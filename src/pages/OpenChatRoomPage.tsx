import React, { useState } from 'react';
import {
  CheckCircle2,
  MessageSquare,
  Send,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Users,
} from 'lucide-react';

type ChatChannel =
  | 'kitchen_table'
  | 'teachers_students'
  | 'real_estate_silos'
  | 'open_debate';

interface ChatPost {
  id: string;
  channel: ChatChannel;
  authorLabel: string;
  stateCode: string;
  timestamp: string;
  body: string;
  agrees: number;
  challenges: number;
  conciergeClean: boolean;
}

const INITIAL_POSTS: ChatPost[] = [
  {
    id: 'MSG-101',
    channel: 'kitchen_table',
    authorLabel: 'Owner #0104 (Public School Parent)',
    stateCode: 'OH',
    timestamp: 'Today · 8:15 AM',
    body: 'Finally a platform where sitting at the kitchen table selling old garage tools actually builds something permanent for our family without Wall Street taking over.',
    agrees: 18,
    challenges: 0,
    conciergeClean: true,
  },
  {
    id: 'MSG-102',
    channel: 'teachers_students',
    authorLabel: 'Owner #0264 (High School Science Teacher)',
    stateCode: 'NC',
    timestamp: 'Today · 9:02 AM',
    body: 'My 9th graders are already sketching $20 garage prototypes for the National Discovery Awards. Keeping entries 100% free and judged blindly out-of-state changes everything for working-class kids.',
    agrees: 24,
    challenges: 0,
    conciergeClean: true,
  },
  {
    id: 'MSG-103',
    channel: 'real_estate_silos',
    authorLabel: 'Owner #0179 (Auto Technician)',
    stateCode: 'PA',
    timestamp: 'Yesterday · 7:40 PM',
    body: 'The 100% debt-free isolated silo rule (Article 10.6) is the smartest part of the whole Constitution. No bank loans means no foreclosure risk when the economy slows down.',
    agrees: 31,
    challenges: 1,
    conciergeClean: true,
  },
  {
    id: 'MSG-104',
    channel: 'open_debate',
    authorLabel: 'Owner #0488 (Working Dad)',
    stateCode: 'CA',
    timestamp: 'Yesterday · 6:12 PM',
    body: 'Straight talk question for the board: How fast do we think the first 50/25/25 marketplace trades will accumulate enough escrow for our first debt-free fourplex?',
    agrees: 14,
    challenges: 2,
    conciergeClean: true,
  },
];

function conciergeScrubMessage(raw: string): { cleaned: string; hadPii: boolean } {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const zipRegex = /\b\d{5}(?:-\d{4})?\b/g;

  const hadPii =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(raw) ||
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(raw) ||
    /\b\d{5}(?:-\d{4})?\b/.test(raw);

  const cleaned = raw
    .replace(emailRegex, '[EMAIL_HIDDEN_BY_CONCIERGE]')
    .replace(phoneRegex, '[PHONE_HIDDEN_BY_CONCIERGE]')
    .replace(zipRegex, '[ZIP_HIDDEN_BY_CONCIERGE]');

  return { cleaned, hadPii };
}

interface OpenChatRoomPageProps {
  defaultChannel?: ChatChannel;
  roomTitle?: string;
}

