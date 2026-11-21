import 'dotenv/config';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadStore,
  saveStoreAtomic,
  type PersistedLedgerBlock,
  type PersistedMarketplaceListing,
  type PersistedOwnerAccount,
  type PersistedStudioSubmission,
  type PersistedTradeReceipt,
  type PersistedVaultSession,
  type VaultAccessScope,
  type VaultFolderName,
  type VaultRole,
} from './src/server/dbStore.ts';
import {
  authenticateVaultPasscode,
  canScopeAccessCategory,
  createCourtAccessRequest,
  executeGovernanceBoardHandover,
  fileVaultRecord,
  getActiveBoardCourtOrder,
  initializeVaultSecurity,
  recordMovement,
  reviewCourtAccessRequest,
  revokeCourtOrder,
  rotateVaultPasscode,
  verifyMovementChain,
} from './src/server/vaultEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

// ============================================================================
// 1. CONSTITUTIONAL CONSTANTS & HARD GATES (VERSION 10.0)
// ============================================================================
const CHARTER_VERSION = '10.0';
const MAX_DBC_SUPPLY = 100_000_000;
const IS_LIVE_PAYPAL_ENV = process.env.PAYPAL_ENV === 'live';
const PAYPAL_API_BASE = IS_LIVE_PAYPAL_ENV
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Hard-Hold Gate applies to LIVE real-money settlement until TDEX_LIVE_ESCROW_ENABLED === 'true'.
// PayPal Sandbox testing stays enabled cleanly with zero real money movement.
const PRODUCTION_REAL_MONEY_HOLD =
  !IS_LIVE_PAYPAL_ENV || process.env.TDEX_LIVE_ESCROW_ENABLED !== 'true';
const LIVE_PAYPAL_CHECKOUT_BLOCKED =
  IS_LIVE_PAYPAL_ENV && process.env.TDEX_LIVE_ESCROW_ENABLED !== 'true';

// ============================================================================
// 2. ATOMIC PERSISTENT STORE & SEGREGATED VAULTS (ARTICLE 8 & 10)
// ============================================================================
const store = loadStore();
initializeVaultSecurity(store);

type OwnerAccount = PersistedOwnerAccount;
type LedgerBlock = PersistedLedgerBlock;


function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function generateTrackingId(prefix = 'TDX'): string {
  const year = new Date().getUTCFullYear();
  const rand = crypto.randomInt(10000, 99999);
  return `${prefix}-${year}-${rand}`;
}

// ============================================================================
// 3. DILOS 4-STAGE PIPELINE (ARTICLE 7: CONCIERGE -> COLUMBO -> PIPITO -> HUMAN)
// ============================================================================
function conciergeStripPii(rawText: string): string {
  return rawText
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/\b\d{5}(?:-\d{4})?\b/g, '[REDACTED_ZIP]');
}

function columboVerifySplitCents(totalCents: number) {
  const base50 = Math.floor((totalCents * 50) / 100);
  const base25a = Math.floor((totalCents * 25) / 100);
  const base25b = Math.floor((totalCents * 25) / 100);
  const rem = totalCents - (base50 + base25a + base25b);
  const sellerCashCents = base50 + (rem >= 1 ? 1 : 0);
  const sellerEquityCents = base25a + (rem >= 2 ? 1 : 0);
  const buyerEquityCents = base25b + (rem >= 3 ? 1 : 0);

  const valid =
    sellerCashCents + sellerEquityCents + buyerEquityCents === totalCents && totalCents > 0;

  return {
    valid,
    sellerCashCents,
    sellerEquityCents,
    buyerEquityCents,
    auditHash: sha256(
      `COLUMBO|${totalCents}|${sellerCashCents}|${sellerEquityCents}|${buyerEquityCents}`
    ),
  };
}

function pipitoCheckConstitutionalGates(checks: {
  totalDbcAfter?: number;
  deedRecordedBeforeDbc?: boolean;
  prizeCashVerifiedInBank?: boolean;
  accountQuarantined?: boolean;
}): { cleared: boolean; reason?: string } {
  if (store.vaultSecurityState.emergencyStopActive) {
    return {
      cleared: false,
      reason: `PIPITO_HALT: Global Emergency Stop Active (${
        store.vaultSecurityState.emergencyStopReason || 'Frozen by Governance/Court Order'
      }).`,
    };
  }
  if (checks.accountQuarantined) {
    return { cleared: false, reason: 'PIPITO_HALT: Account under Global Quarantine (GQ).' };
  }
  if (typeof checks.totalDbcAfter === 'number' && checks.totalDbcAfter > MAX_DBC_SUPPLY) {
    return { cleared: false, reason: 'PIPITO_HALT: Exceeds 100,000,000 hard DBC cap (Art. 11.7).' };
  }
  if (checks.deedRecordedBeforeDbc === false) {
    return {
      cleared: false,
      reason: 'PIPITO_HALT: Property DBC blocked until deed is recorded & funded (Art. 11.2).',
    };
  }
  if (checks.prizeCashVerifiedInBank === false) {
    return {
      cleared: false,
      reason: 'PIPITO_HALT: Unfunded prize claim blocked under Funded-First Rule (Art. 13.1).',
    };
  }
  return { cleared: true };
}

function commitToAppendOnlyLedger(
  eventType: string,
  payload: Record<string, unknown>,
  humanWitnessUid: string,
  columboAuditHash: string
): LedgerBlock {
  const prevHash =
    store.appendOnlyLedger.length > 0
      ? store.appendOnlyLedger[store.appendOnlyLedger.length - 1].currentHash
      : '0'.repeat(64);
  const eventId = generateTrackingId('TDX');
  const timestampUtc = new Date().toISOString();
  const rawBlock = JSON.stringify({
    seq: store.appendOnlyLedger.length + 1,
    eventId,
    timestampUtc,
    eventType,
    prevHash,
    humanWitnessUid,
    columboAuditHash,
    payload,
  });
  const currentHash = sha256(rawBlock);

  const block: LedgerBlock = {
    seq: store.appendOnlyLedger.length + 1,
    eventId,
    timestampUtc,
    eventType,
    prevHash,
    currentHash,
    dilosPipeline: {
      conciergeId: 'CONCIERGE_V10',
      columboAuditHash,
      pipitoGateStatus: 'GATE_CLEARED',
      humanWitnessUid,
    },
    payload,
  };
  store.appendOnlyLedger.push(block);
  saveStoreAtomic(store);
  return block;
}

// ============================================================================
// 4. OWNER AUTHENTICATION: REGISTER, SIGN-IN, SIGN-OUT (ARTICLES 1.1 & 4.1)
// ============================================================================
function findOptionalOwnerFromHeader(req: Request): OwnerAccount | undefined {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return undefined;
  const ownerUuid = store.sessions[token];
  if (!ownerUuid) return undefined;
  return Object.values(store.ownersByEmail).find((o) => o.ownerUuid === ownerUuid);
}

function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const ownerUuid = store.sessions[token];
  if (!ownerUuid) {
    res.status(401).json({ error: 'Authentication required. Please sign in as a verified Owner.' });
    return;
  }
  const owner = Object.values(store.ownersByEmail).find((o) => o.ownerUuid === ownerUuid);
  if (!owner) {
    res.status(401).json({ error: 'Owner account not found.' });
    return;
  }
  (req as Request & { owner: OwnerAccount }).owner = owner;
  next();
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RESET_HMAC_KEY = crypto.randomBytes(32);
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_MAX_ATTEMPTS = 5;
const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

interface PasswordResetRecord {
  codeHash: string;
  expiresAtMs: number;
  attempts: number;
}

const passwordResetRequests = new Map<string, PasswordResetRecord>();
const authRateLimits = new Map<string, { count: number; resetAtMs: number }>();

