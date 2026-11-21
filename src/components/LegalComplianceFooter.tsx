import React, { useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe,
  Lock,
  MapPin,
  Scale,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';

export type LegalPolicyTab =
  | 'tos'
  | 'privacy'
  | 'pickup'
  | 'chargeback'
  | 'prohibited'
  | 'accessibility'
  | 'readiness';

interface LegalComplianceFooterProps {
  onNavigateByButtonLabel: (label: string) => void;
}

const PROHIBITED_CATEGORIES = [
  'Recalled baby cribs, bassinets, walkers, or infant sleep products',
  'Used or expired child car seats and booster seats',
  'Prescription medications, controlled substances, or medical devices',
  'Firearms, ammunition, knives, explosives, or weapons of any kind',
  'Gift cards, prepaid debit cards, cash equivalents, or crypto vouchers',
  'Live animals, pets, or restricted wildlife products',
  'Alcohol, tobacco, vapes, or age-restricted intoxicating goods',
  'Stolen, counterfeit, pirated, or hazardous/flammable materials',
];

const READINESS_GATES = [
  {
    id: 'sandbox-e2e',
    title: '1. Sandbox End-to-End Transaction & Jury Flow Test',
    detail:
      'Test 1 sample listing -> 1 sandbox checkout -> verify 50/25/25 split math -> test 4-digit Pickup Confirmation Code & carrier tracking -> test 1–5 star family rating -> test 12-person Owner Review Jury dispute filing.',
  },
  {
    id: 'concierge-audit',
    title: '2. Concierge 25-Question Tough Audit Test',
    detail:
      'Ask Concierge 25 tough real-world questions (posting items, shipping & local pickup, DBC supply cap, Owner Board handover, Jury duty, School Representatives, and disclaimers) to verify zero "I don’t know" failures.',
  },
  {
    id: 'legal-footer',
    title: '3. Legal, Compliance & Footer Links Verification',
    detail:
      'Confirm Terms of Service, Privacy Policy, Local Pickup Safety, Chargeback Rules, Prohibited Items Checklist, Master Charter (v10.0), and How TDEX Works A-to-Z Blueprint are all live and clickable.',
  },
];

const POLICY_TABS: Array<{ id: LegalPolicyTab; label: string }> = [
  { id: 'tos', label: 'Terms of Service' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'pickup', label: 'Local Pickup Safety' },
  { id: 'chargeback', label: 'Chargebacks & Fraud' },
  { id: 'prohibited', label: 'Prohibited & Recalls' },
  { id: 'accessibility', label: 'Accessibility & Escalation' },
  { id: 'readiness', label: 'Day-One Readiness Gate' },
];

export const LegalComplianceFooter: React.FC<LegalComplianceFooterProps> = ({
  onNavigateByButtonLabel,
}) => {
  const [activePolicy, setActivePolicy] = useState<LegalPolicyTab | null>(null);
  const [checkedGates, setCheckedGates] = useState<Record<string, boolean>>({
    'sandbox-e2e': false,
    'concierge-audit': false,
    'legal-footer': true,
  });

  const completedGateCount = Object.values(checkedGates).filter(Boolean).length;

  const toggleGate = (id: string) => {
    setCheckedGates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <footer
        aria-label="Official Legal, Compliance & Platform Policies Footer"
        className="w-full bg-[#061529] text-slate-200 border-t-2 border-[#dfa62a]"
      >
        <div className="max-w-[1320px] mx-auto px-5 py-6 space-y-4">
          {/* Top Brand + Non-Custodial Summary Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#fcd34d]">
                The Discovery Exchange (TDEX) &bull; National Discovery Awards (NDA)
              </div>
              <p className="text-[11.5px] text-slate-300 leading-snug max-w-3xl">
                Technology &amp; governance platform — never a bank, money transmitter, broker-dealer,
                or escrow agent. Your money always stays in your own regulated accounts until you
                fund a licensed third-party escrow directly.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#fcd34d] bg-white/5 border border-[#dfa62a]/40 rounded-lg px-3 py-1.5 shrink-0">
              Launch Readiness Window: Nov 20, 2026 &rarr; Jan 1, 2027
            </div>
          </div>

          {/* Mandatory Clickable Legal & Compliance Links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <button
              type="button"
              onClick={() => setActivePolicy('tos')}
              className="text-white hover:text-[#fcd34d] font-semibold underline underline-offset-2 cursor-pointer"
            >
              Terms of Service (ToS)
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicy('privacy')}
              className="text-white hover:text-[#fcd34d] font-semibold underline underline-offset-2 cursor-pointer"
            >
              Privacy Policy &amp; KYC Shield
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicy('pickup')}
              className="text-slate-200 hover:text-[#fcd34d] font-medium hover:underline cursor-pointer"
            >
              Local Pickup Safety Policy
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicy('chargeback')}
              className="text-slate-200 hover:text-[#fcd34d] font-medium hover:underline cursor-pointer"
            >
              Chargeback &amp; Fraud Rules
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicy('prohibited')}
              className="text-slate-200 hover:text-[#fcd34d] font-medium hover:underline cursor-pointer"
            >
              Prohibited Items &amp; Recalls
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicy('accessibility')}
              className="text-slate-200 hover:text-[#fcd34d] font-medium hover:underline cursor-pointer"
            >
              Accessibility &amp; Human Escalation
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicy('readiness')}
              className="text-[#fcd34d] hover:text-amber-200 font-bold hover:underline cursor-pointer"
            >
              Day-One Go-Live Gate
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => onNavigateByButtonLabel('Constitution')}
              className="text-slate-200 hover:text-[#fcd34d] font-medium hover:underline cursor-pointer"
            >
              Master Charter (v10.0)
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              type="button"
              onClick={() => onNavigateByButtonLabel('How TDEX Works')}
              className="text-slate-200 hover:text-[#fcd34d] font-medium hover:underline cursor-pointer"
            >
              A-to-Z Blueprint
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
            <span>
              Official Domains: TheDiscoveryExchange.com &bull; NationalDiscoveryAwards.com &bull;
              Contact: robo@thediscoveryexchange.com
            </span>
            <span>
              One Verified Human Owner = One Vote (Article 4.1) &bull; Zero Bosses (Article 1.2)
            </span>
          </div>
        </div>
      </footer>

      {/* FULL COMPLIANCE & POLICY READER OVERLAY MODAL */}
      {activePolicy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="TDEX Official Legal & Compliance Policy Reader"
          className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActivePolicy(null);
            }
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl border-2 border-[#dfa62a] shadow-2xl flex flex-col overflow-hidden">
            {/* Sticky Modal Header */}
            <div className="bg-[#081d38] text-white px-5 py-4 border-b border-[#dfa62a]/40 flex items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#fcd34d]">
                  Official Legal, Safety &amp; Pre-Launch Compliance Documentation
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  The Discovery Exchange (TDEX) &amp; National Discovery Awards (NDA)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Policy Tab Switcher */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap gap-1.5 shrink-0">
              {POLICY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePolicy(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activePolicy === tab.id
                      ? 'bg-[#081d38] text-[#fcd34d]'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Policy Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-sm text-slate-800 leading-relaxed">
              {activePolicy === 'tos' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#081d38]">
                    <FileText className="w-5 h-5 text-[#b47d12]" />
                    <h3 className="font-serif text-xl font-bold">
                      Official Terms of Service (ToS) — Payment Processor &amp; KYC Compliance
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-[#dfa62a] space-y-1.5">
                    <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                      1. Explicit Non-Custodial / Zero Money Handling Clause
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800">
                      The Discovery Exchange (TDEX) is strictly a <strong>technology and governance
                      platform</strong>. TDEX is <strong>NOT</strong> a bank, credit union (prior to
                      formal NCUA chartering), money transmitter, broker-dealer, investment adviser,
                      or escrow agent. TDEX never holds, pools, collects, or takes custody of user
                      funds. Families retain all funds inside their own regulated external payment
                      accounts (such as PayPal or personal financial accounts) and wire or transfer
                      closing funds straight to an independent licensed third-party escrow company
                      when a property matches.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#b47d12]" />
                      <span>2. Binding Internal Arbitration Clause (Article 5.3)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">
                      By registering as a Verified Human Owner or using the Discovery Marketplace,
                      you agree that community trade, listing, conduct, or governance disputes go
                      first to TDEX’s neutral, randomly drawn <strong>12-person Owner Review Jury</strong>{' '}
                      under Master Charter Article 5.3 (with out-of-state blind review and zero
                      cost to families). Statutory legal rights remain preserved as specified in
                      Article 17 of the Master Charter.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                      3. Platform Fees, Account Eligibility &amp; Pre-Launch Status
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">
                      TDEX charges <strong>$0 listing fees</strong> and <strong>$0 membership fees</strong>.
                      Standard external payment processor, carrier shipping, or statutory tax fees
                      from regulated third parties are disclosed transparently at checkout. Owners
                      must be 18+ real human individuals (Article 4.5); minors participate in the
                      National Discovery Awards strictly with verified Parent/Guardian consent.
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'privacy' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#081d38]">
                    <Lock className="w-5 h-5 text-[#b47d12]" />
                    <h3 className="font-serif text-xl font-bold">
                      Privacy &amp; Data Handling Policy (KYC &amp; Concierge Privacy Shield)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                        Encrypted PII Vault (Air-Gapped)
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700">
                        Identity verification (KYC) details, legal names, email addresses, and
                        recovery credentials are stored strictly inside TDEX’s encrypted PII Vault
                        with salted cryptographic password hashing. Public ledger blocks never
                        contain personal names, emails, or street addresses.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                        Zero Sale to Advertisers or Data Brokers
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700">
                        TDEX never sells, rents, or trades Owner, teacher, parent, or student
                        personal data to advertisers, data brokers, or political campaigns—ever.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <div className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Concierge Privacy Shield &amp; Student FERPA Firewall (Article 7 &amp; 8.4)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950">
                      Before any Marketplace listing, community question, or National Discovery
                      Awards entry reaches the Open Ledger or blind Jury panels, the Concierge
                      Privacy Shield automatically scrubs phone numbers, emails, street addresses,
                      and Social Security numbers. Student entries are identified solely by
                      anonymized <code>TDX-NDA-</code> IDs.
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'pickup' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#081d38]">
                    <MapPin className="w-5 h-5 text-[#b47d12]" />
                    <h3 className="font-serif text-xl font-bold">
                      Local Pickup Safety &amp; In-Person Meetup Guidelines
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-[#dfa62a] space-y-2">
                    <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                      Mandatory Safe Meetup Standard (Daylight &amp; Public Exchange Zones Only)
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800">
                      <li>
                        <strong>Meet Only in Daylight at Public Locations:</strong> Always schedule
                        in-person pickups at police department <strong>Safe Exchange Zones</strong>,
                        well-lit bank lobbies, or busy grocery store parking lots with security
                        cameras.
                      </li>
                      <li>
                        <strong>Never Meet Alone Inside Private Homes:</strong> Do not enter a
                        stranger’s private home or invite an unknown buyer inside alone. Bring a
                        family member or trusted adult whenever exchanging bulky items (such as
                        furniture, TVs, or tools).
                      </li>
                      <li>
                        <strong>TDEX Responsibility Notice:</strong> TDEX provides the matching
                        board only and cannot physically supervise private off-platform meetups;
                        both parties are responsible for choosing a safe public venue.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#081d38] text-white border border-[#dfa62a] space-y-1.5">
                    <div className="font-bold text-[#fcd34d] text-xs uppercase tracking-wider">
                      4-Digit Pickup Confirmation Code Rule (Inspect First — Code Entry Is Final)
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100">
                      Buyers must thoroughly inspect and test the item <strong>BEFORE</strong>{' '}
                      handing over their 4-digit Pickup Confirmation Code to the seller. Once the
                      4-digit code is entered and logged on the exchange record, the local pickup
                      is <strong>final and confirmed</strong>, releasing the seller payout and
                      locking both families’ 25% / 25% property credits.
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'chargeback' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#081d38]">
                    <ShieldAlert className="w-5 h-5 text-red-700" />
                    <h3 className="font-serif text-xl font-bold">
                      Chargeback, Fraud &amp; Payment Reversal Rules
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                    <div className="font-bold text-red-950 text-xs uppercase tracking-wider">
                      Bypassing the 12-Person Owner Review Jury (External PayPal / Bank Chargebacks)
                    </div>
                    <p className="text-xs sm:text-sm text-red-950">
                      If a buyer receives an item and files an external credit card, bank, or
                      PayPal chargeback <strong>without first using the TDEX 12-person Owner Review
                      Jury (Article 5.3)</strong> after the 50/25/25 split has executed:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-red-950">
                      <li>
                        <strong>Columbo Evidence Submission:</strong> Columbo compiles and submits
                        the cryptographic audit packet—including carrier delivery tracking,
                        delivery timestamp, or the buyer’s verified 4-digit Pickup Confirmation Code
                        log—directly to the external payment processor to contest the dispute.
                      </li>
                      <li>
                        <strong>Ledger Adjustment of Unearned 25% Credits:</strong> Any unearned
                        25% buyer property accumulation credits tied to a reversed or fraudulent
                        payment are immediately frozen and adjusted off the open ledger.
                      </li>
                      <li>
                        <strong>Permanent Account Suspension:</strong> Confirmed fraudulent
                        chargebacks result in immediate account suspension by Pipito and permanent
                        removal from TDEX Marketplace and governance eligibility upon Jury review.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {activePolicy === 'prohibited' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#081d38]">
                    <Ban className="w-5 h-5 text-red-700" />
                    <h3 className="font-serif text-xl font-bold">
                      Restricted / Prohibited Marketplace Categories &amp; Recall Policy
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700">
                    To protect children, families, and neighbors, the following items are strictly
                    prohibited on The Discovery Marketplace and blocked by a hard-coded safety
                    attestation on the <strong>Add Your Item</strong> form:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PROHIBITED_CATEGORIES.map((item) => (
                      <div
                        key={item}
                        className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-xs font-semibold text-red-950 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800">
                    <strong>Mandatory Listing Attestation:</strong> Every seller must check{' '}
                    <em>
                      “I confirm this item is legal, safe, not recalled, and contains zero
                      prohibited items.”
                    </em>{' '}
                    before a listing is accepted by the server.
                  </div>
                </div>
              )}

              {activePolicy === 'accessibility' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#081d38]">
                    <Globe className="w-5 h-5 text-[#b47d12]" />
                    <h3 className="font-serif text-xl font-bold">
                      Accessibility, Multi-Language &amp; Human Support Escalation Rules
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                        Accessibility &amp; Working-Class Family Readiness
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700">
                        TDEX and NDA are built for working-class families, public school teachers,
                        and under-resourced communities—using semantic ARIA roles, high-contrast
                        labels, large tap targets for mobile screen-reader users, and Spanish /
                        multi-language family support readiness as we approach public launch.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-[#dfa62a] space-y-1.5">
                      <div className="font-bold text-[#081d38] text-xs uppercase tracking-wider">
                        Mandatory 24–48 Hour Human Support Escalation Path
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800">
                        Whenever the AI Concierge encounters an <strong>urgent safety issue</strong>,{' '}
                        <strong>legal subpoena / regulatory notice</strong>,{' '}
                        <strong>child-protection alert</strong>, or{' '}
                        <strong>technical bug</strong> that cannot be resolved from the Official
                        Q&amp;A, it immediately generates a tracked <code>TDX-</code> escalation
                        ticket routed to a verified human support reviewer within{' '}
                        <strong>24–48 hours</strong> (urgent safety &amp; legal notices prioritized
                        immediately via <code>robo@thediscoveryexchange.com</code>).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePolicy === 'readiness' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#081d38]">
                      <ClipboardCheck className="w-5 h-5 text-[#b47d12]" />
                      <h3 className="font-serif text-xl font-bold">
                        Pre-Launch Checklist &amp; “Day-One” Readiness Gate (Nov 20, 2026 &rarr; Jan 1, 2027)
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#081d38] text-[#fcd34d] text-xs font-mono font-bold">
                      {completedGateCount} / {READINESS_GATES.length} Gates Verified
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700">
                    No live money switch or production payment rail is enabled until every single
                    verification gate below is executed and logged cleanly:
                  </p>

                  <div className="space-y-3">
                    {READINESS_GATES.map((gate) => {
                      const isDone = Boolean(checkedGates[gate.id]);
                      return (
                        <button
                          key={gate.id}
                          type="button"
                          onClick={() => toggleGate(gate.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3.5 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-500'
                              : 'bg-slate-50 border-slate-200 hover:border-[#dfa62a]'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border-2 ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-400 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </span>
                          <div className="space-y-1">
                            <div className="font-bold text-sm text-[#081d38]">{gate.title}</div>
                            <p className="text-xs text-slate-700 leading-relaxed">{gate.detail}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer Close Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                Governed by Master Charter Version 10.0 &bull; Zero Custody &bull; Open Ledger
              </span>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 rounded-lg bg-[#081d38] hover:bg-[#0f294d] text-[#fcd34d] text-xs font-bold cursor-pointer"
              >
                Close &amp; Return to Site
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
