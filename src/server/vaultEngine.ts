import crypto from 'node:crypto';
import {
  saveStoreAtomic,
  type PersistedCourtAccessRequest,
  type PersistedCourtOrder,
  type PersistedMovementLogEntry,
  type PersistedVaultFiling,
  type PersistedVaultSession,
  type TdexPersistentStore,
  type VaultAccessScope,
  type VaultFolderName,
  type VaultRole,
} from './dbStore.ts';

const ZERO_HASH = '0'.repeat(64);
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function hashPasscode(passcode: string, saltHex?: string): { saltHex: string; scryptHashHex: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64);
  return { saltHex: salt, scryptHashHex: derived.toString('hex') };
}

function verifyPasscode(passcode: string, saltHex: string, expectedHashHex: string): boolean {
  const { scryptHashHex } = hashPasscode(passcode, saltHex);
  const actualBuf = Buffer.from(scryptHashHex, 'hex');
  const expectedBuf = Buffer.from(expectedHashHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function generateId(prefix: string): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${day}-${hex}`;
}

const ROLE_ENV_CONFIG: Record<VaultRole, { envVar: string; label: string }> = {
  FOUNDER: {
    envVar: 'TDEX_FOUNDER_PASSCODE',
    label: 'Phase 1 Custodian / Founder (petrossianbobby@gmail.com)',
  },
  ARBITRATION_COURT: {
    envVar: 'TDEX_COURT_PASSCODE',
    label: 'Internal Arbitration Court (12-Owner Jury Panel)',
  },
  BOARD_MEMBER: {
    envVar: 'TDEX_BOARD_PASSCODE',
    label: 'Board of Directors (30-Person Mom & Pop Board)',
  },
  AI_OVERSIGHT: {
    envVar: 'TDEX_AI_PASSCODE',
    label: 'DILOS AI Oversight (Columbo & Pipito Auditors)',
  },
};

/**
 * Seeds Vault role scrypt hashes ONLY from explicit environment variables.
 * Never embeds hardcoded fallback passcodes; purges any legacy temporary seeds if unset.
 */
export function initializeVaultSecurity(store: TdexPersistentStore): void {
  let changed = false;

  for (const [roleKey, cfg] of Object.entries(ROLE_ENV_CONFIG) as Array<
    [VaultRole, { envVar: string; label: string }]
  >) {
    const envPasscode = process.env[cfg.envVar]?.trim();
    const existing = store.vaultCredentials[roleKey];

    if (envPasscode) {
      if (!existing || !verifyPasscode(envPasscode, existing.saltHex, existing.scryptHashHex)) {
        const { saltHex, scryptHashHex } = hashPasscode(envPasscode);
        store.vaultCredentials[roleKey] = {
          role: roleKey,
          label: cfg.label,
          saltHex,
          scryptHashHex,
          isTemporary: false,
          updatedAtUtc: new Date().toISOString(),
        };
        changed = true;
      }
    } else if (existing?.isTemporary) {
      // Remove any legacy temporary default credential so old hardcoded passcodes can never work
      delete store.vaultCredentials[roleKey];
      changed = true;
    }
  }

  if (store.vaultFilings.length === 0) {
    const now = new Date().toISOString();
    const initialFilings: Array<Omit<PersistedVaultFiling, 'dilosIntegrityHash'>> = [
      {
        filingId: 'DOC-CHARTER-V10-SEAL',
        folder: '05_Append_Only_Audit_Trails',
        category: 'FILINGS',
        title: 'TDEX Charter v10.0 & Zero-Money-Handling Pre-Launch Compliance Record',
        version: 1,
        classification: 'BOARD_COURT_ONLY',
        summary:
          'Constitutional lock verifying $0 platform fee, zero live financial handling prior to Jan 1, 2027, 100M DBC hard ceiling, and 1 Human Owner = 1 Vote invariance.',
        details: {
          charterVersion: '10.0',
          maxDbcSupply: 100000000,
          zeroFeeInvariant: true,
          phase1Custodian: 'petrossianbobby@gmail.com',
        },
        createdByActorId: 'petrossianbobby@gmail.com',
        createdAtUtc: now,
      },
      {
        filingId: 'DOC-SILO-PROTOCOL-01',
        folder: '01_Property_Silos',
        category: 'ESCROW_SAFEKEEPING',
        title: 'Isolated 1,000-Nugget Property Silo Non-Cross-Collateralization Filing',
        version: 1,
        classification: 'BOARD_COURT_ONLY',
        summary:
          'Article 9.1 & 10.6 safekeeping filing guaranteeing zero mortgage debt and 70% Owners / 30% National Discovery Awards rental distribution split.',
        details: {
          nuggetsPerBuilding: 1000,
          grainsPerNugget: 20,
          rentSplit: '70_OWNERS_30_NDA',
          mortgageDebtAllowed: false,
        },
        createdByActorId: 'petrossianbobby@gmail.com',
        createdAtUtc: now,
      },
      {
        filingId: 'DOC-ESCROW-502525-MATCH',
        folder: '02_Seller_Side_Escrow_Matches',
        category: 'ESCROW_SAFEKEEPING',
        title: 'Marketplace 50/25/25 Segregated Escrow Allocation Ledger Specification',
        version: 1,
        classification: 'BOARD_COURT_ONLY',
        summary:
          'Verified integer-cent conservation rules: 50% Seller cash, 25% Seller property credit, 25% Buyer property credit, audited continuously by AI Columbo.',
        details: {
          splitRatio: '50/25/25',
          preLaunchEscrowHoldActive: true,
          columboIntegerCentCheck: 'ACTIVE',
        },
        createdByActorId: 'AI_COLUMBO_V10',
        createdAtUtc: now,
      },
      {
        filingId: 'DOC-DILOS-PIPITO-GATES',
        folder: '03_Awards_DILOS_Proofs',
        category: 'AI_AUDIT_LOGS',
        title: 'DILOS v2 Security Gatekeeper & PII Air-Gap Enforcement Matrix',
        version: 1,
        classification: 'DILOS_SEALED',
        summary:
          'Fail-closed gatekeeping checklist enforcing parental consent (Art. 4.5), out-of-state blind judging, and automatic PII stripping before storage.',
        details: {
          dilosStages: ['CONCIERGE', 'COLUMBO', 'PIPITO', 'HUMAN_COURT_WITNESS'],
          failClosedMode: true,
          piiRedactionEngine: 'ACTIVE',
        },
        createdByActorId: 'AI_PIPITO_V10',
        createdAtUtc: now,
      },
      {
        filingId: 'DOC-BOARD-COURT-CHARTER',
        folder: '04_Board_Minutes_Votes',
        category: 'PII_OVERSIGHT',
        title: 'Court-Before-Board Access Protocol & 30-Person Handover Prerequisites',
        version: 1,
        classification: 'FOUNDER_COURT_ONLY',
        summary:
          'Binds Board of Directors access strictly to signed Internal Arbitration Court Clearance Orders until formal Phase 2 30-seat lottery seating is verified.',
        details: {
          boardSeated: false,
          requiredDirectorsForHandover: 30,
          courtClearanceRequiredForBoard: true,
        },
        createdByActorId: 'petrossianbobby@gmail.com',
        createdAtUtc: now,
      },
    ];

    for (const f of initialFilings) {
      const hash = sha256Hex(
        `FILING|${f.filingId}|${f.folder}|${f.version}|${f.title}|${JSON.stringify(f.details)}`
      );
      store.vaultFilings.push({ ...f, dilosIntegrityHash: hash });
    }
    changed = true;
  }

  if (store.internalMovementLog.length === 0) {
    recordMovement(store, {
      actorId: 'DILOS_SECURITY_KERNEL',
      actorRole: 'DILOS_SYSTEM',
      action: 'VAULT_INITIALIZED',
      targetResource: 'DILOS_V2_VAULT',
      dilosStage: 'PIPITO',
      summary:
        'Initialized DILOS v2 Closed Vault, Court-Before-Board Clearance Gate, and immutable SHA-256 Movement Ledger.',
    });
    changed = true;
  }

  if (changed) {
    saveStoreAtomic(store);
  }
}

/**
 * Append-only immutable movement recorder.
 * Nothing inside moves without generating a sequential SHA-256 hash-chained log entry.
 */
export function recordMovement(
  store: TdexPersistentStore,
  params: {
    actorId: string;
    actorRole: VaultRole | 'DILOS_SYSTEM';
    action: string;
    targetResource: string;
    courtOrderId?: string;
    dilosStage: PersistedMovementLogEntry['dilosStage'];
    summary: string;
  }
): PersistedMovementLogEntry {
  const seq = store.internalMovementLog.length + 1;
  const eventId = generateId('MOV');
  const timestampUtc = new Date().toISOString();
  const prevHash =
    store.internalMovementLog.length > 0
      ? store.internalMovementLog[store.internalMovementLog.length - 1].currentHash
      : ZERO_HASH;

  const rawPayload = `${seq}|${eventId}|${timestampUtc}|${params.actorId}|${params.actorRole}|${params.action}|${params.targetResource}|${params.courtOrderId || ''}|${params.dilosStage}|${params.summary}|${prevHash}`;
  const currentHash = sha256Hex(rawPayload);

  const entry: PersistedMovementLogEntry = {
    seq,
    eventId,
    timestampUtc,
    actorId: params.actorId,
    actorRole: params.actorRole,
    action: params.action,
    targetResource: params.targetResource,
    courtOrderId: params.courtOrderId,
    dilosStage: params.dilosStage,
    summary: params.summary,
    prevHash,
    currentHash,
  };

  store.internalMovementLog.push(entry);
  saveStoreAtomic(store);
  return entry;
}

export function verifyMovementChain(store: TdexPersistentStore): {
  valid: boolean;
  totalEntries: number;
  brokenAtSeq?: number;
  latestHash: string;
} {
  let expectedPrev = ZERO_HASH;
  for (const entry of store.internalMovementLog) {
    if (entry.prevHash !== expectedPrev) {
      return {
        valid: false,
        totalEntries: store.internalMovementLog.length,
        brokenAtSeq: entry.seq,
        latestHash: expectedPrev,
      };
    }
    const rawPayload = `${entry.seq}|${entry.eventId}|${entry.timestampUtc}|${entry.actorId}|${entry.actorRole}|${entry.action}|${entry.targetResource}|${entry.courtOrderId || ''}|${entry.dilosStage}|${entry.summary}|${entry.prevHash}`;
    const recomputed = sha256Hex(rawPayload);
    if (recomputed !== entry.currentHash) {
      return {
        valid: false,
        totalEntries: store.internalMovementLog.length,
        brokenAtSeq: entry.seq,
        latestHash: expectedPrev,
      };
    }
    expectedPrev = entry.currentHash;
  }
  return {
    valid: true,
    totalEntries: store.internalMovementLog.length,
    latestHash: expectedPrev,
  };
}

export function authenticateVaultPasscode(
  store: TdexPersistentStore,
  params: {
    role: VaultRole;
    actorName: string;
    passcode: string;
    ipKey: string;
  }
): {
  ok: boolean;
  statusCode: number;
  error?: string;
  session?: PersistedVaultSession;
  isTemporaryCredential?: boolean;
} {
  const attemptKey = `${params.role}:${params.ipKey}`;
  const attemptState = store.vaultSecurityState.failedAttemptsByKey[attemptKey] || {
    count: 0,
    lockedUntilMs: 0,
  };

  if (attemptState.lockedUntilMs > Date.now()) {
    const minsLeft = Math.ceil((attemptState.lockedUntilMs - Date.now()) / 60000);
    return {
      ok: false,
      statusCode: 429,
      error: `Security lockout active after repeated failed attempts. Try again in ${minsLeft} minute(s).`,
    };
  }

  const cred = store.vaultCredentials[params.role];
  if (!cred) {
    const envVarName = ROLE_ENV_CONFIG[params.role].envVar;
    recordMovement(store, {
      actorId: params.actorName.trim() || 'UNKNOWN_CALLER',
      actorRole: params.role,
      action: 'VAULT_LOGIN_UNCONFIGURED',
      targetResource: `ROLE:${params.role}`,
      dilosStage: 'PIPITO',
      summary: `Blocked login for ${params.role}: ${envVarName} is not configured in server environment.`,
    });
    return {
      ok: false,
      statusCode: 503,
      error: `Vault role ${params.role} is locked: configure ${envVarName} in server environment variables before sign-in.`,
    };
  }
  if (!verifyPasscode(params.passcode, cred.saltHex, cred.scryptHashHex)) {
    const nextCount = attemptState.count + 1;
    const lockedUntilMs = nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_WINDOW_MS : 0;
    store.vaultSecurityState.failedAttemptsByKey[attemptKey] = {
      count: lockedUntilMs > 0 ? 0 : nextCount,
      lockedUntilMs,
    };
    recordMovement(store, {
      actorId: params.actorName.trim() || 'UNKNOWN_CALLER',
      actorRole: params.role,
      action: lockedUntilMs > 0 ? 'VAULT_LOGIN_LOCKOUT' : 'VAULT_LOGIN_FAILED',
      targetResource: `ROLE:${params.role}`,
      dilosStage: 'PIPITO',
      summary: `Rejected invalid passcode attempt #${nextCount} for role ${params.role}.`,
    });
    return {
      ok: false,
      statusCode: 401,
      error: 'Invalid credentials for the requested restricted Vault role.',
    };
  }

  delete store.vaultSecurityState.failedAttemptsByKey[attemptKey];

  const actorLabel = params.actorName.trim() || cred.label;
  const actorId =
    params.role === 'FOUNDER'
      ? 'petrossianbobby@gmail.com'
      : `${params.role}-${sha256Hex(actorLabel.toLowerCase()).slice(0, 8).toUpperCase()}`;

  const token = `TDXV-${crypto.randomBytes(32).toString('hex')}`;
  const session: PersistedVaultSession = {
    token,
    role: params.role,
    actorId,
    actorLabel,
    issuedAtUtc: new Date().toISOString(),
    expiresAtMs: Date.now() + SESSION_TTL_MS,
  };

  store.vaultSessions[token] = session;
  recordMovement(store, {
    actorId,
    actorRole: params.role,
    action: 'VAULT_LOGIN_SUCCESS',
    targetResource: `SESSION:${actorId}`,
    dilosStage: 'CONCIERGE',
    summary: `${actorLabel} authenticated into closed Vault as ${params.role}.`,
  });

  return {
    ok: true,
    statusCode: 200,
    session,
    isTemporaryCredential: cred.isTemporary,
  };
}

