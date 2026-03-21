# Ember Signal Protocol Legacy Cleanup Report

**Date:** 2026-03-21
**Scope:** Full removal of TweetNaCl → Signal Protocol v2.3 migration scaffolding
**Status:** COMPLETE

---

## 1. Legacy/Migration Findings

### F-01: `ember-shared/src/crypto/key-migration.ts`
- **Category:** Migration scaffolding
- **Severity:** HIGH (entire file is migration-only except 4 key generation functions)
- **Evidence:** File exports `migrateDeviceIdentity()`, `MigrationResult` interface with `legacyPublicKey`/`legacyPrivateKey` fields, and 4 Signal key generation functions (`generateIdentityKey`, `generateRegistrationId`, `generateSignedPreKey`, `generateOneTimePreKeys`) that were co-located here for the migration but belong in core infrastructure
- **Recommendation:** Extract the 4 generation functions to `signal-keys.ts`, delete the file
- **Confidence:** HIGH — file name, JSDoc, and content confirm migration purpose

### F-02: `ember-shared/src/crypto/migration-flow.ts`
- **Category:** Pure migration orchestrator
- **Severity:** HIGH — entire file is migration scaffolding
- **Evidence:** Exports `needsMigration()`, `performMigration()`, `MigrationStatus`, `MigrationOutcome`, `DeviceUpdateRequest` with `proof_of_possession` field; orchestrates PATCH to `/api/v1/devices/{id}` for protocol_version upgrade
- **Recommendation:** Delete entirely
- **Confidence:** HIGH

### F-03: `ember-shared/src/crypto/index.ts` (partial)
- **Category:** Migration re-export
- **Severity:** MEDIUM — two export lines reference deleted files
- **Evidence:** `export * from './key-migration'` and `export * from './migration-flow'`
- **Recommendation:** Remove both lines, add `export * from './signal-keys'`
- **Confidence:** HIGH

### F-04: `ember-shared/src/services/auth.ts` (multiple sections)
- **Category:** Mixed — largely Signal, with legacy compatibility sections
- **Severity:** HIGH
- **Evidence:**
  - Import from `'../crypto/key-migration'` (line 5)
  - Import of `PrivateKey` from libsignal used only for legacy Curve25519 key generation
  - `generateDeviceIdentity()` generates `legacyPublicKey`/`legacyPrivateKey` fields
  - `register()` accepts `legacyPrivateKey` param and stores it as `legacy_private_key_${userId}_${deviceId}` in safeStorage
  - `loginWithRecoveryCode()` has full `isLegacyDevice` branch with `protocol_version === 0` detection
- **Recommendation:** Remove all legacy fields and branches, simplify functions
- **Confidence:** HIGH

### F-05: `ember-shared/src/types/auth.ts` (partial)
- **Category:** Type definitions with migration fields
- **Severity:** MEDIUM
- **Evidence:** `SignalDeviceIdentity` contains `legacyPublicKey: Uint8Array` and `legacyPrivateKey: Uint8Array`; `AuthResponse` contains `migration_required?: boolean`
- **Recommendation:** Remove both fields
- **Confidence:** HIGH

### F-06: `ember-shared/src/services/prekeys.ts` (partial)
- **Category:** Stale import
- **Severity:** MEDIUM
- **Evidence:** `import { generateOneTimePreKeys, generateSignedPreKey } from "../crypto/key-migration"` — importing from the deleted migration file
- **Recommendation:** Update import to `signal-keys`
- **Confidence:** HIGH

### F-07: `src/renderer/managers/recovery-migration-manager.ts`
- **Category:** Pure migration UI manager
- **Severity:** HIGH — entire file is migration scaffolding
- **Evidence:** `reEncryptRecoveryCode()` wraps the identity key for re-encryption after migration; `showMigrationRecoveryModal()` shows a migration-specific UI step
- **Recommendation:** Delete entirely
- **Confidence:** HIGH

### F-08: `src/renderer/services/auth-service.ts` (partial)
- **Category:** Mixed — largely Signal, with legacy references
- **Severity:** HIGH
- **Evidence:**
  - `generateDeviceIdentity()` reads `signalIdentity.legacyPublicKey` and `signalIdentity.legacyPrivateKey`
  - Comment "// No migration needed for fresh database" — migration-era comment
