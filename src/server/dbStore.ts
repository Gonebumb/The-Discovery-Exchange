import fs from 'node:fs';
import path from 'node:path';

export interface PersistedOwnerAccount {
  ownerUuid: string;
  email: string;
  passwordHash: string;
  stateCode: string;
  isAdultVerified: boolean;
  charterAcceptedVersion: string;
  votingWeight: 1; // Invariant Article 4.1: Always 1, never editable
  globalQuarantine: boolean; // Module 06 GQ Flag
  accumulationBalanceCents: number; // 25% property accumulation wallet
  sellerCashBalanceCents: number; // 50% marketplace cash wallet
  siloNuggets: Record<string, number>;
  dbcBalance: number;
  nonce: number;
  createdAtUtc: string;
}

export interface PersistedPiiRecord {
  fullName: string;
  address: string;
  guardianConsent: boolean;
}

export interface PersistedLedgerBlock {
  seq: number;
  eventId: string;
  timestampUtc: string;
  eventType: string;
  prevHash: string;
  currentHash: string;
  dilosPipeline: {
    conciergeId: string;
    columboAuditHash: string;
    pipitoGateStatus: 'GATE_CLEARED' | 'GATE_HALTED';
    humanWitnessUid: string;
  };
  payload: Record<string, unknown>;
}

export interface PersistedMarketplaceListing {
  id: string;
  title: string;
  category: 'Science & Education' | 'Tools & Workshop' | 'Music & Arts' | 'Bikes & Sports';
  price: number;
  location: string;
  sellerFamily: string;
  sellerEmail?: string;
  description: string;
  condition: string;
  badge?: string;
  iconType: string;
  status: 'ACTIVE' | 'SOLD';
  createdAtUtc: string;
}

export interface PersistedTradeReceipt {
  receiptId: string;
  itemId: string;
  itemTitle: string;
  totalCents: number;
  sellerCashCents: number;
  sellerEquityCents: number;
  buyerEquityCents: number;
  sellerEmail: string;
  buyerEmail: string;
  columboAuditHash: string;
  mode: 'SANDBOX_SIMULATED_ESCROW_HOLD' | 'LIVE_ESCROW';
  ledgerEventId: string;
  executedAtUtc: string;
}

export interface PersistedStudioSubmission {
  trackingId: string;
  submittedAtUtc: string;
  ageDivision: string;
  track: string;
  anonymizedTitle: string;
  anonymizedSummary: string;
  materialsUsed: string;
  surprisePromptCode: string;
  surprisePromptText: string;
  videoUrl: string;
  evidenceHash: string;
  piiStatus: 'STRIPPED_BY_CONCIERGE';
  juryStatus: 'QUEUED_FOR_12_OWNER_OUT_OF_STATE_BLIND_JURY';
}

export type VaultRole = 'FOUNDER' | 'ARBITRATION_COURT' | 'BOARD_MEMBER' | 'AI_OVERSIGHT';

export type VaultAccessScope = 'FILINGS' | 'PII_OVERSIGHT' | 'AI_AUDIT_LOGS' | 'ALL_VAULT_RECORDS';

export interface PersistedVaultCredential {
  role: VaultRole;
  label: string;
  saltHex: string;
  scryptHashHex: string;
  isTemporary: boolean;
  updatedAtUtc: string;
}

export interface PersistedVaultSession {
  token: string;
  role: VaultRole;
  actorId: string;
  actorLabel: string;
  issuedAtUtc: string;
  expiresAtMs: number;
}