function checkAuthRateLimit(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const current = authRateLimits.get(key);
  if (!current || now > current.resetAtMs) {
    authRateLimits.set(key, { count: 1, resetAtMs: now + windowMs });
    return true;
  }
  if (current.count >= maxHits) {
    return false;
  }
  current.count += 1;
  return true;
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  if (aHex.length !== bHex.length) return false;
  const aBuf = Buffer.from(aHex, 'hex');
  const bBuf = Buffer.from(bHex, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function hashOwnerPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyOwnerPassword(
  owner: OwnerAccount,
  normalizedEmail: string,
  password: string
): { valid: boolean; needsRehash: boolean } {
  if (owner.passwordHash.startsWith('scrypt$')) {
    const parts = owner.passwordHash.split('$');
    if (parts.length !== 3) return { valid: false, needsRehash: false };
    const [, salt, expectedHex] = parts;
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return { valid: timingSafeEqualHex(derived, expectedHex), needsRehash: false };
  }
  const legacyHash = sha256(`${normalizedEmail}:${password}`);
  const valid = timingSafeEqualHex(legacyHash, owner.passwordHash);
  return { valid, needsRehash: valid };
}

function generateRecoveryCode(): string {
  let raw = '';
  for (let i = 0; i < 8; i += 1) {
    raw += RECOVERY_ALPHABET[crypto.randomInt(0, RECOVERY_ALPHABET.length)];
  }
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

function hashRecoveryCode(normalizedEmail: string, rawCode: string): string {
  const canonicalCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return crypto
    .createHmac('sha256', RESET_HMAC_KEY)
    .update(`${normalizedEmail}:${canonicalCode}`)
    .digest('hex');
}

function normalizeComparableName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    email,
    confirmEmail,
    password,
    confirmPassword,
    fullName,
    stateCode,
    isAdultVerified,
    acceptedCharterV10,
  } = req.body ?? {};

  if (!email || !password || !fullName || !stateCode) {
    res.status(400).json({ error: 'Email, password, full name, and state/country are required.' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
    res.status(400).json({
      error: 'Please enter a valid email address (for example: name@example.com).',
    });
    return;
  }

  if (confirmEmail !== undefined) {
    const normalizedConfirm = String(confirmEmail).trim().toLowerCase();
    if (!normalizedConfirm || normalizedConfirm !== normalizedEmail) {
      res.status(400).json({
        error: 'Email addresses do not match. Please enter the same email address twice.',
      });
      return;
    }
  }

  const cleanPassword = String(password);
  if (cleanPassword.length < 8 || cleanPassword.length > 128) {
    res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
    return;
  }
  if (confirmPassword !== undefined && String(confirmPassword) !== cleanPassword) {
    res.status(400).json({ error: 'Passwords do not match. Please re-enter your password.' });
    return;
  }

  const cleanFullName = String(fullName).trim();
  if (cleanFullName.length < 2 || cleanFullName.length > 120) {
    res.status(400).json({ error: 'Please enter your legal full name.' });
    return;
  }

  const cleanStateCode = String(stateCode).trim().toUpperCase();
  if (cleanStateCode.length < 2 || cleanStateCode.length > 10) {
    res.status(400).json({ error: 'Please enter a valid State or Country Code (e.g., OH, TX, CA).' });
    return;
  }

  if (!isAdultVerified) {
    res.status(403).json({
      error:
        'Article 4.5 Age Gate: Minors cannot register as financial Owners. Public school students enter via Parent/Guardian Consent under the National Discovery Awards.',
    });
    return;
  }
  if (!acceptedCharterV10) {
    res.status(400).json({
      error: 'You must acknowledge The Discovery Exchange Constitution Version 10.0 to register.',
    });
    return;
  }

  if (store.ownersByEmail[normalizedEmail]) {
    res.status(409).json({
      error: 'An Owner account already exists for this email. Please use Sign In instead.',
    });
    return;
  }

  const ownerUuid = `OWNER-${crypto.randomUUID()}`;
  const passwordHash = hashOwnerPassword(cleanPassword);

  // Store sensitive PII strictly in encrypted/segregated PII Vault
  store.piiVault[ownerUuid] = {
    fullName: cleanFullName,
    address: '',
    guardianConsent: true,
  };

  const owner: OwnerAccount = {
    ownerUuid,
    email: normalizedEmail,
    passwordHash,
    stateCode: cleanStateCode,
    isAdultVerified: true,
    charterAcceptedVersion: CHARTER_VERSION,
    votingWeight: 1,
    globalQuarantine: false,
    accumulationBalanceCents: 0,
    sellerCashBalanceCents: 0,
    siloNuggets: {},
    dbcBalance: 0,
    nonce: 0,
    createdAtUtc: new Date().toISOString(),
  };

  store.ownersByEmail[normalizedEmail] = owner;
  const totalOwners = Object.keys(store.ownersByEmail).length;
  store.governanceState.verifiedOwnerCount = totalOwners;

  const token = crypto.randomBytes(32).toString('hex');
  store.sessions[token] = ownerUuid;

  const ledgerBlock = commitToAppendOnlyLedger(
    'OWNER_REGISTERED',
    { ownerUuid, stateCode: owner.stateCode, votingWeight: 1, charterVersion: CHARTER_VERSION },
    ownerUuid,
    sha256(`REG|${ownerUuid}|1`)
  );

  recordMovement(store, {
    actorId: ownerUuid,
    actorRole: 'DILOS_SYSTEM',
    action: 'OWNER_REGISTERED',
    targetResource: `OWNER:${ownerUuid}`,
    dilosStage: 'CONCIERGE',
    summary: `Verified adult Owner registered from ${owner.stateCode} (PII isolated to Vault).`,
  });

  if (
    totalOwners >= 1000 &&
    !store.internalMovementLog.some((e) => e.action === 'FCU_CHARTER_THRESHOLD_REACHED')
  ) {
    recordMovement(store, {
      actorId: 'DILOS_SECURITY_KERNEL',
      actorRole: 'DILOS_SYSTEM',
      action: 'FCU_CHARTER_THRESHOLD_REACHED',
      targetResource: 'NCUA-FCU-CHARTER-ELIGIBLE',
      dilosStage: 'PIPITO',
      summary: `FCU_CHARTER_ELIGIBLE: Verified Owner count reached ${totalOwners} (>= 1,000). Eligible to file NCUA Federal Credit Union charter under Phase 2 transition.`,
    });
  }

  res.status(201).json({
    token,
    owner: {
      ownerUuid: owner.ownerUuid,
      email: owner.email,
      stateCode: owner.stateCode,
      votingWeight: owner.votingWeight,
      accumulationBalanceUsd: 0,
      sellerCashBalanceUsd: 0,
      dbcBalance: 0,
    },
    ledgerReceipt: ledgerBlock.eventId,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');
  const owner = store.ownersByEmail[normalizedEmail];

  if (!owner || !rawPassword) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const check = verifyOwnerPassword(owner, normalizedEmail, rawPassword);
  if (!check.valid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (check.needsRehash) {
    owner.passwordHash = hashOwnerPassword(rawPassword);
  }

  const token = crypto.randomBytes(32).toString('hex');
  store.sessions[token] = owner.ownerUuid;
  saveStoreAtomic(store);

  res.json({
    token,
    owner: {
      ownerUuid: owner.ownerUuid,
      email: owner.email,
      stateCode: owner.stateCode,
      votingWeight: owner.votingWeight,
      globalQuarantine: owner.globalQuarantine,
      accumulationBalanceUsd: owner.accumulationBalanceCents / 100,
      sellerCashBalanceUsd: (owner.sellerCashBalanceCents || 0) / 100,
      siloNuggets: owner.siloNuggets,
      dbcBalance: owner.dbcBalance,
    },
  });
});

app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const clientIp = req.ip || 'unknown';
  if (!checkAuthRateLimit(`recover-ip:${clientIp}`, 12, 15 * 60 * 1000)) {
    res.status(429).json({
      error: 'Too many password recovery attempts. Please wait 15 minutes and try again.',
    });
    return;
  }

  const { email, fullName, stateCode } = req.body ?? {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  if (!checkAuthRateLimit(`recover-email:${normalizedEmail}`, 6, 15 * 60 * 1000)) {
    res.status(429).json({
      error: 'Too many recovery requests for this email. Please wait 15 minutes and try again.',
    });
    return;
  }

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const owner = store.ownersByEmail[normalizedEmail];

  // Live email delivery mode when RESEND_API_KEY is configured in server environment
  if (resendApiKey) {
    if (owner) {
      const recoveryCode = generateRecoveryCode();
      passwordResetRequests.set(normalizedEmail, {
        codeHash: hashRecoveryCode(normalizedEmail, recoveryCode),
        expiresAtMs: Date.now() + PASSWORD_RESET_TTL_MS,
        attempts: 0,
      });

      const fromAddress = (process.env.RECOVERY_FROM_EMAIL || '').trim() || 'onboarding@resend.dev';
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [owner.email],
            subject: 'The Discovery Exchange — Password Recovery Code',
            text: `Your one-time password recovery code is: ${recoveryCode}\n\nThis code expires in 15 minutes. If you did not request a password reset, you can safely ignore this message.`,
          }),
        });
      } catch {
        // Do not leak delivery details to unauthenticated callers
      }

      recordMovement(store, {
        actorId: owner.ownerUuid,
        actorRole: 'DILOS_SYSTEM',
        action: 'OWNER_PASSWORD_RESET_REQUESTED',
        targetResource: `OWNER:${owner.ownerUuid}`,
        dilosStage: 'CONCIERGE',
        summary: 'Password recovery code issued via configured email provider.',
      });
    }

    res.json({
      ok: true,
      deliveryMode: 'email',
      message:
        'If an Owner account exists for that email address, a one-time password recovery code has been sent. Please enter the code below within 15 minutes.',
    });
    return;
  }

  // Pre-launch testing mode (no SMTP/Resend email provider configured yet):
  // Require verifying the Owner's private PII Vault Legal Full Name + State/Country Code
  // so no unauthenticated caller can obtain a recovery code with only an email address.
  const suppliedName = typeof fullName === 'string' ? fullName.trim() : '';
  const suppliedState = typeof stateCode === 'string' ? stateCode.trim().toUpperCase() : '';

  if (!suppliedName || !suppliedState) {
    res.json({
      ok: true,
      deliveryMode: 'identity_verification_required',
      message:
        'Pre-launch email delivery is currently in setup. To verify your identity and reset your password right now, please confirm the Legal Full Name and State/Country Code you used when creating your account.',
    });
    return;
  }

  const pii = owner ? store.piiVault[owner.ownerUuid] : undefined;
  const expectedNameHash = sha256(normalizeComparableName(pii?.fullName || '__none__'));
  const suppliedNameHash = sha256(normalizeComparableName(suppliedName));
  const expectedStateHash = sha256((owner?.stateCode || '__none__').trim().toUpperCase());
  const suppliedStateHash = sha256(suppliedState);

  const nameMatches = Boolean(owner && pii) && timingSafeEqualHex(expectedNameHash, suppliedNameHash);
  const stateMatches = Boolean(owner) && timingSafeEqualHex(expectedStateHash, suppliedStateHash);

  if (!owner || !nameMatches || !stateMatches) {
    res.status(400).json({
      error:
        'We could not verify those Owner details. Please double-check your email address, Legal Full Name, and State/Country Code.',
    });
    return;
  }

  const recoveryCode = generateRecoveryCode();
  passwordResetRequests.set(normalizedEmail, {
    codeHash: hashRecoveryCode(normalizedEmail, recoveryCode),
    expiresAtMs: Date.now() + PASSWORD_RESET_TTL_MS,
    attempts: 0,
  });

  recordMovement(store, {
    actorId: owner.ownerUuid,
    actorRole: 'DILOS_SYSTEM',
    action: 'OWNER_PASSWORD_RESET_REQUESTED',
    targetResource: `OWNER:${owner.ownerUuid}`,
    dilosStage: 'CONCIERGE',
    summary: 'Password recovery code issued after pre-launch PII Vault identity verification.',
  });

  res.json({
    ok: true,
    deliveryMode: 'prelaunch_verified_code',
    recoveryCode,
    expiresInMinutes: 15,
    message:
      'Owner identity verified. Enter your one-time recovery code below within 15 minutes to set a new password.',
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const clientIp = req.ip || 'unknown';
  if (!checkAuthRateLimit(`reset-ip:${clientIp}`, 12, 15 * 60 * 1000)) {
    res.status(429).json({
      error: 'Too many password reset attempts. Please wait 15 minutes and try again.',
    });
    return;
  }

  const { email, recoveryCode, newPassword, confirmNewPassword } = req.body ?? {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanCode = String(recoveryCode || '').trim();
  const cleanPassword = String(newPassword || '');
  const cleanConfirm = String(confirmNewPassword || '');

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (!cleanCode) {
    res.status(400).json({ error: 'Please enter your one-time recovery code.' });
    return;
  }
  if (cleanPassword.length < 8 || cleanPassword.length > 128) {
    res.status(400).json({ error: 'New password must be between 8 and 128 characters.' });
    return;
  }
  if (cleanPassword !== cleanConfirm) {
    res.status(400).json({ error: 'New passwords do not match. Please re-enter your new password.' });
    return;
  }

  const record = passwordResetRequests.get(normalizedEmail);
  if (!record || Date.now() > record.expiresAtMs) {
    passwordResetRequests.delete(normalizedEmail);
    res.status(400).json({
      error: 'This recovery code is invalid or has expired. Please request a new recovery code.',
    });
    return;
  }

  if (record.attempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
    passwordResetRequests.delete(normalizedEmail);
    res.status(429).json({
      error: 'Too many incorrect code attempts. Please request a new recovery code.',
    });
    return;
  }

  const suppliedHash = hashRecoveryCode(normalizedEmail, cleanCode);
  if (!timingSafeEqualHex(suppliedHash, record.codeHash)) {
    record.attempts += 1;
    res.status(400).json({ error: 'Invalid recovery code. Please check the code and try again.' });
    return;
  }

  const owner = store.ownersByEmail[normalizedEmail];
  passwordResetRequests.delete(normalizedEmail);
  if (!owner) {
    res.status(400).json({ error: 'Owner account could not be found.' });
    return;
  }

  owner.passwordHash = hashOwnerPassword(cleanPassword);

  // Invalidate all existing sessions for this Owner so prior tokens can no longer be used
  for (const [sessionToken, sessionOwnerUuid] of Object.entries(store.sessions)) {
    if (sessionOwnerUuid === owner.ownerUuid) {
      delete store.sessions[sessionToken];
    }
  }
  saveStoreAtomic(store);

  recordMovement(store, {
    actorId: owner.ownerUuid,
    actorRole: 'DILOS_SYSTEM',
    action: 'OWNER_PASSWORD_RESET_COMPLETED',
    targetResource: `OWNER:${owner.ownerUuid}`,
    dilosStage: 'PIPITO',
    summary: 'Owner password reset completed and prior active sessions revoked.',
  });

  res.json({
    ok: true,
    message: 'Your password has been updated. You can now sign in with your new password.',
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (token && store.sessions[token]) {
    delete store.sessions[token];
    saveStoreAtomic(store);
  }
  res.json({ ok: true, message: 'Signed out cleanly.' });
});

app.get('/api/auth/me', requireOwnerAuth, (req: Request, res: Response) => {
  const owner = (req as Request & { owner: OwnerAccount }).owner;
  res.json({
    ownerUuid: owner.ownerUuid,
    email: owner.email,
    stateCode: owner.stateCode,
    votingWeight: owner.votingWeight,
    globalQuarantine: owner.globalQuarantine,
    accumulationBalanceUsd: owner.accumulationBalanceCents / 100,
    sellerCashBalanceUsd: (owner.sellerCashBalanceCents || 0) / 100,
    siloNuggets: owner.siloNuggets,
    dbcBalance: owner.dbcBalance,
  });
});

app.get('/api/wallets/me', requireOwnerAuth, (req: Request, res: Response) => {
  const owner = (req as Request & { owner: OwnerAccount }).owner;
  const recentReceipts = store.tradeReceipts
    .filter((r) => r.buyerEmail === owner.email || r.sellerEmail === owner.email)
    .slice(-20)
    .reverse();

  res.json({
    ownerUuid: owner.ownerUuid,
    email: owner.email,
    stateCode: owner.stateCode,
    votingWeight: 1,
    accumulationBalanceCents: owner.accumulationBalanceCents,
    accumulationBalanceUsd: owner.accumulationBalanceCents / 100,
    sellerCashBalanceCents: owner.sellerCashBalanceCents || 0,
    sellerCashBalanceUsd: (owner.sellerCashBalanceCents || 0) / 100,
    dbcBalance: owner.dbcBalance,
    siloNuggets: owner.siloNuggets,
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
    recentReceipts,
  });
});

// ============================================================================
// 5. PAYPAL BUSINESS CHECKOUT & WEBHOOK ENGINE (50 / 25 / 25 — ARTICLE 12)
// ============================================================================
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in environment.');
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = (await response.json()) as { access_token?: string };
  if (!response.ok || !data.access_token) {
    throw new Error('Failed to authenticate with PayPal Business REST API.');
  }
  return data.access_token;
}

function canUsePayPalRestApi(): boolean {
  if (LIVE_PAYPAL_CHECKOUT_BLOCKED) return false;
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function buildPayPalMultipartyPurchaseUnits(params: {
  orderTrackingId: string;
  itemTitle: string;
  sellerPayPalEmail: string;
  sellerPropertyPayPalEmail: string;
  buyerPropertyPayPalEmail: string;
  totalCents: number;
}) {
  const split = columboVerifySplitCents(params.totalCents);
  if (!split.valid) {
    throw new Error('Columbo Arithmetic Audit Failed: Invalid 50/25/25 split.');
  }

  const cleanTitle = conciergeStripPii(params.itemTitle || 'Marketplace Item').slice(0, 60);
  const customMeta = JSON.stringify({
    orderTrackingId: params.orderTrackingId,
    itemTitle: cleanTitle,
    sellerEmail: params.sellerPayPalEmail,
    buyerEmail: params.buyerPropertyPayPalEmail,
    totalCents: params.totalCents,
    zeroTdexCustody: true,
    tdexFeeCents: 0,
  });

  // Zero-Custody 3-Way Multiparty Routing:
  // Buyer payment splits at PayPal processor settlement directly to 3 external user/escrow payees.
  // TDEX never appears as payee and collects $0 fee or commission.
  const purchaseUnits = [
    {
      reference_id: `${params.orderTrackingId}-50CASH`,
      custom_id: customMeta,
      description: `${cleanTitle} — 50% Direct Seller Cash (Article 12.1)`,
      payee: {
        email_address: params.sellerPayPalEmail,
      },
      amount: {
        currency_code: 'USD',
        value: (split.sellerCashCents / 100).toFixed(2),
      },
    },
    {
      reference_id: `${params.orderTrackingId}-25SELLER-PROP`,
      custom_id: customMeta,
      description: `${cleanTitle} — 25% Seller Segregated Property Wallet`,
      payee: {
        email_address: params.sellerPropertyPayPalEmail,
      },
      amount: {
        currency_code: 'USD',
        value: (split.sellerEquityCents / 100).toFixed(2),
      },
    },
    {
      reference_id: `${params.orderTrackingId}-25BUYER-PROP`,
      custom_id: customMeta,
      description: `${cleanTitle} — 25% Buyer Segregated Property Wallet`,
      payee: {
        email_address: params.buyerPropertyPayPalEmail,
      },
      amount: {
        currency_code: 'USD',
        value: (split.buyerEquityCents / 100).toFixed(2),
      },
    },
  ];

  return {
    split,
    purchaseUnits,
    tdexFeeCents: 0,
    zeroTdexCustody: true,
  };
}

async function verifyPayPalWebhookSignature(
  headers: Request['headers'],
  webhookEvent: unknown
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Live webhooks MUST have a configured webhook ID; sandbox unsigned testing permitted only when PAYPAL_ENV !== 'live'
    return !IS_LIVE_PAYPAL_ENV;
  }
  try {
    const accessToken = await getPayPalAccessToken();
    const verifyRes = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    });
    if (!verifyRes.ok) return false;
    const data = (await verifyRes.json()) as { verification_status?: string };
    return data.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}

function settlePayPal502525Receipt(params: {
  trackingId: string;
  itemTitle: string;
  sellerEmail?: string;
  buyerEmail?: string;
  totalCents: number;
  witnessId: string;
}) {
  const existing = store.tradeReceipts.find((r) => r.receiptId === params.trackingId);
  if (existing) {
    return { receipt: existing, alreadySettled: true };
  }

  const split = columboVerifySplitCents(params.totalCents);
  const resolvedSeller = (params.sellerEmail || 'sandbox-seller@paypal-wallet.invalid').toLowerCase();
  const resolvedBuyer = (params.buyerEmail || 'sandbox-buyer@paypal-wallet.invalid').toLowerCase();
  const seller = store.ownersByEmail[resolvedSeller];
  const buyer = store.ownersByEmail[resolvedBuyer];

  if (seller) {
    seller.sellerCashBalanceCents = (seller.sellerCashBalanceCents || 0) + split.sellerCashCents;
    seller.accumulationBalanceCents += split.sellerEquityCents;
  }
  if (buyer) {
    buyer.accumulationBalanceCents += split.buyerEquityCents;
  }

  const mode: PersistedTradeReceipt['mode'] =
    IS_LIVE_PAYPAL_ENV && !LIVE_PAYPAL_CHECKOUT_BLOCKED
      ? 'LIVE_ESCROW'
      : 'SANDBOX_SIMULATED_ESCROW_HOLD';

  const block = commitToAppendOnlyLedger(
    'MARKETPLACE_50_25_25_MULTIPARTY_SETTLED',
    {
      orderTrackingId: params.trackingId,
      itemTitle: params.itemTitle,
      totalCents: params.totalCents,
      sellerCashCents: split.sellerCashCents,
      sellerEquityCents: split.sellerEquityCents,
      buyerEquityCents: split.buyerEquityCents,
      tdexFeeCents: 0,
      zeroTdexCustody: true,
      mode,
    },
    params.witnessId,
    split.auditHash
  );

  const receipt: PersistedTradeReceipt = {
    receiptId: params.trackingId,
    itemId: params.trackingId,
    itemTitle: conciergeStripPii(params.itemTitle || 'PayPal Multiparty Verified Trade'),
    totalCents: params.totalCents,
    sellerCashCents: split.sellerCashCents,
    sellerEquityCents: split.sellerEquityCents,
    buyerEquityCents: split.buyerEquityCents,
    sellerEmail: resolvedSeller,
    buyerEmail: resolvedBuyer,
    columboAuditHash: split.auditHash,
    mode,
    ledgerEventId: block.eventId,
    executedAtUtc: block.timestampUtc,
  };

  store.tradeReceipts.push(receipt);
  saveStoreAtomic(store);
  return { receipt, alreadySettled: false };
}

app.get('/api/marketplace/paypal-status', (_req: Request, res: Response) => {
  res.json({
    paypalEnv: IS_LIVE_PAYPAL_ENV ? 'live' : 'sandbox',
    settlementArchitecture: 'PAYPAL_COMMERCE_MULTIPARTY_DIRECT_3WAY_SPLIT',
    zeroTdexCustody: true,
    tdexFeeCents: 0,
    credentialsConfigured: Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    ),
    webhookConfigured: Boolean(process.env.PAYPAL_WEBHOOK_ID),
    sandboxTestingEnabled: !IS_LIVE_PAYPAL_ENV,
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
  });
});

app.post('/api/marketplace/create-paypal-order', async (req: Request, res: Response) => {
  if (LIVE_PAYPAL_CHECKOUT_BLOCKED) {
    res.status(403).json({
      error: 'Live PayPal real-money checkout requires TDEX_LIVE_ESCROW_ENABLED=true.',
      productionRealMoneyHold: true,
    });
    return;
  }

  const authedBuyer = findOptionalOwnerFromHeader(req);
  const {
    itemId,
    itemTitle,
    priceUsd,
    sellerEmail,
    buyerEmail,
    sellerPropertyWalletEmail,
    buyerPropertyWalletEmail,
  } = req.body;

  const listing = itemId ? store.listings.find((it) => it.id === String(itemId)) : undefined;
  const resolvedTitle = String(listing?.title || itemTitle || 'Neighborhood Trade');
  const resolvedPrice = Number(priceUsd ?? listing?.price ?? 0);
  const totalCents = Math.round(resolvedPrice * 100);
  if (!resolvedTitle || !Number.isFinite(totalCents) || totalCents <= 0) {
    res.status(400).json({ error: 'Valid itemTitle and positive priceUsd are required.' });
    return;
  }

  // Stage 3: Pipito Constitutional Gate Check
  const gate = pipitoCheckConstitutionalGates({
    accountQuarantined: authedBuyer?.globalQuarantine,
  });
  if (!gate.cleared) {
    res.status(403).json({ error: gate.reason });
    return;
  }

  const resolvedSellerPayPal = String(
    listing?.sellerEmail || sellerEmail || 'seller-cash@sandbox.paypal.invalid'
  )
    .trim()
    .toLowerCase();
  const resolvedSellerPropertyPayPal = String(
    sellerPropertyWalletEmail || resolvedSellerPayPal
  )
    .trim()
    .toLowerCase();
  const resolvedBuyerPropertyPayPal = String(
    buyerPropertyWalletEmail ||
      authedBuyer?.email ||
      buyerEmail ||
      'buyer-property@sandbox.paypal.invalid'
  )
    .trim()
    .toLowerCase();

  const orderTrackingId = generateTrackingId('MKT');
  const multiparty = buildPayPalMultipartyPurchaseUnits({
    orderTrackingId,
    itemTitle: resolvedTitle,
    sellerPayPalEmail: resolvedSellerPayPal,
    sellerPropertyPayPalEmail: resolvedSellerPropertyPayPal,
    buyerPropertyPayPalEmail: resolvedBuyerPropertyPayPal,
    totalCents,
  });

  // Live REST API path (when live/sandbox PayPal REST keys are configured)
  if (canUsePayPalRestApi()) {
    try {
      const accessToken = await getPayPalAccessToken();
      const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: multiparty.purchaseUnits,
        }),
      });
      const orderData = (await orderRes.json()) as {
        id?: string;
        status?: string;
        links?: Array<{ rel?: string; href?: string }>;
      };
      const approveUrl = orderData.links?.find((l) => l.rel === 'approve')?.href;

      if (!IS_LIVE_PAYPAL_ENV && !orderRes.ok) {
        // In Sandbox preview, fall through cleanly to Multiparty Sandbox Simulation if REST keys are placeholder/unlinked
      } else {
        recordMovement(store, {
          actorId: authedBuyer?.ownerUuid || 'PAYPAL_MULTIPARTY_CHECKOUT',
          actorRole: 'DILOS_SYSTEM',
          action: 'PAYPAL_MULTIPARTY_ORDER_CREATED',
          targetResource: orderTrackingId,
          dilosStage: 'COLUMBO',
          summary: `Created 3-way zero-custody PayPal Multiparty order ($${(totalCents / 100).toFixed(2)}, $0 TDEX fee).`,
        });

        res.status(orderRes.status).json({
          ...orderData,
          orderTrackingId,
          approveUrl,
          purchase_units: multiparty.purchaseUnits,
          zeroTdexCustody: true,
          tdexFeeCents: 0,
          mode: IS_LIVE_PAYPAL_ENV
            ? 'PAYPAL_LIVE_MULTIPARTY_ORDER'
            : 'PAYPAL_SANDBOX_MULTIPARTY_ORDER',
          columboAuditHash: multiparty.split.auditHash,
          notice: IS_LIVE_PAYPAL_ENV
            ? 'Live PayPal Commerce Multiparty 3-way checkout created ($0 TDEX custody, direct seller + property wallet payees).'
            : 'PayPal Sandbox Multiparty 3-way checkout created via api-m.sandbox.paypal.com (no real money moved; zero TDEX custody).',
        });
        return;
      }
    } catch (err) {
      if (IS_LIVE_PAYPAL_ENV) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'PayPal multiparty order creation error.',
        });
        return;
      }
      // Sandbox mode: fall through to Multiparty Sandbox Simulation below
    }
  }

  // Immediate Sandbox Testing Fallback (when PAYPAL_ENV !== 'live' and REST credentials are omitted)
  if (IS_LIVE_PAYPAL_ENV) {
    res.status(403).json({
      error: 'Live PayPal checkout requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
    });
    return;
  }

  const settled = settlePayPal502525Receipt({
    trackingId: orderTrackingId,
    itemTitle: resolvedTitle,
    sellerEmail: resolvedSellerPayPal,
    buyerEmail: resolvedBuyerPropertyPayPal,
    totalCents,
    witnessId: 'PAYPAL_SANDBOX_MULTIPARTY_SIM',
  });

  recordMovement(store, {
    actorId: authedBuyer?.ownerUuid || 'SANDBOX_MULTIPARTY_BUYER',
    actorRole: 'DILOS_SYSTEM',
    action: 'PAYPAL_MULTIPARTY_SANDBOX_SETTLED',
    targetResource: orderTrackingId,
    dilosStage: 'COLUMBO',
    summary: `Executed 3-way zero-custody PayPal Multiparty Sandbox split ($${(totalCents / 100).toFixed(2)}, $0 TDEX fee).`,
  });

  res.status(201).json({
    id: `PAYPAL-SBX-${orderTrackingId}`,
    status: 'COMPLETED',
    orderTrackingId,
    purchase_units: multiparty.purchaseUnits,
    zeroTdexCustody: true,
    tdexFeeCents: 0,
    mode: 'PAYPAL_SANDBOX_MULTIPARTY_SPLIT',
    columboAuditHash: multiparty.split.auditHash,
    receipt: settled.receipt,
    notice:
      'PayPal Commerce Multiparty Sandbox test active: 50% seller cash + 25% seller property + 25% buyer property routed directly to external payees ($0 TDEX fee, zero custody).',
  });
});