- **Recommendation:** Update to use `identityKeyPair.publicKey`/`privateKey` directly
- **Confidence:** HIGH

### F-09: `src/renderer/services/message-service.ts` (partial)
- **Category:** Migration guard
- **Severity:** MEDIUM
- **Evidence:** `sendEncryptedMessage()` checks `App.migrationStatus === "in-progress"` to block sends during migration
- **Recommendation:** Remove the guard block
- **Confidence:** HIGH

### F-10: `src/renderer/managers/app-state.ts` (partial)
- **Category:** Migration state field
- **Severity:** LOW
- **Evidence:** `migrationStatus: 'idle' as 'idle' | 'in-progress' | 'complete' | 'failed'` in App state object
- **Recommendation:** Remove field
- **Confidence:** HIGH

### F-11: `src/renderer/types/globals.d.ts` (partial)
- **Category:** Migration type declaration
- **Severity:** LOW
- **Evidence:** `migrationStatus: 'idle' | 'in-progress' | 'complete' | 'failed'` in AppState interface
- **Recommendation:** Remove field
- **Confidence:** HIGH

### F-12: `src/main/index.ts` (partial)
- **Category:** Stale import
- **Severity:** MEDIUM
- **Evidence:** `import { migrateDeviceIdentity, ... } from "ember-shared"` — `migrateDeviceIdentity` imported but never called in any function body
- **Recommendation:** Remove `migrateDeviceIdentity` from the import
- **Confidence:** HIGH

### F-13: `src/renderer/managers/direct-messaging-manager.ts` (partial)
- **Category:** Protocol version compatibility check
- **Severity:** MEDIUM
- **Evidence:** `const partnerDeviceId = firstDevice?.protocol_version === 1 ? (firstDevice.id ?? null) : null` — treats non-Signal devices as if they have no device ID; `const partnerProtocolVersion = firstDevice?.protocol_version === 1 ? 1 : 0` — hardcoded dual-stack check
- **Recommendation:** Remove conditional; all devices are Signal (v1)
- **Confidence:** HIGH

### F-14: `ember-server/internal/transport/http/routes.go` — `handleUpdateDevice`
- **Category:** Migration endpoint
- **Severity:** HIGH — entire handler and route are migration-only
- **Evidence:** PATCH `/api/v1/devices/{device_id}` handler that accepts `proof_of_possession`, verifies an Ed25519 signature, and updates `protocol_version` on a device record. Used exclusively to upgrade legacy devices to Signal
- **Recommendation:** Remove route registration and handler function; remove `crypto/ed25519` import
- **Confidence:** HIGH

### F-15: `ember-server/internal/transport/http/routes.go` — legacy comments/defaults
- **Category:** Migration-era comments and values
- **Severity:** LOW
- **Evidence:**
  - "Back-compat: legacy clients may still send encrypted_ember_key" comment
  - "messageType := 0 // Default for legacy messages" comment
  - "Preserve legacy/nil error messaging for existing tests/clients" comments
  - Legacy `emberProtocolVersion == 0` guard in invite creation handler
- **Recommendation:** Remove comments and legacy branch
- **Confidence:** HIGH

### F-16: `ember-server/internal/platform/database/database.go` — schema defaults
- **Category:** Legacy schema defaults
- **Severity:** MEDIUM
- **Evidence:**
  - `protocol_version INT NOT NULL DEFAULT 0` on devices table
  - `protocol_version INT NOT NULL DEFAULT 0` on embers table
  - `protocol_version INT NOT NULL DEFAULT 0` / `envelope_type TEXT NOT NULL DEFAULT 'legacy'` on messages table
  - `identity_key_type TEXT NOT NULL DEFAULT 'legacy'` in recovery_codes table
  - Same DEFAULT 0 values in idempotent ALTER TABLE migration list
- **Recommendation:** Change all defaults to Signal Protocol values (1 / 'signal_group' / 'signal')
- **Confidence:** HIGH

### F-17: Test files (migration-specific)
- **Category:** Migration test suites
- **Severity:** HIGH — tests for deleted functionality
- **Evidence:** 11 test files covering cutover scenarios, dual-stack message handling, and migration flows
- **Recommendation:** Delete all
- **Confidence:** HIGH

---

## 2. Removal Plan

