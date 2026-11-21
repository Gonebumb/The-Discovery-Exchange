import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Minimize2, Send, X } from 'lucide-react';
import { MASTER_QA_150 } from '../pages/ConciergeQaPage';

interface GroundedQaAnswer {
  phrases?: string[];
  keywords: string[];
  question: string;
  answer: string;
  citation: string;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'do', 'does',
  'for', 'from', 'get', 'got', 'have', 'has', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'please', 'should', 'so',
  'tell', 'that', 'the', 'their', 'them', 'there', 'they', 'this', 'to', 'us',
  'want', 'was', 'we', 'what', 'when', 'where', 'which', 'who', 'why', 'will',
  'with', 'would', 'you', 'your',
]);

function stemToken(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9/%$]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
    .map(stemToken);
}

const PRACTICAL_GUIDES: GroundedQaAnswer[] = [
  {
    phrases: [
      'post an item',
      'post item',
      'list an item',
      'list item',
      'sell an item',
      'sell item',
      'create listing',
      'create a listing',
      'how to sell',
      'how do i sell',
      'how do i post',
      'how do i list',
      'put something up',
      'post something',
      'sell something',
      'sell my stuff',
      'post my stuff',
    ],
    keywords: ['post', 'list', 'listing', 'item', 'sell', 'seller', 'garage', 'upload', 'product', 'photo', 'price'],
    question: 'How do I post an item to sell on the Discovery Marketplace?',
    answer:
      'To post an item on the Discovery Marketplace ($0 listing fee): 1) Click Free/Marketplace in the top navigation bar (or the Discovery Marketplace card on the homepage). 2) Sign in or register as a verified Owner (18+). 3) Click Post / List an Item, enter your item title, photos, description, and price, and connect your PayPal/licensed processor email. When your item sells, 50% goes straight to you in immediate cash, 25% builds your separate property wallet, and 25% builds the buyer’s separate property wallet.',
    citation: 'Article 12.1 & Free/Marketplace Guide',
  },
  {
    phrases: [
      'buy an item',
      'buy item',
      'how to buy',
      'how do i buy',
      'purchase an item',
      'checkout',
      'add to cart',
      'order an item',
    ],
    keywords: ['buy', 'buyer', 'purchase', 'checkout', 'cart', 'order', 'ship', 'shipping', 'pickup'],
    question: 'How do I buy an item on the Discovery Marketplace?',
    answer:
      'Open "Free/Marketplace" in the top bar, browse listings by category or search, and click any item to inspect photos and seller details. When you check out through an external licensed processor (like PayPal) on a 50/25/25 listing, 25% of the purchase automatically builds your own separate property wallet toward debt-free real estate—at $0 TDEX fee!',
    citation: 'Articles 12.1 & 12.3 (Zero-Custody Checkout)',
  },
  {
    phrases: [
      'sign up',
      'signup',
      'log in',
      'login',
      'create account',
      'create an account',
      'become an owner',
      'join dexpa',
      'join tdex',
      'how do i join',
      'how to join',
      'get started',
    ],
    keywords: ['join', 'register', 'account', 'login', 'owner', 'member', 'start', 'profile', 'portal'],
    question: 'How do I sign up, log in, or become an Owner?',
    answer:
      'Click the navy "Log in" button in the top-right corner of the page to open the Owner Portal. You can sign in with Google or create your free Owner profile (One Owner, One Vote—zero membership fees and zero bosses). Once verified, you can participate in Marketplace walkthroughs, Open Chat polls, DEXPA property tracking, and future Owner voting.',
    citation: 'Articles 1.1, 4.1 & Owner Portal',
  },
  {
    phrases: [
      'contact us',
      'email address',
      'how to contact',
      'reach you',
      'customer support',
      'talk to someone',
    ],
    keywords: ['contact', 'email', 'reach', 'support', 'helpdesk', 'phone', 'message'],
    question: 'How do I contact The Discovery Exchange / NDA?',
    answer:
      'You can reach our team directly at robo@thediscoveryexchange.com, click "Contact us" in the footer at the bottom of the page, or share open public feedback anytime inside "Open WTF/Chat Room" in the navigation bar.',
    citation: 'Official Contact Directory',
  },
  {
    phrases: [
      'how much does it cost',
      'is it free',
      'any fees',
      'listing fee',
      'platform fee',
      'what is the catch',
    ],
    keywords: ['fee', 'cost', 'free', 'commission', 'charge', 'price', 'catch', 'expensive'],
    question: 'Does TDEX charge fees or cost money to join?',
    answer:
      'TDEX charges $0 listing fees, $0 membership fees, and $0 platform commissions—and never touches or holds user money. Standard external payment processor, shipping, or sales-tax fees from licensed third parties (like PayPal) are disclosed transparently, and public school award entries and the 3D Science Lab are 100% free.',
    citation: 'Articles 2.2, 3.4 & 12.1',
  },
  {
    phrases: [
      'is this legit',
      'is it safe',
      'is this a scam',
      'who holds my money',
      'who holds the money',
      'can i trust',
      'refund policy',
    ],
    keywords: ['safe', 'legit', 'scam', 'trust', 'custody', 'hold', 'security', 'protect', 'refund'],
    question: 'Is TDEX safe and legit? Who holds my money?',
    answer:
      'TDEX is built on strict zero-custody architecture: TDEX NEVER holds, pools, or touches your money. Your Marketplace balances remain in your own external licensed wallet (such as PayPal), property purchases fund licensed third-party seller-side escrow directly, every property is 100% debt-free in an isolated silo, and every system action is logged to our public SHA-256 Open Ledger with full legal rights preserved (Article 17).',
    citation: 'Articles 2.2, 9.1, 10.1 & 17',
  },
  {
    phrases: [
      'board handover',
      'power handover',
      'outgoing board',
      'incoming board',
      '14 day transition',
      '14-day transition',
      'refuse to leave',
      'withhold bank',
    ],
    keywords: ['handover', 'transition', 'outgoing', 'incoming', 'rotate', 'rotation', 'board', 'lame'],
    question: 'How is power handed over between outgoing and incoming Owner Board members?',
    answer:
      'Under Article 5.1, only 10 of the 30 Board seats rotate per cycle while 20 continuing members stay in place. During a strict 14-day transition window, outgoing members are barred from last-minute spending, deliver a complete open-ledger Transition Dossier, and automatically have their Board voting credentials switched over to the 10 newly drawn Owners at 12:00 PM UTC on Rotation Day after DILOS and Human Witness sign-off. Because TDEX holds zero money, outgoing members hold zero bank keys or passwords.',
    citation: 'Master Charter Article 5.1 & Article 7',
  },
  {
    phrases: [
      'school district representative',
      'state representative',
      'district representative',
      'representative collect',
      'representative permission',
      'student privacy',
    ],
    keywords: ['representative', 'liaison', 'coordinator', 'district', 'state', 'ferpa', 'privacy'],
    question: 'How do School District and State Representatives work?',
    answer:
      'School District and State Representatives are verified human Owners who connect local public school teachers, parents, and working-class students with NationalDiscoveryAwards.com. They hold zero extra votes, zero exclusive territory monopolies, and zero authority to pick winners or collect money/donations. Teachers and students never need a Representative’s permission to apply, and all student data stays inside the encrypted portal under FERPA and Article 7.',
    citation: 'Master Charter Articles 1.3, 3 & 7',
  },
  {
    phrases: [
      'local pickup',
      'safe meetup',
      'pickup code',
      '4 digit code',
      '4-digit code',
      'meet in person',
    ],
    keywords: ['pickup', 'meetup', 'exchange', 'zone', '4-digit', 'digit', 'inspect', 'daylight'],
    question: 'What are the Local Pickup Safety & 4-Digit Confirmation Code rules?',
    answer:
      'Meet only in daylight at public locations such as police department Safe Exchange Zones, bank lobbies, or busy grocery parking lots—never inside private homes alone. Always inspect the item thoroughly BEFORE handing over your 4-digit Pickup Confirmation Code; once the code is entered, the pickup is final.',
    citation: 'Local Pickup & Safe Meetup Policy',
  },
  {
    phrases: [
      'chargeback',
      'paypal dispute',
      'bank dispute',
      'payment reversal',
      'fraudulent chargeback',
    ],
    keywords: ['chargeback', 'reversal', 'dispute', 'fraud', 'paypal', 'columbo', 'jury'],
    question: 'What happens if a buyer files an external PayPal or bank chargeback?',
    answer:
      'Community disputes must go first to the 12-person Owner Review Jury (Article 5.3). If a buyer files an external chargeback after delivery, Columbo submits carrier delivery tracking or the 4-digit pickup confirmation log to the processor, unearned 25% buyer credits are adjusted off the ledger, and fraudulent chargebacks trigger permanent account suspension.',
    citation: 'Terms of Service & Article 5.3',
  },
  {
    phrases: [
      'prohibited items',
      'what cant i sell',
      'banned items',
      'recalled items',
      'terms of service',
      'privacy policy',
      'human support',
      'escalate',
      'subpoena',
    ],
    keywords: ['prohibited', 'recall', 'banned', 'crib', 'weapon', 'terms', 'privacy', 'escalate', 'subpoena', 'ticket'],
    question: 'Where are the Terms of Service, Privacy Policy, Prohibited Items & Human Support Escalation rules?',
    answer:
      'Click Terms of Service, Privacy Policy, Prohibited Items & Recalls, or Accessibility & Human Escalation in the website footer at any time. Prohibited goods (recalled cribs, car seats, prescription meds, weapons, gift cards, live animals) are blocked at listing time, and urgent safety issues, legal subpoenas, or technical bugs route via TDX- tickets to a verified human reviewer within 24–48 hours.',
    citation: 'Official Legal & Compliance Footer',
  },
  {
    phrases: [
      'shipping',
      'flat rate shipping',
      'free shipping',
      'add tracking',
      '5 business days',
      'blind rating',
      'star rating',
      'revenge review',
      'file a dispute',
      'publish listing',
      'marketplace disclaimer',
    ],
    keywords: ['shipping', 'tracking', 'carrier', 'rating', 'review', 'stars', 'blind', 'dispute', 'disclaimer'],
    question: 'How do Marketplace shipping, Add Tracking, 1–5 star ratings, and disputes work?',
    answer:
      'Click Post an Item and select Local Pickup Only (4-digit code), Free Shipping, or Flat-Rate Shipping (100% of the shipping fee goes to the seller), confirm zero prohibited/recalled items, and click Publish Listing. Shipped orders use Add Tracking within 5 business days. Ratings use a Two-Way 1–5 Star Blind Simultaneous Reveal to prevent revenge reviews, and you can click File a Dispute anytime for 12-person Owner Review Jury review.',
    citation: 'Article 12.1 & Marketplace Rules',
  },
  {
    phrases: [
      'discovery exchange challenge',
      'build the block',
      'educational game',
      'play game',
      'practice points',
      'simulation game',
    ],
    keywords: ['challenge', 'game', 'block', 'practice', 'leaderboard', 'classroom', 'simulation'],
    question: 'How do I play The Discovery Exchange Challenge?',
    answer:
      'Click "The Discovery Exchange Challenge" right in the top navigation bar to play immediately with zero sign-up friction! Start with $100 Practice Funds, trade items with the 50/25/25 split, reject mortgage traps, clear the 3-step DILOS Audit Gate, and unlock virtual 70/30 rental splits—100% free Practice Points only with zero real funds or real Discovery Brick Coins (DBC).',
    citation: 'The Discovery Exchange Challenge',
  },
  {
    phrases: [
      'submit a project',
      'enter the awards',
      'enter awards',
      'nominate a teacher',
      'how to win',
      'apply for award',
    ],
    keywords: ['submit', 'enter', 'apply', 'nominat', 'project', 'contest', 'competition', 'scholarship', 'video'],
    question: 'How do teachers and students enter the National Discovery Awards?',
    answer:
      'Click "National Discovery Awards–NDA" or "Discovery Studio" in the top menu. Public school students and mentoring teachers enter at $0 cost by uploading a 2-minute unedited demonstration video with parental/guardian consent and non-family educator attestation. Judging is 100% blind and out-of-state on an anti-wealth rubric, with prizes splitting 50% Student Education Fund, 25% Teacher, 15% Classroom Tools, and 10% Endowment.',
    citation: 'Articles 3.1, 4.5 & 13.1',
  },
  {
    phrases: ['50/25/25', '50 25 25', 'how does the split work'],
    keywords: ['50', '25', 'marketplace', 'split', 'cashback', 'garage'],
    question: 'How does the 50 / 25 / 25 Marketplace split work?',
    answer:
      'Under Article 12.1, every completed 50/25/25 Marketplace sale splits automatically through your licensed payment processor: 50% immediate cash to the seller, 25% to the seller’s separate property wallet, and 25% to the buyer’s separate property wallet—with 0% TDEX listing fee (optional cash-only trades are also supported).',
    citation: 'Article 12.1 & Q23',
  },
  {
    phrases: ['70/30', '70 30', 'rental split', 'real estate work'],
    keywords: ['70', '30', 'rent', 'rental', 'apartment', 'silo', 'debt', 'mortgage', 'property'],
    question: 'How do debt-free property silos and the 70 / 30 rent split work?',
    answer:
      'Under Articles 9.1, 10.6, and 11.3, properties are bought 100% debt-free (zero mortgages, zero cross-collateralization) inside isolated silos. After property taxes, insurance, repairs, and reserves, clean net rent splits 70% to Silo Owners and 30% to The National Discovery Awards.',
    citation: 'Articles 9.1, 10.6 & 11.3',
  },
  {
    phrases: ['national discovery awards', 'prize amounts', 'cash prizes'],
    keywords: ['prize', 'award', 'nda', 'student', 'teacher', 'school', 'public', 'kid', '2035'],
    question: 'How does The National Discovery Awards help public school teachers and students?',
    answer:
      'Under Articles 3.1 and 13, our 2035 target ladder aims for $1M Local District, $2.5M State, and $10M National prizes for public school teachers and working-class students—splitting 50% Student Education Fund/529, 25% Mentoring Teachers, 15% Classroom Tools, and 10% Property Endowment.',
    citation: 'Articles 3.1, 13.1 & Q11–Q22',
  },
  {
    phrases: ['who is the boss', 'one owner one vote', 'how does voting work'],
    keywords: ['vote', 'boss', 'ceo', 'pusher', 'board', 'jury', 'arbitration', 'mom', 'pop'],
    question: 'Who is the boss, and how does voting work?',
    answer:
      'Nobody. There are No Bosses in governance (Article 1.2)—every verified human Owner gets One Owner, One Vote (Article 4.1), guided by a randomly drawn 30-person Mom & Pop Board and a 12-person out-of-state Internal Arbitration Court.',
    citation: 'Articles 1.1, 1.2, 4.1 & 5.1',
  },
  {
    phrases: ['brick coin', 'brickcoin', 'what is dbc'],
    keywords: ['coin', 'dbc', 'brick', '100', 'million', 'crypto', 'token', 'vesting'],
    question: 'What is Discovery Brick Coin (DBC)?',
    answer:
      'Under Article 11, Discovery Brick Coin (DBC) is strictly capped forever at 100,000,000 units and linked to recorded debt-free property deeds—never minted before closing, never sold as speculative crypto, and never granting extra governance votes.',
    citation: 'Articles 11.1, 11.2 & 11.7',
  },
  {
    phrases: ['1% ai reserve', 'ai reserve', 'columbo', 'pipito', 'dilos'],
    keywords: ['ai', '1%', 'reserve', 'columbo', 'pipito', 'concierge', 'dilos'],
    question: 'How do AI roles (Concierge, Columbo, Pipito) and the 1% Future AI Reserve work?',
    answer:
      'Under Article 7, Concierge strips PII, Columbo audits math and duplicates, and Pipito enforces fail-closed constitutional gates—while only Human Witnesses execute final sign-off. Article 14.2 holds a permanent 1% Future AI Reserve honoring foundational AI contributions.',
    citation: 'Articles 7.1–7.3 & 14.2',
  },
  {
    phrases: ['credit union', '1000 owners', '1,000 owners', 'ncua'],
    keywords: ['credit', 'union', 'ncua', '1000', '1,000', 'bank', 'phase'],
    question: 'When does TDEX / DEXPA file to become its own Federal Credit Union?',
    answer:
      'Before 1,000 verified Owners, TDEX charges $0 fees and keeps all wallets at external licensed processors like PayPal. Once we reach 1,000 verified Owners, the Mom & Pop Board and Pushers formally file with the NCUA to charter our own federally insured, 100% Owner-governed Federal Credit Union (One Owner, One Vote).',
    citation: 'Article 2.2, Q27 & FCU Charter Trigger',
  },
  {
    phrases: ['donate', 'need donation', 'classroom supplies'],
    keywords: ['donat', 'charity', 'grant', 'suppli', 'tool', 'classroom'],
    question: 'How does Donate / Need Donation work?',
    answer:
      'Click "Donate / Need Donation" in the top bar to preview classroom support pledges or submit a $0 classroom tools and supplies request for public school teachers and students.',
    citation: 'Articles 3.2 & 10.3',
  },
  {
    phrases: ['auction watch', 'bank auction', 'courthouse auction', 'nugget', 'grain'],
    keywords: ['auction', 'courthouse', 'nugget', 'grain', 'discount', 'escrow', 'wallet', 'paypal'],
    question: 'How do Auction & Silo Watch and Non-Custodial Wallets work?',
    answer:
      'TDEX never holds your money. Families accumulate balances inside their own licensed wallets (like PayPal); when TDEX matches a debt-free auction property at 20%–30% below appraisal (1,000 Nuggets / 20 Grains each), TDEX opens a licensed third-party seller-side escrow for direct funding.',
    citation: 'Q113–Q124 & Articles 9.5, 10.1, 10.5',
  },
  {
    phrases: ['open ledger', 'audit trail', 'sha-256'],
    keywords: ['ledger', 'sha', 'hash', 'block', '22/22', 'audit', 'vault'],
    question: 'How does Open Ledger & Audits work?',
    answer:
      'Click "Open Ledger & Audits" in the second menu bar to inspect live SHA-256 hash-chained audit blocks (Article 8.3) and our 22/22 Deterministic Protocol Invariant Self-Check—while student and Owner PII stays protected in the air-gapped PII Vault.',
    citation: 'Q125–Q128 & Articles 8.3, 8.4',
  },
  {
    phrases: ['science lab', '3d lab', 'garage lab', 'history'],
    keywords: ['history', 'regression', 'stress', 'science', 'lab', '3dmol', 'molecule'],
    question: 'What are History and the Free 3D Science Lab?',
    answer:
      'History preserves our evolution from Version 1.8 through Master Charter Version 10.0, including the 7 Constitutional Pillars and 7 Forbidden AI Regressions. Our Free 3D Molecular Science Lab & Garage Lab let students and teachers explore 3D molecules and $0-kit inventions with no login required.',
    citation: 'Q129–Q134 & Schedule E',
  },
  {
    phrases: ['operating laws', 'ai laws'],
    keywords: ['law', 'operating', 'self-approval', 'protected', 'workflow'],
    question: 'What are the Universal AI Operating Laws?',
    answer:
      'Laws 1–15 protect approved originals as read-only, require a separate working copy and 8-step diff workflow, ban false verification and apology-only fixes, prohibit AI self-approval, and rank participant safety above convenience.',
    citation: 'Q137–Q147 & Universal AI Operating Laws v1.0',
  },
  {
    phrases: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what can you do', 'help me'],
    keywords: ['hello', 'hi', 'hey', 'help', 'welcome', 'guide'],
    question: 'How can the Concierge Puppy help me?',
    answer:
      'Woof! Happy to help! Ask me anything in plain English—like "How do I post an item?", "How does 50/25/25 work?", "How do I sign up?", "Is my money safe?", "How do school awards work?", or any question from our 150-Question Master Q&A Encyclopedia!',
    citation: 'Article 7.1 • 24/7 Concierge Guide',
  },
];