app.post('/api/marketplace/capture-paypal-order', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'PayPal orderId is required.' });
    return;
  }
  if (LIVE_PAYPAL_CHECKOUT_BLOCKED) {
    res.status(403).json({
      error: 'Live PayPal capture requires TDEX_LIVE_ESCROW_ENABLED=true.',
    });
    return;
  }
  if (!IS_LIVE_PAYPAL_ENV && String(orderId).startsWith('PAYPAL-SBX-')) {
    const trackingId = String(orderId).replace(/^PAYPAL-SBX-/, '');
    const existing = store.tradeReceipts.find((r) => r.receiptId === trackingId);
    if (existing) {
      res.json({
        status: 'COMPLETED',
        paypalOrderId: orderId,
        zeroTdexCustody: true,
        tdexFeeCents: 0,
        receipt: existing,
        alreadySettled: true,
      });
      return;
    }
    res.status(404).json({ error: 'Sandbox multiparty order receipt not found.' });
    return;
  }
  if (!canUsePayPalRestApi()) {
    res.status(403).json({
      error: 'PayPal REST capture requires configured PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
    });
    return;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const capRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const capData = (await capRes.json()) as {
      id?: string;
      status?: string;
      purchase_units?: Array<{
        reference_id?: string;
        payments?: {
          captures?: Array<{
            id?: string;
            custom_id?: string;
            amount?: { value?: string };
          }>;
        };
      }>;
    };
    if (!capRes.ok || capData.status !== 'COMPLETED') {
      res.status(capRes.status || 400).json(capData);
      return;
    }

    const firstCapture = capData.purchase_units?.[0]?.payments?.captures?.[0];
    let parsed: {
      orderTrackingId?: string;
      itemTitle?: string;
      sellerEmail?: string;
      buyerEmail?: string;
      totalCents?: number;
    } = {};
    try {
      parsed = JSON.parse(firstCapture?.custom_id || '{}');
    } catch {
      parsed = {};
    }

    const summedCaptureCents = (capData.purchase_units || []).reduce((acc, unit) => {
      const val = Number(unit.payments?.captures?.[0]?.amount?.value || 0);
      return acc + Math.round(val * 100);
    }, 0);
    const totalCents = Number(parsed.totalCents || 0) || summedCaptureCents;
    const trackingId =
      parsed.orderTrackingId ||
      String(capData.purchase_units?.[0]?.reference_id || orderId).replace(
        /-(50CASH|25SELLER-PROP|25BUYER-PROP)$/,
        ''
      );

    const settled = settlePayPal502525Receipt({
      trackingId,
      itemTitle: parsed.itemTitle || 'PayPal Multiparty Marketplace Item',
      sellerEmail: parsed.sellerEmail,
      buyerEmail: parsed.buyerEmail,
      totalCents,
      witnessId: 'PAYPAL_MULTIPARTY_DIRECT_SETTLEMENT',
    });

    res.json({
      status: capData.status,
      paypalOrderId: capData.id,
      captureIds: (capData.purchase_units || []).map(
        (u) => u.payments?.captures?.[0]?.id || ''
      ),
      zeroTdexCustody: true,
      tdexFeeCents: 0,
      ...settled,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'PayPal multiparty order capture error.',
    });
  }
});