### Phase 1 — Create `signal-keys.ts` (prerequisite)
Extract the 4 legitimate Signal key generation functions from `key-migration.ts` into a new file `ember-shared/src/crypto/signal-keys.ts` before deleting the old file.

### Phase 2 — Delete pure migration files (11 files)
All files whose entire purpose was migration scaffolding.

### Phase 3 — Edit partially-legacy files (12 files)
Remove migration code sections while preserving Signal Protocol functionality.

### Phase 4 — Verify
Run comprehensive grep to confirm no dangling references remain.

---

## 3. Signal Protocol Purity Findings

Before cleanup, the following legitimate Signal Protocol infrastructure was confirmed intact and untouched:

| File | Status | Notes |
|------|--------|-------|
| `crypto/signal-protocol.ts` | PRESERVED | Core Double Ratchet, X3DH, Sender Key operations |
| `crypto/signal-store.ts` | PRESERVED | Store interfaces for sessions, prekeys, identity keys |
| `crypto/signal-types.ts` | PRESERVED | All Signal type definitions (no migration fields) |
| `crypto/envelope.ts` | PRESERVED | Signal wire format serialization |
| `crypto/service.ts` | PRESERVED | AES-GCM helpers, recovery code crypto |
| `crypto/ember-ipc-types.ts` | PRESERVED | IPC command types for main process |
| `services/prekeys.ts` | PRESERVED (import fixed) | Prekey upload/rotation |
| `services/sender-keys.ts` | PRESERVED | Sender key distribution |
| `src/main/signal-db.ts` | PRESERVED | SQLite Signal state store |
| `src/renderer/services/signal-service.ts` | PRESERVED | Renderer IPC bridge to Signal operations |
| `src/renderer/managers/signal-session-manager.ts` | PRESERVED | Session lifecycle wrapper |

The `signal-db.ts` file contains a comment "can be initialised later (e.g. after migration)" — this is a code comment only and was left as-is since it describes a valid initialization pattern, not migration logic.

---

## 4. Code Changes Performed

### Files Created

| File | Purpose |
|------|---------|
| `/ember-client/ember-shared/src/crypto/signal-keys.ts` | New home for Signal key generation functions extracted from key-migration.ts |

### Files Deleted (11)

| File | Reason |
|------|--------|
| `ember-shared/src/crypto/key-migration.ts` | Pure migration scaffolding (migrateDeviceIdentity, MigrationResult) |
| `ember-shared/src/crypto/migration-flow.ts` | Pure migration orchestrator (needsMigration, performMigration) |
| `src/renderer/managers/recovery-migration-manager.ts` | Pure migration UI (reEncryptRecoveryCode, showMigrationRecoveryModal) |
| `ember-shared/tests/unit/crypto/ember-legacy-crypto-exports.test.ts` | Tests for deleted legacy crypto exports |
| `ember-shared/tests/unit/crypto/key-migration.test.ts` | Tests for deleted key-migration.ts |
| `ember-shared/tests/unit/crypto/migration-flow.test.ts` | Tests for deleted migration-flow.ts |
| `tests/integration/dm-key-self-box-migration.test.ts` | Integration test for DM key migration flow |
| `tests/unit/services/auth-service-migration.test.ts` | Unit tests for migration-era auth-service code |
| `tests/unit/message-service-cutover.test.ts` | Unit tests for dual-stack message cutover logic |
| `ember-server/tests/internal/transport/http/cutover_test.go` | Go tests for protocol cutover endpoint |
| `ember-server/tests/internal/transport/http/message_dual_stack_test.go` | Go tests for dual-stack message handling |

### Files Edited (12)

#### `ember-shared/src/crypto/index.ts`
- Removed: `export * from './key-migration'`
- Removed: `export * from './migration-flow'`
- Added: `export * from './signal-keys'`

#### `ember-shared/src/services/auth.ts`
- Changed import from `'../crypto/key-migration'` to `'../crypto/signal-keys'`
- Removed: `import { PrivateKey } from '@signalapp/libsignal-client'` (no longer needed)
- Removed: legacy Curve25519 key generation from `generateDeviceIdentity()` (3 lines)
- Removed: `legacyPublicKey`/`legacyPrivateKey` fields from returned `SignalDeviceIdentity`
- Removed: `legacyPrivateKey` parameter from `register()` function signature
- Removed: `legacy_private_key_${userId}_${deviceId}` safeStorage write
- Removed: `registerWithSignalKeys()` call no longer passes `signalIdentity.legacyPrivateKey`
- Removed: entire `isLegacyDevice` branch from `loginWithRecoveryCode()` (45 lines)
- Removed: `protocol_version?: number` field and comment from `RecoverResponse`
- Simplified: `loginWithRecoveryCode()` now always generates fresh Signal identity and prekeys

