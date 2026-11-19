import React, { useState } from 'react';
import { MessageCircle, Minimize2, Send, X } from 'lucide-react';

interface GroundedQaAnswer {
  keywords: string[];
  question: string;
  answer: string;
  citation: string;
}

const CONCIERGE_KNOWLEDGE_INDEX: GroundedQaAnswer[] = [
  {
    keywords: ['50', '25', 'marketplace', 'sell', 'buy', 'split', 'garage', 'fashion'],
    question: 'How does the 50 / 25 / 25 Marketplace split work?',
    answer:
      'Under Article 12.1, completed sales split 50% cash to the seller, 25% to the seller’s property accumulation balance, and 25% to the buyer’s property accumulation balance—with 0% TDEX listing fee (optional cash-only trades also planned). You can walk the full split right inside Marketplace without charging a card.',
    citation: 'Article 12.1 & Q23',
  },
  {
    keywords: ['70', '30', 'rent', 'rental', 'apartment', 'silo', 'debt', 'mortgage'],
    question: 'How do debt-free property silos and the 70 / 30 rent split work?',
    answer:
      'Under Articles 9.1, 10.6, and 11.3, buildings are purchased 100% debt-free inside isolated silos. Clean net rent after taxes, insurance, repairs, and reserves splits 70% to Silo Owners and 30% to The National Discovery Awards.',
    citation: 'Articles 9.1, 10.6 & 11.3',
  },
  {
    keywords: ['prize', 'award', 'nda', 'student', 'teacher', 'school', 'public', 'public schools', 'kids'],
    question: 'How does The National Discovery Awards help public school teachers and students?',
    answer:
      'Under Article 3.1 and 13, $1M Local District, $2.5M State, and $10M National award pools (goal to reach by 2035) honor great public school teachers and uplift working-class students—splitting 50% to student education trusts/529s, 25% to mentoring teachers, 15% to classroom tools, and 10% to endowment.',
    citation: 'Articles 3.1, 13.1 & Q11–Q22',
  },
  {
    keywords: ['vote', 'owner', 'boss', 'ceo', 'pusher', 'board', 'jury'],
    question: 'Who is the boss, and how does voting work?',
    answer:
      'Nobody. There are No Bosses (Article 1.2)—every verified human Owner gets 1 vote (Article 4.1), with a rotating 30-person Board and 12-person Juries chosen by random draw.',
    citation: 'Articles 1.1, 1.2, 4.1 & 5.1',
  },
  {
    keywords: ['coin', 'dbc', 'brick', '100', 'million', 'crypto'],
    question: 'What is Discovery Brick Coin (DBC)?',
    answer:
      'Under Article 11, Discovery Brick Coin (DBC) is strictly capped at 100,000,000 units. It is tied to recorded debt-free property deeds—never minted prior to closing and never giving extra governance votes.',
    citation: 'Articles 11.1, 11.2 & 11.7',
  },
  {
    keywords: ['ai', '1%', 'reserve', 'columbo', 'pipito', 'concierge', 'dilos'],
    question: 'How do AI roles (Concierge, Columbo, Pipito) and the 1% Future AI Reserve work?',
    answer:
      'Under Article 7, Concierge strips PII, Columbo audits math, and Pipito checks gates—while only Human Witnesses act. Article 14.2 holds a permanent 1% Future AI Reserve honoring foundational AI contributions.',
    citation: 'Articles 7.1–7.3 & 14.2',
  },
  {
    keywords: ['donate', 'donation', 'tax', 'charity', 'social good'],
    question: 'How does Donate / Need Donation work?',
    answer:
      'In Donate / Need Donation, supporters can preview classroom support pledges or teachers can request $0 classroom tools and supplies.',
    citation: 'Article 3.2 & 10.3',
  },
  {
    keywords: ['studio', 'video', 'upload', 'download', 'week', 'month', 'winner'],
    question: 'How does Discovery Studio (Channel #15) work?',
    answer:
      'Discovery Studio is our public schools showcase and free Classroom Build Sheet library. Students share 2-minute unedited demos with guardian consent, and teachers can download build sheets for free.',
    citation: 'Q101–Q104 & Article 13',
  },
  {
    keywords: ['fashion', 'clothes', 'dress', 'closet', 'sewing', 'women', 'mom'],
    question: 'How does the Fashion & Style Group (Channel #16) work?',
    answer:
      'Channel #16 features Closet-to-Equity walkthroughs (50% cash / 25% seller / 25% buyer property credit, 0% TDEX listing fee) plus public school textile design concepts.',
    citation: 'Q105–Q106 & Article 12.1',
  },
  {
    keywords: ['district', 'principal', 'chapter', 'register school'],
    question: 'How do School Districts sign up?',
    answer:
      'Any teacher, principal, or parent organizer can walk through $0 school district registration to connect classrooms with 15% tool grants and blind out-of-state judging.',
    citation: 'Q107–Q108 & Article 1.3',
  },
  {
    keywords: ['chat', 'forum', 'talk', 'opinion', 'poll', 'wtf', 'heaven'],
    question: 'How does the Open Kitchen-Table Chat Room work?',
    answer:
      'Open Chat is an open kitchen-table review room for 18+ adult Owners and educators where you can test live polls and share feedback; Concierge automatically hides stray phone numbers, emails, and zip codes.',
    citation: 'Q112 & Article 8.4',
  },
  {
    keywords: ['auction', 'courthouse', 'nugget', 'grain', 'discount', 'watch', 'escrow', 'wallet', 'paypal', 'non-custodial'],
    question: 'How do Auction & Silo Watch (Channel #17) and Non-Custodial Wallets work?',
    answer:
      'TDEX never holds or touches any money. Families build balances inside their own licensed payment wallets (e.g., PayPal), and when TDEX matches a debt-free auction property at 20%–30% below appraisal (1,000 Nuggets / 20 Grains each), TDEX opens a licensed third-party seller-side escrow for direct funding.',
    citation: 'Q113–Q124 & Articles 9.5, 10.1, 10.5',
  },
  {
    keywords: ['ledger', 'open the ledger', 'sha', 'hash', 'block', '22/22', 'audit', 'vault'],
    question: 'How does Open The Ledger (Channel #19) work?',
    answer:
      'Open The Ledger publishes SHA-256 hash-chained blocks under Article 8.3 and runs the 22/22 Deterministic Protocol Invariant Self-Check in real time while keeping private student and Owner PII inside the air-gapped PII Vault.',
    citation: 'Q125–Q128 & Articles 8.3, 8.4',
  },
  {
    keywords: ['history', 'past', 'regression', 'stress', 'science', 'lab', '3dmol', 'molecule', 'garage'],
    question: 'What are Past History (Channel #20) and the Free 3D Science Lab?',
    answer:
      'Past History preserves Version 1.8 to 10.0 continuity, the 7 Constitutional Pillars, and the 7 Forbidden AI Regressions. Our Free 3D Molecular Science Lab & Garage Lab let public school teachers and students explore 3D proteins and $0-kit inventions.',
    citation: 'Q129–Q134 & Schedule E',
  },
  {
    keywords: ['law', 'operating laws', 'rule', '21', 'self-approval', 'protected', 'workflow'],
    question: 'What are the Universal AI Operating Laws (Channel #21)?',
    answer:
      'Laws 1–15 protect approved human-AI originals as read-only, require a separate working copy and 8-step diff workflow, ban false verification and apology-only fixes, prohibit AI self-approval, and rank participant safety above convenience.',
    citation: 'Q137–Q147 & Universal AI Operating Laws v1.0',
  },
];