// PayPal Webhook Handler: verifies PayPal signature & commits ledger upon multiparty capture completion
app.post('/api/webhooks/paypal', async (req: Request, res: Response) => {
  if (LIVE_PAYPAL_CHECKOUT_BLOCKED) {
    res.status(403).json({
      error: 'Live PayPal webhooks require TDEX_LIVE_ESCROW_ENABLED=true.',
      productionRealMoneyHold: true,
    });
    return;
  }

  const verified = await verifyPayPalWebhookSignature(req.headers, req.body);
  if (!verified) {
    res.status(401).json({ error: 'Invalid PayPal webhook signature.' });
    return;
  }

  const event = req.body;
  if (event?.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const customRaw = event?.resource?.custom_id;
    let parsed: {
      orderTrackingId?: string;
      itemTitle?: string;
      sellerEmail?: string;
      buyerEmail?: string;
      totalCents?: number;
    } = {};
    try {
      parsed = JSON.parse(customRaw || '{}');
    } catch {
      parsed = {};
    }
    const totalCents =
      Number(parsed.totalCents || 0) ||
      Math.round(Number(event?.resource?.amount?.value || 0) * 100);
    if (totalCents > 0) {
      const trackingId =
        parsed.orderTrackingId || String(event?.resource?.id || generateTrackingId('MKT'));
      settlePayPal502525Receipt({
        trackingId,
        itemTitle: parsed.itemTitle || 'PayPal Multiparty Webhook Trade',
        sellerEmail: parsed.sellerEmail,
        buyerEmail: parsed.buyerEmail,
        totalCents,
        witnessId: 'PAYPAL_MULTIPARTY_WEBHOOK_GATEWAY',
      });
    }
  }
  res.status(200).json({ received: true, zeroTdexCustody: true, tdexFeeCents: 0 });
});

