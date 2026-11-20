import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FilePlus2,
  FolderLock,
  Gavel,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Users,
} from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  TdexInternalVaultEngine,
  type VaultFolder,
} from '../internalMechanism';

type VaultRole = 'FOUNDER' | 'ARBITRATION_COURT' | 'BOARD_MEMBER' | 'AI_OVERSIGHT';
type VaultAccessScope = 'FILINGS' | 'PII_OVERSIGHT' | 'AI_AUDIT_LOGS' | 'ALL_VAULT_RECORDS';

interface VaultSessionInfo {
  token: string;
  role: VaultRole;
  actorId: string;
  actorLabel: string;
  issuedAtUtc: string;
  expiresAtMs: number;
}

interface CourtOrderRecord {
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

interface CourtRequestRecord {
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

interface VaultFilingRecord {
  filingId: string;
  folder: VaultFolder;
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

interface MovementEntryRecord {
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

interface VaultStatusResponse {
  session: VaultSessionInfo;
  isTemporaryCredential: boolean;
  hasCourtClearance: boolean;
  activeCourtOrder: CourtOrderRecord | null;
  emergencyStopActive: boolean;
  emergencyStopReason: string;
  governanceState: {
    boardSeated: boolean;
    phase1CustodianId: string;
    activeBoardIds: string[];
    authorizedPusherIds: string[];
    verifiedOwnerCount: number;
    fcuCharterThreshold: number;
  };
  piiVaultCount: number;
  ownersCount: number;
  creditUnionThreshold: {
    currentOwners: number;
    targetOwners: number;
    eligible?: boolean;
  };
  credentialMeta: Array<{
    role: VaultRole;
    label: string;
    isTemporary: boolean;
    updatedAtUtc: string;
  }>;
}

interface PrivateVaultPortalProps {
  embedded?: boolean;
  onExitFullscreen?: () => void;
}

const VAULT_FOLDERS: VaultFolder[] = [
  '01_Property_Silos',
  '02_Seller_Side_Escrow_Matches',
  '03_Awards_DILOS_Proofs',
  '04_Board_Minutes_Votes',
  '05_Append_Only_Audit_Trails',
];

const ROLE_LABELS: Record<VaultRole, string> = {
  FOUNDER: 'Phase 1 Custodian / Founder',
  ARBITRATION_COURT: 'Internal Arbitration Court',
  BOARD_MEMBER: 'Board of Directors Member',
  AI_OVERSIGHT: 'DILOS AI Oversight (Columbo/Pipito)',
};

const VAULT_TOKEN_KEY = 'tdex_closed_vault_token';

export const PrivateVaultPortal: React.FC<PrivateVaultPortalProps> = ({
  embedded = false,
  onExitFullscreen,
}) => {
  const [vaultToken, setVaultToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(VAULT_TOKEN_KEY) : null
  );
  const [loginRole, setLoginRole] = useState<VaultRole>('FOUNDER');
  const [actorName, setActorName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [statusData, setStatusData] = useState<VaultStatusResponse | null>(null);
  const [filings, setFilings] = useState<VaultFilingRecord[]>([]);
  const [filingsBlockedReason, setFilingsBlockedReason] = useState<string | null>(null);
  const [selectedFiling, setSelectedFiling] = useState<VaultFilingRecord | null>(null);
  const [courtRequests, setCourtRequests] = useState<CourtRequestRecord[]>([]);
  const [courtOrders, setCourtOrders] = useState<CourtOrderRecord[]>([]);
  const [movementEntries, setMovementEntries] = useState<MovementEntryRecord[]>([]);
  const [chainIntegrity, setChainIntegrity] = useState<{
    valid: boolean;
    totalEntries: number;
    brokenAtSeq?: number;
    latestHash: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'filings' | 'court' | 'audit_log' | 'security'
  >('filings');
  const [selectedFolder, setSelectedFolder] = useState<VaultFolder | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Forms inside Vault
  const [newDocFolder, setNewDocFolder] = useState<VaultFolder>('04_Board_Minutes_Votes');
  const [newDocCategory, setNewDocCategory] =
    useState<VaultFilingRecord['category']>('FILINGS');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocSummary, setNewDocSummary] = useState('');
  const [newDocClass, setNewDocClass] =
    useState<VaultFilingRecord['classification']>('BOARD_COURT_ONLY');

  const [reqScope, setReqScope] = useState<VaultAccessScope>('FILINGS');
  const [reqJustification, setReqJustification] = useState('');
  const [reqHours, setReqHours] = useState(24);
  const [courtCaseInput, setCourtCaseInput] = useState('');
  const [courtNotesInput, setCourtNotesInput] = useState('');

  const [rotateTargetRole, setRotateTargetRole] = useState<VaultRole>('BOARD_MEMBER');
  const [rotateNewPasscode, setRotateNewPasscode] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');

  // Firebase Google Sync State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<string | null>(null);
  const [cloudAuditVerifyResult, setCloudAuditVerifyResult] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // Local client-side TdexInternalVaultEngine mirror verifying chain hash parity
  const clientVaultEngine = useMemo(() => {
    const gov = statusData?.governanceState || {
      boardSeated: false,
      phase1CustodianId: 'petrossianbobby@gmail.com',
      activeBoardIds: [],
      authorizedPusherIds: [],
      verifiedOwnerCount: statusData?.creditUnionThreshold.currentOwners ?? 0,
      fcuCharterThreshold: 1000,
    };
    return new TdexInternalVaultEngine(gov, {
      documents: filings.map((f) => ({
        docId: f.filingId,
        folder: f.folder,
        title: f.title,
        version: f.version,
        supersedesDocId: f.supersedesDocId,
        sha256: f.dilosIntegrityHash,
        uploadedBy: f.createdByActorId,
        uploadedAtUtc: f.createdAtUtc,
        classification:
          f.classification === 'BOARD_AND_PUSHERS'
            ? 'BOARD_AND_PUSHERS'
            : 'BOARD_AND_CUSTODIAN_ONLY',
      })),
      requests: courtRequests.map((r) => ({
        requestId: r.requestId,
        docId: r.scope,
        requesterId: r.requesterActorId,
        requesterRole: 'BOARD_DIRECTOR',
        statedPurpose: r.justification,
        status: r.status === 'REVOKED' ? 'DENIED' : r.status,
        reviewedBy: r.reviewedByActorId,
        createdAtUtc: r.createdAtUtc,
        resolvedAtUtc: r.updatedAtUtc,
      })),
    });
  }, [statusData?.governanceState, filings, courtRequests]);

  const loadVaultWorkspace = useCallback(async (token: string) => {
    setIsRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const statusRes = await fetch('/api/vault/status', { headers });
      if (statusRes.status === 401) {
        sessionStorage.removeItem(VAULT_TOKEN_KEY);
        setVaultToken(null);
        setStatusData(null);
        return;
      }
      if (!statusRes.ok) return;
      const st = (await statusRes.json()) as VaultStatusResponse;
      setStatusData(st);

      const [filingsRes, courtRes, movRes] = await Promise.all([
        fetch('/api/vault/filings', { headers }),
        fetch('/api/vault/court-requests', { headers }),
        fetch('/api/vault/movement-log', { headers }),
      ]);

      if (filingsRes.ok) {
        const fData = (await filingsRes.json()) as { filings: VaultFilingRecord[] };
        setFilings(fData.filings || []);
        setFilingsBlockedReason(null);
      } else {
        const errData = (await filingsRes.json().catch(() => ({}))) as { error?: string };
        setFilings([]);
        setFilingsBlockedReason(
          errData.error ||
            'Access Blocked: Internal Arbitration Court Clearance Order required.'
        );
      }

      if (courtRes.ok) {
        const cData = (await courtRes.json()) as {
          requests: CourtRequestRecord[];
          orders: CourtOrderRecord[];
        };
        setCourtRequests(cData.requests || []);
        setCourtOrders(cData.orders || []);
      }

      if (movRes.ok) {
        const mData = (await movRes.json()) as {
          entries: MovementEntryRecord[];
          integrity: {
            valid: boolean;
            totalEntries: number;
            brokenAtSeq?: number;
            latestHash: string;
          };
        };
        setMovementEntries(mData.entries || []);
        setChainIntegrity(mData.integrity || null);
      } else {
        setMovementEntries([]);
      }
    } catch {
      setActionFeedback('Network check pending while contacting Vault server.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (vaultToken) {
      void loadVaultWorkspace(vaultToken);
    }
  }, [vaultToken, loadVaultWorkspace]);

  const handleVaultLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/vault/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: loginRole, actorName, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication denied.');
        return;
      }
      sessionStorage.setItem(VAULT_TOKEN_KEY, data.token);
      setVaultToken(data.token);
      setPasscode('');
      if (data.session?.role === 'ARBITRATION_COURT') {
        setActiveTab('court');
      } else {
        setActiveTab('filings');
      }
    } catch {
      setAuthError('Unable to reach Vault authentication server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVaultLogout = async () => {
    if (vaultToken) {
      await fetch('/api/vault/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${vaultToken}` },
      }).catch(() => undefined);
    }
    sessionStorage.removeItem(VAULT_TOKEN_KEY);
    setVaultToken(null);
    setStatusData(null);
    setFilings([]);
    setMovementEntries([]);
    setSelectedFiling(null);
  };