export function getActiveBoardCourtOrder(
  store: TdexPersistentStore,
  boardActorId: string
): PersistedCourtOrder | undefined {
  const nowMs = Date.now();
  return store.courtOrders
    .filter(
      (o) =>
        o.boardActorId === boardActorId &&
        o.status === 'APPROVED' &&
        o.expiresAtMs > nowMs
    )
    .sort((a, b) => b.expiresAtMs - a.expiresAtMs)[0];
}

export function canScopeAccessCategory(
  scope: VaultAccessScope,
  category: PersistedVaultFiling['category']
): boolean {
  if (scope === 'ALL_VAULT_RECORDS') return true;
  if (scope === 'FILINGS') return category === 'FILINGS' || category === 'ESCROW_SAFEKEEPING';
  if (scope === 'PII_OVERSIGHT') return category === 'PII_OVERSIGHT';
  if (scope === 'AI_AUDIT_LOGS') return category === 'AI_AUDIT_LOGS';
  return false;
}

export function createCourtAccessRequest(
  store: TdexPersistentStore,
  session: PersistedVaultSession,
  params: {
    scope: VaultAccessScope;
    justification: string;
    durationHours: number;
  }
): PersistedCourtAccessRequest {
  const now = new Date().toISOString();
  const clampedHours = Math.max(1, Math.min(168, Math.round(params.durationHours || 24)));
  const request: PersistedCourtAccessRequest = {
    requestId: generateId('REQ'),
    requesterActorId: session.actorId,
    requesterLabel: session.actorLabel,
    scope: params.scope,
    justification: params.justification.trim(),
    durationHours: clampedHours,
    status: 'PENDING',
    createdAtUtc: now,
    updatedAtUtc: now,
  };

  store.courtAccessRequests.unshift(request);
  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'COURT_ACCESS_REQUESTED',
    targetResource: request.requestId,
    dilosStage: 'CONCIERGE',
    summary: `Board Member ${session.actorLabel} requested Court clearance for ${params.scope} (${clampedHours}h): ${request.justification}`,
  });

  return request;
}