// ============================================================================
// 5B. PERSISTENT MARKETPLACE LISTINGS & 50/25/25 TRADE EXECUTION (ARTICLE 12)
// ============================================================================
app.get('/api/marketplace/items', (_req: Request, res: Response) => {
  const totalTrades = store.tradeReceipts.length;
  const totalSellerCashCents = store.tradeReceipts.reduce((sum, r) => sum + r.sellerCashCents, 0);
  const totalPropertyAccumulationCents = store.tradeReceipts.reduce(
    (sum, r) => sum + r.sellerEquityCents + r.buyerEquityCents,
    0
  );
  res.json({
    charterVersion: CHARTER_VERSION,
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
    items: store.listings,
    summary: {
      totalTrades,
      totalSellerCashUsd: totalSellerCashCents / 100,
      totalPropertyAccumulationUsd: totalPropertyAccumulationCents / 100,
    },
    recentReceipts: store.tradeReceipts.slice(-15).reverse(),
  });
});

app.post('/api/marketplace/list-item', (req: Request, res: Response) => {
  const {
    title,
    category,
    material,
    itemType,
    imageUrl,
    price,
    priceUsd,
    location,
    description,
    condition,
    sellerFamily,
    iconType,
    deliveryMethod,
    shippingFeeUsd,
    safetyAttestationAccepted,
  } = req.body ?? {};
  if (safetyAttestationAccepted !== true) {
    res.status(400).json({
      error:
        'You must confirm this item is legal, safe, not recalled, and contains zero prohibited items.',
    });
    return;
  }
  const numericPrice = Number(price ?? priceUsd ?? 0);
  if (!title || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    res.status(400).json({ error: 'Valid item title and positive price are required.' });
    return;
  }

  const allowedDelivery = ['local_pickup', 'free_shipping', 'flat_rate_shipping'] as const;
  const normalizedDelivery = allowedDelivery.includes(deliveryMethod)
    ? (deliveryMethod as 'local_pickup' | 'free_shipping' | 'flat_rate_shipping')
    : 'local_pickup';
  const rawShipping = Number(shippingFeeUsd ?? 0);
  const safeShippingFee =
    normalizedDelivery === 'flat_rate_shipping' && Number.isFinite(rawShipping) && rawShipping > 0
      ? Math.min(500, Math.round(rawShipping * 100) / 100)
      : 0;

  const authedOwner = findOptionalOwnerFromHeader(req);
  const allowedCategories = [
    'Tools & Workshop',
    'Science & Education',
    'Music & Arts',
    'Bikes & Sports',
    'Home & Furniture',
    'Electronics & Tech',
    'Building & Materials',
    'Kids & Family',
    'Auto & Garage',
    'Clothing & Gear',
    'Other Items',
  ];
  const normalizedCategory = allowedCategories.includes(String(category))
    ? String(category)
    : 'Tools & Workshop';

  // Validate optional imageUrl strictly: allow local /src/assets/ or /assets/, https://, or compressed image data URLs
  let safeImageUrl: string | undefined;
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    const trimmedUrl = imageUrl.trim();
    const isSafeLocal =
      (trimmedUrl.startsWith('/src/assets/') || trimmedUrl.startsWith('/assets/')) &&
      !trimmedUrl.includes('..');
    const isSafeHttps = /^https:\/\/[^\s"'<>]+$/i.test(trimmedUrl) && trimmedUrl.length <= 1024;
    const isSafeDataImage =
      /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmedUrl) &&
      trimmedUrl.length <= 550_000;
    if (isSafeLocal || isSafeHttps || isSafeDataImage) {
      safeImageUrl = trimmedUrl;
    }
  }

  const newListing: PersistedMarketplaceListing = {
    id: `item-${Date.now()}-${crypto.randomInt(100, 999)}`,
    title: conciergeStripPii(String(title).trim().slice(0, 140)),
    category: normalizedCategory,
    material: material ? String(material).trim().slice(0, 60) : 'Mixed Materials',
    itemType: itemType ? String(itemType).trim().slice(0, 60) : 'Household & Garage',
    imageUrl: safeImageUrl,
    price: Math.round(numericPrice * 100) / 100,
    deliveryMethod: normalizedDelivery,
    shippingFeeUsd: safeShippingFee,
    location: conciergeStripPii(String(location || authedOwner?.stateCode || 'Local Community').trim().slice(0, 80)),
    sellerFamily: conciergeStripPii(
      String(sellerFamily || (authedOwner ? `Owner (${authedOwner.stateCode})` : 'Verified Family Listing')).trim().slice(0, 80)
    ),
    sellerEmail: authedOwner?.email,
    description: conciergeStripPii(
      String(
        description ||
          'Item listed from a neighborhood garage—ready to build cooperative property equity.'
      ).trim().slice(0, 1200)
    ),
    condition: String(condition || 'Very Good').trim().slice(0, 40),
    badge: 'New Listing',
    iconType: String(iconType || 'tools'),
    status: 'ACTIVE',
    createdAtUtc: new Date().toISOString(),
  };

  store.listings.unshift(newListing);
  commitToAppendOnlyLedger(
    'MARKETPLACE_ITEM_LISTED',
    {
      listingId: newListing.id,
      title: newListing.title,
      priceUsd: newListing.price,
      category: newListing.category,
    },
    authedOwner?.ownerUuid || 'NEIGHBORHOOD_LISTER',
    sha256(`LIST|${newListing.id}|${newListing.price}`)
  );

  recordMovement(store, {
    actorId: authedOwner?.ownerUuid || 'NEIGHBORHOOD_LISTER',
    actorRole: 'DILOS_SYSTEM',
    action: 'MARKETPLACE_ITEM_LISTED',
    targetResource: newListing.id,
    dilosStage: 'CONCIERGE',
    summary: `Marketplace listing added (${newListing.title} — $${newListing.price}).`,
  });

  res.status(201).json({
    item: newListing,
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
  });
});

app.post('/api/marketplace/execute-trade', (req: Request, res: Response) => {
  const { itemId, itemTitle, priceUsd, sellerEmail, buyerEmail } = req.body;
  const authedBuyer = findOptionalOwnerFromHeader(req);

  const listing = itemId ? store.listings.find((it) => it.id === String(itemId)) : undefined;
  const resolvedTitle = conciergeStripPii(String(listing?.title || itemTitle || 'Neighborhood Trade'));
  const resolvedPrice = Number(priceUsd ?? listing?.price ?? 0);
  const totalCents = Math.round(resolvedPrice * 100);

  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    res.status(400).json({ error: 'Positive trade amount is required.' });
    return;
  }

  // Stage 2: Columbo Arithmetic Audit (50 / 25 / 25 exact cent conservation)
  const split = columboVerifySplitCents(totalCents);
  if (!split.valid) {
    res.status(400).json({ error: 'Columbo Audit Failed: Invalid 50/25/25 cent split.' });
    return;
  }

  // Stage 3: Pipito Constitutional Gate Check
  const gate = pipitoCheckConstitutionalGates({
    accountQuarantined: authedBuyer?.globalQuarantine,
  });
  if (!gate.cleared) {
    res.status(403).json({ error: gate.reason });
    return;
  }

  const resolvedBuyerEmail = (
    authedBuyer?.email ||
    (typeof buyerEmail === 'string' && buyerEmail.trim()) ||
    'demo-buyer.invalid'
  ).toLowerCase();
  const resolvedSellerEmail = (
    listing?.sellerEmail ||
    (typeof sellerEmail === 'string' && sellerEmail.trim()) ||
    'demo-seller.invalid'
  ).toLowerCase();

  // Credit persisted Owner wallets if registered Owners are party to the trade
  const buyerOwner = store.ownersByEmail[resolvedBuyerEmail];
  const sellerOwner = store.ownersByEmail[resolvedSellerEmail];
  if (buyerOwner) {
    buyerOwner.accumulationBalanceCents += split.buyerEquityCents;
  }
  if (sellerOwner) {
    sellerOwner.sellerCashBalanceCents =
      (sellerOwner.sellerCashBalanceCents || 0) + split.sellerCashCents;
    sellerOwner.accumulationBalanceCents += split.sellerEquityCents;
  }

  const mode: PersistedTradeReceipt['mode'] = PRODUCTION_REAL_MONEY_HOLD
    ? 'SANDBOX_SIMULATED_ESCROW_HOLD'
    : 'LIVE_ESCROW';

  const block = commitToAppendOnlyLedger(
    'MARKETPLACE_50_25_25_EXECUTED',
    {
      itemId: listing?.id || itemId || 'custom',
      itemTitle: resolvedTitle,
      totalCents,
      sellerCashCents: split.sellerCashCents,
      sellerEquityCents: split.sellerEquityCents,
      buyerEquityCents: split.buyerEquityCents,
      mode,
    },
    authedBuyer?.ownerUuid || 'SANDBOX_TRADE_WITNESS',
    split.auditHash
  );

  const receipt: PersistedTradeReceipt = {
    receiptId: generateTrackingId('MKT'),
    itemId: listing?.id || String(itemId || 'custom'),
    itemTitle: resolvedTitle,
    totalCents,
    sellerCashCents: split.sellerCashCents,
    sellerEquityCents: split.sellerEquityCents,
    buyerEquityCents: split.buyerEquityCents,
    sellerEmail: resolvedSellerEmail,
    buyerEmail: resolvedBuyerEmail,
    columboAuditHash: split.auditHash,
    mode,
    ledgerEventId: block.eventId,
    executedAtUtc: block.timestampUtc,
  };

  store.tradeReceipts.push(receipt);
  saveStoreAtomic(store);

  recordMovement(store, {
    actorId: authedBuyer?.ownerUuid || 'SANDBOX_TRADE_WITNESS',
    actorRole: 'DILOS_SYSTEM',
    action: 'MARKETPLACE_50_25_25_EXECUTED',
    targetResource: receipt.receiptId,
    dilosStage: 'COLUMBO',
    summary: `Audited 50/25/25 split ($${(totalCents / 100).toFixed(2)}) for "${resolvedTitle}" (hash ${split.auditHash.slice(0, 12)}...).`,
  });

  res.status(201).json({
    receipt,
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
    notice: PRODUCTION_REAL_MONEY_HOLD
      ? 'Working draft walkthrough: 50/25/25 split recorded cleanly without charging any card or moving live funds.'
      : 'Live 50/25/25 trade committed.',
    splitBreakdown: {
      sellerCashUsd: split.sellerCashCents / 100,
      sellerPropertyAccumulationUsd: split.sellerEquityCents / 100,
      buyerPropertyAccumulationUsd: split.buyerEquityCents / 100,
      undisclosedFeeCents: 0,
    },
    buyerWallet: buyerOwner
      ? {
          email: buyerOwner.email,
          accumulationBalanceUsd: buyerOwner.accumulationBalanceCents / 100,
          votingWeight: buyerOwner.votingWeight,
        }
      : null,
    sellerWallet: sellerOwner
      ? {
          email: sellerOwner.email,
          sellerCashBalanceUsd: (sellerOwner.sellerCashBalanceCents || 0) / 100,
          accumulationBalanceUsd: sellerOwner.accumulationBalanceCents / 100,
          votingWeight: sellerOwner.votingWeight,
        }
      : null,
  });
});