#### `ember-shared/src/types/auth.ts`
- Removed: `legacyPublicKey: Uint8Array` from `SignalDeviceIdentity`
- Removed: `legacyPrivateKey: Uint8Array` from `SignalDeviceIdentity`
- Removed: `migration_required?: boolean` from `AuthResponse`

#### `ember-shared/src/services/prekeys.ts`
- Changed import from `'../crypto/key-migration'` to `'../crypto/signal-keys'`

#### `src/renderer/services/auth-service.ts`
- Updated `generateDeviceIdentity()` to use `signalIdentity.identityKeyPair.publicKey`/`privateKey` directly instead of `legacyPublicKey`/`legacyPrivateKey`
- Updated validation to check `identityKeyPair.publicKey`/`privateKey` presence
- Removed: "No migration needed for fresh database" comment

#### `src/renderer/services/message-service.ts`
- Removed: `migrationStatus === "in-progress"` guard block from `sendEncryptedMessage()`

#### `src/renderer/managers/app-state.ts`
- Removed: `migrationStatus: 'idle' as 'idle' | 'in-progress' | 'complete' | 'failed'` field

#### `src/renderer/types/globals.d.ts`
- Removed: `migrationStatus: 'idle' | 'in-progress' | 'complete' | 'failed'` from AppState interface

#### `src/main/index.ts`
- Removed: `migrateDeviceIdentity` from ember-shared import (was imported but never called)

#### `src/renderer/managers/direct-messaging-manager.ts`
- Simplified: `partnerDeviceId` — removed `protocol_version === 1` conditional, now always uses `firstDevice.id`
- Simplified: `partnerProtocolVersion` — hardcoded to `1` (Signal only)

#### `ember-server/internal/transport/http/routes.go`
- Removed: `"crypto/ed25519"` import (only used by removed handler)
- Removed: route registration `protected.HandleFunc("/devices/{device_id}", s.handleUpdateDevice).Methods("PATCH")`
- Removed: entire `handleUpdateDevice()` function (83 lines) — migration-only endpoint
- Removed: legacy `emberProtocolVersion == 0` guard in invite creation handler
- Removed: "Back-compat: legacy clients" comment in ember creation handler
- Removed: "messageType := 0 // Default for legacy messages" comment
- Removed: "Preserve legacy/nil error messaging" comments (×2)
- Cleaned: updated security comments to remove dual-stack language

#### `ember-server/internal/platform/database/database.go`
- Changed: `devices.protocol_version DEFAULT 0` → `DEFAULT 1`
- Changed: `embers.protocol_version DEFAULT 0` → `DEFAULT 1`
- Changed: `messages.protocol_version DEFAULT 0` → `DEFAULT 1`
- Changed: `messages.envelope_type DEFAULT 'legacy'` → `DEFAULT 'signal_group'`
- Changed: `recovery_codes.identity_key_type DEFAULT 'legacy'` → `DEFAULT 'signal'`
- Changed: same defaults in idempotent ALTER TABLE migration list
- Cleaned: "Phase 6: stop writing legacy ember keys" comment → neutral wording
- Cleaned: "Sprint 2: Signal Protocol infrastructure" comment → neutral wording

#### `ember-server/internal/transport/http/dm_request_handlers.go`
- Cleaned: removed "old clients or migration" from `handleAcceptDMRequest` comment

### Key Functions Removed

| Function/Method | File | Lines |
|-----------------|------|-------|
| `migrateDeviceIdentity()` | key-migration.ts (deleted) | ~25 |
| `needsMigration()` | migration-flow.ts (deleted) | ~5 |
| `performMigration()` | migration-flow.ts (deleted) | ~75 |
| `generateProofOfPossession()` | migration-flow.ts (deleted) | ~8 |
| `reEncryptRecoveryCode()` | recovery-migration-manager.ts (deleted) | ~45 |
| `showMigrationRecoveryModal()` | recovery-migration-manager.ts (deleted) | ~40 |
| `handleUpdateDevice()` | routes.go | ~83 |
| `isLegacyDevice` branch | auth.ts | ~45 |