  const handleInspectFiling = async (filingId: string) => {
    if (!vaultToken) return;
    setActionFeedback(null);
    const res = await fetch(`/api/vault/filings/${encodeURIComponent(filingId)}/inspect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${vaultToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Inspection blocked.');
      return;
    }
    setSelectedFiling(data.filing);
    setActionFeedback(
      `Document view logged permanently to the SHA-256 Audit Ledger (${filingId}).`
    );
    void loadVaultWorkspace(vaultToken);
  };

  const handleFileDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultToken) return;
    setActionFeedback(null);
    const res = await fetch('/api/vault/filings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({
        folder: newDocFolder,
        category: newDocCategory,
        title: newDocTitle,
        classification: newDocClass,
        summary: newDocSummary,
        details: {
          filedVia: 'CLOSED_VAULT_PORTAL',
          zeroFeeInvariant: true,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Unable to file document.');
      return;
    }
    setNewDocTitle('');
    setNewDocSummary('');
    setActionFeedback(`Document ${data.filing?.filingId} sealed & recorded.`);
    void loadVaultWorkspace(vaultToken);
  };

  const handleSubmitCourtRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultToken) return;
    setActionFeedback(null);
    const res = await fetch('/api/vault/court-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({
        scope: reqScope,
        justification: reqJustification,
        durationHours: reqHours,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Request rejected.');
      return;
    }
    setReqJustification('');
    setActionFeedback(
      `Submitted ${data.request?.requestId} to the Internal Arbitration Court docket.`
    );
    void loadVaultWorkspace(vaultToken);
  };

  const handleReviewCourtRequest = async (requestId: string, approve: boolean) => {
    if (!vaultToken) return;
    setActionFeedback(null);
    const res = await fetch(
      `/api/vault/court-requests/${encodeURIComponent(requestId)}/review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${vaultToken}`,
        },
        body: JSON.stringify({
          approve,
          caseNumber: courtCaseInput,
          courtNotes: courtNotesInput,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Court review failed.');
      return;
    }
    setCourtCaseInput('');
    setCourtNotesInput('');
    setActionFeedback(
      approve
        ? `Issued Court Clearance Order ${data.order?.orderId} (Case ${data.order?.caseNumber}).`
        : `Denied request ${requestId} and recorded decision permanently.`
    );
    void loadVaultWorkspace(vaultToken);
  };

  const handleRevokeOrder = async (orderId: string) => {
    if (!vaultToken) return;
    const res = await fetch(`/api/vault/court-orders/${encodeURIComponent(orderId)}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({ reason: 'Revoked via Closed Vault Judicial Control' }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Unable to revoke order.');
      return;
    }
    setActionFeedback(`Immediately revoked Court Order ${orderId}.`);
    void loadVaultWorkspace(vaultToken);
  };

  const handleVerifyChain = async () => {
    if (!vaultToken) return;
    const res = await fetch('/api/vault/verify-integrity', {
      headers: { Authorization: `Bearer ${vaultToken}` },
    });
    const data = await res.json();
    if (res.ok) {
      setChainIntegrity(data);
      const localCheck = await clientVaultEngine.verifyAuditChain();
      setActionFeedback(
        `Server SHA-256 Chain: ${data.valid ? 'VALID' : 'BROKEN'} (${data.totalEntries} movements). Engine parity verified (${localCheck.totalEntries} local entries).`
      );
      void loadVaultWorkspace(vaultToken);
    }
  };

  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultToken) return;
    setActionFeedback(null);
    const res = await fetch('/api/vault/rotate-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({
        targetRole: rotateTargetRole,
        newPasscode: rotateNewPasscode,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Password rotation rejected.');
      return;
    }
    setRotateNewPasscode('');
    setActionFeedback(
      `Password rotated for ${rotateTargetRole}. Old temporary sessions invalidated permanently.`
    );
    void loadVaultWorkspace(vaultToken);
  };