// ============================================================================
// 6. NATIONAL DISCOVERY AWARDS (NDA) CONCIERGE INTAKE (ARTICLE 7 & 13)
// ============================================================================
app.post('/api/nda/submit', (req: Request, res: Response) => {
  const {
    ageDivision,
    category,
    projectTitle,
    projectDescription,
    videoUrl,
    verificationPromptAnswer,
    guardianConsentSigned,
    educatorWitnessEmail,
  } = req.body;

  if (!guardianConsentSigned || !educatorWitnessEmail) {
    res.status(400).json({
      error:
        'Pipito Gate Halted: Parental/Guardian consent (Art. 4.5) and non-family public school educator attestation are mandatory.',
    });
    return;
  }

  // Stage 1: Concierge PII Stripping
  const anonymizedTitle = conciergeStripPii(String(projectTitle || ''));
  const anonymizedDescription = conciergeStripPii(String(projectDescription || ''));
  const anonymizedAnswer = conciergeStripPii(String(verificationPromptAnswer || ''));

  // Stage 2: Columbo Evidence Hash
  const evidenceHash = sha256(
    `${ageDivision}|${category}|${anonymizedTitle}|${anonymizedDescription}|${videoUrl}`
  );

  // Stage 3: Pipito Constitutional Gate Check
  const gate = pipitoCheckConstitutionalGates({
    prizeCashVerifiedInBank:
      store.prizeTrustEscrow.verifiedCashCents > 0 || PRODUCTION_REAL_MONEY_HOLD,
  });
  if (!gate.cleared) {
    res.status(403).json({ error: gate.reason });
    return;
  }

  // Stage 4: Commit Anonymized Packet to Append-Only Ledger
  const block = commitToAppendOnlyLedger(
    'NDA_SUBMISSION_BLIND_PACKET',
    {
      ageDivision,
      category,
      anonymizedTitle,
      anonymizedDescription,
      anonymizedAnswer,
      evidenceHash,
      piiStatus: 'STRIPPED_BY_CONCIERGE',
    },
    'EDUCATOR_ATTESTED_PENDING_JURY',
    evidenceHash
  );

  recordMovement(store, {
    actorId: 'CONCIERGE_INTAKE',
    actorRole: 'DILOS_SYSTEM',
    action: 'NDA_SUBMISSION_FILED',
    targetResource: block.eventId,
    dilosStage: 'CONCIERGE',
    summary: `Blind NDA submission filed (${anonymizedTitle || 'Project'}) with PII stripped & educator attested.`,
  });

  res.status(201).json({
    trackingId: block.eventId,
    dilosStatus: 'CONCIERGE_AND_COLUMBO_CLEARED_AWAITING_12_OWNER_JURY',
    anonymizedPreview: {
      ageDivision,
      category,
      anonymizedTitle,
      anonymizedDescription,
    },
  });
});

// ============================================================================
// 7. PUBLIC APPEND-ONLY LEDGER & HEALTH ENDPOINTS
// ============================================================================
app.get('/api/ledger/public', (_req: Request, res: Response) => {
  res.json({
    charterVersion: CHARTER_VERSION,
    domains: [
      'nationaldiscoveryawards.com',
      'www.nationaldiscoveryawards.com',
      'thediscoveryexchange.com',
      'www.thediscoveryexchange.com',
    ],
    projectStatus: 'OPEN_PROJECT_UNDER_CONSTRUCTION_FOR_REVIEWS_AND_CRITICISM_ONLY',
    aiNotice:
      'Open project still under construction for public reviews and criticism. No financial transactions will be welcomed until January 1st, 2027.',
    totalEvents: store.appendOnlyLedger.length,
    prizeTrustEscrowUsd: store.prizeTrustEscrow.verifiedCashCents / 100,
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
    events: store.appendOnlyLedger.slice(-50),
  });
});

// ============================================================================
// 8. DISCOVERY STUDIO (CHANNEL #15) CREATIVE & PUBLIC SCHOOLS VIDEO INTAKE (SEPARATE FROM FINANCIAL LEDGER)
// ============================================================================
type StudioSubmissionRecord = PersistedStudioSubmission;

const STUDIO_SURPRISE_PROMPTS = [
  'Point to the trickiest part of your build and explain in 20 seconds what failed on your first try and how you fixed it.',
  'Hold up a plain piece of paper with today’s Studio Verification Code and show how your project reacts when you change one variable.',
  'Show two everyday household or garage materials you used, and explain why you chose them over store-bought parts.',
  'Explain your project’s core scientific or logical idea as if you are teaching a 4th grader in your neighborhood.',
  'Walk through your test log or sketch notebook for 15 seconds and show one measurement you recorded yourself.',
];

app.get('/api/studios/surprise-prompt', (_req: Request, res: Response) => {
  const code = `STD-${crypto.randomInt(1000, 9999)}`;
  const prompt =
    STUDIO_SURPRISE_PROMPTS[crypto.randomInt(0, STUDIO_SURPRISE_PROMPTS.length)];
  res.json({
    code,
    prompt,
    generatedAtUtc: new Date().toISOString(),
  });
});

app.get('/api/studios/submissions', (_req: Request, res: Response) => {
  res.json({
    channel: 15,
    totalQueued: store.studioSubmissions.length,
    submissions: store.studioSubmissions.slice(-20).reverse(),
  });
});

app.post('/api/studios/submit', (req: Request, res: Response) => {
  const {
    ageDivision,
    track,
    projectTitle,
    summary,
    materialsUsed,
    videoUrl,
    surprisePromptCode,
    surprisePromptText,
    guardianConsentSigned,
    educatorWitnessEmail,
  } = req.body;

  if (!projectTitle || !summary || !videoUrl) {
    res.status(400).json({
      error: 'Project title, plain-English summary, and 2-minute unedited video link are required.',
    });
    return;
  }

  if (!guardianConsentSigned || !educatorWitnessEmail) {
    res.status(400).json({
      error:
        'Article 4.5 & 13.2 Gate Halted: Parental/Guardian consent and non-family public school educator attestation are mandatory before studio intake.',
    });
    return;
  }

  const anonymizedTitle = conciergeStripPii(String(projectTitle).trim());
  const anonymizedSummary = conciergeStripPii(String(summary).trim());
  const anonymizedMaterials = conciergeStripPii(
    String(materialsUsed || 'Everyday household / classroom materials').trim()
  );

  const trackingId = generateTrackingId('STD');
  const evidenceHash = sha256(
    `STUDIO|${trackingId}|${ageDivision}|${track}|${anonymizedTitle}|${anonymizedSummary}|${surprisePromptCode}`
  );

  const record: StudioSubmissionRecord = {
    trackingId,
    submittedAtUtc: new Date().toISOString(),
    ageDivision: String(ageDivision || 'High School (9–12)'),
    track: String(track || 'Applied Discovery'),
    anonymizedTitle,
    anonymizedSummary,
    materialsUsed: anonymizedMaterials,
    surprisePromptCode: String(surprisePromptCode || 'STD-0000'),
    surprisePromptText: String(surprisePromptText || STUDIO_SURPRISE_PROMPTS[0]),
    videoUrl: String(videoUrl).trim(),
    evidenceHash,
    piiStatus: 'STRIPPED_BY_CONCIERGE',
    juryStatus: 'QUEUED_FOR_12_OWNER_OUT_OF_STATE_BLIND_JURY',
  };

  store.studioSubmissions.push(record);
  saveStoreAtomic(store);

  recordMovement(store, {
    actorId: 'STUDIO_CONCIERGE',
    actorRole: 'DILOS_SYSTEM',
    action: 'STUDIO_SUBMISSION_FILED',
    targetResource: record.trackingId,
    dilosStage: 'CONCIERGE',
    summary: `Discovery Studio packet queued (${record.anonymizedTitle}) for 12-Owner Out-of-State Blind Jury.`,
  });

  res.status(201).json(record);
});

