---
title: Ember E2E Security Review
date: 2026-04-28
project: Ember Application
type: security-review
tags: [security, encryption, signal-protocol, e2e, audit]
reviewers: [security-reviewer, security-reviewer, security-reviewer, Explore]
threat-model: "Decryption must be impossible without physical access AND OS-account access on the device"
---

# Ember E2E Security Review — 2026-04-28

## Bottom Line

**Guarantee NOT yet upheld.** The cryptographic foundation is solid — Signal Protocol (X3DH + Double Ratchet + Sender Keys) with PQXDH (ML-KEM-768) used correctly via libsignal-client, and a genuinely zero-knowledge server for message content. However, **two specific code paths break the guarantee**:

1. **DM "ember key" leaks to the server in plaintext** — server compromise yields full DM read.
2. **safeStorage plaintext fallback** — when Linux keyring is unavailable, all private keys are written to disk in plaintext, and the SQLite Signal-DB envelope encryption collapses with it.

Fix those two and tighten the High-severity items below to reach the standard.

---

## Threat Model

The guarantee being audited:

> A user's messages can be decrypted **only** by someone with both physical access to the user's device and the user's OS account credentials. Equivalently:
>
> - Full server compromise (DB dump + code execution + logs) → no plaintext, no private keys.
> - Network MITM with TLS bypass → no plaintext.
> - Disk image of the device without OS keychain access → no plaintext, no private keys.
> - Insider (ember admin or instance operator) → cannot read DMs or other ember messages.

---

## CRITICAL Findings (break the guarantee)

### CRIT-1 — DM ember key sent to server in plaintext

**Files**:
- `ember-client/src/renderer/managers/direct-messaging-manager.ts:367-369` (DM request initiation)
- `ember-client/src/renderer/managers/direct-messaging-manager.ts:540-542` (`acceptDMRequest` fallback path)
- Comment at line 410 acknowledges the issue.

**Issue**: When a DM request is initiated, a 32-byte symmetric ember key is generated correctly with `crypto.getRandomValues`, but `encryptedKeySelf` is then set to `window.uint8ArrayToBase64(emberKey)` — the raw plaintext key bytes, base64-encoded — and transmitted to the server. The peerBox path correctly wraps the key inside a Signal message, but the `encryptedKeySelf` plaintext field travels alongside it. The server therefore receives the unencrypted DM key material.

**Impact**: Any server compromise gives an attacker full read access to DM history that was encrypted with this key. Directly violates the guarantee.

**Fix**: Wrap `encryptedKeySelf` with the device's own Signal session (self-encrypt envelope), or remove the field entirely and store an in-memory or local-encrypted copy only.

### CRIT-2 — safeStorage plaintext fallback for private keys

**Files**:
- `ember-client/src/main/auth-safe-storage.ts:42-43`
- `ember-client/src/main/index.ts:609` (warn + plaintext write)
- `ember-client/src/main/index.ts:637` (plaintext read fallback)
- `ember-client/src/main/index.ts:560-602` (`checkSafeStorageAtStartup` dialog with `cancelId: 1` "Continue Anyway")

**Issue**: When `safeStorage.isEncryptionAvailable()` returns false (most common scenario: Linux self-hosted users without a running keyring daemon), every call to `setSafeStorage` writes the raw value to electron-store's on-disk JSON file with no encryption. This affects:

- Identity private key (`identity_key_*`)
- Signed pre-key private key (`signed_prekey_*`)
- One-time pre-key private keys (`otp_prekeys_*`)
- Registration ID
- App-lock PIN hash

The startup dialog warns the user but defaults to "Quit" with a "Continue Anyway" button — so users can bypass.

**Cascading impact**: The Signal SQLite DB's AES-256-GCM key is `HKDF(identityPrivateKey, ...)` (`signal-db.ts:168-172`). When this fallback fires, the identity private key is in `config.json` plaintext, which means an attacker who reads `config.json` obtains the HKDF input and can decrypt the entire Signal DB (all sessions, sender keys, ratchet state, decrypted-message cache).

**Fix**: Hard-fail when safeStorage is unavailable. Remove the "Continue Anyway" option. Refuse to start until the user resolves the keyring environment.

---

## HIGH Findings

### H-1 — JWT bearer token stored unencrypted in electron-store

`ember-client/src/main/index.ts:791-803`. The `save-auth` IPC handler does `store.set('auth', authData)`, writing `{ token, userId, deviceId, hostname, username }` as plain JSON to electron-store. Anyone with read access to `~/.config/ember-client/config.json` can extract a valid 24-hour JWT. The `auth_token_` prefix is in the safeStorage allowlist (`safe-storage-allowlist.ts:12`) but unused — apparent unfinished intent.

