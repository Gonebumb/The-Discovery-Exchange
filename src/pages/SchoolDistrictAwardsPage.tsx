import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MapPin,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';

type DistrictTab = 'overview' | 'mechanism' | 'register' | 'directory';

interface DistrictChapter {
  districtCode: string;
  districtName: string;
  state: string;
  repRole: string;
  status: 'Verified Pre-Launch Chapter' | 'Pending DILOS Gate';
  studentsServedFocus: string;
}

const SAMPLE_DISTRICTS: DistrictChapter[] = [
  {
    districtCode: 'TDX-NV-001',
    districtName: 'Clark County School District Educator & Parent Chapter',
    state: 'NV',
    repRole: 'Public High School Science Teacher & District Pusher',
    status: 'Verified Pre-Launch Chapter',
    studentsServedFocus: 'Grades 7–12 Applied & Hybrid Discovery',
  },
  {
    districtCode: 'TDX-OH-002',
    districtName: 'Cleveland Metropolitan Public School District Chapter',
    state: 'OH',
    repRole: 'Title I Middle School Educator & Parent Coordinator',
    status: 'Verified Pre-Launch Chapter',
    studentsServedFocus: 'Grades 6–12 Grit & Growth + Classroom Tools',
  },
  {
    districtCode: 'TDX-TX-003',
    districtName: 'Houston ISD Teachers First Cohort',
    state: 'TX',
    repRole: 'Public School Principal & Educator Mentor',
    status: 'Pending DILOS Gate',
    studentsServedFocus: 'Public Schools Teachers First Initiative',
  },
];

