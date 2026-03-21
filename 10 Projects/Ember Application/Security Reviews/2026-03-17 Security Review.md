# Ember Security Review — 2026-03-17

**Scope:** ember-client (Electron), ember-server (Go/PostgreSQL), ember-mobile (early stage, not reviewed)
**Reviewer:** Claude Code security-reviewer agent
**Status:** Open — remediation in progress

---

## Summary

25 security findings across CRITICAL (5), HIGH (7), MEDIUM (7), and LOW (6) severity levels. The most urgent issues are an XSS vulnerability that chains with a disabled Electron sandbox to enable OS-level RCE, a missing rate limit on the device recovery endpoint, hardcoded DevTools in production, and vulnerable npm dependencies.

---

## CRITICAL Issues

### CRIT-1: Electron Sandbox Disabled on All Windows
**File:** `ember-client/src/main/index.ts` lines 163–171, 843–850
**Status:** Open

Both the main window and the video pop-out window are created with `sandbox: false`. The Electron sandbox is the primary defense against renderer-process exploits gaining elevated OS access.

Vulnerable code:
```
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: false,   // sandbox disabled on all windows
}
```

**Impact:** If an attacker executes arbitrary JavaScript in the renderer (via XSS, malicious content, or a compromised dependency), they gain full Node.js / OS-level access. `contextIsolation: true` reduces but does not eliminate this when `sandbox: false`.

**Fix:** Set `sandbox: true`. Audit all preload scripts for direct Node API use that must be refactored to IPC.

---

### CRIT-2: XSS via Unsanitized Username in DM Typing Indicator
**File:** `ember-client/src/renderer/managers/direct-messaging-ui.ts` line 1195
**Status:** Open

A server-supplied username is interpolated directly into an innerHTML template string:

```
typingIndicator.innerHTML = `${username} is typing...`;
```

**Impact:** Any user can register a username containing HTML/script tags. When another user sees this in the DM typing indicator, the payload executes. Combined with CRIT-1 (sandbox disabled), this is OS-level RCE.

**Fix:** Use textContent for the username portion and build the element with createElement:
```
const nameSpan = document.createElement('span');
nameSpan.textContent = username;
typingIndicator.replaceChildren(nameSpan, document.createTextNode(' is typing'), ...dots);
```

---

### CRIT-3: PIN Stored and Compared in Plaintext (Timing Attack)
**File:** `ember-client/src/main/index.ts` lines 788–793
**Status:** Open

The app lock PIN is compared with direct string equality after decryption — no bcrypt hashing before storage. A 4-digit PIN (10,000 combinations) is brute-forceable with no rate limiting, and the string equality check is vulnerable to a timing side-channel.

**Fix:** Hash PIN with bcrypt (work factor 12) before storing. Use constant-time comparison on verify.

---

### CRIT-4: Private Key Stored in Plaintext When safeStorage Unavailable
**File:** `ember-client/src/main/index.ts` lines 353–380
**Status:** Open

When Electron's OS keyring is not available, the NaCl device private key silently falls back to unencrypted storage in electron-store (a plain JSON file on disk). A `log.warn` is emitted but no user-visible warning is shown.

**Impact:** An attacker with filesystem access (malware, backup theft) gains the device private key, enabling decryption of all ember keys and historical messages.

**Fix:** Show a prominent user warning and consider refusing to start rather than silently degrading.

---

### CRIT-5: /recover-device Has No Rate Limiting
**File:** `ember-server/internal/transport/http/routes.go` line 235
**Status:** Open

The `/recover-device` endpoint is registered on the unauthenticated `api` subrouter with no rate limiter — unlike `/login` which uses `rateLimitMiddleware(loginRL, handleLogin)`.

**Impact:** Unlimited credential-stuffing or brute-force against the recovery endpoint. Successful attacks return the encrypted device key for offline decryption.

**Fix:** Apply the existing `loginRL` rate limiter to this endpoint.

---

## HIGH Issues

### HIGH-1: JWT Uses Symmetric HS256
**File:** `ember-server/internal/domain/auth/auth.go` lines 34–65
**Status:** Open

The server issues and validates JWTs using HS256 with a single symmetric `JWT_SECRET`. Any component holding the secret can forge tokens for any user.

**Fix:** Long-term: migrate to RS256/ES256 asymmetric keys. Short-term: ensure `JWT_SECRET` is 256+ bits of entropy, rotated periodically, never logged.

---

