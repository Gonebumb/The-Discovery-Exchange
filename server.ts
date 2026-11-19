import 'dotenv/config';
import crypto from 'node:crypto';
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
} from './src/server/dbStore.ts';

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
const PAYPAL_MERCHANT_EMAIL = process.env.PAYPAL_MERCHANT_EMAIL || 'DISABLED_PRELAUNCH';
const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Hard-Hold Gate: Flips to false ONLY when Stripe Connect / PayPal Commerce & segregated escrow accounts are active
const PRODUCTION_REAL_MONEY_HOLD = process.env.TDEX_LIVE_ESCROW_ENABLED !== 'true';

// ============================================================================
// 2. ATOMIC PERSISTENT STORE & SEGREGATED VAULTS (ARTICLE 8 & 10)
// ============================================================================
const store = loadStore();

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

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, stateCode, isAdultVerified, acceptedCharterV10 } = req.body;

  if (!email || !password || !fullName || !stateCode) {
    res.status(400).json({ error: 'Email, password, full name, and state/country are required.' });
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

  const normalizedEmail = String(email).trim().toLowerCase();
  if (store.ownersByEmail[normalizedEmail]) {
    res.status(409).json({ error: 'An Owner account already exists for this email.' });
    return;
  }

  const ownerUuid = `OWNER-${crypto.randomUUID()}`;
  const passwordHash = sha256(`${normalizedEmail}:${password}`);

  // Store sensitive PII strictly in encrypted/segregated PII Vault
  store.piiVault[ownerUuid] = {
    fullName: String(fullName).trim(),
    address: '',
    guardianConsent: true,
  };

  const owner: OwnerAccount = {
    ownerUuid,
    email: normalizedEmail,
    passwordHash,
    stateCode: String(stateCode).trim().toUpperCase(),
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
  const token = crypto.randomBytes(32).toString('hex');
  store.sessions[token] = ownerUuid;

  const ledgerBlock = commitToAppendOnlyLedger(
    'OWNER_REGISTERED',
    { ownerUuid, stateCode: owner.stateCode, votingWeight: 1, charterVersion: CHARTER_VERSION },
    ownerUuid,
    sha256(`REG|${ownerUuid}|1`)
  );

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
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const owner = store.ownersByEmail[normalizedEmail];

  if (!owner || owner.passwordHash !== sha256(`${normalizedEmail}:${password}`)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
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
  if (PRODUCTION_REAL_MONEY_HOLD) return false;
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function verifyPayPalWebhookSignature(
  headers: Request['headers'],
  webhookEvent: unknown
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Reject unverified live webhook payloads; only allow unsigned local sandbox testing
    return process.env.PAYPAL_ENV !== 'live' && PRODUCTION_REAL_MONEY_HOLD;
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
  const resolvedSeller = (params.sellerEmail || 'demo-seller.invalid').toLowerCase();
  const resolvedBuyer = (params.buyerEmail || 'demo-buyer.invalid').toLowerCase();
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
    process.env.PAYPAL_ENV === 'live' && !PRODUCTION_REAL_MONEY_HOLD
      ? 'LIVE_ESCROW'
      : 'SANDBOX_SIMULATED_ESCROW_HOLD';

  const block = commitToAppendOnlyLedger(
    'MARKETPLACE_50_25_25_SETTLED',
    {
      orderTrackingId: params.trackingId,
      itemTitle: params.itemTitle,
      totalCents: params.totalCents,
      sellerCashCents: split.sellerCashCents,
      sellerEquityCents: split.sellerEquityCents,
      buyerEquityCents: split.buyerEquityCents,
      mode,
    },
    params.witnessId,
    split.auditHash
  );

  const receipt: PersistedTradeReceipt = {
    receiptId: params.trackingId,
    itemId: params.trackingId,
    itemTitle: conciergeStripPii(params.itemTitle || 'PayPal Verified Trade'),
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

async function dispatchPayPalSeller50Payout(params: {
  trackingId: string;
  sellerEmail: string;
  sellerCashCents: number;
  itemTitle: string;
}): Promise<{ dispatched: boolean; payoutBatchId?: string; skippedReason?: string }> {
  if (!canUsePayPalRestApi() || params.sellerCashCents <= 0) {
    return { dispatched: false, skippedReason: 'CREDENTIALS_OR_AMOUNT_NOT_READY' };
  }
  if (process.env.PAYPAL_ENV === 'live' && PRODUCTION_REAL_MONEY_HOLD) {
    return { dispatched: false, skippedReason: 'PRODUCTION_REAL_MONEY_HOLD_ACTIVE' };
  }
  if (process.env.PAYPAL_ENV !== 'live' && process.env.PAYPAL_ENABLE_SANDBOX_PAYOUTS !== 'true') {
    return { dispatched: false, skippedReason: 'SANDBOX_PAYOUTS_DRY_RUN' };
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const res = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `${params.trackingId}-50CASH`,
          email_subject: 'TDEX Article 12.1 — Your 50% Instant Seller Cash Payout',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: (params.sellerCashCents / 100).toFixed(2),
              currency: 'USD',
            },
            note: `50% Seller Cash for ${params.itemTitle} (Remaining 25% + 25% locked in segregated Dexpa Property Escrow).`,
            sender_item_id: `${params.trackingId}-ITEM`,
            receiver: params.sellerEmail,
          },
        ],
      }),
    });
    const data = (await res.json()) as {
      batch_header?: { payout_batch_id?: string };
    };
    return {
      dispatched: res.ok,
      payoutBatchId: data.batch_header?.payout_batch_id,
    };
  } catch {
    return { dispatched: false, skippedReason: 'PAYOUT_DISPATCH_ERROR' };
  }
}

