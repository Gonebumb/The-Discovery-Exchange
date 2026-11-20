// src/internalMechanism.ts
// TDEX Internal Vault, Document Request Gate & Append-Only Audit Ledger
// Aligned with Constitution v10.0 (Articles 1.3, 5.1, 6.2, 7.3, 8.3 & Zero-Money-Handling Rule)

export type InternalRole =
  | 'PHASE1_CUSTODIAN'   // Sole active access until 30-person Owner Board is seated
  | 'BOARD_DIRECTOR'     // 30-person Owner Board (Article 5.1)
  | 'AUTHORIZED_PUSHER'  // Local chapter organizer (Article 1.3)
  | 'AUDITOR_READONLY';  // Columbo / Pipito / Independent Human Witness (Article 7.3)

export type VaultFolder =
  | '01_Property_Silos'
  | '02_Seller_Side_Escrow_Matches'
  | '03_Awards_DILOS_Proofs'
  | '04_Board_Minutes_Votes'
  | '05_Append_Only_Audit_Trails';

export interface VaultDocument {
  docId: string;
  folder: VaultFolder;
  title: string;
  version: number;
  supersedesDocId?: string;
  sha256: string;
  uploadedBy: string;
  uploadedAtUtc: string;
  classification: 'BOARD_AND_CUSTODIAN_ONLY' | 'BOARD_AND_PUSHERS';
}

export interface DocumentRequestTicket {
  requestId: string; // REQ-YYYYMMDD-XXXXXXXX
  docId: string;
  requesterId: string;
  requesterRole: InternalRole;
  statedPurpose: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  reviewedBy?: string;
  createdAtUtc: string;
  resolvedAtUtc?: string;
}

export interface AuditLedgerEntry {
  sequence: number;
  utcTimestamp: string;
  actorId: string;
  actorRole: InternalRole;
  action:
    | 'DOC_FILED'
    | 'DOC_VERSION_APPENDED'
    | 'DOC_REQUESTED'
    | 'DOC_RELEASE_APPROVED'
    | 'DOC_RELEASE_DENIED'
    | 'DOC_VIEWED'
    | 'BOARD_HANDOVER_EXECUTED'
    | 'FCU_CHARTER_THRESHOLD_REACHED';
  targetId: string;
  docSha256: string;
  details: string;
  prevHash: string;
  entryHash: string;
}

export interface GovernanceState {
  boardSeated: boolean; // false in Phase 1 (Sole Custodian); true once 30-person Owner Board seats
  phase1CustodianId: string;
  activeBoardIds: string[];
  authorizedPusherIds: string[];
  verifiedOwnerCount: number;
  readonly fcuCharterThreshold?: number;
}

export const ZERO_HASH_64 =
  '0000000000000000000000000000000000000000000000000000000000000000';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function makeId(prefix: string): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(16)
    .toUpperCase()
    .padStart(8, '0');
  return `${prefix}-${day}-${rand}`;
}

export class TdexInternalVaultEngine {
  readonly fcuCharterThreshold = 1000;
  private state: GovernanceState;
  private documents: VaultDocument[] = [];
  private requests: DocumentRequestTicket[] = [];
  private auditLedger: AuditLedgerEntry[] = [];
  private fcuThresholdLogged = false;

  constructor(
    initialState: GovernanceState,
    hydrated?: {
      documents?: VaultDocument[];
      requests?: DocumentRequestTicket[];
      auditLedger?: AuditLedgerEntry[];
    }
  ) {
    this.state = {
      boardSeated: initialState.boardSeated,
      phase1CustodianId: initialState.phase1CustodianId,
      activeBoardIds: [...initialState.activeBoardIds],
      authorizedPusherIds: [...initialState.authorizedPusherIds],
      verifiedOwnerCount: initialState.verifiedOwnerCount ?? 0,
      fcuCharterThreshold: this.fcuCharterThreshold,
    };
    if (hydrated?.documents) {
      this.documents = hydrated.documents.map((d) => Object.freeze({ ...d }));
    }
    if (hydrated?.requests) {
      this.requests = hydrated.requests.map((r) => ({ ...r }));
    }
    if (hydrated?.auditLedger) {
      this.auditLedger = hydrated.auditLedger.map((e) => Object.freeze({ ...e }));
      this.fcuThresholdLogged = this.auditLedger.some(
        (e) => e.action === 'FCU_CHARTER_THRESHOLD_REACHED'
      );
    }
  }