### HIGH-2: String Literals Used as Context Keys (Key Collision Risk)
**File:** `ember-server/internal/domain/auth/auth.go` lines 87–88
**Status:** Open

Raw strings `"user_id"` and `"device_id"` are used as context keys. Any package using the same string key can overwrite or shadow auth values.

**Fix:** Use unexported typed context keys:
```go
type contextKey string
const userIDKey contextKey = "user_id"
```

---

### HIGH-3: devTools: true Hardcoded in Production Main Window
**File:** `ember-client/src/main/index.ts` line 168
**Status:** Open

The main window always enables DevTools. The video pop-out correctly gates with `isDev` but the main window does not.

**Impact:** DevTools expose full application state, IPC channels, local storage, and renderer JavaScript to anyone with access to the machine.

**Fix:** `devTools: isDev`

---

### HIGH-4: Unvalidated filePath Passed to shell.openPath
**File:** `ember-client/src/main/update-downloader.ts` lines 152–168
**Status:** Open

The installer file path (constructed from GitHub API `asset.name`) is passed to `shell.openPath` without validating it remains inside `os.tmpdir()`.

**Fix:** After download, validate `path.normalize(filePath).startsWith(os.tmpdir())` before calling `shell.openPath`. Verify file checksum against a pinned release manifest.

---

### HIGH-5: Vulnerable Dependencies
**Source:** `npm audit` on ember-client
**Status:** Open

| Package | Vulnerability | CVEs |
|---------|--------------|------|
| `tar` <= 7.5.10 | Path traversal via hardlinks/symlinks | GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx |
| `electron` < 35.7.5 | ASAR integrity bypass | GHSA-vmqv-hx8q-j7mg |

**Fix:** Upgrade `electron-builder` to `^26.8.1` and `electron` to `^35.7.5`.

---

### HIGH-6: Unsanitized Server Data in DM Reactions
**File:** `ember-client/src/renderer/managers/direct-messaging-ui.ts` lines 1216–1219
**Status:** Open

Both `reaction.emoji` and `reaction.count` are server-supplied values interpolated into innerHTML without sanitization.

**Fix:** Use createElement/textContent for each reaction element.

---

### HIGH-7: Unsanitized Data in Context Menu Labels
**File:** `ember-client/src/renderer/managers/direct-messaging-ui.ts` lines 1300–1303
**Status:** Open

`item.icon` and `item.label` are interpolated into innerHTML for context menu items.

**Fix:** Use createElement/textContent for all context menu items.

---

## MEDIUM Issues

### MED-1: Missing HSTS and CSP Security Headers
**File:** `ember-server/internal/transport/http/routes.go` lines 3563–3572
**Status:** Open

`securityHeadersMiddleware` is missing `Strict-Transport-Security` and `Content-Security-Policy`.

**Fix:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` and a `Content-Security-Policy` for HTML responses.

---

### MED-2: JWT Logged in Plaintext via /ws?token= URI
**File:** `ember-server/internal/transport/http/routes.go` line 3709
**Status:** Open

`loggingMiddleware` logs the full `r.RequestURI`, which includes the JWT for WebSocket connections at `/ws?token=eyJ...`.

**Impact:** Anyone with log access can harvest valid 24-hour JWTs.

**Fix:** Redact the `token` query parameter from the URI before logging.

---

### MED-3: Rate Limiter Bypassable via Proxy
**File:** `ember-server/internal/transport/http/routes.go` lines 3587–3605
**Status:** Open

Rate limiter is keyed on `r.RemoteAddr`. Attackers behind a proxy bypass per-IP limits; all users behind the same CDN share one bucket.

**Fix:** In production, read real IP from `X-Real-IP` or the rightmost non-private IP in `X-Forwarded-For`.

---

### MED-4: /invites/{code} Returns Encrypted Key Without Authentication
**File:** `ember-server/internal/transport/http/routes.go` line 236
**Status:** Open

The endpoint is on the unauthenticated `api` subrouter and returns `encrypted_ember_key` and `key_salt` to anyone who knows the invite code.

**Fix:** Move to the `protected` subrouter.

---

### MED-5: Invite Code Entropy Too Low (Client-Generated)
**File:** `ember-client/src/renderer/managers/invite-manager.ts` lines 324–326
**Status:** Open

Invite codes are 4 bytes (32 bits of entropy — ~4 billion combinations). The client generates and submits the code to the server, which stores it verbatim. Codes should be server-generated.

**Fix:** Have the server generate invite codes; client only requests creation and receives the code.

---

### MED-6: Dynamic SQL Construction Pattern in handleUpdateEmber
**File:** `ember-server/internal/transport/http/routes.go` lines 697–720
**Status:** Open (fragile, not currently exploitable)

`fmt.Sprintf("UPDATE embers SET %s WHERE id = $%d", strings.Join(updates, ", "), argIndex)` — currently safe since `updates` contains only hardcoded column references, but the pattern invites SQL injection in future modifications.

**Fix:** Refactor to fixed conditional updates, or add an explicit warning comment.

---

### MED-7: DB SSL Disabled by Default
**File:** `ember-server/internal/app/config/config.go` line 44
**Status:** Open

`DBSSLMode: getEnv("DB_SSL_MODE", "disable")` — default should be `require`.

---

## LOW Issues

- **LOW-1:** `innerHTML = ""` pattern inconsistency — use `replaceChildren()` consistently (`renderer.ts:1108`)
- **LOW-2:** Misleading devTools comment — comment says "change false to true" but value is already `true` (`main/index.ts:116`)
- **LOW-3:** Implicit `file://` CORS default in docker-compose — document that `ALLOWED_ORIGINS=*` opens CORS to all origins
- **LOW-4:** No maximum password length — cap at 72 chars (bcrypt practical limit) to prevent DoS via intentionally slow hashing
- **LOW-5:** Recovery handler uses `LIMIT 1` to fetch public key — may return wrong device's key for multi-device users (`routes.go:1700`)
- **LOW-6:** Update downloader follows HTTP redirects — reject any redirect target that is not `https:`