export function reviewCourtAccessRequest(
  store: TdexPersistentStore,
  courtSession: PersistedVaultSession,
  params: {
    requestId: string;
    approve: boolean;
    caseNumber?: string;
    courtNotes?: string;
  }
): {
  request: PersistedCourtAccessRequest;
  order?: PersistedCourtOrder;
} {
  const req = store.courtAccessRequests.find((r) => r.requestId === params.requestId);
  if (!req) {
    throw new Error('Court access request not found.');
  }
  if (req.status !== 'PENDING') {
    throw new Error(`Request ${req.requestId} is already ${req.status}.`);
  }

  const now = new Date().toISOString();
  req.status = params.approve ? 'APPROVED' : 'DENIED';
  req.reviewedByActorId = courtSession.actorId;
  req.courtNotes = (params.courtNotes || '').trim() || (params.approve ? 'Cleared by Internal Arbitration Court.' : 'Denied by Internal Arbitration Court.');
  req.updatedAtUtc = now;

  let order: PersistedCourtOrder | undefined;
  if (params.approve) {
    const orderId = generateId('ORD');
    const caseNumber = (params.caseNumber || '').trim() || `COURT-${new Date().getUTCFullYear()}-${crypto.randomInt(1000, 9999)}`;
    const expiresAtMs = Date.now() + req.durationHours * 60 * 60 * 1000;
    const sealHash = sha256Hex(
      `COURT_SEAL|${orderId}|${req.requestId}|${req.requesterActorId}|${req.scope}|${caseNumber}|${expiresAtMs}`
    );

    order = {
      orderId,
      requestId: req.requestId,
      boardActorId: req.requesterActorId,
      boardActorLabel: req.requesterLabel,
      caseNumber,
      scope: req.scope,
      status: 'APPROVED',
      issuedByActorId: courtSession.actorId,
      sealHash,
      courtNotes: req.courtNotes,
      expiresAtMs,
      createdAtUtc: now,
      updatedAtUtc: now,
    };

    req.courtOrderId = orderId;
    store.courtOrders.unshift(order);

    recordMovement(store, {
      actorId: courtSession.actorId,
      actorRole: courtSession.role,
      action: 'COURT_ORDER_APPROVED',
      targetResource: orderId,
      courtOrderId: orderId,
      dilosStage: 'HUMAN_COURT_WITNESS',
      summary: `Court approved ${req.requestId} (Case ${caseNumber}, Order ${orderId}) granting ${req.requesterLabel} ${req.durationHours}h access to ${req.scope}.`,
    });
  } else {
    recordMovement(store, {
      actorId: courtSession.actorId,
      actorRole: courtSession.role,
      action: 'COURT_ORDER_DENIED',
      targetResource: req.requestId,
      dilosStage: 'HUMAN_COURT_WITNESS',
      summary: `Court denied ${req.requestId} for ${req.requesterLabel}. Reason: ${req.courtNotes}`,
    });
  }

  saveStoreAtomic(store);
  return { request: req, order };
}