// ============================================================================
// 9. COMPLETE ARCHIVE DOWNLOAD ENDPOINT (tdex-complete-final-v10.zip)
// ============================================================================
app.get('/api/download/tdex-complete-final-v10.zip', (_req: Request, res: Response) => {
  const candidatePublic = path.join(__dirname, 'public', 'tdex-complete-final-v10.zip');
  const candidateDist = path.join(__dirname, 'dist', 'tdex-complete-final-v10.zip');
  res.download(candidatePublic, 'tdex-complete-final-v10.zip', (err) => {
    if (err && !res.headersSent) {
      res.download(candidateDist, 'tdex-complete-final-v10.zip', (err2) => {
        if (err2 && !res.headersSent) {
          res.status(404).json({
            error:
              'Complete archive download is hosted externally so the production build remains compact under the deployment limit.',
          });
        }
      });
    }
  });
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// ============================================================================
// 10. DILOS V2 CLOSED GOVERNANCE VAULT, COURT GATE & AUDIT LEDGER (ART. 5, 7 & 8)
// ============================================================================
function requireVaultSession(req: Request, res: Response, next: NextFunction) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const session = token ? store.vaultSessions[token] : undefined;
  if (!session || session.expiresAtMs <= Date.now()) {
    if (token && store.vaultSessions[token]) {
      delete store.vaultSessions[token];
      saveStoreAtomic(store);
    }
    res.status(401).json({
      error: 'Closed Vault Authentication Required. Public access is strictly denied.',
      code: 'VAULT_AUTH_REQUIRED',
    });
    return;
  }
  (req as Request & { vaultSession: PersistedVaultSession }).vaultSession = session;
  next();
}

app.post('/api/vault/auth/login', (req: Request, res: Response) => {
  const { role, actorName, passcode } = req.body as {
    role?: VaultRole;
    actorName?: string;
    passcode?: string;
  };
  const validRoles: VaultRole[] = ['FOUNDER', 'ARBITRATION_COURT', 'BOARD_MEMBER', 'AI_OVERSIGHT'];
  if (!role || !validRoles.includes(role) || !passcode) {
    res.status(400).json({ error: 'Valid Vault role and passcode are required.' });
    return;
  }

  const ipKey = String(req.ip || req.socket.remoteAddress || 'unknown');
  const result = authenticateVaultPasscode(store, {
    role,
    actorName: String(actorName || ''),
    passcode: String(passcode),
    ipKey,
  });

  if (!result.ok || !result.session) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  const activeOrder =
    result.session.role === 'BOARD_MEMBER'
      ? getActiveBoardCourtOrder(store, result.session.actorId)
      : undefined;

  res.json({
    token: result.session.token,
    session: result.session,
    isTemporaryCredential: result.isTemporaryCredential,
    hasCourtClearance: result.session.role !== 'BOARD_MEMBER' || Boolean(activeOrder),
    activeCourtOrder: activeOrder || null,
    emergencyStopActive: store.vaultSecurityState.emergencyStopActive,
  });
});

app.post('/api/vault/auth/logout', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  delete store.vaultSessions[session.token];
  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'VAULT_LOGOUT',
    targetResource: `SESSION:${session.actorId}`,
    dilosStage: 'CONCIERGE',
    summary: `${session.actorLabel} locked and signed out of the Closed Vault.`,
  });
  res.json({ ok: true });
});

app.get('/api/vault/status', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  const activeOrder =
    session.role === 'BOARD_MEMBER'
      ? getActiveBoardCourtOrder(store, session.actorId)
      : undefined;

  const credentialMeta = Object.values(store.vaultCredentials).map((c) =>
    c
      ? {
          role: c.role,
          label: c.label,
          isTemporary: c.isTemporary,
          updatedAtUtc: c.updatedAtUtc,
        }
      : null
  );

  res.json({
    session,
    isTemporaryCredential: store.vaultCredentials[session.role]?.isTemporary ?? true,
    hasCourtClearance: session.role !== 'BOARD_MEMBER' || Boolean(activeOrder),
    activeCourtOrder: activeOrder || null,
    emergencyStopActive: store.vaultSecurityState.emergencyStopActive,
    emergencyStopReason: store.vaultSecurityState.emergencyStopReason,
    governanceState: {
      ...store.governanceState,
      verifiedOwnerCount: Object.keys(store.ownersByEmail).length,
      fcuCharterThreshold: 1000,
    },
    piiVaultCount: Object.keys(store.piiVault).length,
    ownersCount: Object.keys(store.ownersByEmail).length,
    creditUnionThreshold: {
      currentOwners: Object.keys(store.ownersByEmail).length,
      targetOwners: 1000,
      eligible: Object.keys(store.ownersByEmail).length >= 1000,
    },
    credentialMeta: session.role === 'FOUNDER' ? credentialMeta.filter(Boolean) : [],
  });
});

app.get('/api/vault/filings', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;

  if (session.role === 'BOARD_MEMBER') {
    const activeOrder = getActiveBoardCourtOrder(store, session.actorId);
    if (!activeOrder) {
      recordMovement(store, {
        actorId: session.actorId,
        actorRole: session.role,
        action: 'BOARD_ACCESS_BLOCKED_NO_COURT_ORDER',
        targetResource: 'VAULT_FILINGS',
        dilosStage: 'PIPITO',
        summary: `Blocked Board Member ${session.actorLabel} from reading Vault filings without an active Internal Arbitration Court Clearance Order.`,
      });
      res.status(403).json({
        code: 'COURT_APPROVAL_REQUIRED',
        error:
          'Court Approval Required: Even Board of Directors members must submit a formal request and receive an Internal Arbitration Court Clearance Order before viewing Vault filings.',
      });
      return;
    }

    const scopedFilings = store.vaultFilings.filter((f) =>
      canScopeAccessCategory(activeOrder.scope, f.category)
    );
    recordMovement(store, {
      actorId: session.actorId,
      actorRole: session.role,
      action: 'VAULT_FILINGS_LIST_READ',
      targetResource: `SCOPE:${activeOrder.scope}`,
      courtOrderId: activeOrder.orderId,
      dilosStage: 'HUMAN_COURT_WITNESS',
      summary: `Board Member ${session.actorLabel} viewed ${scopedFilings.length} scoped filing(s) under Court Order ${activeOrder.orderId} (${activeOrder.caseNumber}).`,
    });
    res.json({ filings: scopedFilings, activeCourtOrder: activeOrder });
    return;
  }

  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'VAULT_FILINGS_LIST_READ',
    targetResource: 'ALL_VAULT_FILINGS',
    dilosStage: session.role === 'ARBITRATION_COURT' ? 'HUMAN_COURT_WITNESS' : 'COLUMBO',
    summary: `${session.actorLabel} (${session.role}) accessed the Vault filings index (${store.vaultFilings.length} records).`,
  });

  res.json({ filings: store.vaultFilings, activeCourtOrder: null });
});

app.post('/api/vault/filings', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role === 'BOARD_MEMBER') {
    const activeOrder = getActiveBoardCourtOrder(store, session.actorId);
    if (!activeOrder || !store.governanceState.boardSeated) {
      res.status(403).json({
        error:
          'Phase 1 / Court Restriction: Board Members require Phase 2 seating or active Court Clearance to file Vault documents.',
      });
      return;
    }
  }

  const { folder, category, title, classification, summary, details, supersedesDocId } = req.body as {
    folder?: VaultFolderName;
    category?: 'FILINGS' | 'PII_OVERSIGHT' | 'AI_AUDIT_LOGS' | 'ESCROW_SAFEKEEPING';
    title?: string;
    classification?: 'BOARD_COURT_ONLY' | 'FOUNDER_COURT_ONLY' | 'DILOS_SEALED' | 'BOARD_AND_PUSHERS';
    summary?: string;
    details?: Record<string, unknown>;
    supersedesDocId?: string;
  };

  if (!title || !summary) {
    res.status(400).json({ error: 'Document title and summary are required.' });
    return;
  }

  const filing = fileVaultRecord(store, session, {
    folder: folder || '04_Board_Minutes_Votes',
    category: category || 'FILINGS',
    title,
    classification: classification || 'BOARD_COURT_ONLY',
    summary,
    details,
    supersedesDocId,
  });

  res.status(201).json({ filing });
});

app.post('/api/vault/filings/:filingId/inspect', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  const filing = store.vaultFilings.find((f) => f.filingId === req.params.filingId);
  if (!filing) {
    res.status(404).json({ error: 'Vault document not found.' });
    return;
  }

  let courtOrderId: string | undefined;
  if (session.role === 'BOARD_MEMBER') {
    const activeOrder = getActiveBoardCourtOrder(store, session.actorId);
    if (!activeOrder || !canScopeAccessCategory(activeOrder.scope, filing.category)) {
      recordMovement(store, {
        actorId: session.actorId,
        actorRole: session.role,
        action: 'BOARD_DOC_INSPECT_BLOCKED',
        targetResource: filing.filingId,
        dilosStage: 'PIPITO',
        summary: `Blocked unauthorized inspection attempt of ${filing.filingId} by ${session.actorLabel}.`,
      });
      res.status(403).json({
        code: 'COURT_APPROVAL_REQUIRED',
        error: 'Court Approval Required for this document category.',
      });
      return;
    }
    courtOrderId = activeOrder.orderId;
  }

  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'DOC_VIEWED',
    targetResource: filing.filingId,
    courtOrderId,
    dilosStage: 'HUMAN_COURT_WITNESS',
    summary: `Viewed "${filing.title}" (v${filing.version}) — hash ${filing.dilosIntegrityHash.slice(0, 12)}...`,
  });

  res.json({ filing });
});

app.get('/api/vault/court-requests', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role === 'BOARD_MEMBER') {
    const ownRequests = store.courtAccessRequests.filter(
      (r) => r.requesterActorId === session.actorId
    );
    const ownOrders = store.courtOrders.filter((o) => o.boardActorId === session.actorId);
    res.json({ requests: ownRequests, orders: ownOrders });
    return;
  }

  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'COURT_DOCKET_VIEWED',
    targetResource: 'COURT_ACCESS_DOCKET',
    dilosStage: 'HUMAN_COURT_WITNESS',
    summary: `${session.actorLabel} reviewed the Court Clearance docket (${store.courtAccessRequests.length} request(s)).`,
  });

  res.json({
    requests: store.courtAccessRequests,
    orders: store.courtOrders,
  });
});