export interface PersistedCourtAccessRequest {
  requestId: string;
  requesterActorId: string;
  requesterLabel: string;
  scope: VaultAccessScope;
  justification: string;
  durationHours: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'REVOKED';
  courtOrderId?: string;
  reviewedByActorId?: string;
  courtNotes?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PersistedCourtOrder {
  orderId: string;
  requestId: string;
  boardActorId: string;
  boardActorLabel: string;
  caseNumber: string;
  scope: VaultAccessScope;
  status: 'APPROVED' | 'DENIED' | 'REVOKED';
  issuedByActorId: string;
  sealHash: string;
  courtNotes: string;
  expiresAtMs: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type VaultFolderName =
  | '01_Property_Silos'
  | '02_Seller_Side_Escrow_Matches'
  | '03_Awards_DILOS_Proofs'
  | '04_Board_Minutes_Votes'
  | '05_Append_Only_Audit_Trails';

export interface PersistedVaultFiling {
  filingId: string;
  folder: VaultFolderName;
  category: 'FILINGS' | 'PII_OVERSIGHT' | 'AI_AUDIT_LOGS' | 'ESCROW_SAFEKEEPING';
  title: string;
  version: number;
  supersedesDocId?: string;
  classification: 'BOARD_COURT_ONLY' | 'FOUNDER_COURT_ONLY' | 'DILOS_SEALED' | 'BOARD_AND_PUSHERS';
  summary: string;
  details: Record<string, unknown>;
  dilosIntegrityHash: string;
  createdByActorId: string;
  createdAtUtc: string;
}

export interface PersistedGovernanceState {
  boardSeated: boolean;
  phase1CustodianId: string;
  activeBoardIds: string[];
  authorizedPusherIds: string[];
  verifiedOwnerCount: number;
  readonly fcuCharterThreshold: number;
}

export interface PersistedMovementLogEntry {
  seq: number;
  eventId: string;
  timestampUtc: string;
  actorId: string;
  actorRole: VaultRole | 'DILOS_SYSTEM';
  action: string;
  targetResource: string;
  courtOrderId?: string;
  dilosStage: 'CONCIERGE' | 'COLUMBO' | 'PIPITO' | 'HUMAN_COURT_WITNESS';
  summary: string;
  prevHash: string;
  currentHash: string;
}

export interface PersistedVaultSecurityState {
  emergencyStopActive: boolean;
  emergencyStopReason: string;
  updatedByActorId?: string;
  updatedAtUtc?: string;
  failedAttemptsByKey: Record<string, { count: number; lockedUntilMs: number }>;
}

export interface TdexPersistentStore {
  version: string;
  ownersByEmail: Record<string, PersistedOwnerAccount>;
  piiVault: Record<string, PersistedPiiRecord>;
  sessions: Record<string, string>;
  appendOnlyLedger: PersistedLedgerBlock[];
  prizeTrustEscrow: {
    verifiedCashCents: number;
    reservedForActiveSeasonCents: number;
  };
  listings: PersistedMarketplaceListing[];
  tradeReceipts: PersistedTradeReceipt[];
  studioSubmissions: PersistedStudioSubmission[];
  vaultCredentials: Partial<Record<VaultRole, PersistedVaultCredential>>;
  vaultSessions: Record<string, PersistedVaultSession>;
  courtAccessRequests: PersistedCourtAccessRequest[];
  courtOrders: PersistedCourtOrder[];
  vaultFilings: PersistedVaultFiling[];
  internalMovementLog: PersistedMovementLogEntry[];
  vaultSecurityState: PersistedVaultSecurityState;
  governanceState: PersistedGovernanceState;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'tdex_persistent_store.json');

const SEED_LISTINGS: PersistedMarketplaceListing[] = [
  {
    id: 'item-telescope',
    title: 'Celestron 70mm Student Refractor Telescope',
    category: 'Science & Education',
    price: 120,
    location: 'Oakland Hills, CA',
    sellerFamily: 'The Miller Family',
    description:
      'Used for two middle-school astronomy terms. Includes tripod, 20mm eyepiece, and solar filter. Clean optics.',
    condition: 'Excellent',
    badge: 'Student Science',
    iconType: 'telescope',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:00:00.000Z',
  },
  {
    id: 'item-tool-chest',
    title: 'Craftsman 120-Piece Socket & Mechanics Chest',
    category: 'Tools & Workshop',
    price: 100,
    location: 'Columbus, OH',
    sellerFamily: 'Dave & Sarah K.',
    description:
      'Classic garage tool set. Metric and standard sockets, ratchets, and heavy-duty case. The exact $100 Article 12.1 model.',
    condition: 'Like New',
    badge: 'Article 12.1 Anchor',
    iconType: 'tools',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:05:00.000Z',
  },
  {
    id: 'item-violin',
    title: '1/2 Size Student Violin with Horsehair Bow & Hard Case',
    category: 'Music & Arts',
    price: 160,
    location: 'Philadelphia, PA',
    sellerFamily: 'The Chen Family',
    description:
      'Handcrafted spruce top, warm tone. Outgrown by our 6th grader who moved to a full-size violin.',
    condition: 'Very Good',
    badge: 'Youth Arts',
    iconType: 'music',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:10:00.000Z',
  },
  {
    id: 'item-trail-bike',
    title: 'Trek 24-Inch Aluminum Youth Mountain Bike',
    category: 'Bikes & Sports',
    price: 80,
    location: 'Austin, TX',
    sellerFamily: 'The Jackson Family',
    description:
      'Brand-new tires, 7-speed Shimano shifting, tuned brakes. Perfect for riding to middle school.',
    condition: 'Good',
    badge: 'Neighborhood Active',
    iconType: 'bike',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:15:00.000Z',
  },
  {
    id: 'item-microscope',
    title: 'AmScope 1200x Compound Monocular Microscope',
    category: 'Science & Education',
    price: 90,
    location: 'Denver, CO',
    sellerFamily: 'Marcus T. (Science Teacher)',
    description:
      'LED illumination, precision glass optics, includes 25 prepared specimen slides for biology projects.',
    condition: 'Like New',
    badge: 'Public Schools Ready',
    iconType: 'microscope',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:20:00.000Z',
  },
  {
    id: 'item-workbench',
    title: 'Solid Maple Garage Workbench with Woodworking Vise',
    category: 'Tools & Workshop',
    price: 240,
    location: 'Pittsburgh, PA',
    sellerFamily: 'The Alvarez Family',
    description:
      'Heavy-duty 5-foot bench built from solid hardwood with steel legs and integrated 7-inch rapid-action vise.',
    condition: 'Very Good',
    badge: 'Garage Heavy',
    iconType: 'workbench',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:25:00.000Z',
  },
  {
    id: 'item-3d-printer',
    title: 'Creality Ender-3 V2 3D Printer (Student-Tuned)',
    category: 'Science & Education',
    price: 180,
    location: 'Atlanta, GA',
    sellerFamily: 'The Patel Family',
    description:
      'Glass bed upgrade, silent motherboard, calibrated for youth robotics prototyping. Includes 2 spools of PLA.',
    condition: 'Excellent',
    badge: 'Invention Lab',
    iconType: 'printer',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:30:00.000Z',
  },
  {
    id: 'item-electric-guitar',
    title: 'Fender Squier Mini Electric Guitar & Practice Amp',
    category: 'Music & Arts',
    price: 140,
    location: 'Nashville, TN',
    sellerFamily: 'The Ramirez Family',
    description:
      '3/4 size body, cable, strap, gig bag, and 10-watt amplifier. Ready for the next garage rocker.',
    condition: 'Excellent',
    badge: 'Starter Gear',
    iconType: 'guitar',
    status: 'ACTIVE',
    createdAtUtc: '2026-11-01T12:35:00.000Z',
  },
];

function createDefaultStore(): TdexPersistentStore {
  return {
    version: '10.0',
    ownersByEmail: {},
    piiVault: {},
    sessions: {},
    appendOnlyLedger: [],
    prizeTrustEscrow: {
      verifiedCashCents: 0,
      reservedForActiveSeasonCents: 0,
    },
    listings: [...SEED_LISTINGS],
    tradeReceipts: [],
    studioSubmissions: [],
    vaultCredentials: {},
    vaultSessions: {},
    courtAccessRequests: [],
    courtOrders: [],
    vaultFilings: [],
    internalMovementLog: [],
    vaultSecurityState: {
      emergencyStopActive: false,
      emergencyStopReason: '',
      failedAttemptsByKey: {},
    },
    governanceState: {
      boardSeated: false,
      phase1CustodianId: 'petrossianbobby@gmail.com',
      activeBoardIds: [],
      authorizedPusherIds: [],
      verifiedOwnerCount: 0,
      fcuCharterThreshold: 1000,
    },
  };
}

let cachedStore: TdexPersistentStore | null = null;

export function loadStore(): TdexPersistentStore {
  if (cachedStore) return cachedStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<TdexPersistentStore>;
      const base = createDefaultStore();
      cachedStore = {
        version: parsed.version || base.version,
        ownersByEmail: parsed.ownersByEmail || {},
        piiVault: parsed.piiVault || {},
        sessions: parsed.sessions || {},
        appendOnlyLedger: Array.isArray(parsed.appendOnlyLedger) ? parsed.appendOnlyLedger : [],
        prizeTrustEscrow: parsed.prizeTrustEscrow || base.prizeTrustEscrow,
        listings:
          Array.isArray(parsed.listings) && parsed.listings.length > 0
            ? parsed.listings
            : base.listings,
        tradeReceipts: Array.isArray(parsed.tradeReceipts) ? parsed.tradeReceipts : [],
        studioSubmissions: Array.isArray(parsed.studioSubmissions) ? parsed.studioSubmissions : [],
        vaultCredentials: parsed.vaultCredentials || {},
        vaultSessions: parsed.vaultSessions || {},
        courtAccessRequests: Array.isArray(parsed.courtAccessRequests)
          ? parsed.courtAccessRequests
          : [],
        courtOrders: Array.isArray(parsed.courtOrders) ? parsed.courtOrders : [],
        vaultFilings: Array.isArray(parsed.vaultFilings) ? parsed.vaultFilings : [],
        internalMovementLog: Array.isArray(parsed.internalMovementLog)
          ? parsed.internalMovementLog
          : [],
        vaultSecurityState: parsed.vaultSecurityState || base.vaultSecurityState,
        governanceState: {
          ...base.governanceState,
          ...(parsed.governanceState || {}),
          verifiedOwnerCount: Object.keys(parsed.ownersByEmail || {}).length,
          fcuCharterThreshold: 1000,
        },
      };
      return cachedStore;
    }
  } catch {
    // Recover cleanly with initialized default store if file is missing or unreadable
  }

  cachedStore = createDefaultStore();
  saveStoreAtomic(cachedStore);
  return cachedStore;
}

export function saveStoreAtomic(store: TdexPersistentStore): void {
  cachedStore = store;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${STORE_FILE}.tmp-${process.pid}-${Date.now()}`;
  const serialized = JSON.stringify(store, null, 2);
  fs.writeFileSync(tmpFile, serialized, 'utf8');
  fs.renameSync(tmpFile, STORE_FILE);
}