---

## 5. Remaining Suspicious Areas

### Minor — Acceptable Residue

The following patterns remain in the codebase but are **legitimate Signal Protocol infrastructure**, not migration scaffolding:

1. **`protocol_version` column reads in routes.go**: The server reads and returns `protocol_version` from DB records. This is a legitimate data field. All new inserts hardcode `protocol_version = 1`. The field is retained for observability.

2. **`protocol_version` in message wire format** (`ember-shared/src/protocol/messages.ts`, `ember-shared/src/services/messages.ts`): `protocol_version: 1` is sent with every message as the Signal version indicator. Required by server-side validation.

3. **`protocol_version` on `Ember` type** (`ember-shared/src/types/ember.ts`): Read from server. Retained as data field.

4. **`ember-server` idempotent schema migration loop** (`database.go` lines 201-338): Standard Go schema bootstrap idiom. The variable name "migration" refers to SQL DDL statements, not the Signal migration effort.

5. **`handleGetEmberKey()` returns HTTP 410 Gone** — deprecation stub returning error is acceptable for API clarity.

---

## 6. Validation Results

### Verification Grep Results

The following patterns were searched across all modified directories after cleanup:

```
key-migration | migration-flow | recovery-migration-manager | migrateDevice |
needsMigration | performMigration | protocol_version.*==.*0 | legacy.*nacl |
nacl.*legacy | legacyPublicKey | legacyPrivateKey | legacy_private_key |
migration_required | migrationStatus | isLegacyDevice | proof_of_possession |
handleUpdateDevice
```

**Result: 0 matches** — grep exit code 1 (no matches found).

### File Existence Checks

All 11 deleted files confirmed absent.

### crypto/index.ts Export Audit

After cleanup, `ember-shared/src/crypto/index.ts` exports only:
- `service` — AES-GCM crypto, recovery code functions
- `signal-types` — Signal type definitions
- `envelope` — Signal wire format
- `signal-store` — Store interfaces
- `signal-keys` — Key generation (new file)
- `ember-ipc-types` — IPC command types
- Named exports from `signal-protocol` — session management

No migration or legacy exports remain.

### Import Chain Verification

| Consumer | Old Import | New Import | Status |
|----------|------------|------------|--------|
| `auth.ts` | `key-migration` | `signal-keys` | Fixed |
| `prekeys.ts` | `key-migration` | `signal-keys` | Fixed |
| `index.ts` | exports `key-migration`, `migration-flow` | exports `signal-keys` | Fixed |
| `main/index.ts` | `migrateDeviceIdentity` | removed | Fixed |

---

## 7. Final Risk Notes

### Risk: `signal-keys.ts` function signatures must match old `key-migration.ts`

**Status: RESOLVED** — The 4 functions (`generateIdentityKey`, `generateRegistrationId`, `generateSignedPreKey`, `generateOneTimePreKeys`) were copied verbatim with identical signatures. No behavior changes were made.

### Risk: `loginWithRecoveryCode` simplification may break recovery for Signal devices that had stored identity keys

**Assessment: ACCEPTABLE** — The new implementation always generates a fresh identity key pair on recovery and uploads new prekeys. This is the correct behavior for Signal Protocol: device recovery creates a new Signal identity (same as a new device registration). The private key bytes recovered from the recovery code are still returned in `DeviceIdentity.private_key` for the caller.

### Risk: Removing `handleUpdateDevice` breaks any client still attempting migration

**Assessment: ACCEPTABLE** — The task specification states "clean-slate system, no legacy clients to stay compatible with." The PATCH `/api/v1/devices/{id}` endpoint was exclusively for upgrading pre-Signal devices. Any client attempting to call it will receive HTTP 405 Method Not Allowed from gorilla/mux.

### Risk: Changing schema DEFAULT values in `database.go`