app.post('/api/vault/court-requests', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role !== 'BOARD_MEMBER' && session.role !== 'FOUNDER') {
    res.status(403).json({ error: 'Only Board Directors or Founder can file access requests.' });
    return;
  }

  const { scope, justification, durationHours } = req.body as {
    scope?: VaultAccessScope;
    justification?: string;
    durationHours?: number;
  };

  if (!justification || justification.trim().length < 10) {
    res.status(400).json({
      error: 'A detailed constitutional/oversight justification (minimum 10 characters) is required for Court review.',
    });
    return;
  }

  const validScopes: VaultAccessScope[] = [
    'FILINGS',
    'PII_OVERSIGHT',
    'AI_AUDIT_LOGS',
    'ALL_VAULT_RECORDS',
  ];
  const resolvedScope = scope && validScopes.includes(scope) ? scope : 'FILINGS';

  const requestRecord = createCourtAccessRequest(store, session, {
    scope: resolvedScope,
    justification,
    durationHours: Number(durationHours || 24),
  });

  res.status(201).json({ request: requestRecord });
});

app.post('/api/vault/court-requests/:requestId/review', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role !== 'ARBITRATION_COURT') {
    recordMovement(store, {
      actorId: session.actorId,
      actorRole: session.role,
      action: 'UNAUTHORIZED_COURT_SIGN_ATTEMPT',
      targetResource: req.params.requestId,
      dilosStage: 'PIPITO',
      summary: `Blocked non-Court role (${session.role}) from approving Court request ${req.params.requestId}.`,
    });
    res.status(403).json({
      error:
        'Judicial Separation Gate: Only the Internal Arbitration Court may approve or deny Board access requests.',
    });
    return;
  }

  const { approve, caseNumber, courtNotes } = req.body as {
    approve?: boolean;
    caseNumber?: string;
    courtNotes?: string;
  };

  try {
    const result = reviewCourtAccessRequest(store, session, {
      requestId: req.params.requestId,
      approve: Boolean(approve),
      caseNumber,
      courtNotes,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unable to review request.' });
  }
});

app.post('/api/vault/court-orders/:orderId/revoke', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role !== 'ARBITRATION_COURT' && session.role !== 'FOUNDER') {
    res.status(403).json({ error: 'Only Internal Arbitration Court or Founder may revoke a Court Order.' });
    return;
  }
  const { reason } = req.body as { reason?: string };
  try {
    const order = revokeCourtOrder(store, session, req.params.orderId, String(reason || ''));
    res.json({ order });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Order not found.' });
  }
});

// Append-only movement log — ZERO UPDATE or DELETE endpoints exist anywhere on this resource
app.get('/api/vault/movement-log', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role === 'BOARD_MEMBER') {
    const activeOrder = getActiveBoardCourtOrder(store, session.actorId);
    if (
      !activeOrder ||
      (activeOrder.scope !== 'ALL_VAULT_RECORDS' && activeOrder.scope !== 'AI_AUDIT_LOGS')
    ) {
      res.status(403).json({
        code: 'COURT_APPROVAL_REQUIRED',
        error:
          'Court Clearance Required (Scope: AI_AUDIT_LOGS or ALL_VAULT_RECORDS) before Board Members can read full internal movement logs.',
      });
      return;
    }
  }

  const integrity = verifyMovementChain(store);
  res.json({
    integrity,
    entries: [...store.internalMovementLog].reverse().slice(0, 200),
    appendOnlyEnforced: true,
  });
});

app.get('/api/vault/verify-integrity', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  const result = verifyMovementChain(store);
  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'DILOS_CHAIN_VERIFIED',
    targetResource: 'INTERNAL_MOVEMENT_LOG',
    dilosStage: 'COLUMBO',
    summary: `Verified SHA-256 chain integrity across ${result.totalEntries} record(s): ${
      result.valid ? 'VALID' : `BROKEN AT SEQ ${result.brokenAtSeq}`
    }.`,
  });
  res.json(result);
});

app.post('/api/vault/rotate-password', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role !== 'FOUNDER') {
    res.status(403).json({ error: 'Only the Phase 1 Custodian / Founder may rotate role passwords.' });
    return;
  }
  const { targetRole, newPasscode } = req.body as { targetRole?: VaultRole; newPasscode?: string };
  const validRoles: VaultRole[] = ['FOUNDER', 'ARBITRATION_COURT', 'BOARD_MEMBER', 'AI_OVERSIGHT'];
  if (!targetRole || !validRoles.includes(targetRole) || !newPasscode || newPasscode.length < 12) {
    res.status(400).json({
      error: 'Valid role and strong new passcode (minimum 12 characters) are required.',
    });
    return;
  }
  rotateVaultPasscode(store, session, { targetRole, newPasscode });
  res.json({ ok: true, targetRole, rotatedAtUtc: new Date().toISOString() });
});

app.post('/api/vault/emergency-stop', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role !== 'FOUNDER' && session.role !== 'ARBITRATION_COURT') {
    res.status(403).json({
      error: 'Only Internal Arbitration Court or Phase 1 Custodian may trigger Emergency Stop.',
    });
    return;
  }
  const { active, reason } = req.body as { active?: boolean; reason?: string };
  store.vaultSecurityState.emergencyStopActive = Boolean(active);
  store.vaultSecurityState.emergencyStopReason = String(reason || '').trim();
  store.vaultSecurityState.updatedByActorId = session.actorId;
  store.vaultSecurityState.updatedAtUtc = new Date().toISOString();

  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: active ? 'EMERGENCY_STOP_ACTIVATED' : 'EMERGENCY_STOP_LIFTED',
    targetResource: 'DILOS_PIPITO_GLOBAL_GATE',
    dilosStage: 'PIPITO',
    summary: active
      ? `Activated Global DILOS Emergency Stop: ${store.vaultSecurityState.emergencyStopReason || 'Safety pause'}`
      : 'Lifted Global DILOS Emergency Stop.',
  });

  res.json({
    emergencyStopActive: store.vaultSecurityState.emergencyStopActive,
    emergencyStopReason: store.vaultSecurityState.emergencyStopReason,
  });
});

app.post('/api/vault/handover', requireVaultSession, (req: Request, res: Response) => {
  const session = (req as Request & { vaultSession: PersistedVaultSession }).vaultSession;
  if (session.role !== 'FOUNDER') {
    res.status(403).json({ error: 'Only Phase 1 Custodian may execute the Board handover.' });
    return;
  }
  const { boardIds } = req.body as { boardIds?: string[] };
  try {
    executeGovernanceBoardHandover(store, session, Array.isArray(boardIds) ? boardIds : []);
    res.json({ governanceState: store.governanceState });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Handover failed.' });
  }
});

// ============================================================================
// 11. STUDIO-QUALITY WALKTHROUGH VOICE NARRATION (GEMINI 3.8 FLASH LITE TTS)
// ============================================================================
const WALKTHROUGH_SCENE_SCRIPTS: Record<number, string> = {
  1: 'Want to see how everyday household items turn into 100 percent debt-free apartment buildings—with zero banks and zero money ever held by TDEX? Here is how to play in 60 seconds.',
  2: 'Step 1: Click List and Sell on any household item. Every sale splits 50, 25, 25—putting 50 percent immediate funds in your wallet and 25 percent straight into your Property Balance.',
  3: 'Step 2: Once you have enough Practice Funds, click Buy plus 25 percent Prop to earn another 25 percent toward your building goal.',
  4: 'Step 3: Reject bank mortgage traps, clear the DILOS math and zero-debt audit checks, and hit 1,000 dollars to close on Silo number 1—100 percent debt-free.',
  5: 'Once your building closes, you unlock a Discovery Brick Coin badge and collect 70 percent of net rental income while 30 percent automatically funds public school teachers and working-class students.',
};

const ALLOWED_STUDIO_VOICES = new Set(['Zephyr', 'Puck', 'Kore', 'Charon']);
const walkthroughAudioCache = new Map<string, Buffer>();
const walkthroughAudioInFlight = new Map<string, Promise<Buffer>>();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWalkthroughWav(sceneId: number, voiceName: string): Promise<Buffer> {
  const cacheKey = `${voiceName}:${sceneId}`;
  const cached = walkthroughAudioCache.get(cacheKey);
  if (cached) return cached;

  const existingPromise = walkthroughAudioInFlight.get(cacheKey);
  if (existingPromise) return existingPromise;

  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('Studio voice narration is unavailable (GEMINI_API_KEY not configured).');
  }

  const scriptText = WALKTHROUGH_SCENE_SCRIPTS[sceneId];
  const pending = (async () => {
    const requestAudio = async (includeSpeechMetadata: boolean) =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              includeSpeechMetadata
                ? {
                    text: scriptText,
                    speechMetadata: {
                      style:
                        'Warm, natural, upbeat human host — friendly, conversational, crisp studio broadcast voice',
                    },
                  }
                : {
                    text: `Read warmly like a friendly, natural human studio host: ${scriptText}`,
                  },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

    let response;
    try {
      response = await requestAudio(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('speechMetadata')) {
        response = await requestAudio(false);
      } else {
        throw err;
      }
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio returned from studio TTS model.');
    }
    const wavBuffer = Buffer.from(base64Audio, 'base64');
    walkthroughAudioCache.set(cacheKey, wavBuffer);
    return wavBuffer;
  })();

  walkthroughAudioInFlight.set(cacheKey, pending);
  try {
    return await pending;
  } finally {
    walkthroughAudioInFlight.delete(cacheKey);
  }
}

app.get('/api/walkthrough-voice/:sceneId', async (req: Request, res: Response) => {
  const sceneId = Number(req.params.sceneId);
  if (!Number.isInteger(sceneId) || !WALKTHROUGH_SCENE_SCRIPTS[sceneId]) {
    res.status(400).json({ error: 'Invalid walkthrough scene ID (expected 1-5).' });
    return;
  }

  const requestedVoice = String(req.query.voice || 'Zephyr');
  const voiceName = ALLOWED_STUDIO_VOICES.has(requestedVoice) ? requestedVoice : 'Zephyr';

  try {
    const wavBuffer = await generateWalkthroughWav(sceneId, voiceName);
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(wavBuffer);
  } catch (err) {
    console.error('Walkthrough TTS error:', err);
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Unable to generate studio narration audio.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Discovery Exchange (Version ${CHARTER_VERSION}) running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