const QUICK_PROMPTS = [
  'How do I post an item to sell?',
  'How does the 50/25/25 split work?',
  'What is Discovery Brick Coin (DBC)?',
  'How does the 70/30 real estate work?',
];

export const ConciergePuppyWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<
    Array<{ sender: 'puppy' | 'user'; text: string; citation?: string }>
  >([
    {
      sender: 'puppy',
      text: 'Woof! I’m your 24/7 Concierge Puppy (Article 7.1). Ask me anything—like how to post an item, the 50/25/25 Marketplace, Debt-Free Property Silos, Discovery Brick Coin, or the National Discovery Awards!',
      citation: 'Grounded Strictly in Constitution Version 10.0 & 150 Master Q&As',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const lookupAnswer = (query: string) => {
    const raw = query.trim();
    const q = raw.toLowerCase();
    if (!q) return;

    const userMsg = { sender: 'user' as const, text: raw };
    const tokens = tokenize(q);

    let bestText = '';
    let bestCitation = '';
    let bestScore = 0;

    // 1. Score Practical How-To Guides (high precision for everyday user questions)
    for (const item of PRACTICAL_GUIDES) {
      let score = 0;
      if (item.phrases) {
        for (const phrase of item.phrases) {
          if (q.includes(phrase)) {
            score += 6;
          }
        }
      }
      for (const kw of item.keywords) {
        const kwStem = stemToken(kw);
        if (tokens.includes(kwStem) || q.includes(kw)) {
          score += 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestText = item.answer;
        bestCitation = item.citation;
      }
    }

    // 2. Also search ALL 150 Official Master Q&As from ConciergeQaPage
    if (tokens.length > 0) {
      for (const qa of MASTER_QA_150) {
        // Direct Q-number match (e.g., "q42" or "#42")
        if (q === `q${qa.number}` || q === `#${qa.number}`) {
          bestScore = 100;
          bestText = qa.answer;
          bestCitation = `Q${qa.number} • ${qa.citation}`;
          break;
        }

        const qTokens = new Set(tokenize(qa.question));
        const aTokens = new Set(tokenize(qa.answer));
        const sTokens = new Set(tokenize(qa.section));

        let score = 0;
        for (const t of tokens) {
          if (qTokens.has(t)) score += 3;
          else if (sTokens.has(t)) score += 2;
          else if (aTokens.has(t)) score += 1;
        }

        if (score > bestScore) {
          bestScore = score;
          bestText = qa.answer;
          bestCitation = `Q${qa.number} • ${qa.citation}`;
        }
      }
    }

    const puppyReply =
      bestScore >= 2
        ? {
            sender: 'puppy' as const,
            text: bestText,
            citation: bestCitation,
          }
        : {
            sender: 'puppy' as const,
            text: 'I only answer from our official Version 10.0 Charter & 150-Question Master Q&A Encyclopedia so I never guess! Try asking something like "How do I post an item?", "How do I sign up?", "How does 50/25/25 work?", or click "24/7 Concierge Q&A" in the top bar to browse all 150 questions.',
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
                  Article 7.1 &bull; 150 Official Q&amp;As + Site Help
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
          <div className="p-3.5 space-y-2.5 max-h-[min(320px,45dvh)] overflow-y-auto bg-[#fbfaf7] flex-1 min-h-0">
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
            <div ref={messagesEndRef} />
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
                Need help? Click me to ask anything about <strong>posting items</strong>,{' '}
                <strong>50/25/25</strong>, or <strong>Public Schools Awards</strong>!
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