export function revokeCourtOrder(
  store: TdexPersistentStore,
  session: PersistedVaultSession,
  orderId: string,
  reason: string
): PersistedCourtOrder {
  const order = store.courtOrders.find((o) => o.orderId === orderId);
  if (!order) {
    throw new Error('Court clearance order not found.');
  }
  order.status = 'REVOKED';
  order.updatedAtUtc = new Date().toISOString();
  order.courtNotes = `${order.courtNotes} | REVOKED: ${reason || 'Revoked by Judicial/Founder Order'}`;

  const linkedReq = store.courtAccessRequests.find((r) => r.requestId === order.requestId);
  if (linkedReq) {
    linkedReq.status = 'REVOKED';
    linkedReq.updatedAtUtc = order.updatedAtUtc;
  }

  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: 'COURT_ORDER_REVOKED',
    targetResource: order.orderId,
    courtOrderId: order.orderId,
    dilosStage: 'HUMAN_COURT_WITNESS',
    summary: `Revoked Court Clearance Order ${order.orderId} (Case ${order.caseNumber}) for ${order.boardActorLabel}.`,
  });

  return order;
}

export function fileVaultRecord(
  store: TdexPersistentStore,
  session: PersistedVaultSession,
  params: {
    folder: VaultFolderName;
    category: PersistedVaultFiling['category'];
    title: string;
    classification: PersistedVaultFiling['classification'];
    summary: string;
    details?: Record<string, unknown>;
    supersedesDocId?: string;
  }
): PersistedVaultFiling {
  const prior = params.supersedesDocId
    ? store.vaultFilings.find((f) => f.filingId === params.supersedesDocId)
    : undefined;

  const filingId = generateId('DOC');
  const version = prior ? prior.version + 1 : 1;
  const details = params.details || {};
  const dilosIntegrityHash = sha256Hex(
    `FILING|${filingId}|${params.folder}|${version}|${params.title}|${JSON.stringify(details)}`
  );

  const filing: PersistedVaultFiling = {
    filingId,
    folder: params.folder,
    category: params.category,
    title: params.title.trim(),
    version,
    supersedesDocId: prior?.filingId,
    classification: params.classification,
    summary: params.summary.trim(),
    details,
    dilosIntegrityHash,
    createdByActorId: session.actorId,
    createdAtUtc: new Date().toISOString(),
  };

  store.vaultFilings.unshift(filing);
  recordMovement(store, {
    actorId: session.actorId,
    actorRole: session.role,
    action: prior ? 'DOC_VERSION_APPENDED' : 'DOC_FILED',
    targetResource: filing.filingId,
    dilosStage: 'PIPITO',
    summary: `${session.actorLabel} filed "${filing.title}" (v${filing.version}) in ${filing.folder}.`,
  });

  return filing;
}

