# TDEX Governance Vault & DILOS Security Specification (Phase 0 TDD)

## 1. Core Security Invariants
1. **Closed Vault Isolation**: Public visitors and unverified users receive zero reads/writes across `vault_roles`, `court_access_requests`, `court_orders`, `vault_filings`, `internal_movement_log`, and `encrypted_pii_vault`.
2. **Court-Before-Board Rule**: A `BOARD_MEMBER` cannot create or approve their own `court_orders` and cannot read `vault_filings` unless a valid `court_orders` document exists with `status == 'APPROVED'`, `boardMemberUid == request.auth.uid`, and `expiresAtMs` valid.
3. **Immutable Movement Ledger**: Every entry in `internal_movement_log` is strictly append-only (`allow update, delete: if false;`), enforcing SHA-256 `prevHash`/`currentHash` 64-char hex strings and `request.time` timestamp integrity.
4. **No Self-Privilege Escalation**: Users cannot write to `vault_roles` to promote themselves to `FOUNDER` or `ARBITRATION_COURT`; only verified `FOUNDER` (`petrossianbobby@gmail.com` or assigned Founder role) can assign roles.
5. **No Shadow Fields / Payload Exhaustion**: All `create` and `update` gates enforce `keys().hasOnly(...)`, `affectedKeys().hasOnly(...)`, `isValidId()`, and `.size()` caps on every string field.

## 2. Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Vault Filing Read**: Anonymous user attempts `get(/vault_filings/FILING-001)` -> `PERMISSION_DENIED`.
2. **Public User Self-Admin Role Escalation**: Signed-in non-Founder creates `/vault_roles/{uid}` with `role: "FOUNDER"` -> `PERMISSION_DENIED`.
3. **Unverified Email Admin Spoof**: Token with `email: "petrossianbobby@gmail.com"` and `email_verified: false` reads `/vault_filings` -> `PERMISSION_DENIED`.
4. **Board Member Self-Approval**: `BOARD_MEMBER` creates `/court_orders/ORD-1` with `status: "APPROVED"` -> `PERMISSION_DENIED`.
5. **Board Member Bypassing Court**: `BOARD_MEMBER` without an active `APPROVED` Court Order reads `/vault_filings/FILING-001` -> `PERMISSION_DENIED`.
6. **Board Member Modifying Request Status**: `BOARD_MEMBER` updates `/court_access_requests/REQ-1` to `status: "APPROVED"` -> `PERMISSION_DENIED`.
7. **Shadow Field Injection on Request**: Valid `BOARD_MEMBER` creates `/court_access_requests/REQ-2` with extra ghost field `isAutoApproved: true` -> `PERMISSION_DENIED`.
8. **Movement Log Tampering (Update)**: Even `FOUNDER` attempts `update(/internal_movement_log/MOV-1, { summary: "edited" })` -> `PERMISSION_DENIED`.
9. **Movement Log Deletion**: Even `FOUNDER` attempts `delete(/internal_movement_log/MOV-1)` -> `PERMISSION_DENIED`.
10. **Forged Timestamp on Movement Log**: Authorized user creates `/internal_movement_log/MOV-2` with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
11. **1.5KB Document ID Resource Poisoning**: User creates `/court_access_requests/${'A'.repeat(1500)}` -> `PERMISSION_DENIED`.
12. **Cross-Owner PII Read**: Authenticated User A attempts `get(/encrypted_pii_vault/USER_B)` -> `PERMISSION_DENIED`.