  getState(): GovernanceState {
    return {
      boardSeated: this.state.boardSeated,
      phase1CustodianId: this.state.phase1CustodianId,
      activeBoardIds: [...this.state.activeBoardIds],
      authorizedPusherIds: [...this.state.authorizedPusherIds],
      verifiedOwnerCount: this.state.verifiedOwnerCount,
      fcuCharterThreshold: this.fcuCharterThreshold,
    };
  }

  isReadyForFcuCharterFiling(
    actorId: string = this.state.phase1CustodianId,
    actorRole: InternalRole = 'PHASE1_CUSTODIAN'
  ): boolean {
    const threshold = this.state.fcuCharterThreshold ?? this.fcuCharterThreshold;
    const ready = this.state.verifiedOwnerCount >= threshold;
    if (ready && !this.fcuThresholdLogged) {
      this.fcuThresholdLogged = true;
      void this.appendAudit(
        actorId,
        actorRole,
        'FCU_CHARTER_THRESHOLD_REACHED',
        'NCUA-FCU-CHARTER-ELIGIBLE',
        ZERO_HASH_64,
        `FCU_CHARTER_ELIGIBLE: Verified Owner count reached ${this.state.verifiedOwnerCount} (>= ${threshold}). Formal NCUA Federal Credit Union charter filing triggered.`
      );
    }
    return ready;
  }

  updateVerifiedOwnerCount(
    verifiedOwnerCount: number,
    actorId?: string,
    actorRole?: InternalRole
  ): boolean {
    this.state.verifiedOwnerCount = Math.max(0, Math.floor(verifiedOwnerCount));
    return this.isReadyForFcuCharterFiling(actorId, actorRole);
  }

  // Role check: Phase 1 restricts internal access solely to Phase 1 Custodian;
  // Phase 2 restricts confidential vault to Seated Board Directors (+ approved Pusher folders).
  private canAccessDocument(actorId: string, role: InternalRole, doc: VaultDocument): boolean {
    if (!this.state.boardSeated) {
      return role === 'PHASE1_CUSTODIAN' && actorId === this.state.phase1CustodianId;
    }
    if (role === 'BOARD_DIRECTOR' && this.state.activeBoardIds.includes(actorId)) {
      return true;
    }
    if (
      role === 'AUTHORIZED_PUSHER' &&
      this.state.authorizedPusherIds.includes(actorId) &&
      doc.classification === 'BOARD_AND_PUSHERS'
    ) {
      return true;
    }
    return false;
  }

  // Every single movement—even by the Phase 1 Custodian—appends an immutable hash-chained record.
  private async appendAudit(
    actorId: string,
    actorRole: InternalRole,
    action: AuditLedgerEntry['action'],
    targetId: string,
    docSha256: string,
    details: string
  ): Promise<AuditLedgerEntry> {
    const sequence = this.auditLedger.length + 1;
    const utcTimestamp = new Date().toISOString();
    const prevHash =
      this.auditLedger.length === 0
        ? ZERO_HASH_64
        : this.auditLedger[this.auditLedger.length - 1].entryHash;

    const payload = `${sequence}|${utcTimestamp}|${actorId}|${actorRole}|${action}|${targetId}|${docSha256}|${details}|${prevHash}`;
    const entryHash = await sha256Hex(payload);

    const entry: AuditLedgerEntry = {
      sequence,
      utcTimestamp,
      actorId,
      actorRole,
      action,
      targetId,
      docSha256,
      details,
      prevHash,
      entryHash,
    };

    // Append-only: no delete or edit methods exist anywhere in this class
    this.auditLedger.push(Object.freeze(entry));
    return entry;
  }