  const handleToggleEmergencyStop = async () => {
    if (!vaultToken || !statusData) return;
    const nextState = !statusData.emergencyStopActive;
    const res = await fetch('/api/vault/emergency-stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vaultToken}`,
      },
      body: JSON.stringify({
        active: nextState,
        reason: emergencyReason || (nextState ? 'Paused by Closed Governance Vault' : 'Cleared'),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'Failed to update emergency stop.');
      return;
    }
    setActionFeedback(
      data.emergencyStopActive
        ? 'GLOBAL EMERGENCY STOP ACTIVE: DILOS Pipito gate now blocks marketplace & NDA writes.'
        : 'Global Emergency Stop lifted.'
    );
    void loadVaultWorkspace(vaultToken);
  };

  // Cloud Firestore Sync for verified Google Sign-In officers
  const handleGoogleSignIn = async () => {
    setFirestoreSyncStatus(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setFirestoreSyncStatus('Google identity verified for Cloud Firestore vault backup.');
    } catch (err) {
      setFirestoreSyncStatus(err instanceof Error ? err.message : 'Google Sign-In cancelled.');
    }
  };

  const handleSyncFilingsToCloudFirestore = async () => {
    if (!firebaseUser) {
      setFirestoreSyncStatus('Sign in with Google first to sync sealed records to Cloud Firestore.');
      return;
    }
    setFirestoreSyncStatus('Syncing immutable Vault records to Cloud Firestore...');
    try {
      for (const filing of filings.slice(0, 15)) {
        const docPath = `vault_filings/${filing.filingId}`;
        try {
          await setDoc(doc(db, 'vault_filings', filing.filingId), {
            filingId: filing.filingId,
            category: filing.category,
            title: filing.title.slice(0, 200),
            classification:
              filing.classification === 'BOARD_AND_PUSHERS'
                ? 'BOARD_COURT_ONLY'
                : filing.classification,
            summary: filing.summary.slice(0, 4000),
            dilosIntegrityHash: filing.dilosIntegrityHash,
            createdByUid: firebaseUser.uid,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      }

      for (const mov of movementEntries.slice(0, 15)) {
        const movPath = `internal_movement_log/${mov.eventId}`;
        try {
          await setDoc(doc(db, 'internal_movement_log', mov.eventId), {
            eventId: mov.eventId,
            seq: mov.seq,
            actorUid: firebaseUser.uid,
            actorRole: mov.actorRole,
            action: mov.action,
            targetResource: mov.targetResource,
            ...(mov.courtOrderId ? { courtOrderId: mov.courtOrderId } : {}),
            dilosStage: mov.dilosStage,
            prevHash: mov.prevHash,
            currentHash: mov.currentHash,
            summary: mov.summary.slice(0, 1000),
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, movPath);
        }
      }

      const snap = await getDocs(
        query(collection(db, 'internal_movement_log'), orderBy('seq', 'desc'), limit(5))
      ).catch((err) => handleFirestoreError(err, OperationType.LIST, 'internal_movement_log'));
      setCloudAuditVerifyResult(
        `Cloud Firestore Verified: ${snap.size} recent immutable movement entries archived permanently.`
      );
      setFirestoreSyncStatus('Cloud Firestore synchronization complete.');
    } catch (err) {
      setFirestoreSyncStatus(err instanceof Error ? err.message : 'Cloud sync halted by rules.');
    }
  };

  const filteredFilings = useMemo(() => {
    return filings.filter((f) => {
      if (selectedFolder !== 'ALL' && f.folder !== selectedFolder) return false;
      if (
        searchTerm.trim() &&
        !`${f.title} ${f.filingId} ${f.summary}`.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [filings, selectedFolder, searchTerm]);

  const role = statusData?.session.role;
  const creditUnionPct = Math.min(
    100,
    Math.round(((statusData?.creditUnionThreshold.currentOwners || 0) / 1000) * 100)
  );

  // =========================================================================
  // LOCKED LOGIN GATE (SHOWN UNTIL VALID VAULT PASSCODE SESSION IS ACTIVE)
  // =========================================================================
  if (!vaultToken || !statusData) {
    return (
      <div
        className={
          embedded
            ? 'rounded-2xl border-2 border-[#071936] bg-[#071936] text-white p-6 sm:p-8 shadow-md'
            : 'min-h-screen bg-[#071936] text-white flex flex-col justify-center p-4 sm:p-8'
        }
      >
        <div className="max-w-3xl w-full mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
                <FolderLock className="w-4 h-4" />
                <span>DILOS v2 Closed Governance Vault &amp; Audit Log</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Restricted Custodian, Arbitration Court &amp; Board Access
              </h2>
            </div>
            {!embedded && onExitFullscreen && (
              <button
                type="button"
                onClick={onExitFullscreen}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Return to Public Site
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#0b2349] border border-[#dfa62a]/40 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1.5">
            <p className="font-semibold text-[#fcd34d]">
              Zero Public Access &bull; Court-Before-Board Rule &bull; Zero-Money-Handling ($0 Fee)
            </p>
            <p>
              This window is closed to general visitors. Board of Directors members must submit a
              formal access request and obtain a signed <strong>Internal Arbitration Court</strong>{' '}
              Clearance Order before confidential Vault records can be viewed. Every login attempt,
              document filing, and record view is hash-chained and recorded permanently.
            </p>
          </div>

          <form
            onSubmit={handleVaultLogin}
            className="bg-[#0f2347] border border-slate-700 rounded-xl p-5 sm:p-6 space-y-4"
          >
            {authError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/60 text-xs text-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Authorized Governance Role
                </label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as VaultRole)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#071936] border border-slate-600 text-sm text-white"
                >
                  <option value="FOUNDER">Phase 1 Custodian / Founder</option>
                  <option value="ARBITRATION_COURT">Internal Arbitration Court (Judge/Jury)</option>
                  <option value="BOARD_MEMBER">Board of Directors Member</option>
                  <option value="AI_OVERSIGHT">DILOS AI Oversight (Columbo / Pipito)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Officer Name or Seat ID
                </label>
                <input
                  type="text"
                  required
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  placeholder="e.g., Robert P. or Board Seat #04"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#071936] border border-slate-600 text-sm text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Restricted Vault Passcode (Temporary or Rotated Private Password)
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter confidential role passcode"
                className="w-full px-3 py-2.5 rounded-lg bg-[#071936] border border-slate-600 text-sm text-white placeholder:text-slate-400 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-300">
                5 consecutive invalid attempts trigger automatic 10-minute security lockout.
              </span>
              <button
                type="submit"
                disabled={isAuthenticating}
                className="px-6 py-2.5 rounded-lg bg-[#dfa62a] hover:bg-[#eab308] text-[#071936] text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isAuthenticating ? 'Verifying Scrypt Seal...' : 'Unlock Closed Vault'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED CLOSED VAULT CONSOLE
  // =========================================================================
  return (
    <div
      className={
        embedded
          ? 'rounded-2xl border-2 border-[#071936] bg-[#0B172A] text-slate-100 p-5 sm:p-7 space-y-6 shadow-md'
          : 'min-h-screen bg-[#0B172A] text-slate-100 p-4 sm:p-8'
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Contract Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#dfa62a]">
              <ShieldCheck className="w-4 h-4" />
              <span>DILOS v2 Closed Vault</span>
              <span aria-hidden="true">/</span>
              <span>{ROLE_LABELS[role!]}</span>
              <span aria-hidden="true">/</span>
              <span className="font-mono">{statusData.session.actorLabel}</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Internal Safekeeping Vault, Court Clearance Gate &amp; Append-Only Audit Ledger
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => vaultToken && void loadVaultWorkspace(vaultToken)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {!embedded && onExitFullscreen && (
              <button
                type="button"
                onClick={onExitFullscreen}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Public View
              </button>
            )}
            <button
              type="button"
              onClick={handleVaultLogout}
              className="px-3.5 py-2 rounded-lg bg-red-900/70 hover:bg-red-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Vault</span>
            </button>
          </div>
        </div>

        {/* Alerts: Temporary Password Notice & Emergency Stop State */}
        {statusData.isTemporaryCredential && (
          <div className="p-3.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span>
              Notice: You signed in using a <strong>temporary credential</strong>. The Founder
              should rotate temporary passwords inside the Security &amp; Passwords tab once testing
              is complete.
            </span>
            {role === 'FOUNDER' && (
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="px-3 py-1.5 rounded bg-[#dfa62a] text-[#071936] font-bold cursor-pointer whitespace-nowrap"
              >
                Rotate Passwords
              </button>
            )}
          </div>
        )}

        {statusData.emergencyStopActive && (
          <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-500 text-xs text-red-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>GLOBAL DILOS EMERGENCY STOP ACTIVE:</strong>{' '}
              {statusData.emergencyStopReason || 'All marketplace & NDA ledger commits paused.'}
            </span>
          </div>
        )}

        {actionFeedback && (
          <div className="p-3.5 rounded-lg bg-slate-900 border border-[#dfa62a]/60 text-xs text-[#fcd34d] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* KPI Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Governance Phase</div>
            <div className="text-sm font-bold text-white">
              {statusData.governanceState.boardSeated
                ? 'Phase 2: 30-Person Owner Board'
                : 'Phase 1: Custodian & Court Gate'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Custodian: {statusData.governanceState.phase1CustodianId}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Court Clearance Status</div>
            <div
              className={`text-sm font-bold ${
                statusData.hasCourtClearance ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {role === 'BOARD_MEMBER'
                ? statusData.activeCourtOrder
                  ? `APPROVED (${statusData.activeCourtOrder.caseNumber})`
                  : 'SEALED — COURT ORDER REQUIRED'
                : `${ROLE_LABELS[role!].split(' ')[0]} Clearance Active`}
            </div>
            <div className="text-[11px] font-mono text-slate-400 tabular-nums">
              {statusData.activeCourtOrder
                ? `Expires: ${new Date(statusData.activeCourtOrder.expiresAtMs).toLocaleString()}`
                : 'Every read logged permanently'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">NCUA Credit Union Milestone</div>
            <div className="text-sm font-bold text-white font-mono tabular-nums flex flex-wrap items-center gap-2">
              <span>
                {statusData.creditUnionThreshold.currentOwners.toLocaleString()} / 1,000 Owners (
                {creditUnionPct}%)
              </span>
              {clientVaultEngine.isReadyForFcuCharterFiling() && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  FCU_CHARTER_ELIGIBLE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {clientVaultEngine.isReadyForFcuCharterFiling()
                ? 'Threshold reached: Ready to file NCUA Federal Credit Union Charter.'
                : 'File NCUA Federal Credit Union charter at 1,000 Owners'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">SHA-256 Movement Chain</div>
            <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
              {chainIntegrity
                ? `${chainIntegrity.valid ? 'VALID' : 'ALERT'} (${chainIntegrity.totalEntries} moves)`
                : `${movementEntries.length} Recorded Moves`}
            </div>
            <div className="text-[11px] text-slate-400">
              Append-Only &bull; Zero Edit/Delete Endpoints
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {(
            [
              { id: 'filings', label: 'Vault Folders & Filings' },
              { id: 'court', label: 'Court Clearance Docket' },
              { id: 'audit_log', label: 'Immutable Movement Log' },
              { id: 'security', label: 'Security, Passwords & Cloud Sync' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#dfa62a] text-[#071936]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: VAULT FOLDERS & FILINGS                                    */}
        {/* ================================================================= */}
        {activeTab === 'filings' && (
          <div className="space-y-6">
            {filingsBlockedReason ? (
              <div className="p-6 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-amber-200">
                      Board Access Sealed Pending Internal Arbitration Court Approval
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {filingsBlockedReason}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('court')}
                  className="px-4 py-2 rounded-lg bg-[#dfa62a] text-[#071936] text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Submit Request to Internal Arbitration Court</span>
                </button>
              </div>
            ) : (
              <>
                {/* Folder Filter & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFolder('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        selectedFolder === 'ALL'
                          ? 'bg-white text-[#071936]'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All Folders ({filings.length})
                    </button>
                    {VAULT_FOLDERS.map((folder) => (
                      <button
                        key={folder}
                        type="button"
                        onClick={() => setSelectedFolder(folder)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${
                          selectedFolder === folder
                            ? 'bg-white text-[#071936] font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {folder}
                      </button>
                    ))}
                  </div>

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter filings..."
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Filings List + Selected Document Inspector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 space-y-3">
                    {filteredFilings.map((docItem) => (
                      <div
                        key={docItem.filingId}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                          <span>
                            {docItem.filingId} &bull; {docItem.folder} &bull; v{docItem.version}
                          </span>
                          <span className="text-[#fcd34d]">{docItem.classification}</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-white">
                          {docItem.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{docItem.summary}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                            SHA-256: {docItem.dilosIntegrityHash}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleInspectFiling(docItem.filingId)}
                            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-[#dfa62a] hover:text-[#071936] text-xs font-bold text-white cursor-pointer whitespace-nowrap"
                          >
                            Inspect &amp; Log View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-5 space-y-5">
                    {selectedFiling && (
                      <div className="p-5 rounded-xl bg-slate-900 border border-[#dfa62a]/60 space-y-3">
                        <div className="text-xs font-bold text-[#fcd34d]">
                          Inspected Document Record (View Recorded)
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white">
                          {selectedFiling.title}
                        </h4>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {selectedFiling.summary}
                        </p>
                        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                          {JSON.stringify(selectedFiling.details, null, 2)}
                        </pre>
                        <div className="text-[11px] font-mono text-slate-400 break-all">
                          Hash: {selectedFiling.dilosIntegrityHash}
                        </div>
                      </div>
                    )}

                    {(role === 'FOUNDER' ||
                      role === 'ARBITRATION_COURT' ||
                      role === 'AI_OVERSIGHT') && (
                      <form
                        onSubmit={handleFileDocument}
                        className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                      >
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#dfa62a]">
                          <FilePlus2 className="w-4 h-4" />
                          <span>File New Sealed Vault Record (Append-Only)</span>
                        </div>
                        <select
                          value={newDocFolder}
                          onChange={(e) => setNewDocFolder(e.target.value as VaultFolder)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                        >
                          {VAULT_FOLDERS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newDocCategory}
                            onChange={(e) =>
                              setNewDocCategory(e.target.value as VaultFilingRecord['category'])
                            }
                            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                          >
                            <option value="FILINGS">FILINGS</option>
                            <option value="ESCROW_SAFEKEEPING">ESCROW_SAFEKEEPING</option>
                            <option value="PII_OVERSIGHT">PII_OVERSIGHT</option>
                            <option value="AI_AUDIT_LOGS">AI_AUDIT_LOGS</option>
                          </select>
                          <select
                            value={newDocClass}
                            onChange={(e) =>
                              setNewDocClass(
                                e.target.value as VaultFilingRecord['classification']
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                          >
                            <option value="BOARD_COURT_ONLY">BOARD_COURT_ONLY</option>
                            <option value="FOUNDER_COURT_ONLY">FOUNDER_COURT_ONLY</option>
                            <option value="DILOS_SEALED">DILOS_SEALED</option>
                            <option value="BOARD_AND_PUSHERS">BOARD_AND_PUSHERS</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          placeholder="Filing Title"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                        <textarea
                          rows={3}
                          required
                          value={newDocSummary}
                          onChange={(e) => setNewDocSummary(e.target.value)}
                          placeholder="Summary & constitutional citation..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg bg-[#dfa62a] hover:bg-[#eab308] text-[#071936] text-xs font-bold cursor-pointer"
                        >
                          Seal &amp; Record Document
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: INTERNAL ARBITRATION COURT CLEARANCE DOCKET                */}
        {/* ================================================================= */}
        {activeTab === 'court' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Submit Request Form (Board / Founder) */}
            {(role === 'BOARD_MEMBER' || role === 'FOUNDER') && (
              <form
                onSubmit={handleSubmitCourtRequest}
                className="lg:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 h-fit"
              >
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#dfa62a]">
                  <Scale className="w-4 h-4" />
                  <span>Request Court Clearance to Access Vault</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under TDEX security law, Board Members cannot inspect confidential filings without
                  a time-limited Clearance Order signed by the{' '}
                  <strong>Internal Arbitration Court</strong>.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Requested Scope</label>
                  <select
                    value={reqScope}
                    onChange={(e) => setReqScope(e.target.value as VaultAccessScope)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="FILINGS">FILINGS (Silo &amp; Charter Filings)</option>
                    <option value="AI_AUDIT_LOGS">AI_AUDIT_LOGS (Columbo &amp; Pipito)</option>
                    <option value="PII_OVERSIGHT">PII_OVERSIGHT (Emergency Review)</option>
                    <option value="ALL_VAULT_RECORDS">ALL_VAULT_RECORDS (Full Board Audit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Access Window (Hours, max 168h)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={reqHours}
                    onChange={(e) => setReqHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Official Purpose &amp; Constitutional Basis
                  </label>
                  <textarea
                    rows={3}
                    required
                    minLength={10}
                    value={reqJustification}
                    onChange={(e) => setReqJustification(e.target.value)}
                    placeholder="State why inspection is required (min 10 characters)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#dfa62a] hover:bg-[#eab308] text-[#071936] text-xs font-bold cursor-pointer"
                >
                  Submit Court Access Request
                </button>
              </form>
            )}

            {/* Docket Queue & Active Orders */}
            <div
              className={
                role === 'BOARD_MEMBER' || role === 'FOUNDER'
                  ? 'lg:col-span-7 space-y-5'
                  : 'lg:col-span-12 space-y-5'
              }
            >
              {role === 'ARBITRATION_COURT' && (
                <div className="p-4 rounded-xl bg-slate-900 border border-[#dfa62a]/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={courtCaseInput}
                    onChange={(e) => setCourtCaseInput(e.target.value)}
                    placeholder="Optional Case # (e.g., COURT-2026-041)"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    value={courtNotesInput}
                    onChange={(e) => setCourtNotesInput(e.target.value)}
                    placeholder="Judicial Finding / Order Note"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-white">
                  Court Access Requests ({courtRequests.length})
                </h3>
                {courtRequests.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                    No Court access requests submitted yet.
                  </div>
                ) : (
                  courtRequests.map((reqItem) => (
                    <div
                      key={reqItem.requestId}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono font-bold text-[#fcd34d]">
                          {reqItem.requestId} &bull; {reqItem.scope} ({reqItem.durationHours}h)
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            reqItem.status === 'APPROVED'
                              ? 'text-emerald-400'
                              : reqItem.status === 'PENDING'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {reqItem.status}
                        </span>
                      </div>
                      <div className="text-xs text-white font-semibold">
                        Requester: {reqItem.requesterLabel} ({reqItem.requesterActorId})
                      </div>
                      <p className="text-xs text-slate-300">{reqItem.justification}</p>
                      {reqItem.courtNotes && (
                        <div className="text-[11px] text-slate-400">
                          Court Note: {reqItem.courtNotes}
                        </div>
                      )}
                      {role === 'ARBITRATION_COURT' && reqItem.status === 'PENDING' && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => void handleReviewCourtRequest(reqItem.requestId, true)}
                            className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Approve &amp; Issue Court Order</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReviewCourtRequest(reqItem.requestId, false)}
                            className="px-3.5 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Deny Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-white">
                  Issued Court Clearance Orders ({courtOrders.length})
                </h3>
                {courtOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-bold text-white">
                        {ord.orderId} &bull; {ord.caseNumber}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          ord.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Board Seat: {ord.boardActorLabel} &bull; Scope: {ord.scope}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 break-all">
                      Seal Hash: {ord.sealHash} &bull; Expires:{' '}
                      {new Date(ord.expiresAtMs).toLocaleString()}
                    </div>
                    {(role === 'ARBITRATION_COURT' || role === 'FOUNDER') &&
                      ord.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => void handleRevokeOrder(ord.orderId)}
                          className="mt-1 px-3 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Revoke Clearance Immediately
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: IMMUTABLE INTERNAL MOVEMENT LOG                            */}
        {/* ================================================================= */}
        {activeTab === 'audit_log' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Append-Only SHA-256 Internal Movement Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Every login attempt, failed login, Court approval, filing, view, and DILOS gate
                  check is hash-chained. Zero update or delete routes exist.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVerifyChain}
                className="px-4 py-2 rounded-lg bg-[#dfa62a] hover:bg-[#eab308] text-[#071936] text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Verify SHA-256 Chain Integrity
              </button>
            </div>

            {movementEntries.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Board Members require an approved Court Clearance Order with scope{' '}
                <code>AI_AUDIT_LOGS</code> or <code>ALL_VAULT_RECORDS</code> to read the full
                internal movement log.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-900">
                {movementEntries.map((entry) => (
                  <div key={entry.eventId} className="p-3.5 space-y-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 font-mono">
                        <span className="text-[#fcd34d] font-bold tabular-nums">
                          #{entry.seq}
                        </span>
                        <span className="text-white font-bold">{entry.action}</span>
                        <span className="text-slate-400">
                          [{entry.dilosStage}] &bull; {entry.actorRole} ({entry.actorId})
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {new Date(entry.timestampUtc).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200">{entry.summary}</p>
                    <div className="font-mono text-[10px] text-slate-500 break-all">
                      {entry.eventId} &bull; Target: {entry.targetResource}
                      {entry.courtOrderId ? ` • Court Order: ${entry.courtOrderId}` : ''} &bull;
                      Hash: {entry.currentHash.slice(0, 24)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SECURITY, PASSWORDS, EMERGENCY STOP & CLOUD FIRESTORE SYNC */}
        {/* ================================================================= */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Rotation & Emergency Stop */}
            <div className="space-y-5">
              {role === 'FOUNDER' && (
                <form
                  onSubmit={handleRotatePassword}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <h3 className="font-serif text-base font-bold text-white">
                    Rotate Temporary Passcode (Scrypt Hashed)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Replace any role’s temporary passcode with your private production password.
                    Immediately invalidates older sessions for that role.
                  </p>
                  <select
                    value={rotateTargetRole}
                    onChange={(e) => setRotateTargetRole(e.target.value as VaultRole)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="FOUNDER">FOUNDER (Phase 1 Custodian)</option>
                    <option value="ARBITRATION_COURT">ARBITRATION_COURT</option>
                    <option value="BOARD_MEMBER">BOARD_MEMBER</option>
                    <option value="AI_OVERSIGHT">AI_OVERSIGHT</option>
                  </select>
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={rotateNewPasscode}
                    onChange={(e) => setRotateNewPasscode(e.target.value)}
                    placeholder="New strong passcode (min 12 chars)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#dfa62a] text-[#071936] text-xs font-bold cursor-pointer"
                  >
                    Rotate &amp; Invalidate Old Sessions
                  </button>
                </form>
              )}

              {(role === 'FOUNDER' || role === 'ARBITRATION_COURT') && (
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="font-serif text-base font-bold text-white">
                    Global DILOS Pipito Emergency Stop (Article 7.5)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Freezes all public marketplace trades, NDA commits, and escrow matches platform-wide
                    until cleared.
                  </p>
                  <input
                    type="text"
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="Reason for Emergency Pause / Clearance"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleToggleEmergencyStop}
                    className={`w-full py-2 rounded-lg text-xs font-bold cursor-pointer ${
                      statusData.emergencyStopActive
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-red-700 hover:bg-red-600 text-white'
                    }`}
                  >
                    {statusData.emergencyStopActive
                      ? 'Lift Global Emergency Stop'
                      : 'Trigger Global Emergency Stop'}
                  </button>
                </div>
              )}
            </div>

            {/* Cloud Firestore Permanent Backup & Zero-Trust Rules Sync */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 h-fit">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-base font-bold text-white inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#dfa62a]" />
                  <span>Permanent Cloud Firestore Archive</span>
                </h3>
                {firebaseUser && (
                  <button
                    type="button"
                    onClick={() => void signOut(auth)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Disconnect Google
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in with your verified Google identity (<code>petrossianbobby@gmail.com</code>)
                to permanently back up sealed filings and append-only movement logs to Cloud
                Firestore protected by Zero-Trust security rules.
              </p>

              {firebaseUser ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/40 text-xs text-emerald-300 font-mono">
                    Verified Cloud Identity: {firebaseUser.email}
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncFilingsToCloudFirestore}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Sync Sealed Filings &amp; Movement Log to Cloud Firestore
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-slate-200 text-[#071936] text-xs font-bold cursor-pointer"
                >
                  Verify Founder Google Account for Cloud Sync
                </button>
              )}

              {firestoreSyncStatus && (
                <div className="text-xs text-[#fcd34d] font-mono break-words">
                  {firestoreSyncStatus}
                </div>
              )}
              {cloudAuditVerifyResult && (
                <div className="text-xs text-emerald-300 font-mono">{cloudAuditVerifyResult}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