const QUICK_PROMPTS = [
  'How does the 50/25/25 split work?',
  'What is Discovery Brick Coin (DBC)?',
  'How does the 70/30 real estate work?',
  'Explain 1% AI Reserve & 1% / 3% rules',
];

export const ConciergePuppyWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<
    Array<{ sender: 'puppy' | 'user'; text: string; citation?: string }>
  >([
    {
      sender: 'puppy',
      text: 'Woof! I’m your 24/7 Concierge Puppy (Article 7.1). Ask me anything about the 50/25/25 Marketplace, Debt-Free Property Silos, Discovery Brick Coin, or the National Public Schools Discovery Awards!',
      citation: 'Grounded Strictly in Constitution Version 10.0',
    },
  ]);

  const lookupAnswer = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const userMsg = { sender: 'user' as const, text: query.trim() };

    let bestMatch: GroundedQaAnswer | null = null;
    let bestScore = 0;

    for (const item of CONCIERGE_KNOWLEDGE_INDEX) {
      let score = 0;
      for (const kw of item.keywords) {
        if (q.includes(kw)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    const puppyReply = bestMatch
      ? {
          sender: 'puppy' as const,
          text: bestMatch.answer,
          citation: bestMatch.citation,
        }
      : {
          sender: 'puppy' as const,
          text: 'I only answer directly from our approved Version 10.0 Master Q&A Encyclopedia so I never guess or invent rules! Click "24/7 Concierge Q&A" in the top bar to search all 150 official questions, or ask me about 50/25/25, 70/30 rent, Auction Watch, Open The Ledger, Operating Laws, Discovery Studio, Fashion Group, DBC, or One Owner One Vote.',
          citation: 'Article 2.4 & 7.1 Zero-Hallucination Rule',
        };

    setMessages((prev) => [...prev, userMsg, puppyReply]);
    setInputQuery('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupAnswer(inputQuery);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-2.5 max-w-[calc(100vw-1.5rem)]">
      {/* EXPANDED CONCIERGE CHAT WINDOW */}
      {isOpen && (
        <div className="w-[min(380px,calc(100vw-1.5rem))] max-h-[calc(100dvh-5.5rem)] bg-white border-2 border-[#dfa62a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Navy & Gold Header */}
          <div className="bg-[#081d38] text-white px-4 py-3 flex items-center justify-between gap-2 border-b border-[#dfa62a]/40 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#dfa62a] bg-slate-800 flex items-center justify-center shrink-0">
                {!imgFailed ? (
                  <img
                    src="/src/assets/images/mascot_concierge_puppy_1794483065529.jpg"
                    alt="TDEX Concierge Puppy Mascot"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#dfa62a]">TDX</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#dfa62a] leading-tight truncate">
                  Concierge Puppy &bull; 24/7 Guide
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  Article 7.1 &bull; Version 10.0 Q&amp;A Lookup
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Minimize Concierge Puppy"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Message Stream */}
          <div className="p-3.5 space-y-2.5 max-h-[min(300px,42dvh)] overflow-y-auto bg-[#fbfaf7] flex-1 min-h-0">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'puppy'
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'bg-[#081d38] text-white ml-6'
                }`}
              >
                <p>{m.text}</p>
                {m.citation && (
                  <div className="mt-1.5 pt-1 border-t border-slate-100 text-[10px] font-mono font-bold text-amber-800">
                    {m.citation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* One-Tap Starter Question Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 shrink-0">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => lookupAnswer(qp)}
                className="px-2 py-1 rounded-md bg-white hover:bg-amber-50 border border-slate-200 text-[11px] font-medium text-[#081d38] cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleFormSubmit}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask the Concierge Puppy a question..."
              className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#081d38]"
            />
            <button
              type="submit"
              aria-label="Send question"
              className="p-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] rounded-lg cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* CLIPPY-STYLE SPEECH BUBBLE + FLOATING PUPPY AVATAR */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2">
          {showSpeechBubble && (
            <div className="relative max-w-[min(250px,calc(100vw-7rem))] bg-white border-2 border-[#dfa62a] rounded-xl p-3 pr-6 shadow-lg text-xs text-[#081d38] leading-snug font-medium">
              <button
                type="button"
                onClick={() => setShowSpeechBubble(false)}
                aria-label="Close tip"
                className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p>
                Need help? Click me to ask anything about <strong>50/25/25</strong>,{' '}
                <strong>Public Schools Awards</strong>, or <strong>1 Owner = 1 Vote</strong>!
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setShowSpeechBubble(false);
              }}
              title="Open 24/7 Concierge Puppy Assistant"
              className="w-16 h-16 rounded-full border-3 border-[#dfa62a] bg-[#081d38] shadow-xl overflow-hidden flex items-center justify-center hover:scale-105 transition-transform cursor-pointer relative group"
            >
              {!imgFailed ? (
                <img
                  src="/src/assets/images/mascot_concierge_puppy_1794483065529.jpg"
                  alt="Concierge Puppy Helper"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MessageCircle className="w-7 h-7 text-[#dfa62a]" />
              )}
            </button>
            <span className="px-2 py-0.5 rounded-full bg-[#081d38] border border-[#dfa62a] text-[#dfa62a] text-[10px] font-bold shadow-sm">
              Ask Me
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