**Assessment: LOW** — The `CREATE TABLE IF NOT EXISTS` statements only apply on fresh database creation. The `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements with the new defaults only apply when the column does not yet exist. No existing data is altered by this change.

### Risk: `ed25519` import removal from routes.go

**Assessment: RESOLVED** — Confirmed zero remaining uses of `ed25519.` in routes.go after handler removal. Go compiler will reject unused imports, confirming correctness.

### Risk: Test suite breakage

**Assessment: EXPECTED** — The deleted test files were exclusively testing migration functionality. The remaining test suites (signal-protocol, signal-store, sender-key-protocol, etc.) test legitimate Signal infrastructure and remain intact.

---

---

## Pass 2 — Deep Cleanup (2026-03-21)

### Additional Files Edited (Pass 2)

| File | Changes |
|------|---------|
| `src/renderer/managers/app-state.ts` | Removed `emberMetadata` map, removed `protocolVersion: 0` field |
| `src/renderer/types/globals.d.ts` | Removed `emberMetadata` and `protocolVersion` from AppState interface |
| `src/renderer/managers/ember-manager.ts` | Removed `App.emberMetadata.clear()` and `App.emberMetadata.set(...)`, cleaned legacy comments |
| `src/renderer/managers/invite-manager.ts` | Removed `isSignalEmber` guards (lines 299-303, 535-539), removed `protocol_version` checks — all embers are Signal |
| `src/renderer/managers/direct-messaging-manager.ts` | Removed `partnerProtocolVersion` field from DmEntry, removed `partnerProtocolVersion === 1` conditionals, removed `partnerProtocolVersion: 0` defaults, cleaned all migration comments, updated JSDoc |
| `src/renderer/services/enhanced-recovery-service.ts` | Simplified `identity_key_type` from `'legacy' \| 'ed25519' \| 'curve25519'` to `'ed25519'`, removed `protocol_version < 2` and `identity_key_type === 'legacy'` checks, hardcoded `enhanced: true` |
| `src/renderer/services/epoch-history-service.ts` | Removed `decryptLegacyMessage()` function, removed legacy v1.x fallback path, removed `legacy` counter from `getDecryptionInfo()`, simplified `decryptMessage()` to epoch-only |
| `src/renderer/services/voice-service.ts` | Removed "Legacy Phase 4 cleanup" comment |
| `src/renderer/services/invite-ephemeral-key-service.ts` | Cleaned "Signal Protocol migration" from JSDoc header |
| `src/renderer/services/attachment-encryption-service.ts` | Cleaned "Signal Protocol migration" from JSDoc header |
| `src/renderer/services/message-service.ts` | Changed "Hard cutover" comments to neutral wording |
| `src/main/index.ts` | Removed "(legacy keys removed)" and "(legacy key storage disabled)" log messages, removed stale migration comments |
| `src/main/signal-db.ts` | Changed "e.g. after migration" comment to "after initial DB creation" |
| `ember-shared/src/crypto/service.ts` | Cleaned JSDoc, removed "Signal migration cutover notes" header, removed "(legacy)"/"(Signal migration)" labels from recovery code format docs |
| `ember-server/internal/transport/http/routes.go` | Removed PATCH /devices migration comment, removed "migrate from DM boxes" comment, made `NewPublicKey` required in device recovery (removed backward-compat key copy fallback) |
| `ember-server/internal/transport/http/dm_request_handlers.go` | Removed "fallback for old clients" comment from `EncryptedKeySelf` field |

### Key Behavioral Changes (Pass 2)

1. **Device recovery now requires `new_public_key`** — the server no longer falls back to copying the old device's public key. All clients must provide a new key during recovery.
2. **`decryptLegacyMessage()` removed from epoch-history-service** — only epoch-based Signal messages are supported. Non-epoch messages will throw an explicit error.
3. **`isSignalEmber` guards removed** — invite creation and acceptance no longer check whether an ember is Signal Protocol. All embers are Signal by definition.
4. **`partnerProtocolVersion` removed from DM state** — Signal sessions are initiated for all partners with known device IDs, unconditionally.
5. **`identity_key_type` narrowed to `'ed25519'` only** — recovery codes no longer accept or check for `'legacy'` or `'curve25519'` key types.

### Pass 2 Verification

Final grep across all source files for 40+ legacy patterns returned **1 match**: the standard SQL schema migration loop variable name `migration` in `database.go`, which is legitimate database schema evolution infrastructure.

---

*Report generated by Claude Code on 2026-03-21.*
*Pass 1: claude-sonnet-4-6 | Pass 2: claude-opus-4-6*
*Cleanup performed against Ember monorepo post-Signal Protocol v2.3 migration.*