### H-2 — No userData directory permission hardening

`signal-state.db` and `config.json` are created under `app.getPath('userData')` with no explicit `chmod`. On Linux this inherits the process umask (commonly `022`, world-readable). No `fs.chmod` or `mkdirSync({ mode: 0o700 })` exists in the source.

### H-3 — Identity private key crosses IPC into the renderer's JS heap

`ember-client/src/renderer/managers/app-state.ts:210-220, 250, 381, 457, 515`. For pre-key generation/rotation, the renderer reads the identity private key via `GetSafeStorage`, receives it as base64, then sends it back over IPC for signing (`GenerateSignedPreKey`, `GenerateKyberPreKey`, `GenerateKyberPreKeyBatch`). The private key exists as a plain base64 string in the renderer's V8 heap — exploitable via contextIsolation bypass, renderer XSS, or any module that logs the variable.

**Fix**: Move signing into the main process. The renderer should never see the private key.

### H-4 — `identity_pubkey_` prefix missing from safeStorage allowlist

`ember-client/src/main/safe-storage-allowlist.ts` only allows `identity_key_`, but the renderer reads `identity_pubkey_${userId}_${deviceId}` in `signal-service.ts:73,215`. The handler at `ember-ipc.ts:189-194` and `index.ts:808-825` rejects this with "Key not allowed". `getIdentityKeyPair()` and `getLocalDevice()` will throw — suggests either an untested path or a silent fallback worth tracing.

### H-5 — TOTP encryption key falls back to JWT_SECRET in non-production

`ember-server/internal/transport/http/totp_handlers.go:574-583`. When `TOTP_ENCRYPTION_KEY` is not set (enforced only in `ENVIRONMENT=production`), the AES-256-GCM key protecting `totp_secrets.encrypted_secret` is derived as `sha256("totp-encryption:" + JWT_SECRET)`. A staging/CI compromise of one secret unlocks both auth and TOTP seeds. Doesn't break message E2E but expands blast radius.

### H-6 — Non-constant-time `bytesEqual` in identity-trust check

`ember-client/src/renderer/services/signal-service.ts:12-15` and `:114`. `bytesEqual` short-circuits on first mismatch and is used in `IpcIdentityKeyStore.isTrustedIdentity`. Timing exploitation in-process JS is hard but this is a deviation from the constant-time guarantee libsignal provides internally.

### H-7 — Group decrypt errors silently swallowed