export function rotateVaultPasscode(
  store: TdexPersistentStore,
  founderSession: PersistedVaultSession,
  params: { targetRole: VaultRole; newPasscode: string }
): void {
  const cred = store.vaultCredentials[params.targetRole];
  if (!cred) {
    throw new Error('Target vault role credential not initialized.');
  }
  const { saltHex, scryptHashHex } = hashPasscode(params.newPasscode);
  cred.saltHex = saltHex;
  cred.scryptHashHex = scryptHashHex;
  cred.isTemporary = false;
  cred.updatedAtUtc = new Date().toISOString();

  // Invalidate older active sessions for the rotated role so old temporary credentials stop working immediately
  for (const [tok, sess] of Object.entries(store.vaultSessions)) {
    if (sess.role === params.targetRole && tok !== founderSession.token) {
      delete store.vaultSessions[tok];
    }
  }

  recordMovement(store, {
    actorId: founderSession.actorId,
    actorRole: founderSession.role,
    action: 'CREDENTIAL_ROTATED',
    targetResource: `ROLE:${params.targetRole}`,
    dilosStage: 'PIPITO',
    summary: `Founder rotated passcode for ${params.targetRole} and invalidated prior temporary sessions.`,
  });
}

export function executeGovernanceBoardHandover(
  store: TdexPersistentStore,
  custodianSession: PersistedVaultSession,
  boardIds: string[]
): void {
  if (store.governanceState.boardSeated) {
    throw new Error('Phase 2 handover already executed; 30-person Owner Board is already seated.');
  }
  if (boardIds.length < 30) {
    throw new Error('Article 5.1 requires 30 verified Owner Board Directors to execute handover.');
  }
  store.governanceState.boardSeated = true;
  store.governanceState.activeBoardIds = [...boardIds];

  recordMovement(store, {
    actorId: custodianSession.actorId,
    actorRole: custodianSession.role,
    action: 'BOARD_HANDOVER_EXECUTED',
    targetResource: 'GOVERNANCE-PHASE-2',
    dilosStage: 'HUMAN_COURT_WITNESS',
    summary:
      'Executed one-way Phase 1 -> Phase 2 Custody Handover to 30-Person Owner Board (Art. 1.3 & 5.1).',
  });
}