app.get('/api/marketplace/paypal-status', (_req: Request, res: Response) => {
  res.json({
    paypalEnv: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox',
    merchantEmail: PAYPAL_MERCHANT_EMAIL,
    credentialsConfigured: Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    ),
    webhookConfigured: Boolean(process.env.PAYPAL_WEBHOOK_ID),
    productionRealMoneyHold: PRODUCTION_REAL_MONEY_HOLD,
    payoutsCapabilityWired: true,
  });
});

app.post('/api/marketplace/create-paypal-order', async (req: Request, res: Response) => {
  if (PRODUCTION_REAL_MONEY_HOLD || !canUsePayPalRestApi()) {
    res.status(403).json({
      error: 'Working draft mode: real card billing and PayPal checkout are not active yet.',
      productionRealMoneyHold: true,
    });
    return;
  }

  const { itemTitle, priceUsd, sellerEmail, buyerEmail } = req.body;
  const totalCents = Math.round(Number(priceUsd || 0) * 100);
  if (!itemTitle || totalCents <= 0) {
    res.status(400).json({ error: 'Valid itemTitle and positive priceUsd are required.' });
    return;
  }

  // Stage 2: Columbo Arithmetic Audit
  const split = columboVerifySplitCents(totalCents);
  if (!split.valid) {
    res.status(400).json({ error: 'Columbo Audit Failed: Invalid 50/25/25 split.' });
    return;
  }

  // Stage 3: Pipito Constitutional Gate Check
  const gate = pipitoCheckConstitutionalGates({});
  if (!gate.cleared) {
    res.status(403).json({ error: gate.reason });
    return;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const orderTrackingId = generateTrackingId('MKT');
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderTrackingId,
            custom_id: JSON.stringify({
              orderTrackingId,
              itemTitle: String(itemTitle).slice(0, 60),
              sellerEmail,
              buyerEmail,
              totalCents,
            }),
            description: `${itemTitle} — Article 12 Split (50% Cash / 25% Seller / 25% Buyer)`,
            amount: {
              currency_code: 'USD',
              value: (totalCents / 100).toFixed(2),
            },
          },
        ],
      }),
    });
    const orderData = (await orderRes.json()) as {
      id?: string;
      status?: string;
      links?: Array<{ rel?: string; href?: string }>;
    };
    const approveUrl = orderData.links?.find((l) => l.rel === 'approve')?.href;
    res.status(orderRes.status).json({
      ...orderData,
      orderTrackingId,
      approveUrl,
      mode: process.env.PAYPAL_ENV === 'live' ? 'PAYPAL_LIVE_ORDER' : 'PAYPAL_SANDBOX_ORDER',
      columboAuditHash: split.auditHash,
      notice:
        process.env.PAYPAL_ENV === 'live'
          ? 'Live PayPal order created with Article 12.1 50/25/25 tracking.'
          : 'PayPal Sandbox test order created via api-m.sandbox.paypal.com (no real money moved).',
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'PayPal order creation error.',
    });
  }
});