---

## What Was Fixed / Confirmed Secure

- All SQL queries use parameterized `$N` placeholders — no SQL injection found
- IPC channel allowlists enforced in preload (`ALLOWED_SEND`, `ALLOWED_INVOKE`, `ALLOWED_ON`)
- `window.open` blocks non-HTTPS URLs
- `webSecurity: true`, `allowRunningInsecureContent: false` on all windows
- `contextIsolation: true` on all windows
- Recovery middleware prevents server crashes from panics
- 1 MiB request body limit enforced
- Rate limiting on `/login` and `/register`
- `parseInviteUrl` validates scheme, host, and port
- Production config validates JWT_SECRET length, TURN_SECRET, DB SSL, and PUBLIC_HOST
- bcrypt used for password hashing

---

## Remediation Checklist

### Immediate (This Sprint)
- [x] **CRIT-2** — Fix XSS in typing indicator (use textContent instead of innerHTML) ✅ 2026-03-17
- [x] **CRIT-5** — Apply `loginRL` to `/recover-device` ✅ 2026-03-17
- [x] **HIGH-3** — Gate `devTools` behind `isDev` ✅ 2026-03-17
- [x] **HIGH-5** — Upgrade `electron-builder@^26.8.1` and `electron@^35.7.5` ✅ 2026-03-17
- [x] **MED-2** — Redact `?token=` from request URI in logging middleware ✅ 2026-03-17
- [x] **MED-4** — Move `GET /invites/{code}` to `protected` subrouter ✅ 2026-03-17

### Short-Term (Next Sprint)
- [ ] ~~**CRIT-1** — Enable Electron sandbox (`sandbox: true`)~~
- [x] **CRIT-3** — Hash PIN with bcrypt before storage; use constant-time comparison ✅ 2026-03-17
- [x] **HIGH-6 / HIGH-7** — Replace innerHTML templates with createElement in reactions and context menus ✅ 2026-03-17
- [x] **LOW-4** — Add maximum password length (72 chars) ✅ 2026-03-17
- [x] **MED-5** — Move invite code generation server-side ✅ 2026-03-17

### Medium-Term
- [x] **CRIT-4** — Block app start or warn prominently when safeStorage unavailable ✅ 2026-03-17
- [ ] **HIGH-1** — Migrate JWT to RS256/ES256
- [ ] **HIGH-2** — Use typed context keys in auth package
- [x] **HIGH-4** — Validate installer path stays within tmpdir; add checksum verification ✅ 2026-03-17
- [ ] **MED-1** — Add HSTS and CSP headers
- [ ] **MED-3** — Use real IP from trusted proxy header in production
- [ ] **MED-6** — Refactor `handleUpdateEmber` away from dynamic SQL construction
- [ ] **MED-7** — Default `DB_SSL_MODE` to `require`