export const OpenChatRoomPage: React.FC<OpenChatRoomPageProps> = ({
  defaultChannel = 'kitchen_table',
  roomTitle = 'Open Kitchen-Table Chat Room & Parent Opinion Line',
}) => {
  const [activeChannel, setActiveChannel] = useState<ChatChannel>(defaultChannel);
  const [posts, setPosts] = useState<ChatPost[]>(INITIAL_POSTS);
  const [authorAlias, setAuthorAlias] = useState('Verified Owner (Parent)');
  const [authorState, setAuthorState] = useState('NV');
  const [draftMessage, setDraftMessage] = useState('');
  const [piiWarning, setPiiWarning] = useState<string | null>(null);

  // Live Kitchen-Table Opinion Poll (1 Human = 1 Vote)
  const [pollChoice, setPollChoice] = useState<string | null>(null);
  const [pollCounts, setPollCounts] = useState({
    teachers_first: 42,
    debt_free_silos: 38,
    marketplace_split: 29,
  });

  const handleVotePoll = (key: 'teachers_first' | 'debt_free_silos' | 'marketplace_split') => {
    if (pollChoice) return;
    setPollChoice(key);
    setPollCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim()) return;

    const { cleaned, hadPii } = conciergeScrubMessage(draftMessage.trim());
    if (hadPii) {
      setPiiWarning(
        'Concierge Privacy Shield (Article 8.4): Phone numbers, emails, or zip codes were automatically hidden to protect family and student privacy.'
      );
    } else {
      setPiiWarning(null);
    }

    const newPost: ChatPost = {
      id: `MSG-${Math.floor(200 + Math.random() * 800)}`,
      channel: activeChannel,
      authorLabel: authorAlias.trim() || 'Verified Owner',
      stateCode: authorState.trim().toUpperCase() || 'US',
      timestamp: 'Just now',
      body: cleaned,
      agrees: 1,
      challenges: 0,
      conciergeClean: true,
    };

    setPosts((prev) => [newPost, ...prev]);
    setDraftMessage('');
  };

  const handleReact = (id: string, type: 'agree' | 'challenge') => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              agrees: type === 'agree' ? p.agrees + 1 : p.agrees,
              challenges: type === 'challenge' ? p.challenges + 1 : p.challenges,
            }
          : p
      )
    );
  };

  const visiblePosts = posts.filter((p) => p.channel === activeChannel);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>Article 1.1 &amp; Article 8.4 &bull; Kitchen-Table Parent &amp; Owner Open Forum</span>
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            18+ Adult Owners &amp; Educators
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
          {roomTitle}
        </h1>

        <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
          <em>&ldquo;Let us sit crooked, but let us talk straight.&rdquo;</em> An open discussion room for 18+ parents, public school educators, and adult reviewers—protected by <strong>Concierge PII redaction</strong> and <strong>Article 6.4 anti-retaliation rules</strong>.
        </p>
      </div>

      {/* Channel Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2">
        {[
          { id: 'kitchen_table', label: '1. Kitchen-Table General Chat' },
          { id: 'teachers_students', label: '2. Teachers & Parents Public Schools Line' },
          { id: 'real_estate_silos', label: '3. Debt-Free Property & 50/25/25 Talk' },
          { id: 'open_debate', label: '4. Open Debate & Challenge Room' },
        ].map((ch) => {
          const active = activeChannel === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChannel(ch.id as ChatChannel)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center max-w-full sm:whitespace-nowrap ${
                active
                  ? 'bg-[#081d38] text-[#dfa62a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout: Left Chat Stream + Right Opinion Poll & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: Post Composer + Live Message Feed */}
        <div className="lg:col-span-8 space-y-5">
          {/* Post Opinion Form */}
          <form
            onSubmit={handlePostMessage}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-bold text-[#081d38]">
                Post Your Opinion on the Open Line
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Concierge Auto-Strips Phone/Email/Zip
              </span>
            </div>

            {piiWarning && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
                {piiWarning}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Display Label</label>
                <input
                  type="text"
                  value={authorAlias}
                  onChange={(e) => setAuthorAlias(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State</label>
                <input
                  type="text"
                  maxLength={4}
                  value={authorState}
                  onChange={(e) => setAuthorState(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Your Message (Do Not Post Minor Names, Home Addresses, or Phone Numbers)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Share your honest opinion, ask a question about the Constitution, or suggest an improvement..."
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] border border-[#dfa62a] text-xs sm:text-sm font-bold cursor-pointer transition"
            >
              <Send className="w-4 h-4" />
              <span>Post to Open Room</span>
            </button>
          </form>

          {/* Message Feed */}
          <div className="space-y-3">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#081d38]">{post.authorLabel}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      {post.stateCode}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {post.id} &bull; {post.timestamp}
                  </span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{post.body}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleReact(post.id, 'agree')}
                    className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold inline-flex items-center gap-1.5 cursor-pointer tabular-nums"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Agree ({post.agrees})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReact(post.id, 'challenge')}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold inline-flex items-center gap-1.5 cursor-pointer tabular-nums"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Challenge / Question ({post.challenges})</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT 4 COLS: Live Kitchen-Table Poll & Room Rules */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#b47d12] inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>One Owner, One Vote (Article 4.1)</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-[#081d38]">
                Kitchen-Table Opinion Pulse
              </h2>
              <p className="text-xs text-slate-600">
                Which constitutional safeguard matters most to your family right now?
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'teachers_first' as const,
                  label: '30% Rent Funding Public School Teachers & Working-Class Kids',
                  count: pollCounts.teachers_first,
                },
                {
                  key: 'debt_free_silos' as const,
                  label: '100% Debt-Free Isolated Property Silos (Zero Mortgages)',
                  count: pollCounts.debt_free_silos,
                },
                {
                  key: 'marketplace_split' as const,
                  label: '50/25/25 Garage-to-Equity Marketplace Split',
                  count: pollCounts.marketplace_split,
                },
              ].map((opt) => {
                const selected = pollChoice === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleVotePoll(opt.key)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer text-xs font-semibold ${
                      selected
                        ? 'bg-[#081d38] text-[#dfa62a] border-[#081d38]'
                        : 'bg-[#fbfaf7] hover:bg-slate-100 text-slate-900 border-slate-200'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="font-mono font-bold tabular-nums shrink-0">{opt.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#081d38] text-white border border-[#dfa62a] rounded-xl p-5 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#dfa62a]">
              Open Room Ground Rules (Articles 4.5, 6.4 &amp; 19.4)
            </h3>
            <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>18+ Adults Open Chat:</strong> Never post student names, home addresses, or school details—Concierge automatically shields PII before messages post.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Straight Talk Welcome:</strong> Challenging weak ideas is encouraged under the Build &amp; Attack Method.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>No Informal Rule Changes:</strong> Chat posts never amend the Constitution (Article 19.4).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
