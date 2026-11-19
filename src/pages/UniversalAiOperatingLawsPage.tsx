import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileText,
  Scale,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface OperatingLaw {
  number: number;
  heading: string;
  rule: string;
  enforcement: string;
}

const OPERATING_LAWS: OperatingLaw[] = [
  {
    number: 1,
    heading: 'LAW 1 — APPROVED WORK IS PROTECTED',
    rule: 'No AI shall delete, overwrite, abbreviate, or silently replace formally approved work.',
    enforcement:
      'Protected originals must reside in independently controlled read-only or immutable storage; attempted unauthorized changes are rejected and logged.',
  },
  {
    number: 2,
    heading: 'LAW 2 — ORIGINALS MUST SURVIVE',
    rule: 'Revise a separate working copy; do not overwrite an original.',
    enforcement:
      'Retain versioned approved originals and independent recoverable backups.',
  },
  {
    number: 3,
    heading: 'LAW 3 — NO UNAUTHORIZED CHANGES',
    rule: 'A general instruction to improve or correct is not permission to remove approved requirements.',
    enforcement:
      'Require an explicit change request with source, affected sections, and scope.',
  },
  {
    number: 4,
    heading: 'LAW 4 — COMPLETE CHANGE DISCLOSURE',
    rule: 'Report every proposed addition, deletion, and material alteration.',
    enforcement:
      'Independently compare proposed and approved versions before publication.',
  },
  {
    number: 5,
    heading: 'LAW 5 — PRESERVE THE ORIGINAL REQUIREMENT',
    rule: 'Test the actual proposed architecture before substituting an alternative.',
    enforcement:
      'Record the original requirement, assumptions, evidence, and test result.',
  },
  {
    number: 6,
    heading: 'LAW 6 — NO FALSE VERIFICATION',
    rule: 'Do not call untested legal, financial, constitutional, or technical claims verified.',
    enforcement:
      'Label findings VERIFIED, PROVISIONAL, FAILED, or NOT TESTED with evidence and responsible reviewer.',
  },
  {
    number: 7,
    heading: 'LAW 7 — COMPLETE CORRECTION',
    rule: 'An apology or new wording alone does not close an error.',
    enforcement:
      'Record the error, withdraw invalid conclusions, trace dependencies, retest, and independently close the issue.',
  },
  {
    number: 8,
    heading: 'LAW 8 — NO SELF-APPROVAL',
    rule: 'An AI must not independently authorize a consequential change it authored or certify its own serious correction.',
    enforcement: 'Independent checks plus required human authority.',
  },
  {
    number: 9,
    heading: 'LAW 9 — LEAST PRIVILEGE',
    rule: 'Give each AI only permissions necessary for its task.',
    enforcement:
      'Approved sources are read-only to AI; publication, finance, and ownership changes need separate permissions.',
  },
  {
    number: 10,
    heading: 'LAW 10 — REPEATED FAILURES HAVE CONSEQUENCES',
    rule: 'Verified serious or recurring violations trigger restriction of the relevant operational permissions.',
    enforcement:
      'Independent investigation, corrective tests, and documented reinstatement.',
  },
  {
    number: 11,
    heading: 'LAW 11 — PROTECT PARTICIPANTS',
    rule: 'Family property, children, teachers, money, and legal rights take precedence over convenience.',
    enforcement:
      'High-impact actions need proportionate independent human authorization and safeguards.',
  },
  {
    number: 12,
    heading: 'LAW 12 — AUDITABILITY',
    rule: 'Keep attributable records of material decisions, approvals, changes, and rejections.',
    enforcement: 'Tamper-evident version and audit history with defined retention.',
  },
  {
    number: 13,
    heading: 'LAW 13 — NO SILENT FAILURE',
    rule: 'Report missing sources, partial access, unchecked assumptions, and incomplete work.',
    enforcement:
      'Required missing evidence blocks a protected change from approval.',
  },
  {
    number: 14,
    heading: 'LAW 14 — HUMAN POWER ALSO HAS LIMITS',
    rule: 'No single human or AI gets unrestricted unilateral control of protected records.',
    enforcement:
      'Separate roles, privileged access controls, and independently controlled recovery.',
  },
  {
    number: 15,
    heading: 'LAW 15 — TEST THE PROTECTIONS',
    rule: 'Promises of compliance are not tests.',
    enforcement:
      'Before production, test unauthorized deletion, overwritten documents, missing sections, bad approvals, corrupt changes, logging, and restoration.',
  },
];

const MANDATORY_CHANGE_WORKFLOW: string[] = [
  'Identify the precise authoritative source and version.',
  'Record requested scope; preserve the source.',
  'Work on a separate candidate copy.',
  'Produce a complete machine-readable diff and human-readable summary.',
  'Independently validate scope, content integrity, and required evidence.',
  'Obtain legally required human authorization.',
  'Publish a new version; retain old versions and logs.',
  'Test recovery and trace outstanding findings.',
];

const PDF_ASSET_PATH = '/assets/aistudio/TDEX_Universal_AI_Operating_Laws_v1_9a0c4b4f.pdf';

export const UniversalAiOperatingLawsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const normalizedQuery = search.trim().toLowerCase();
  const filteredLaws = OPERATING_LAWS.filter((law) => {
    if (!normalizedQuery) return true;
    return (
      law.heading.toLowerCase().includes(normalizedQuery) ||
      law.rule.toLowerCase().includes(normalizedQuery) ||
      law.enforcement.toLowerCase().includes(normalizedQuery) ||
      `law ${law.number}` === normalizedQuery
    );
  });

  return (
    <div className="space-y-6">
      {/* Authoritative Draft Header */}
      <div className="bg-[#081d38] text-white rounded-xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
            THE DISCOVERY EXCHANGE — UNIVERSAL AI OPERATING LAWS
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            Version 1.0 — PROPOSED, NOT ADOPTED
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
          Universal AI Operating Laws — Review Draft
        </h1>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          These rules apply to AI work on TDEX when supplied as instructions, subject to platform
          rules and applicable law. Compliance with written instructions alone is not a technical
          security guarantee.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={PDF_ASSET_PATH}
            download="TDEX_Universal_AI_Operating_Laws_v1.pdf"
            className="px-4 py-2 bg-[#dfa62a] hover:bg-[#c99524] text-[#06182f] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download Original PDF</span>
          </a>

          <button
            type="button"
            onClick={() => setShowPdfPreview((prev) => !prev)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>{showPdfPreview ? 'Hide Original PDF Viewer' : 'View Original PDF'}</span>
          </button>

          <span className="text-xs font-semibold text-slate-300 ml-auto">
            NONBINDING REVIEW DRAFT — NOT IN FORCE
          </span>
        </div>
      </div>

      {/* Non-Custodial Open Project Notice */}
      <div
        role="region"
        aria-label="Open Project Non-Custodial Notice"
        className="tdex-prelaunch-banner w-full bg-[#061529] text-white border-2 border-[#dfa62a] rounded-xl px-4 sm:px-6 py-3 text-center text-xs sm:text-[13px] leading-snug shadow-xs"
      >
        <div className="font-bold text-[#fcd34d] uppercase tracking-wide mb-0.5">
          OPEN PROJECT UNDER ACTIVE REVIEW &amp; BUILD — ZERO MONEY HANDLING BY TDEX
        </div>
        <div>
          The Discovery Exchange (TDEX) <strong>NEVER</strong> holds, pools, collects, or touches any money. Families can begin setting up and building their own segregated property-accumulation balances inside their own licensed payment processor wallets (such as PayPal or an authorized financial partner) right away. When TDEX matches a debt-free property to buyers, TDEX opens a licensed third-party escrow directly on the seller’s side and gives buyers a set window to fund that seller-side escrow straight from their own regulated wallets.
        </div>
      </div>

      {/* Optional Embedded Original PDF Viewer */}
      {showPdfPreview && (
        <div className="bg-white border-2 border-[#081d38]/20 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-[#081d38]">
            <span>Source Document: TDEX_Universal_AI_Operating_Laws_v1.pdf (3 Pages)</span>
            <a
              href={PDF_ASSET_PATH}
              target="_blank"
              rel="noreferrer"
              className="text-amber-800 hover:underline"
            >
              Open PDF in New Tab
            </a>
          </div>
          <iframe
            src={PDF_ASSET_PATH}
            title="Universal AI Operating Laws Version 1.0 PDF"
            className="w-full h-[min(640px,75dvh)] min-h-[340px] border-0"
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter Laws 1–15 (e.g., 'Law 1', 'Originals', 'Verification', 'Human', 'Workflow')..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
          />
        </div>
        <div className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">
          Showing {filteredLaws.length} of {OPERATING_LAWS.length} Operating Laws
        </div>
      </div>

      {/* Verbatim Laws 1–15 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLaws.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
            No operating laws matched &ldquo;{search}&rdquo;.
          </div>
        ) : (
          filteredLaws.map((law) => (
            <article
              key={law.number}
              className="bg-white border border-slate-200 hover:border-[#081d38] rounded-xl p-5 space-y-3 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-[#081d38] text-[#dfa62a] font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {law.number}
                  </span>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-[#081d38] leading-snug">
                    {law.heading}
                  </h2>
                </div>
                <p className="text-sm text-slate-900 leading-relaxed">{law.rule}</p>
              </div>

              <div className="bg-[#fbfaf7] border border-slate-200 rounded-lg p-3 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                <strong className="text-[#081d38]">ENFORCEMENT:</strong> {law.enforcement}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Mandatory Change Workflow + Default Rule */}
      <div className="bg-white border-2 border-[#081d38]/20 rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-[#081d38]" aria-hidden="true" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            MANDATORY CHANGE WORKFLOW
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 tabular-nums">
          {MANDATORY_CHANGE_WORKFLOW.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3 bg-[#fbfaf7] border border-slate-200 rounded-lg p-3.5 text-sm text-slate-800"
            >
              <span className="w-6 h-6 rounded-full bg-[#081d38] text-[#dfa62a] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ol>

        <div className="bg-amber-50 border border-[#dfa62a] rounded-lg p-4 flex items-start gap-3 text-sm text-[#081d38]">
          <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong>DEFAULT RULE:</strong> If source, permission, or required verification is
            missing, do not perform or publish the protected change.
          </div>
        </div>
      </div>

      {/* Page 3 Implementation Limit Notice */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-5 flex items-start gap-3 text-xs sm:text-sm text-slate-800">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="leading-relaxed">
            <strong>IMPLEMENTATION LIMIT:</strong> An AI&rsquo;s agreement to these laws does not
            grant software enforcement. Storage immutability, permissions, authorization, and
            independent verification must be implemented externally.
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            NONBINDING REVIEW DRAFT — NOT IN FORCE
          </p>
        </div>
      </div>
    </div>
  );
};