export const SchoolDistrictAwardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DistrictTab>('overview');

  // District Registration Simulator State
  const [districtName, setDistrictName] = useState('');
  const [districtState, setDistrictState] = useState('NV');
  const [repTitle, setRepTitle] = useState<'teacher' | 'principal' | 'parent_pusher'>('teacher');
  const [schoolCount, setSchoolCount] = useState<number>(5);
  const [acceptedNoBossRule, setAcceptedNoBossRule] = useState(false);
  const [acceptedChildSafety, setAcceptedChildSafety] = useState(false);
  const [registrationReceipt, setRegistrationReceipt] = useState<string | null>(null);

  const handleRegisterDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtName.trim() || !acceptedNoBossRule || !acceptedChildSafety) return;
    const code = Math.floor(1000 + Math.random() * 9000);
    setRegistrationReceipt(`TDX-DIST-${districtState.toUpperCase()}-${code}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner — Consistent Compact Layout */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Articles 1.3, 1.4, 3.1 &amp; 13 &bull; Public School District Representation</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold rounded">
            $0 District Cost &bull; Pushers, Not Bosses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              School District / Awards — District Representation &amp; Chapter Program
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              At zero cost, school districts, principals, teachers, and parent organizers can register chapters to nominate great public school teachers and connect classrooms with direct 15% tool grants and 25% teacher honoraria.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-950 aspect-[16/9]">
              <img
                src="/src/assets/images/card_district_reps_1794483101400.jpg"
                alt="Local School District Town Hall — Our Schools, Our Future"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3 Core District Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-[#dfa62a]">1. District Pushers, Not Bosses</div>
            <div className="text-base font-bold text-white">Article 1.3 Equality</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              District representatives organize local teacher/student participation—granting zero extra votes and zero gatekeeper control over who wins.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-emerald-300">2. Out-of-State Blind Judging</div>
            <div className="text-base font-bold text-white">Zero Local Favoritism</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Entries from your district are stripped of school/district names and judged blindly by 12-person Owner juries in other states (Article 5.3).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-sky-300">3. Direct Classroom Grants</div>
            <div className="text-base font-bold text-white">15% Tools + 25% Teachers</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Award grants bypass bureaucratic bloat—flowing directly to mentoring public school teachers and classroom books, lab gear, and shop tools.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2">
        {[
          { id: 'overview', label: '1. How District Representation Works' },
          { id: 'mechanism', label: '2. District Governance & Anti-Capture Rules' },
          { id: 'register', label: '3. Sign Up Your School District' },
          { id: 'directory', label: '4. Participating District Chapters' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DistrictTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center max-w-full sm:whitespace-nowrap ${
                active
                  ? 'bg-[#081d38] text-[#dfa62a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOW DISTRICT REPRESENTATION WORKS */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
              5-Step School District Onboarding &amp; Award Flow
            </h2>
            <p className="text-sm text-slate-600">
              How any public school teacher, principal, or parent organizer registers their school district and connects classrooms to the National Discovery Awards ($1M District • $2.5M State • $10M National — Goal to Reach by 2035).
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: 1,
                title: 'District Representative Registers as a Local Pusher (Article 1.3)',
                detail:
                  'A verified public school teacher, school principal, or parent Owner registers the school district at $0 cost. Under Article 1.3, acting as a District Pusher builds local awareness without creating a permanent executive seat or extra voting weight.',
              },
              {
                step: 2,
                title: 'DILOS Verification of School / District Credentials',
                detail:
                  'Concierge logs the district registration (TDX-DIST-...), Columbo verifies public school/district accreditation, and Pipito confirms child-safeguarding compliance (Article 13.2) before activating the district’s nomination portal.',
              },
              {
                step: 3,
                title: 'Teachers & Students Submit Zero-Cost Discovery Projects (Article 3.3)',
                detail:
                  'Working-class public school students across Elementary, Middle, and High School submit Applied, Analytical, or Hybrid Discovery prototypes using everyday garage or classroom materials—backed by guardian consent and a 2-minute unedited video proof.',
              },
              {
                step: 4,
                title: 'Blind Out-of-State Scoring & Single-Season Educator Panels',
                detail:
                  'Concierge strips all district, school, and student names. Anonymized packets are scored blindly on the 10-point anti-wealth rubric by a 12-person out-of-state Owner Jury and a single-season public school teacher specialist panel.',
              },
              {
                step: 5,
                title: 'Direct Payouts to Students (50%), Teachers (25%) & District Classrooms (15%)',
                detail:
                  '50% goes into a protected student education fund (529 or trust), 25% goes directly to mentoring public school teachers, 15% buys tools/books for the winning classroom, and 10% compounds the debt-free property endowment.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-4 sm:p-5 rounded-xl bg-[#fbfaf7] border border-slate-200 flex items-start gap-4"
              >
                <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {item.step}
                </span>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#081d38]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DISTRICT GOVERNANCE & ANTI-CAPTURE RULES */}
      {activeTab === 'mechanism' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
            <h2 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#b47d12]" />
              <span>1. One-Season Term Limit on District Reviewers</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              District representatives help teachers and families submit entries, but they cannot judge entries from their own state or district (Article 6.2). Any educator selected for a national finalist panel serves for one single season only.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
            <h2 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-2">
              <Award className="w-5 h-5 text-[#b47d12]" />
              <span>2. Classroom Grants Bypass Bureaucratic Overhead</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              The 15% Classroom &amp; School Resource Grant is earmarked strictly for direct classroom books, lab kits, shop tools, and student learning materials—verified by receipts on the open ledger (Article 8.1).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
            <h2 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-2">
              <Building className="w-5 h-5 text-[#b47d12]" />
              <span>3. Local Debt-Free Property Silos for Districts (Article 1.4 &amp; 9.1)</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              As local families trade on the 50/25/25 Marketplace, communities can designate isolated debt-free property silos whose 30% net rental stream supports regional public school awards alongside the National Laureate pool.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
            <h2 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>4. Strict Student Privacy Firewall (Article 8.4 &amp; 13.2)</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              School districts never upload student Social Security numbers, home addresses, or private academic transcripts to public pages. Concierge automatically strips identifying student details before judging begins, and verified parent/guardian consent is required on every minor entry.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: SIGN UP YOUR SCHOOL DISTRICT */}
      {activeTab === 'register' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Pre-Launch District Intake Preview (Article 2.2 &amp; 13.1):</strong> District chapters are registering now in preparation for our initial funded award cycle. Zero fees are ever charged to any school, teacher, or district.
            </span>
          </div>

          <form onSubmit={handleRegisterDistrict} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Official Public School District / Homeschool Co-op Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clark County School District"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State / Territory</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={districtState}
                  onChange={(e) => setDistrictState(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Your Representative Role</label>
                <select
                  value={repTitle}
                  onChange={(e) =>
                    setRepTitle(e.target.value as 'teacher' | 'principal' | 'parent_pusher')
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="teacher">Public School Teacher</option>
                  <option value="principal">School Principal / Administrator</option>
                  <option value="parent_pusher">Parent / Community Chapter Pusher</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Approximate Public Schools Represented
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={schoolCount}
                  onChange={(e) => setSchoolCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedNoBossRule}
                  onChange={(e) => setAcceptedNoBossRule(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I acknowledge Article 1.3 (Pushers, Not Bosses): representing my district confers zero extra votes and zero gatekeeper control over award scoring.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedChildSafety}
                  onChange={(e) => setAcceptedChildSafety(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I confirm all student entries will include verified Parent/Guardian consent and zero minor financial obligations (Articles 4.5 &amp; 13.2).
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!acceptedNoBossRule || !acceptedChildSafety}
              className="px-5 py-2.5 bg-[#081d38] hover:bg-[#0f2b52] disabled:opacity-40 text-[#dfa62a] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Generate District Chapter Intake Receipt</span>
            </button>

            {registrationReceipt && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs sm:text-sm text-emerald-950">
                <div className="font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>District Chapter Intake Logged: {registrationReceipt}</span>
                </div>
                <p>
                  {districtName} ({districtState.toUpperCase()}) &bull; {schoolCount} schools represented &mdash; queued for DILOS Columbo/Pipito verification under Article 1.3 &amp; Article 13.
                </p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 4: PARTICIPATING DISTRICT CHAPTERS */}
      {activeTab === 'directory' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#081d38] inline-flex items-center gap-2">
            <Users className="w-5 h-5 text-[#b47d12]" />
            <span>Participating District Chapters (Model Registry)</span>
          </h2>

          <div className="space-y-3">
            {SAMPLE_DISTRICTS.map((d) => (
              <div
                key={d.districtCode}
                className="p-4 sm:p-5 rounded-xl bg-[#fbfaf7] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#081d38] text-[#dfa62a] font-mono font-bold">
                      {d.districtCode}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{d.state}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#081d38]">{d.districtName}</h3>
                  <p className="text-xs text-slate-600">
                    Lead Pusher: {d.repRole} &bull; Focus: {d.studentsServedFocus}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold shrink-0 self-start sm:self-center">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