`ember-client/src/renderer/services/message-service.ts:123-155`. `tryGroupDecrypt` returns `{ plaintext: null, permanentFailure: false }` on any exception. Tampered ciphertext becomes "[Waiting for sender key]" instead of "[Message could not be authenticated]". Confidentiality is preserved (libsignal's AEAD still rejects), but integrity-failure UX is missing.

### H-8 — JWT_SECRET weak-default check skipped in development

`ember-server/internal/app/config/config.go:96-98`. The default `"change-me-in-production"` and weak-length enforcement only fire when `c.Environment != "development"`. A deploy with `ENVIRONMENT` accidentally unset gets no warning. Combined with H-5, a stolen default JWT_SECRET unlocks both token forgery and TOTP decryption.

---

## MEDIUM Findings

### M-1 — Sourcemaps shipped in production ASAR
`ember-client/esbuild.renderer.mjs:34,48` set `sourcemap: true` on both passes. `package.json:83` includes `dist/**/*` with no `!dist/**/*.map` exclusion. Full TypeScript source reconstructible from a release build.

### M-2 — DevTools default-on when NODE_ENV is unset
`ember-client/src/main/dev.ts:7` defines `isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV`. `index.ts:212` uses `devTools: isDev`. Releases must explicitly set `NODE_ENV=production`.

### M-3 — `minLevel = DEBUG` hardcoded in main logger
`ember-client/src/main/logger.ts:139`. All `log.debug(...)` calls fire in every build, including:
- `index.ts:606` "Encrypting private key with OS safeStorage" (confirms key in memory)
- `index.ts:633` "Decrypting private key from OS safeStorage"
- `ember-ipc.ts:680` ProcessPreKeyBundle metadata
- `ember-ipc.ts:773` `DecryptPreKey local key state` (SPK + OTP availability)

No raw key bytes, but Signal session metadata streams to prod stdout.

### M-4 — Renderer console leaks
- `ember-client/src/renderer/managers/renderer.ts:39-40`: `console.log('[renderer] window.electronAPI:', window.electronAPI)` dumps the full bridge surface on startup.
- `ember-client/src/renderer/websocket/index.ts:181`: `console.warn('WebSocket not connected, message not sent:', message)` dumps full WS message envelopes when send is attempted before connect.

### M-5 — Decrypted-message cache has no TTL or logout cleanup
`StoreDecryptedMessage` / `LoadDecryptedMessage` IPC handlers persist plaintext indefinitely. The cache exists because the ratchet deletes its own keys, so this becomes the long-term confidentiality boundary.

### M-6 — Multi-device provisioning is incomplete (currently safe but watch)
`ember-client/src/renderer/services/provisioning-service.ts:83-262`. Creates server-side request records but no Approve button, no ephemeral DH, no QR. Currently produces a new independent identity (safe). **Future implementation must use ephemeral key agreement and never relay private material via the server.**

### M-7 — Server metadata leaks
- `signal_sessions` table reveals the full social graph (`(user_id, device_id, peer_user_id, peer_device_id)` + timestamp).
- `attachments.original_name` and `content_type` are stored in plaintext (`database.go:205-211`, `attachment_handlers.go:117-125`). File names like `invoice_acme_Q4.pdf` and MIME types leak from a DB dump even though `encrypted_data` is opaque.

### M-8 — Legacy `decryptFileBytes` still wired
`ember-client/src/preload/index.ts:342-344`. Old `iv‖tag‖ciphertext` decrypt for pre-migration attachments retained. Encrypt path was removed. Live entry point to legacy crypto code.

### M-9 — Misleading `encryptedKeySelf` field name
The field is named as if it contains encrypted material but carries plaintext (see CRIT-1). Recipient code may behave unexpectedly.

---

## Server Persisted-Field Audit

A DB dump from `ember-server` yields:

| Table.Column | Classification | Yield |
|---|---|---|
| `users.password_hash` | bcrypt hash | Not reversible |
| `users.username` / `status` / `chat_color` / `avatar` | Public | Plaintext UI metadata |
| `devices.public_key` / `identity_key` | Public | Signal/EC public keys (OK) |
| `messages.ciphertext` | E2E ciphertext | Opaque without sender/session key |
| `messages.sender_id` / `sender_user_id` / `created_at` | Metadata | Social graph + timing |
| `ember_keys_archive.encrypted_key` | Encrypted per-device | Opaque without device private key |
| `ember_keys_archive.sender_public_key` | Public | Ephemeral DH public (OK) |
| `totp_secrets.encrypted_secret` | AES-256-GCM | Decryptable with TOTP_ENCRYPTION_KEY (or JWT_SECRET via H-5) |
| `totp_secrets.backup_codes` | bcrypt hashes | Not reversible |
| `totp_secrets.last_used_code` | Plaintext | Stale 6-digit code, ~30s |
| `signed_prekeys.public_key` + `signature` | Public | Signal public material (OK) |
| `one_time_prekeys.public_key` | Public | Signal OTP public key (OK) |
| `kyber_prekeys.public_key` + `signature` | Public | ML-KEM-768 public key (OK) |
| `sender_key_distributions.distribution_message` | E2E ciphertext | Opaque without recipient device key |
| `signal_sessions` | Metadata | **Full social graph** (M-7) |
| `attachments.encrypted_data` | Client-encrypted | Opaque |
| `attachments.original_name` / `content_type` | Plaintext | **Filename/MIME leak** (M-7) |
| `invites.encrypted_ember_key` + `key_salt` | Client-encrypted | Opaque without invite code |
| `dm_conversation_keys.encrypted_key` | Client-encrypted | Opaque without device key |
| `channel_root_keys.encrypted_key` | Client-encrypted | Opaque without device key |
| `device_provisioning_requests.encrypted_bundle` | Client-encrypted | Opaque without device key |
| `group_epoch_keys.encrypted_key` | Client-encrypted | Opaque without device key |

**Verdict**: Server is genuinely zero-knowledge for message content. Caveats are TOTP-secret encryption key strength (H-5) and metadata (M-7).

---

## What's Done Right

1. **libsignal-client (Rust-backed) used exclusively** for X3DH (`processPreKeyBundle`), Double Ratchet (`signalEncrypt`/`signalDecrypt`/`signalDecryptPreKey`), and Sender Keys (`groupEncrypt`/`groupDecrypt`/`SenderKeyDistributionMessage`). No hand-rolled DH, HKDF, or AEAD anywhere in the message path.
2. **PQXDH (ML-KEM-768) hard-required**. `handleProcessPreKeyBundle` in `ember-ipc.ts` throws if `kyberPreKey` or `kyberPreKeySignature` are absent.
3. **All key generation uses `crypto.getRandomValues` and libsignal's CSPRNG.** No `Math.random`, no date seeds, no predictable values.
4. **Sender key distributions encrypted per-recipient** via pairwise Signal sessions before POST. Server never sees raw sender keys.
5. **Self-encrypt / self-decrypt handled correctly** via `self-recv::` prefix to avoid corrupting the sender-chain counter.
6. **Server has zero decryption code paths.** No Go file imports symmetric-crypto and operates on `message`/`content`/`body` fields. Handlers round-trip `ciphertext` opaquely.
7. **WebRTC uses default DTLS-SRTP.** ion-SFU is forwarding-only; TURN is opaque relay; no DTLS key material logged.
8. **JWT carries only `user_id` + `device_id`.** Redacted from access logs via `redactLogURI` in `middleware.go:199-215`.
9. **TOTP backup codes bcrypt-hashed** with `SELECT FOR UPDATE` for replay prevention.
10. **Preload log scrubber** covers `privateKey`, `ember_key`, `pin`, `secret`, `recoveryCode` (`preload/index.ts:30-43`).
11. **IPC error sanitization** strips base64/hex (`ember-ipc.ts:950-958`).
12. **Stale-counter decrypt failures flagged as permanent** (`isOldCounterError`) preventing infinite retries on tampered/replayed messages.
13. **Rate limiters** on `/login`, `/register`, `/recover-device`, `/change-password`, `/2fa/verify`.
14. **No telemetry / crash reporters** (Sentry, Bugsnag, Mixpanel, etc.) found in the source.

### Verified safeStorage slots (when keyring is available)

| Slot | Contents | File |
|---|---|---|
| `identity_key_${userId}_${deviceId}` | Identity Ed25519 private (32B) | `auth-service.ts:1051-1054`, `index.ts:1759` |
| `signed_prekey_${userId}_${deviceId}` | `{ id, publicKey, privateKey, signature }` JSON | `auth-service.ts:986-994` |
| `otp_prekeys_${userId}_${deviceId}` | OTP private keys array | `auth-service.ts:997-1009` |
| `registration_id_${userId}_${deviceId}` | Registration ID | `auth-service.ts:976-979` |
| `appLockPin` | scrypt hash | `index.ts:1403` |
| Signal DB BLOBs | session ratchet, identity, pre-keys, sender keys, kyber pre-keys, decrypted-message cache | `signal-db.ts` (AES-256-GCM with HKDF-derived key + per-row AAD) |

---

## Recommended Fix Order

1. **Branch**: `feature/security-hardening-2026-04-28` in `ember-client`.
2. **CRIT-1 first** (biggest blast radius): wrap or remove `encryptedKeySelf`.
3. **CRIT-2 next**: hard-fail on safeStorage unavailable. No "Continue Anyway".
4. **H-3**: move identity-key signing into the main process; never expose to renderer.
5. **H-1**: store JWT via safeStorage (the `auth_token_` allowlist prefix is already declared).
6. **H-2**: chmod userData on first run; create with `mode: 0o700`.
7. **H-4**: add `identity_pubkey_` to allowlist (or remove the renderer read path if it's vestigial).
8. **H-7**: distinguish `permanentFailure: true` for AEAD failures (tampered ciphertext) from missing-key.
9. **H-6**: switch `bytesEqual` to constant-time (`timingSafeEqual` equivalent).
10. **M-1, M-2, M-3, M-4**: release hygiene — strip sourcemaps, force `NODE_ENV=production`, gate DEBUG floor on env, remove `console.log` of bridge/messages.
11. **H-5, H-8**: server config — enforce `TOTP_ENCRYPTION_KEY` outside production too; warn on default JWT_SECRET regardless of environment.
12. **M-5**: TTL + logout-cleanup for the decrypted-message cache; consider opt-in rather than default-on.

---

## Reviewer Notes

- Audit conducted by 4 parallel sub-agents:
  - Client crypto correctness (security-reviewer)
  - Client at-rest key storage (security-reviewer)
  - Server zero-knowledge (security-reviewer)
  - Cross-repo leak hunt (Explore)
- All findings have file:line citations against the working tree at the date of the review.
- This document is the synthesis. Raw agent reports are not preserved beyond this note.