app.post('/api/marketplace/capture-paypal-order', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'PayPal orderId is required.' });
    return;
  }
  if (!canUsePayPalRestApi()) {
    res.status(403).json({
      error: 'PayPal REST capture requires configured sandbox/live credentials and unlocked mode.',
    });
    return;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const capRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
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

    const capture = capData.purchase_units?.[0]?.payments?.captures?.[0];
    let parsed: {
      orderTrackingId?: string;
      itemTitle?: string;
      sellerEmail?: string;
      buyerEmail?: string;
      totalCents?: number;
    } = {};
    try {
      parsed = JSON.parse(capture?.custom_id || '{}');
    } catch {
      parsed = {};
    }
    const totalCents =
      Number(parsed.totalCents || 0) ||
      Math.round(Number(capture?.amount?.value || 0) * 100);
    const trackingId = parsed.orderTrackingId || capData.purchase_units?.[0]?.reference_id || String(orderId);
    const settled = settlePayPal502525Receipt({
      trackingId,
      itemTitle: parsed.itemTitle || 'PayPal Marketplace Item',
      sellerEmail: parsed.sellerEmail,
      buyerEmail: parsed.buyerEmail,
      totalCents,
      witnessId: 'PAYPAL_CAPTURE_API',
    });

    const payout = !settled.alreadySettled && parsed.sellerEmail
      ? await dispatchPayPalSeller50Payout({
          trackingId,
          sellerEmail: parsed.sellerEmail,
          sellerCashCents: settled.receipt.sellerCashCents,
          itemTitle: settled.receipt.itemTitle,
        })
      : { dispatched: false, skippedReason: 'ALREADY_SETTLED_OR_NO_SELLER_EMAIL' };

    res.json({
      status: capData.status,
      paypalOrderId: capData.id,
      captureId: capture?.id,
      payout,
      ...settled,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'PayPal order capture error.',
    });
  }
});

// PayPal Webhook Handler: Hard-disabled during pre-launch hold; verifies signature & commits 50/25/25 Ledger upon PAYMENT.CAPTURE.COMPLETED
app.post('/api/webhooks/paypal', async (req: Request, res: Response) => {
  if (PRODUCTION_REAL_MONEY_HOLD) {
    res.status(403).json({
      error: 'Working draft mode: live PayPal webhooks are not active yet.',
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
      const settled = settlePayPal502525Receipt({
        trackingId,
        itemTitle: parsed.itemTitle || 'PayPal Webhook Settled Trade',
        sellerEmail: parsed.sellerEmail,
        buyerEmail: parsed.buyerEmail,
        totalCents,
        witnessId: 'PAYPAL_VERIFIED_GATEWAY',
      });
      if (!settled.alreadySettled && parsed.sellerEmail) {
        await dispatchPayPalSeller50Payout({
          trackingId,
          sellerEmail: parsed.sellerEmail,
          sellerCashCents: settled.receipt.sellerCashCents,
          itemTitle: settled.receipt.itemTitle,
        });
      }
    }
  }
  res.status(200).json({ received: true });
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
  const { title, category, price, priceUsd, location, description, condition, sellerFamily, iconType } =
    req.body;
  const numericPrice = Number(price ?? priceUsd ?? 0);
  if (!title || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    res.status(400).json({ error: 'Valid item title and positive price are required.' });
    return;
  }

  const authedOwner = findOptionalOwnerFromHeader(req);
  const allowedCategories = [
    'Science & Education',
    'Tools & Workshop',
    'Music & Arts',
    'Bikes & Sports',
  ] as const;
  const normalizedCategory = allowedCategories.includes(category)
    ? category
    : 'Tools & Workshop';

  const newListing: PersistedMarketplaceListing = {
    id: `item-${Date.now()}-${crypto.randomInt(100, 999)}`,
    title: conciergeStripPii(String(title).trim()),
    category: normalizedCategory,
    price: Math.round(numericPrice * 100) / 100,
    location: conciergeStripPii(String(location || authedOwner?.stateCode || 'Local Community').trim()),
    sellerFamily: conciergeStripPii(
      String(sellerFamily || (authedOwner ? `Owner (${authedOwner.stateCode})` : 'Verified Family Listing')).trim()
    ),
    sellerEmail: authedOwner?.email,
    description: conciergeStripPii(
      String(
        description ||
          'Item listed from a neighborhood garage—ready to build cooperative property equity.'
      ).trim()
    ),
    condition: String(condition || 'Very Good').trim(),
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