  // 1. File a new internal document (or append a new version — never overwrite)
  async fileDocument(params: {
    actorId: string;
    actorRole: InternalRole;
    folder: VaultFolder;
    title: string;
    rawContentForHash: string;
    classification: VaultDocument['classification'];
    supersedesDocId?: string;
  }): Promise<VaultDocument> {
    if (!this.state.boardSeated && params.actorId !== this.state.phase1CustodianId) {
      throw new Error(
        'Phase 1 Access Denied: Only Phase 1 Custodian may file documents until Owner Board seats.'
      );
    }
    if (
      this.state.boardSeated &&
      params.actorRole !== 'BOARD_DIRECTOR' &&
      params.actorRole !== 'AUTHORIZED_PUSHER'
    ) {
      throw new Error(
        'Access Denied: Only seated Board Directors or Authorized Pushers may file records.'
      );
    }

    const prior = params.supersedesDocId
      ? this.documents.find((d) => d.docId === params.supersedesDocId)
      : undefined;

    const doc: VaultDocument = Object.freeze({
      docId: makeId('DOC'),
      folder: params.folder,
      title: params.title,
      version: prior ? prior.version + 1 : 1,
      supersedesDocId: prior?.docId,
      sha256: await sha256Hex(params.rawContentForHash),
      uploadedBy: params.actorId,
      uploadedAtUtc: new Date().toISOString(),
      classification: params.classification,
    });

    this.documents.push(doc);

    await this.appendAudit(
      params.actorId,
      params.actorRole,
      prior ? 'DOC_VERSION_APPENDED' : 'DOC_FILED',
      doc.docId,
      doc.sha256,
      `Filed "${doc.title}" (v${doc.version}) in ${doc.folder}`
    );

    return doc;
  }

  // 2. Mandatory Document Request Ticket before any external/Pusher/Board release
  async requestDocumentAccess(params: {
    requesterId: string;
    requesterRole: InternalRole;
    docId: string;
    statedPurpose: string;
  }): Promise<DocumentRequestTicket> {
    const doc = this.documents.find((d) => d.docId === params.docId);
    if (!doc) throw new Error('Document ID not found in vault.');

    const ticket: DocumentRequestTicket = {
      requestId: makeId('REQ'),
      docId: doc.docId,
      requesterId: params.requesterId,
      requesterRole: params.requesterRole,
      statedPurpose: params.statedPurpose,
      status: 'PENDING',
      createdAtUtc: new Date().toISOString(),
    };

    this.requests.push(ticket);

    await this.appendAudit(
      params.requesterId,
      params.requesterRole,
      'DOC_REQUESTED',
      ticket.requestId,
      doc.sha256,
      `Requested access to ${doc.docId} ("${doc.title}") — Purpose: ${params.statedPurpose}`
    );

    return ticket;
  }

  // 3. Approve or Deny a Document Request (logged permanently)
  async reviewDocumentRequest(params: {
    reviewerId: string;
    reviewerRole: InternalRole;
    requestId: string;
    approve: boolean;
    note?: string;
  }): Promise<DocumentRequestTicket> {
    const ticket = this.requests.find((r) => r.requestId === params.requestId);
    if (!ticket) throw new Error('Request ticket not found.');
    const doc = this.documents.find((d) => d.docId === ticket.docId);
    if (!doc) throw new Error('Referenced document not found.');

    if (!this.state.boardSeated && params.reviewerId !== this.state.phase1CustodianId) {
      throw new Error(
        'Only Phase 1 Custodian can approve document releases prior to Board seating.'
      );
    }
    if (this.state.boardSeated && params.reviewerRole !== 'BOARD_DIRECTOR') {
      throw new Error('Only seated Board Directors can approve document releases.');
    }

    ticket.status = params.approve ? 'APPROVED' : 'DENIED';
    ticket.reviewedBy = params.reviewerId;
    ticket.resolvedAtUtc = new Date().toISOString();

    await this.appendAudit(
      params.reviewerId,
      params.reviewerRole,
      params.approve ? 'DOC_RELEASE_APPROVED' : 'DOC_RELEASE_DENIED',
      ticket.requestId,
      doc.sha256,
      `${ticket.status} request ${ticket.requestId} for ${ticket.requesterId}${
        params.note ? ` (${params.note})` : ''
      }`
    );

    return ticket;
  }

