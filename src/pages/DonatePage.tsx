import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Lock,
  Scale,
  ShieldCheck,
} from 'lucide-react';

type DonateTab = 'contribute' | 'request_support' | 'safeguards';

const PRESET_AMOUNTS = [25, 50, 100, 250];

export const DonatePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DonateTab>('contribute');

  // Contribution tab state
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [designation, setDesignation] = useState<
    'classroom_tools' | 'student_hardship' | 'prize_escrow'
  >('classroom_tools');
  const [acknowledgedRules, setAcknowledgedRules] = useState<boolean>(true);
  const [pledgeReceipt, setPledgeReceipt] = useState<string | null>(null);

  // Need Donation / Classroom Support Request state
  const [schoolOrChapter, setSchoolOrChapter] = useState<string>('');
  const [stateCode, setStateCode] = useState<string>('OH');
  const [requesterRole, setRequesterRole] = useState<
    'public_school_teacher' | 'title1_coordinator' | 'parent_pusher'
  >('public_school_teacher');
  const [supportCategory, setSupportCategory] = useState<string>(
    'Classroom Science, Shop, or Reading Supplies'
  );
  const [needSummary, setNeedSummary] = useState<string>('');
  const [acceptedPrivacyGate, setAcceptedPrivacyGate] = useState<boolean>(false);
  const [acceptedNoMinorObligation, setAcceptedNoMinorObligation] = useState<boolean>(false);
  const [requestReceipt, setRequestReceipt] = useState<string | null>(null);

  const effectiveAmount =
    customAmount.trim() !== '' && Number(customAmount) > 0
      ? Number(customAmount)
      : selectedAmount;

  const handleSupportRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !schoolOrChapter.trim() ||
      !needSummary.trim() ||
      !acceptedPrivacyGate ||
      !acceptedNoMinorObligation
    ) {
      return;
    }
    const digits = Math.floor(1000 + Math.random() * 9000);
    setRequestReceipt(`TDX-GRANT-${stateCode.toUpperCase()}-${digits}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner — Consistent Compact Layout */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" />
            <span>Articles 3.2, 3.4, 10.3 &amp; 15.1 &bull; Segregated Mission Support</span>
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            Working Draft &bull; Walkthrough Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Donate / Need Donation — Mission Support Walkthrough
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Under <strong>Article 3.2</strong>, The Discovery Exchange is built for long-term self-funding independence without corporate sponsor strings. Walk through future classroom designations below or submit a classroom supply request (no cards are charged in this draft).
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-950 aspect-[16/9]">
              <img
                src="/assets/aistudio/image-gen-4_3__7bca0d36.png"
                alt="Life is too short, and it goes by too fast. There is nothing quite like being a parent. — The Discovery Exchange"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('contribute')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border ${
            activeTab === 'contribute'
              ? 'bg-[#081d38] text-[#dfa62a] border-[#dfa62a]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          1. Make a Direct Contribution
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('request_support')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border ${
            activeTab === 'request_support'
              ? 'bg-[#081d38] text-[#dfa62a] border-[#dfa62a]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          2. Need Donation / Request Classroom Tools
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safeguards')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border ${
            activeTab === 'safeguards'
              ? 'bg-[#081d38] text-[#dfa62a] border-[#dfa62a]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          3. Donor Safeguards &amp; Zero-Influence Rules
        </button>
      </div>

      {/* TAB 1: MAKE A DIRECT CONTRIBUTION */}
      {activeTab === 'contribute' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 space-y-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#081d38]">
                Support Public School Teachers &amp; Working-Class Classroom Discovery
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Select a segregated mission designation and contribution amount below.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Phase 1 Nonprofit Sponsorship Notice:</strong> Once NDA&rsquo;s legal nonprofit sponsorship is finalized, The <strong>National Discovery Awards</strong> will welcome charitable donations and grants to honor great public school teachers and lift working-class students. Zero real donations are accepted until sponsorship is finalized.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Choose Segregated Mission Designation (Article 10.3)
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'classroom_tools' as const,
                      title: 'Direct Public Schools Classroom Supplies, Books & Shop/Lab Tools',
                      desc: 'Helps public school teachers equip hands-on science, repair, and reading classrooms.',
                    },
                    {
                      id: 'student_hardship' as const,
                      title: 'Working-Class Student Project Materials & Hardship Aid',
                      desc: 'Ensures under-resourced students can build and submit National Discovery Awards projects at $0 family cost.',
                    },
                    {
                      id: 'prize_escrow' as const,
                      title: 'Segregated National Discovery Awards Pool (Article 13.1)',
                      desc: 'Held strictly in funded-first award custody for verified public school student & teacher awards.',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        designation === opt.id
                          ? 'border-[#081d38] bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="designation"
                        checked={designation === opt.id}
                        onChange={() => setDesignation(opt.id)}
                        className="mt-0.5 accent-[#081d38]"
                      />
                      <span className="text-xs">
                        <strong className="text-[#081d38] block">{opt.title}</strong>
                        <span className="text-slate-600">{opt.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  2. Select Contribution Amount (USD)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-lg text-sm font-bold border tabular-nums transition ${
                        customAmount === '' && selectedAmount === amt
                          ? 'bg-[#081d38] text-[#dfa62a] border-[#dfa62a]'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Or enter custom USD amount..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedRules}
                  onChange={(e) => setAcknowledgedRules(e.target.checked)}
                  className="mt-0.5 accent-[#081d38]"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I understand under <strong>Articles 4.1 &amp; 4.4</strong> that contributions confer zero voting power and zero judging influence.
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const digits = Math.floor(1000 + Math.random() * 9000);
                  setPledgeReceipt(`TDX-WALK-${digits}`);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] font-bold text-sm cursor-pointer border border-[#dfa62a] transition"
              >
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>Walk Contribution Preview (${effectiveAmount.toFixed(2)})</span>
              </button>

              {pledgeReceipt && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1 text-xs text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Walkthrough Logged: {pledgeReceipt} (${effectiveAmount.toFixed(2)})</span>
                  </div>
                  <p className="text-emerald-800">
                    100% allocated in preview to <strong>{designation.replace('_', ' ')}</strong>. No card or external account was charged.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEED DONATION / REQUEST CLASSROOM TOOLS OR STUDENT SUPPORT */}
      {activeTab === 'request_support' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#081d38]">
                Need Donation — Classroom Supply &amp; Student Project Material Request
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Public school teachers, Title I coordinators, and homeschool Pushers may log material needs for DILOS verification and conflict-free Owner review.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>$0 Cost to Families &amp; Minors (Article 4.5)</span>
            </span>
          </div>

          <form onSubmit={handleSupportRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public School, District Chapter, or Homeschool Co-op Name
                </label>
                <input
                  type="text"
                  required
                  value={schoolOrChapter}
                  onChange={(e) => setSchoolOrChapter(e.target.value)}
                  placeholder="e.g., East Technical High School — Science & Shop Dept."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  U.S. State / Territory
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  placeholder="OH"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono focus:outline-none focus:border-[#081d38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adult Requester Role
                </label>
                <select
                  value={requesterRole}
                  onChange={(e) =>
                    setRequesterRole(
                      e.target.value as 'public_school_teacher' | 'title1_coordinator' | 'parent_pusher'
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#081d38]"
                >
                  <option value="public_school_teacher">Public School Teacher / Mentor</option>
                  <option value="title1_coordinator">Title I / School Resource Coordinator</option>
                  <option value="parent_pusher">Verified Parent / Homeschool Co-op Pusher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Needed Tools or Material Category
                </label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#081d38]"
                >
                  <option value="Classroom Science, Shop, or Reading Supplies">
                    Classroom Science, Shop, or Reading Supplies
                  </option>
                  <option value="Applied Discovery Student Build Materials">
                    Applied Discovery Student Build Materials
                  </option>
                  <option value="Analytical / Hybrid Lab Verification Equipment">
                    Analytical / Hybrid Lab Verification Equipment
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Plain-Language Summary of Classroom / Student Need (Do Not Include Minor Names)
              </label>
              <textarea
                rows={3}
                required
                value={needSummary}
                onChange={(e) => setNeedSummary(e.target.value)}
                placeholder="Describe the specific books, lab instruments, or shop materials needed and how many public school students will benefit..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedPrivacyGate}
                  onChange={(e) => setAcceptedPrivacyGate(e.target.checked)}
                  className="mt-0.5 accent-[#081d38]"
                />
                <span>
                  <strong>Article 3.4 &amp; 8.4 Child-Privacy Gate:</strong> I confirm this request contains zero personally identifiable minor student names, home addresses, or private student records.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedNoMinorObligation}
                  onChange={(e) => setAcceptedNoMinorObligation(e.target.checked)}
                  className="mt-0.5 accent-[#081d38]"
                />
                <span>
                  <strong>Article 4.5 Protection of Minors:</strong> I confirm no student or family is asked to pay fees, buy goods, or accept any financial obligation.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#081d38] text-[#dfa62a] border border-[#dfa62a] text-sm font-bold hover:opacity-95 transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Log Pre-Launch Classroom Support Request</span>
            </button>
          </form>

          {requestReceipt && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Support Intake Logged: {requestReceipt}</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Queued for DILOS pipeline review (<strong>Concierge &rarr; Columbo &rarr; Pipito &rarr; Independent Human Witness</strong>) under Article 7.3 &amp; Article 13.1 Funded-First disbursement rules.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DONOR SAFEGUARDS & ZERO-INFLUENCE RULES */}
      {activeTab === 'safeguards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#b47d12]">
              <Scale className="w-4 h-4" />
              <span>Article 3.2 &bull; Self-Funding Independence</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#081d38]">
              Never Dependent on Wealthy Patrons
            </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
              The National Discovery Awards is structurally funded by 30% of net rental cash from debt-free residential apartment silos—ensuring working-class teachers and students never depend on outside corporate sponsors.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#b47d12]">
              <ShieldCheck className="w-4 h-4" />
              <span>Articles 4.1 &amp; 4.4 &bull; Zero Vote Buying</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#081d38]">
              Donations Buy Zero Votes &amp; Zero Favors
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Whether someone contributes $0 or $10,000, every verified human Owner holds strictly one equal vote, and all public schools judging remains blind, out-of-state, and conflict-screened (Articles 5.3 &amp; 6.2).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#b47d12]">
              <Lock className="w-4 h-4" />
              <span>Articles 10.1–10.3 &bull; Segregated Custody</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#081d38]">
              Strict Separation &amp; Dual Human Authorization
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Prize and classroom support funds are held in segregated entity accounts—never commingled with personal accounts or 70% Owner property silos—and require two independent human approvers above threshold.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#b47d12]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Articles 8.2 &amp; 8.3 &bull; Public Append-Only Audit</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#081d38]">
              Quarterly Plain-Language Public Reporting
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Every receipt, classroom grant disbursement, and reserve reconciliation is published in quarterly plain-language summaries backed by append-only records that can never be erased.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