  // 4. Open/View a Document — logs EVERY view, including Phase 1 Custodian views
  async recordDocumentView(
    actorId: string,
    actorRole: InternalRole,
    docId: string
  ): Promise<VaultDocument> {
    const doc = this.documents.find((d) => d.docId === docId);
    if (!doc) throw new Error('Document not found.');
    const hasDirectAccess = this.canAccessDocument(actorId, actorRole, doc);
    const hasApprovedTicket = this.requests.some(
      (r) => r.docId === docId && r.requesterId === actorId && r.status === 'APPROVED'
    );
    if (!hasDirectAccess && !hasApprovedTicket) {
      throw new Error(
        'Access Blocked: Must hold Board/Custodian clearance or an approved Document Request Ticket.'
      );
    }

    await this.appendAudit(
      actorId,
      actorRole,
      'DOC_VIEWED',
      doc.docId,
      doc.sha256,
      `Viewed "${doc.title}" (v${doc.version})`
    );
    return doc;
  }

  // 5. One-way Phase 1 -> Phase 2 Handover once 30-Person Owner Board is seated
  async executeBoardHandover(custodianId: string, seatedBoardIds: string[]): Promise<void> {
    if (this.state.boardSeated) throw new Error('Owner Board is already seated.');
    if (custodianId !== this.state.phase1CustodianId) {
      throw new Error('Only the Phase 1 Custodian can trigger the initial Board handover.');
    }
    if (seatedBoardIds.length < 30) {
      throw new Error('Article 5.1 requires 30 verified Owner Board Directors to complete handover.');
    }

    this.state.boardSeated = true;
    this.state.activeBoardIds = [...seatedBoardIds];

    await this.appendAudit(
      custodianId,
      'PHASE1_CUSTODIAN',
      'BOARD_HANDOVER_EXECUTED',
      'GOVERNANCE-PHASE-2',
      ZERO_HASH_64,
      'Custody transferred to 30-Person Owner Board; Initiating Pusher transitions to standard 1-Owner, 1-Vote standing (Art. 1.3).'
    );
  }

  // Verify cryptographic integrity of the entire chain (detects any tampering)
  async verifyAuditChain(): Promise<{
    valid: boolean;
    totalEntries: number;
    brokenAtSequence?: number;
  }> {
    let expectedPrev = ZERO_HASH_64;
    for (const entry of this.auditLedger) {
      if (entry.prevHash !== expectedPrev) {
        return {
          valid: false,
          totalEntries: this.auditLedger.length,
          brokenAtSequence: entry.sequence,
        };
      }
      const payload = `${entry.sequence}|${entry.utcTimestamp}|${entry.actorId}|${entry.actorRole}|${entry.action}|${entry.targetId}|${entry.docSha256}|${entry.details}|${entry.prevHash}`;
      const recomputed = await sha256Hex(payload);
      if (recomputed !== entry.entryHash) {
        return {
          valid: false,
          totalEntries: this.auditLedger.length,
          brokenAtSequence: entry.sequence,
        };
      }
      expectedPrev = entry.entryHash;
    }
    return { valid: true, totalEntries: this.auditLedger.length };
  }

  getAuditLedger(): readonly AuditLedgerEntry[] {
    return [...this.auditLedger];
  }

  getDocuments(): readonly VaultDocument[] {
    return [...this.documents];
  }

  getRequests(): readonly DocumentRequestTicket[] {
    return [...this.requests];
  }
}
