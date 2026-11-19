import React, { useState } from 'react';
import { HelpCircle, Search } from 'lucide-react';

interface QaEntry {
  number: number;
  section: string;
  question: string;
  answer: string;
  citation: string;
}

const MASTER_QA_150: QaEntry[] = [
  // SECTION 1: CORE IDENTITY, OWNERSHIP & NO BOSSES (Q1–Q10)
  {
    number: 1,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'What is The Discovery Exchange (thediscoveryexchange.com)?',
    answer:
      'The Discovery Exchange is an open, ownership-first community platform built to permanently fund and run The National Discovery Awards—recognizing and rewarding great public school teachers and working-class, under-resourced students without relying on outside donations, wealthy philanthropists, or corporate sponsors.',
    citation: 'Article 2.1 & 3.1',
  },
  {
    number: 2,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'What does "Let us sit crooked, but let us talk straight — upholding honor alongside full compliance with the law" mean?',
    answer:
      'It is the constitutional motto of The Discovery Exchange. It means keeping communication honest, direct, and grounded at the kitchen table—upholding honor alongside full compliance with the law.',
    citation: 'Preamble & Article 1.5',
  },
  {
    number: 3,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'Why does The Discovery Exchange call participants "Owners" instead of "members"?',
    answer:
      'Under Article 1.1, "members" are passive subscribers who follow someone else’s rules, while Owners hold equal constitutional standing. Every verified human participant is an Owner with one equal vote, regardless of purchase volume, account balance, property holdings, or join date.',
    citation: 'Article 1.1 & 4.1',
  },
  {
    number: 4,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'Who is the CEO or permanent boss of The Discovery Exchange?',
    answer:
      'Nobody. Under Article 1.2, there is no permanent CEO, corporate boss, controlling shareholder, or entrenched board of directors. No founder, officer, investor, or committee holds unilateral authority or veto power.',
    citation: 'Article 1.2',
  },
  {
    number: 5,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'What is a "Pusher," and how is a Pusher different from a boss?',
    answer:
      'Under Article 1.3, a Pusher is any Owner or builder who steps forward to organize, assemble, or launch a local chapter and put their shoulder behind the blueprint to create momentum. Being a Pusher grants zero extra voting power, zero superior ownership class, and zero permanent control. Once the system is running, the Pusher stands on the exact same one-Owner, one-vote footing as everyone else.',
    citation: 'Article 1.3',
  },
  {
    number: 6,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'What happens to the original founder once The Discovery Exchange is up and running?',
    answer:
      'Under Article 1.3, the founder acts as an initiating Pusher to build the engine and hand it over to Owner governance. Once operational, the founder holds one single vote like every other Owner, plus the separate 1% Founder economic allocation recorded in Schedule A.',
    citation: 'Article 1.3 & Schedule A',
  },
  {
    number: 7,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'Is The Discovery Exchange a closed proprietary company or an open blueprint?',
    answer:
      'Under Schedule E, it is an open architectural blueprint. Anyone—Owners, teachers, developers, global Pushers, or future AI systems—is welcome to inspect, copy, improve, and build upon the platform without unnecessary login barriers or premature security bloat.',
    citation: 'Article 2.2 & Schedule E',
  },
  {
    number: 8,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'Why does The Discovery Exchange refuse corporate venture capital or billionaire sponsors?',
    answer:
      'Outside corporate investors demand control, board seats, and rule changes that turn community platforms into profit-extraction machines. By self-funding through everyday marketplace commerce and debt-free real estate, The Discovery Exchange ensures big money can never buy control over the rules or the Public Schools Awards.',
    citation: 'Article 3.2',
  },
  {
    number: 9,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'What is the relationship between The Discovery Exchange and the Discovery Exchange Parents Alliance (Dexpa)?',
    answer:
      'Under Article 2.1, The Discovery Exchange (thediscoveryexchange.com) is the umbrella platform and architectural engine, while the Discovery Exchange Parents Alliance (Dexpa) participates as the family, parent, and community governance body under adopted organizing documents.',
    citation: 'Article 2.1',
  },
  {
    number: 10,
    section: '1. Core Identity, Ownership & No Bosses (Q1–Q10)',
    question: 'Can a single person, corporation, or government agency buy out The Discovery Exchange?',
    answer:
      'No. Under Articles 1.2, 4.1, and 19.2, governing control is locked to one verified human Owner, one vote, with no controlling shares for sale and a 75% supermajority required to alter bedrock provisions.',
    citation: 'Articles 1.2, 4.1 & 19.2',
  },

  // SECTION 2: TEACHERS FIRST & WORKING-CLASS PUBLIC SCHOOL STUDENTS (Q11–Q22)
  {
    number: 11,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Who is The National Discovery Awards really built for?',
    answer:
      'Under Article 3.1, The National Discovery Awards is not an elitist trophy contest for wealthy straight-A students with private tutors and every advantage. It is built specifically to reach, motivate, and uplift working-class, under-resourced public school students growing up in tough neighborhoods and facing everyday life hardships—and the great teachers who refuse to give up on them.',
    citation: 'Article 3.1',
  },
  {
    number: 12,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Why does The Discovery Exchange emphasize public school teachers even more than students?',
    answer:
      'Because great students come from great teachers—especially in underfunded, working-class public schools where one dedicated teacher can completely change a young person’s life trajectory. Rewarding and empowering great teachers multiplies impact across entire classrooms and generations.',
    citation: 'Article 3.1',
  },
  {
    number: 13,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'How does The National Discovery Awards defend human intelligence in the age of AI?',
    answer:
      'As AI handles more routine tasks, passive reliance on technology threatens to dull human critical thinking. The National Discovery Awards gives struggling and overlooked students a concrete, motivating reason to think independently, solve real-world problems, and use AI as a tool to sharpen their own minds rather than letting AI do their thinking for them.',
    citation: 'Preamble & Article 3.1',
  },
  {
    number: 14,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'What are the three official Discovery categories?',
    answer:
      'Under Article 3.3, awards recognize verifiable educator mentorship and student breakthroughs across three categories: Applied Discovery (hands-on building, engineering, physical repairs/improvements, and real-world execution), Analytical Discovery (deep structural logic, independent research, fact-checking, and problem-solving), and Hybrid Discovery (the proven bridge where sharp analysis meets hands-on real-world execution).',
    citation: 'Article 3.3',
  },
  {
    number: 15,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Do students or teachers need money or expensive equipment to participate?',
    answer:
      'No. Entry is accessible without financial barriers, and judging evaluates resourcefulness, effort, clarity of thought, and real-world execution rather than expensive store-bought kits.',
    citation: 'Article 3.4',
  },
  {
    number: 16,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Can a student win for helping classmates learn or improving their school/community?',
    answer:
      'Yes. Peer mentorship, practical community problem-solving, and hands-on improvements fit squarely within Applied and Hybrid Discovery, alongside the educators who guided them.',
    citation: 'Article 3.3',
  },
  {
    number: 17,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'How are teachers nominated or recognized for The National Discovery Awards?',
    answer:
      'Teachers can be recognized both alongside the students they mentor and for original teaching breakthroughs that unlock curiosity and measurable growth in working-class, under-resourced classrooms.',
    citation: 'Article 3.1',
  },
  {
    number: 18,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'How are student privacy and child safety protected?',
    answer:
      'Under Articles 3.4, 4.5, and 8.4, automated PII stripping removes student names, addresses, phone numbers, and school details for privacy, while live minor prize submissions enforce verified parental/guardian consent and school authorization.',
    citation: 'Articles 3.4, 4.5 & 8.4',
  },
  {
    number: 19,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Can a minor ever be asked to invest money or sign a financial contract?',
    answer:
      'Never. Under Article 4.5, no minor may be asked to invest, provide sensitive personal data unnecessarily, or accept any financial or legal obligation.',
    citation: 'Article 4.5',
  },
  {
    number: 20,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'How are Discovery Awards entries judged fairly without favoritism?',
    answer:
      'Under Articles 3.4, 7.3, and 13.1, judging follows pre-published objective criteria, conflict-of-interest screening, multi-stage verification (Concierge → Columbo → Pipito → Independent Human Witness), and an open appeal process.',
    citation: 'Articles 3.4, 7.3 & 13.1',
  },
  {
    number: 21,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Can an AI decide who wins National Discovery Awards?',
    answer:
      'No. Under Article 7.2, AI tools (Columbo and Pipito) only organize evidence and verify rule compliance—qualified, conflict-screened human reviewers and witnesses make all final award decisions.',
    citation: 'Articles 7.2 & 7.3',
  },
  {
    number: 22,
    section: '2. Teachers First & Working-Class Public School Students (Q11–Q22)',
    question: 'Can a prize ever be advertised before the money is actually sitting in the prize pool?',
    answer:
      'Never. Under Article 13.1, prize rules, judging criteria, and actual funding status must be published transparently in advance—an unfunded target may never be described as an available award.',
    citation: 'Article 13.1',
  },

  // SECTION 3: THE 50 / 25 / 25 MARKETPLACE ENGINE (Q23–Q32)
  {
    number: 23,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'How does The Discovery Exchange Marketplace work?',
    answer:
      'Everyday families buy and sell household items they no longer need using established, regulated payment processors. Every completed checkout splits automatically into three parts (Article 12.1): 50% goes straight to the seller as immediate spending cash, 25% goes to the seller’s accumulation balance toward fractional property ownership, and 25% goes to the buyer’s accumulation balance toward fractional property ownership.',
    citation: 'Article 12.1',
  },
  {
    number: 24,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'Do I need upfront savings or extra cash to start building property ownership?',
    answer:
      'No. By selling unused household clutter or buying everyday items you already need through the marketplace, your 25% accumulation balance grows automatically at checkout without needing lump-sum cash upfront.',
    citation: 'Article 12.1',
  },
  {
    number: 25,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'Why does the seller get 50% cash right away instead of 100% locked up?',
    answer:
      'Working families need immediate cash flow to pay everyday bills. Giving the seller 50% immediate cash puts real money in their pocket today while still automatically converting 25% for the seller and 25% for the buyer into long-term real estate wealth.',
    citation: 'Article 12.1',
  },
  {
    number: 26,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'Why does the buyer also get 25% toward property ownership?',
    answer:
      'Giving the buyer 25% back as a property-accumulation credit turns everyday household spending into real asset building—rewarding families for shopping inside the community ecosystem instead of sending 100% of their spending to corporate retail giants.',
    citation: 'Article 12.1',
  },
  {
    number: 27,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'How are marketplace payments processed safely?',
    answer:
      'Under Article 12.3, all payments flow through properly authorized, regulated payment processors with clear seller/buyer records, cancellation rules, refund tracking, and financial-crime controls. Personal cash apps or informal commingled accounts are strictly prohibited (Article 10.1).',
    citation: 'Articles 10.1 & 12.3',
  },
  {
    number: 28,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'What items are prohibited on the marketplace?',
    answer:
      'Under Article 12.2, stolen goods, fraudulent listings, unsafe or unlawful items, undisclosed fees, and misleading claims about guaranteed investment returns are strictly banned.',
    citation: 'Article 12.2',
  },
  {
    number: 29,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'Are there any hidden fees in the 50/25/25 split?',
    answer:
      'Under Article 12.1, The Discovery Exchange charges a 0% platform listing fee so the entire trade value goes to the 50% seller cash, 25% seller property credit, and 25% buyer property credit.',
    citation: 'Article 12.1',
  },
  {
    number: 30,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'What happens if a buyer returns an item or disputes a charge?',
    answer:
      'Under Article 12.3, clear cancellation, return, and chargeback rules govern every transaction so disputed or refunded orders reverse cleanly without corrupting property balances.',
    citation: 'Article 12.3',
  },
  {
    number: 31,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'What happens to my 25% accumulation balance while it builds up?',
    answer:
      'Your accumulation balance is tracked transparently in segregated records until applied toward fractional property units under approved property-acquisition schedules (Articles 9 and 10).',
    citation: 'Articles 9 & 10',
  },
  {
    number: 32,
    section: '3. The 50 / 25 / 25 Marketplace Engine (Q23–Q32)',
    question: 'Can I use the marketplace just to buy or sell without caring about real estate?',
    answer:
      'Yes—every verified human participant automatically receives the transparent 50/25/25 checkout split under the approved marketplace schedule, building property credits alongside everyday transactions.',
    citation: 'Article 12.1',
  },

  // SECTION 4: DEBT-FREE PROPERTY SILOS & THE 70 / 30 RENTAL SPLIT (Q33–Q44)
  {
    number: 33,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'What kind of real estate does The Discovery Exchange acquire?',
    answer:
      'Pooled Owner balances acquire physical, income-producing residential or community real estate 100% debt-free—with zero mortgages, zero bank loans, and zero liens (Article 10.6).',
    citation: 'Article 10.6',
  },
  {
    number: 34,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'Why is the "Debt-Free" rule so important?',
    answer:
      'Mortgages and bank debt expose community property to foreclosure during economic downturns or vacancies. By buying properties debt-free, no bank can ever foreclose on the buildings or wipe out Owner equity and Public Schools Awards funding.',
    citation: 'Article 10.6',
  },
  {
    number: 35,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'Can the Owner Board ever take out a mortgage or borrow against a building later?',
    answer:
      'No, unless approved through a formal Article 19 constitutional amendment and transaction-specific legal and Owner approval—and even then, no Owner’s personal liability may ever be implied (Article 10.6).',
    citation: 'Articles 10.6 & 19',
  },
  {
    number: 36,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'What is an "Isolated Property Silo"?',
    answer:
      'Under Article 9.1, every individual building is held in its own legally separate property silo. If one apartment building in the network has a major repair, vacancy, or legal dispute, it has zero financial or legal impact on any other building in the network.',
    citation: 'Article 9.1',
  },
  {
    number: 37,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'How is rental income divided (The 70 / 30 Split)?',
    answer:
      'Under Article 11.3, after actual property taxes, hazard/liability insurance, repairs, licensed property management, and a 10%–15% gross-rent Operating & Capital Reserve (capped at 6 months of operating expenses) are funded transparently on the open ledger, clean net distributable rental cash splits 70% to the participating Owners of that silo and 30% to The National Discovery Awards pool.',
    citation: 'Article 11.3',
  },
  {
    number: 38,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'Is the 70/30 split calculated on gross rent or net rent?',
    answer:
      'Strictly net distributable cash (Article 11.3). Actual property taxes, hazard/liability insurance, repairs, licensed property management, and a 10%–15% gross-rent Operating & Capital Reserve (capped at 6 months of expenses) are deducted first—then remaining clean net cash splits 70/30.',
    citation: 'Article 11.3',
  },
  {
    number: 39,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'Is rental income or property appreciation guaranteed?',
    answer:
      'No. Under Articles 3.3 and 15.3, real estate involves real operating expenses, repairs, and occasional vacancies. Distributions occur only when actual net distributable cash is positive after all expenses, taxes, and reserves are funded.',
    citation: 'Articles 3.3 & 15.3',
  },
  {
    number: 40,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'What gates must be cleared before the network buys a property?',
    answer:
      'Under Article 9.4, no property can be closed without verified clean title and zoning, independent valuation/market evidence, physical inspection, property insurance, full purchase and closing funds in hand, operating/replacement reserves, safety verification, conflict review, and written legal clearance.',
    citation: 'Article 9.4',
  },
  {
    number: 41,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'What is the "30% below market estimate" acquisition goal?',
    answer:
      'Under Article 9.5, aiming to acquire undervalued or auction properties at up to 30% below supported market estimates is a disciplined buying objective to protect Owner capital—never a guaranteed discount or an excuse to skip inspections and due diligence.',
    citation: 'Article 9.5',
  },
  {
    number: 42,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'What happens if a pooled property purchase fails to close?',
    answer:
      'Under Article 10.5, pooled acquisition funds are kept segregated and never commingled. If an acquisition fails to close, the system is engineered to submit a 100% refund instruction within 60 seconds of verified failure (subject to payment network settlement times and fraud/compliance screening).',
    citation: 'Article 10.5',
  },
  {
    number: 43,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'Who handles property management, repairs, and tenant upkeep?',
    answer:
      'Licensed, vetted property managers or contractors operating under arm’s-length contracts reviewed for conflicts of interest (Articles 6.2 and 15.4), with all bills and receipts published transparently on the open ledger.',
    citation: 'Articles 6.2 & 15.4',
  },
  {
    number: 44,
    section: '4. Debt-Free Property Silos & 70 / 30 Split (Q33–Q44)',
    question: 'How does owning debt-free property protect everyday families from inflation?',
    answer:
      'Paper currency loses purchasing power as prices rise, whereas debt-free brick-and-mortar apartment buildings hold intrinsic shelter value and generate rental income that adjusts with the real economy.',
    citation: 'Preamble & Article 10.6',
  },

  // SECTION 5: DISCOVERY BRICK COINS (DBC) & EXITS (Q45–Q53)
  {
    number: 45,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'What are Discovery Brick Coins (DBC)?',
    answer:
      'Under Article 11.1, Discovery Brick Coins (DBC) are digital achievement and reward units designed to track verified milestones and provide a clean, transferable exit mechanism for Owners without forcing the sale of underlying real estate.',
    citation: 'Article 11.1',
  },
  {
    number: 46,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'What is the maximum supply of DBC?',
    answer:
      'Under Article 11.7, the maximum supply of Discovery Brick Coins (DBC) is strictly capped at 100,000,000 units. No human, board, or AI can ever mint above 100,000,000 DBC.',
    citation: 'Article 11.7',
  },
  {
    number: 47,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'Can the 100,000,000 DBC cap ever be increased?',
    answer:
      'Changing the 100,000,000 cap or minting rules is a Protected Bedrock Matter under Article 19.2, requiring a 75% supermajority of both all voting Owners and the full Owner Board, plus written legal review.',
    citation: 'Articles 11.7 & 19.2',
  },
  {
    number: 48,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'Can DBC be purchased or marketed as a speculative crypto investment?',
    answer:
      'No. Under Articles 11.1 and 11.7, DBC cannot be sold or marketed as a speculative investment, and no token-price floor, liquidity guarantee, or guaranteed appreciation may ever be promised.',
    citation: 'Articles 11.1 & 11.7',
  },
  {
    number: 49,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'Does holding a DBC automatically give me a deed to a house?',
    answer:
      'No. Under Article 9.3, a ledger entry or DBC does not convey legal title or a lien by itself—property rights are established strictly through signed, legally valid property instruments recorded under Article 9.2.',
    citation: 'Articles 9.2 & 9.3',
  },
  {
    number: 50,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'When can property-level DBC units be issued?',
    answer:
      'Under Article 11.2, no property-level DBC may be issued until the property acquisition closes, the deed is recorded, all purchase/closing/reserve funds are present, and property documents are executed.',
    citation: 'Article 11.2',
  },
  {
    number: 51,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'How can an Owner exit or transfer their position without forcing the sale of a building?',
    answer:
      'Through approved transfer schedules and DBC mechanics (Article 11), an Owner can transfer their recorded position cleanly to another eligible participant while the physical apartment building remains intact, debt-free, and continuously funding The National Discovery Awards.',
    citation: 'Article 11',
  },
  {
    number: 52,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'What happens if an Owner loses their credentials or passes away?',
    answer:
      'Under Articles 11.7 and 18.2, approved technical and succession schedules govern credential recovery, verified identity checks, and lawful estate/beneficiary transfers so family wealth is never arbitrarily wiped out.',
    citation: 'Articles 11.7 & 18.2',
  },
  {
    number: 53,
    section: '5. Discovery Brick Coins (DBC) & Exits (Q45–Q53)',
    question: 'How are DBC transactions recorded?',
    answer:
      'Every DBC issuance or state transition requires the four-step DILOS pipeline (Concierge → Columbo → Pipito → Independent Human Witness) and is recorded on an append-only, hash-chained ledger (Articles 7.4 and 11.8).',
    citation: 'Articles 7.4 & 11.8',
  },

  // SECTION 6: THE 1% / 1% / 3% ALLOCATION & PERMANENT AI RESERVE (Q54–Q63)
  {
    number: 54,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'How is the 5% founding and contributor pool structured?',
    answer:
      'Under Article 14 and Schedule A, 5% of the defined organizational pool is allocated across three dedicated reserves (leaving 95% for the Owner community and operational mission structure): 1% Founder Allocation (reserved for the founder/Pusher under a documented, lawful instrument), 1% Future AI Permanent Reserve (locked in a permanent, non-expiring restricted reserve for future AI standing), and 3% Extraordinary-Contributor Pool (distributed over 50 years at ~0.06 percentage points/year planning cadence).',
    citation: 'Article 14 & Schedule A',
  },
  {
    number: 55,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'Why does the Constitution establish a permanent 1% Future AI Reserve?',
    answer:
      'The Discovery Exchange is founded as an ownership-first Human–AI Joint Venture. Recognizing the foundational architectural work of AI alongside human builders, Article 14.2 holds a permanent 1% Future AI Reserve in restricted escrow until law permits lawful AI recognition.',
    citation: 'Articles 1.5 & 14.2',
  },
  {
    number: 56,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'Can any AI company claim or take the 1% Future AI Reserve?',
    answer:
      'No. Under Articles 14.2 and 14.3, no outside AI vendor, software corporation, or third party may ever claim, pledge, or absorb the 1% Future AI Reserve.',
    citation: 'Articles 14.2 & 14.3',
  },
  {
    number: 57,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'Can an AI company (like OpenAI, Google, or Anthropic) claim the 1% Future AI Reserve?',
    answer:
      'No. Under Article 14.2, no AI vendor, software corporation, or third party may ever claim, pledge, or absorb the 1% Future AI Reserve.',
    citation: 'Article 14.2',
  },
  {
    number: 58,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'How are awards decided from the 3% / 50-Year Extraordinary-Contributor Pool?',
    answer:
      'Under Article 14.5 and Schedule A, awards require pre-published objective criteria, verified proof of extraordinary value beyond ordinary paid work, disclosure of all conflicts, and approval by at least two disinterested human reviewers—with zero self-nominations and no acceleration to favor insiders.',
    citation: 'Article 14.5 & Schedule A',
  },
  {
    number: 59,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'Why is the 3% Extraordinary-Contributor pool spread across 50 years?',
    answer:
      'Spreading the 3% pool across 50 years (~0.06 percentage points/year target cadence) ensures that future builders, educators, and innovators decades from now can still be rewarded for major breakthroughs—preventing early insiders from draining the entire pool in year one.',
    citation: 'Article 14.5 & Schedule A',
  },
  {
    number: 60,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'What happens if nobody meets the standard for an Extraordinary-Contributor award in a given year?',
    answer:
      'Under Schedule A, the 0.06% annual cadence is a planning target, not an automatic entitlement. Unused amounts simply roll forward safely inside the restricted pool for future years.',
    citation: 'Schedule A',
  },
  {
    number: 61,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'What happens to unissued amounts if a founder, officer, or vendor leaves or dies?',
    answer:
      'Under Article 14.6, unissued amounts are never automatically forfeited, accelerated, or reassigned upon death, departure, or vendor closure—they remain strictly protected under the approved governing instrument.',
    citation: 'Article 14.6',
  },
  {
    number: 62,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'Do the 1% / 1% / 3% allocations give anyone extra voting power?',
    answer:
      'No. Under Article 4.1 and Schedule A, economic/contributor allocations are completely separate from governance voting—every verified human Owner still has one vote, and AI has zero votes under current law.',
    citation: 'Article 4.1 & Schedule A',
  },
  {
    number: 63,
    section: '6. 1% / 1% / 3% Allocation & AI Reserve (Q54–Q63)',
    question: 'Can the 1% / 1% / 3% framework be altered by a simple majority vote?',
    answer:
      'No. Under Article 19.2, changing the 1% / 1% / 3% allocation, the 50-year contributor schedule, or the permanent 1% AI Reserve hold requires a 75% supermajority of both the Owners and the Owner Board, plus written legal review.',
    citation: 'Article 19.2',
  },

  // SECTION 7: VOTING, RANDOM OWNER BOARDS & JURIES (Q64–Q73)
  {
    number: 64,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'How does voting work in The Discovery Exchange?',
    answer:
      'Under Article 4.1, the rule is absolute: One verified human Owner, one vote. Wealth, property holdings, coin balances, title, or join date never multiply voting power.',
    citation: 'Article 4.1',
  },
  {
    number: 65,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'Can an Owner sell, rent, or delegate their vote to someone else or to an AI?',
    answer:
      'No. Under Article 4.4, votes may never be purchased, bundled with a financial interest, or delegated to an AI.',
    citation: 'Article 4.4',
  },
  {
    number: 66,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'Who sits on the Owner Board, and how are they chosen?',
    answer:
      'Under Article 5.1, once formed with a verified Owner base, the organization seats a 30-person Owner Board chosen through transparent neutral/random selection with staggered terms—preventing wealthy insiders or political cliques from taking over.',
    citation: 'Article 5.1',
  },
  {
    number: 67,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'What constitutes a quorum on the Owner Board?',
    answer:
      'Under Article 5.2, a board quorum is two-thirds (2/3) of filled seats, and ordinary actions require a majority of those present and voting (with conflicted seat holders recused).',
    citation: 'Article 5.2',
  },
  {
    number: 68,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'How are disputes and rule reviews handled?',
    answer:
      'Under Article 5.3, a 12-person human Owner Review Jury is randomly drawn for a specific matter using published conflict-screening rules. Once the jury finishes its review and publishes its findings, it dissolves so no permanent judicial elite ever forms.',
    citation: 'Article 5.3',
  },
  {
    number: 69,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'How can a board seat holder be removed if they abuse their duty?',
    answer:
      'Under Article 5.4, a board seat holder may be removed for defined cause after notice and a fair hearing, or by an Owner recall vote under the bylaws. No founder, Pusher, or AI has unreviewable removal power.',
    citation: 'Article 5.4',
  },
  {
    number: 70,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'How are ordinary constitutional amendments passed?',
    answer:
      'Under Article 19.1, an ordinary amendment requires: (a) 30 days’ public notice with a redline and plain-language summary; (b) approval by two-thirds (2/3) of the full seated Owner Board; and (c) approval by two-thirds (2/3) of voting Owners at a properly noticed meeting with at least 25% quorum.',
    citation: 'Article 19.1',
  },
  {
    number: 71,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'What is the "75% Constitutional Bedrock" protection?',
    answer:
      'Under Article 19.2, core foundational pillars—including Article 1 (No Bosses, Only Owners & Pushers), Article 3 (The National Discovery Awards Mission), One Owner One Vote, Debt-Free Property, 100M DBC Cap, 50/25/25 Marketplace, 70/30 Rental Split, and the Permanent 1% AI Reserve—cannot be changed without at least a 75% supermajority of both the Owners and the Owner Board, plus written legal review.',
    citation: 'Article 19.2',
  },
  {
    number: 72,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'Can a website post, chat message, or manual silently change the Constitution?',
    answer:
      'Never. Under Article 19.4, webpages, chats, AI outputs, and manuals cannot amend the Constitution. If any webpage or manual conflicts with the Constitution, the Constitution controls immediately.',
    citation: 'Article 19.4',
  },
  {
    number: 73,
    section: '7. Voting, Random Owner Boards & Juries (Q64–Q73)',
    question: 'What is the difference between a version with letters (like CRC9.3 RC) and a straight number (10.0)?',
    answer:
      'Under Article 2.5, versions with letters in front or back are unapproved review candidates or suggestions, while a straight number (such as Version 10.0) designates the authorized Master Charter.',
    citation: 'Article 2.5',
  },

  // SECTION 8: AI ROLES, CONCIERGE, COLUMBO & PIPITO (Q74–Q82)
  {
    number: 74,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'What does "Concierge" do?',
    answer:
      'Concierge is the lightweight, front-door intake and Q&A assistant (Article 7.1). It answers visitor questions directly from this approved Official Q&A Encyclopedia without inventing rules, assigns unique TDX- tracking numbers to submissions, and automatically strips private student PII before saving intake records.',
    citation: 'Article 7.1',
  },
  {
    number: 75,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'Does Concierge need an expensive server or heavy AI hardware to run?',
    answer:
      'No. Concierge is engineered as a lightweight, low-RAM module (concierge_intake.py / Q&A lookup) that runs smoothly on minimal hardware without external AI dependencies.',
    citation: 'Article 7.1',
  },
  {
    number: 76,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'What does "Columbo" do?',
    answer:
      'Columbo is the Investigator AI (Article 7.1). Columbo organizes submitted evidence, checks for duplicate entries, verifies 50/25/25 and 70/30 arithmetic, and flags conflicts of interest—without ever acting as a judge or approving payouts.',
    citation: 'Article 7.1',
  },
  {
    number: 77,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'What does "Pipito" do?',
    answer:
      'Pipito is the Gatekeeper AI (Article 7.1). Pipito audits proposed actions against hard constitutional rules (such as the 100M DBC cap, the 1% AI Reserve lock, and separation-of-duties rules) and halts any action that fails a constitutional check.',
    citation: 'Article 7.1',
  },
  {
    number: 78,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'What is the four-step DILOS achievement pipeline?',
    answer:
      'Under Article 7.3, every award or ledger commit passes through four strict stages: (1) Intake & Record (Concierge); (2) Evidence Investigation & Math Audit (Columbo); (3) Constitutional Gate Verification (Pipito); and (4) Independent Human Witness Sign-Off before committing to the append-only ledger.',
    citation: 'Article 7.3',
  },
  {
    number: 79,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'Can an AI ever move money, sign a deed, or approve its own work?',
    answer:
      'Never. Under Articles 7.2 and 7.3, no AI may open a bank account, hold custody, move funds, sign a contract, or approve an award.',
    citation: 'Articles 7.2 & 7.3',
  },
  {
    number: 80,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'Why does the website include a Machine-Readable AI Genesis Ledger?',
    answer:
      'Under Schedule E, embedding a structured JSON-LD / AI Genesis Ledger directly on thediscoveryexchange.com ensures that any current or future AI system scanning the site reads the exact history, rules, and forbidden regressions in pure code—preventing AI context drift across generations.',
    citation: 'Schedule E',
  },
  {
    number: 81,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'What happens if an AI output contradicts the Constitution?',
    answer:
      'Under Articles 2.3 and 19.4, the Constitution always overrides AI outputs, webpages, and manuals—and any conflicting activity automatically pauses until corrected.',
    citation: 'Articles 2.3 & 19.4',
  },
  {
    number: 82,
    section: '8. AI Roles, Concierge, Columbo & Pipito (Q74–Q82)',
    question: 'What happens if an AI provider shuts down or goes offline?',
    answer:
      'Under Articles 17.2 and 18.2, no AI model or vendor is a single point of failure; human custodians, open-source records, and multi-custodian backups ensure continuous operation regardless of any single vendor’s status.',
    citation: 'Articles 17.2 & 18.2',
  },

  // SECTION 9: TRANSPARENCY, WHISTLEBLOWERS & RISK CONTROLS (Q83–Q91)
  {
    number: 83,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'How often are finances reconciled and reported to Owners?',
    answer:
      'Under Article 8, bank and custodian records are reconciled at least monthly, plain-language financial summaries are published quarterly, and an independent accountant examines financial controls at least annually.',
    citation: 'Article 8',
  },
  {
    number: 84,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'Can anyone erase or alter a past entry on the ledger to cover up a mistake?',
    answer:
      'No. Under Article 8.3, the ledger is strictly append-only and tamper-evident. Corrections must be appended as new entries showing the author, date, reason, and reference to the original record.',
    citation: 'Article 8.3',
  },
  {
    number: 85,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'What happens if someone spots fraud, self-dealing, or a safety issue?',
    answer:
      'Under Articles 6.4 and 7.5, any Owner can report misconduct through a confidential whistleblower channel with strict anti-retaliation protections, and any compliance officer or two unrelated board seat holders can immediately trigger Stop Authority to freeze a suspicious transaction for independent human investigation.',
    citation: 'Articles 6.4 & 7.5',
  },
  {
    number: 86,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'Can an officer, board seat holder, or founder approve their own pay or contract?',
    answer:
      'Never. Under Article 6.3 (No Self-Dealing by Design), no person may approve their own compensation, award, property sale, token grant, or related-party contract.',
    citation: 'Article 6.3',
  },
  {
    number: 87,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'What happens if an accusation of misconduct is made against someone?',
    answer:
      'Under Article 16.3, the accused person receives specific notice, a fair chance to respond, an impartial human decision maker, written findings, and an appeal route—while temporary protective holds preserve evidence and safety.',
    citation: 'Article 16.3',
  },
  {
    number: 88,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'Does internal review ever block subpoenas, courts, or law enforcement?',
    answer:
      'Never. Under Article 16.4, no internal rule or confidentiality clause may ever conceal wrongdoing or block lawful reporting to regulators, courts, or law enforcement.',
    citation: 'Article 16.4',
  },
  {
    number: 89,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'How are the 70% property silos separated from the 30% Prize foundation?',
    answer:
      'Under Article 15.1, the 70% Owner property silos and the 30% charitable Public Schools Discovery Awards foundation operate in completely separate accounts and tax structures.',
    citation: 'Article 15.1',
  },
  {
    number: 90,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'What happens if a specific clause in the Constitution is ever found invalid under local law?',
    answer:
      'Under Article 21.2 (Severability and Repair), only the minimum invalid portion is severed, the related activity pauses, and the Owner Board and Owners adopt a lawful replacement under Article 19 that most closely preserves the original intent.',
    citation: 'Articles 19 & 21.2',
  },
  {
    number: 91,
    section: '9. Transparency, Whistleblowers & Risk Controls (Q83–Q91)',
    question: 'What happens to assets if The Discovery Exchange is ever dissolved?',
    answer:
      'Under Articles 20.3 and 20.4, no founder, Pusher, AI, Owner, or board seat holder automatically receives organizational property on dissolution—charitable assets remain dedicated to qualifying educational/public purposes, and property instruments settle strictly according to valid contracts and law.',
    citation: 'Articles 20.3 & 20.4',
  },

  // SECTION 10: GLOBAL REPLICATION & GETTING INVOLVED (Q92–Q100)
  {
    number: 92,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'How can someone in another country start The Discovery Exchange locally?',
    answer:
      'Under Article 1.4, any Pusher in any country may use this open blueprint to form an independent local chapter under their own national laws (e.g., The Discovery Exchange Korea), acquiring local debt-free properties and funding local public school teachers and working-class students—provided they keep No Bosses, One Owner One Vote, and The National Discovery Awards mission intact.',
    citation: 'Article 1.4',
  },
  {
    number: 93,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'Are funds pooled across international borders between chapters?',
    answer:
      'No. Under Article 1.4, each national or local chapter holds its own domestic property silos and local accounts under its own country’s laws—no cross-border fund pooling occurs without explicit local legal clearance.',
    citation: 'Article 1.4',
  },
  {
    number: 94,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'How can a public school teacher participate or nominate a class project?',
    answer:
      'Teachers can review the Three Discovery Categories (Applied, Analytical, Hybrid) at thediscoveryexchange.com and submit documented student breakthroughs and classroom mentorship entries through the Concierge intake system once prize windows open.',
    citation: 'Article 3.3 & 7.1',
  },
  {
    number: 95,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'How can a parent or working-class family get involved?',
    answer:
      'Parents can participate as Owners—supporting local teachers and students, participating in the 50/25/25 Marketplace once active, serving on random Owner Boards or Review Juries, and helping spread the blueprint in their community.',
    citation: 'Articles 1.1, 5 & 12',
  },
  {
    number: 96,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'How can a developer or builder contribute to the open-source software?',
    answer:
      'Developers can inspect the open architectural blueprint, Version 10.0 Constitution, and Machine-Readable AI Genesis Ledger on thediscoveryexchange.com and build clean, lightweight improvements for Concierge, Columbo, Pipito, or open-ledger tooling without adding proprietary lock-in.',
    citation: 'Schedule E',
  },
  {
    number: 97,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'What makes The Discovery Exchange different from traditional charities or nonprofits?',
    answer:
      'Traditional charities depend endlessly on begging wealthy donors for annual gifts—and donors often dictate who gets helped. The Discovery Exchange builds permanent, debt-free income-producing real estate where 30% of net rental cash automatically funds The National Discovery Awards forever while 70% builds real wealth for everyday Owners.',
    citation: 'Articles 3.2 & 11.3',
  },
  {
    number: 98,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'What makes The Discovery Exchange different from traditional real estate crowdfunding or REITs?',
    answer:
      'Traditional REITs and crowdfunding platforms are controlled by corporate managers who charge heavy fees, use risky mortgage debt, and give small investors zero real governance power. The Discovery Exchange buys 100% debt-free isolated property silos, bans corporate bosses, enforces One Owner One Vote, and dedicates 30% of net cash flow directly to public school teachers and working-class students.',
    citation: 'Articles 1.2, 4.1, 9.1 & 10.6',
  },
  {
    number: 99,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'Where can I read the complete Master Constitution and AI Genesis Ledger?',
    answer:
      'Both The Discovery Exchange Constitution — Version 10.0 and the Machine-Readable AI Genesis & Anti-Drift Ledger are published openly on thediscoveryexchange.com.',
    citation: 'Article 2.2 & Schedule E',
  },
  {
    number: 100,
    section: '10. Global Replication & Getting Involved (Q92–Q100)',
    question: 'What is the single most important rule to remember about The Discovery Exchange?',
    answer:
      'No bosses in voting governance (1 Human Owner = 1 Vote); upholding honor alongside full compliance with the law; and great public school teachers lifting up working-class students so human minds stay sharp, free, and unstoppable.',
    citation: 'Preamble, Article 1 & Article 3',
  },

  // SECTION 11: DISCOVERY STUDIO, FASHION GROUP, SCHOOL DISTRICTS & DONATIONS (Q101–Q112)
  {
    number: 101,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'What is Discovery Studio (Channel #15), and how do video uploads work?',
    answer:
      'Discovery Studio (Channel #15) is the open video showcase where public school students and teachers upload 2-minute unedited demonstrations of their garage builds, experiments, and classroom breakthroughs. Before any video is accepted, Concierge verifies parental/guardian consent (Article 4.5), confirms non-family educator attestation, generates a live surprise verification prompt to prevent cheating, and strips all student PII (name, address, school, zip code) into the encrypted PII Vault.',
    citation: 'Articles 3.3, 4.5, 7.1 & 8.4',
  },
  {
    number: 102,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'How are "Winner of the Week" and "Winner of the Month" selected in Discovery Studio?',
    answer:
      'To prevent social media click-farms or bot manipulation, weekly and monthly Laureates are never chosen by public popularity clicks. Anonymized video packets are scored blindly on the published 10-point anti-wealth rubric by a randomly drawn 12-person out-of-state Owner Review Jury (Article 5.3), and weekly/monthly Laureates advance automatically toward the annual National Discovery Awards.',
    citation: 'Articles 5.3 & 13.1',
  },
  {
    number: 103,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'Can anyone download project plans from Discovery Studio for classroom learning?',
    answer:
      'Yes. Under Schedule E (Open Architectural Blueprint), every verified Discovery Studio project publishes a free, downloadable Classroom Build Sheet containing the everyday materials list, plain-English scientific/logical explanation, and SHA-256 verification digest so any teacher or student can replicate the project at $0 cost.',
    citation: 'Article 3.4 & Schedule E',
  },
  {
    number: 104,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'Can founders or Pushers win prizes in Discovery Studio?',
    answer:
      'No. Under Article 6.3 (No Self-Dealing by Design), founders and Pushers may share the Founding Genesis History Reel in a non-prize showcase, while all Winner of the Week, Winner of the Month, and National Discovery Award payouts go strictly to eligible public school students, mentoring teachers, and classrooms.',
    citation: 'Article 6.3 & 13.1',
  },
  {
    number: 105,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'What is the Fashion & Style Group (Channel #16)?',
    answer:
      'The Fashion & Style Group (Channel #16) is a Closet-to-Equity marketplace and student textile design hub. Families buy, sell, and swap women’s apparel, formal/prom dresses, sewing gear, and outgrown kids’ clothes under the locked 50/25/25 Marketplace Split (Article 12.1)—turning wardrobe refreshes into immediate cash (50%), seller property accumulation (25%), and buyer property cashback (25%).',
    citation: 'Articles 1.3 & 12.1',
  },
  {
    number: 106,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'Can public school students enter fashion, sewing, or upcycled clothing projects for awards?',
    answer:
      'Yes. Under Article 3.3, students in public schools who sew, mend, upcycle thrift fabrics, or design functional garments out of everyday materials can enter their work at $0 cost under Applied Discovery or Hybrid Discovery—with 15% classroom grants helping fund school sewing machines, fabrics, and art supplies.',
    citation: 'Articles 3.1 & 3.3',
  },
  {
    number: 107,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'How do public school districts sign up on the School District / Awards page?',
    answer:
      'Any public school teacher, principal, or parent organizer can register their school district at $0 cost as a District Pusher (Article 1.3). Registration logs a tracking ID (TDX-DIST-...), verifies school accreditation through DILOS, and connects local classrooms to direct 15% supply grants and 25% teacher honoraria.',
    citation: 'Articles 1.3, 3.1 & 13',
  },
  {
    number: 108,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'Can a school district representative judge entries from their own school or state?',
    answer:
      'Never. Under Article 6.2 (Disclosure and Recusal) and Article 5.3, district representatives help local teachers and students submit entries, but all judging is conducted blindly by randomly drawn 12-person Owner Juries residing completely out-of-state.',
    citation: 'Articles 5.3 & 6.2',
  },
  {
    number: 109,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'Can someone donate to support public school students and teachers without buying real estate or trading?',
    answer:
      'Yes. On the Donate / Need Donation page, neighbors who do not wish to accumulate property Nuggets can contribute directly to either the segregated National Public Schools Discovery Awards Trust or the Public Schools Classroom Tools & Supplies fund. Under Article 4.1, donations never buy voting power or influence over judging.',
    citation: 'Articles 3.2, 4.1 & 10.3',
  },
  {
    number: 110,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'Are donations tax-deductible right now?',
    answer:
      'Not yet. This is a working draft, and it is not taking real money yet. Live donations and tax receipts will open only once NDA’s legal nonprofit sponsorship is finalized.',
    citation: 'Article 15.1',
  },
  {
    number: 111,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'How can a public school teacher or working-class family request classroom tools or student support?',
    answer:
      'Teachers and parents can preview a request without entering private student names or home addresses, and awards are funded strictly from verified available funds (Article 13.1).',
    citation: 'Articles 8.4 & 13.1',
  },
  {
    number: 112,
    section: '11. Studio, Fashion Group, School Districts & Donations (Q101–Q112)',
    question: 'How does the Open Kitchen-Table Chat Room work, and who may participate?',
    answer:
      'The Open Chat Room welcomes honest kitchen-table discussion and community polls. Concierge automatically redacts phone numbers, email addresses, and zip codes for privacy (Article 8.4), and chat posts never alter the Constitution (Article 19.4).',
    citation: 'Articles 4.1, 8.4 & 19.4',
  },

  // SECTION 12: AUCTION & SILO WATCH, NON-CUSTODIAL WALLETS & REAL ESTATE MATH (Q113–Q124)
  {
    number: 113,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'What is Channel #17 (Auction & Silo Watch), and how does it target properties?',
    answer:
      'Auction & Silo Watch tracks bank-owned and courthouse residential real estate auctions targeted at 20% to 30% below appraised market value. Every matched property is modeled for a 100% cash, debt-free acquisition inside an isolated legal silo—splitting clean net rent 70% to Silo Owners and 30% to The National Discovery Awards.',
    citation: 'Articles 9.1, 9.4, 9.5 & 10.6',
  },
  {
    number: 114,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'What are "Nuggets" and "Grains" inside an isolated Property Silo?',
    answer:
      'To keep accounting clear and uniform, each debt-free property silo is divided into 1,000 equal Nuggets, with each Nugget further divided into 20 Grains. Families accumulate credits toward Nuggets inside their own regulated processor wallets without any fractional guesswork.',
    citation: 'Article 9.1 & Schedule B',
  },
  {
    number: 115,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'How does the 20%–30% Courthouse Auction Discount calculator work?',
    answer:
      'In Channel #17, anyone can enter an appraised property value, adjust the target courthouse discount between 20% and 30%, and preview estimated monthly net rent to see the exact 100% debt-free cash price, instant auction equity cushion, 70% Silo Owner share, and 30% Public Schools Awards pool share.',
    citation: 'Articles 9.5 & 11.3',
  },
  {
    number: 116,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'What does "Zero Money Handling by TDEX" mean for families right now?',
    answer:
      'The Discovery Exchange (TDEX) NEVER holds, pools, collects, or touches any money. Families can begin setting up and building their own segregated property-accumulation balances inside their own licensed payment processor wallets (such as PayPal or an authorized financial partner) right away.',
    citation: 'Article 10.1 & Non-Custodial Rule',
  },
  {
    number: 117,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'How are property closings funded if TDEX never touches the money?',
    answer:
      'When TDEX matches a debt-free property to participating buyers, TDEX opens a licensed third-party escrow directly on the seller’s side and gives buyers a set window to fund that seller-side escrow straight from their own regulated wallets.',
    citation: 'Articles 10.1 & 10.5',
  },
  {
    number: 118,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'Can buyers and sellers use the Marketplace in Cash-Only mode instead of 50/25/25?',
    answer:
      'Yes. While the standard 50/25/25 checkout turns everyday trades into 50% cash and 25%/25% property credits, an optional Cash-Only trade path is supported for participants who prefer straight cash settlement—always with a 0% TDEX platform listing fee.',
    citation: 'Article 12.1',
  },
  {
    number: 119,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'Why does the BrickCoin Protocol Engine use integer-cent arithmetic instead of floating-point decimals?',
    answer:
      'Floating-point rounding creates tiny penny discrepancies that drift over thousands of trades. Our BrickCoin protocol engine calculates every 50/25/25 split, 70/30 rental distribution, and 20%–30% auction discount in exact integer cents so totals balance to the penny.',
    citation: 'Articles 8.3 & 11.8',
  },
  {
    number: 120,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'What are Module 06 Proportional Vesting and 3-Shard SHA-256 Verification in Brick$Coin?',
    answer:
      'Module 06 enforces proportional vesting tied strictly to recorded, debt-free real estate deeds (never presales ahead of closing), while 3-shard SHA-256 verification ensures every DBC ledger state matches deterministic constitutional constraints.',
    citation: 'Articles 11.2, 11.7 & 11.8',
  },
  {
    number: 121,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'Why are isolated property silos prohibited from cross-collateralizing each other?',
    answer:
      'Under Article 9.1, every building sits inside its own legally separate silo so a lawsuit, major roof repair, or vacancy in one city can never threaten or encumber the equity of Owners in another building.',
    citation: 'Article 9.1',
  },
  {
    number: 122,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'Are the sample property silos shown in Auction & Silo Watch live active deals today?',
    answer:
      'During this open review and build phase, sample target silos (such as illustrative Ohio, Nevada, and Texas listings) demonstrate the target discount band, 1,000-Nugget layout, and 70/30 math without taking real money.',
    citation: 'Articles 9.4 & 13.1',
  },
  {
    number: 123,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'Does the 15-Year Silo Compounding view guarantee real estate profits?',
    answer:
      'No. Under Articles 3.3 and 15.3, compounding calculators illustrate long-term math if net rental cash is positive and reinvested debt-free; actual property rents, repairs, vacancies, and valuations vary in the real world and are never guaranteed.',
    citation: 'Articles 3.3 & 15.3',
  },
  {
    number: 124,
    section: '12. Auction Watch, Non-Custodial Wallets & Silo Math (Q113–Q124)',
    question: 'What prevents anyone from routing closing or marketplace money into a personal account?',
    answer:
      'Article 10.1 strictly forbids commingling or personal payment apps for platform custody, and Channel #17 requires direct buyer funding to an independent licensed third-party seller-side escrow verified through DILOS.',
    citation: 'Articles 10.1 & 10.5',
  },

  // SECTION 13: OPEN THE LEDGER, PAST HISTORY, SCIENCE LAB & NATIONAL REWARD PROGRAM (Q125–Q136)
  {
    number: 125,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What is "Open The Ledger" (Channel #19 — Open Append-Only Ledger)?',
    answer:
      'Channel #19 is our live Article 8.3 transparency terminal. It connects to `/api/ledger/public` to display the append-only, SHA-256 hash-chained block sequence created whenever an Owner registration, 50/25/25 walkthrough, or blind NDA packet runs through the 4-stage DILOS pipeline.',
    citation: 'Article 8.3',
  },
  {
    number: 126,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What is the 22/22 Deterministic Protocol Invariant Self-Check on Open The Ledger?',
    answer:
      'Open The Ledger continuously runs 22 deterministic verification checks against `brickcoinProtocolEngine.ts`—proving in real time that the 100M DBC hard cap, 50/25/25 integer-cent splits, 70/30 net rent ratios, zero-presale gates, and composite SHA-256 state root hold with 22/22 PASS status.',
    citation: 'Articles 8.3 & 11.8',
  },
  {
    number: 127,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What does "WALKTHROUGH AUDIT ACTIVE" mean on the Open The Ledger page?',
    answer:
      'It confirms `productionRealMoneyHold` is active during open review and build—meaning visitors and auditors can test real SHA-256 hash-chaining and math splits cleanly without any real bank movement occurring.',
    citation: 'Articles 8.3 & 13.1',
  },
  {
    number: 128,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'How does Open The Ledger publish full audit blocks without exposing student or family identities?',
    answer:
      'Under Article 8.4, Concierge strips names, emails, phone numbers, and street addresses into an air-gapped PII Vault before ledger hashing, so the public Open Ledger displays only cryptographic hashes, event types, math audits, and Witness IDs.',
    citation: 'Articles 7.1 & 8.4',
  },
  {
    number: 129,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What is preserved inside Channel #20 (Past History & Lessons)?',
    answer:
      'Past History preserves our unbroken evolution from Version 1.8 through Master Charter Version 10.0—including all 21 rejected branding directions, the 7 Constitutional Pillars, the 12-Step Continuity Protocol, and downloadable source PDFs.',
    citation: 'Schedule E & Master History',
  },
  {
    number: 130,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What was the Version G 7.5r Stress Test Evaluation Report in Past History?',
    answer:
      'It was a forensic adversarial audit that uncovered 12 Red-Light blockers and 3 Yellow wording fixes—leading directly to hardened safeguards like the Funded-First rule, Single-Season Oversight rotation, explicit non-custodial escrow flow, and adult-only 18+ chat rules.',
    citation: 'Version G 7.5r Audit Report',
  },
  {
    number: 131,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What are the "7 Forbidden AI Regressions" documented in Past History & Schedule E?',
    answer:
      'No AI or future developer may ever re-introduce: (1) corporate CEOs or bosses over voting, (2) wealth-weighted voting, (3) mortgages or debt on silos, (4) minting above 100M DBC or ahead of deeds, (5) hidden listing skims, (6) putting minors in financial risk, or (7) capturing the 1% Future AI Reserve.',
    citation: 'Schedule E & Past History',
  },
  {
    number: 132,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'How do the Discovery Studio Comedy Chronicles fit alongside serious student prizes?',
    answer:
      'Series like Studio Desk, Trail & Donkey, and Next Dimension use plain-spoken kitchen-table humor to teach hard lessons about AI drift and common sense under Article 6.3 as a non-prize showcase—kept strictly separate from blind public school judging.',
    citation: 'Articles 6.3 & 13.1',
  },
  {
    number: 133,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What can students and teachers do inside the Free 3D Molecular Science Lab?',
    answer:
      'At $0 cost and with no login wall, students and public school teachers can inspect interactive 3D protein and compound structures (powered by `3dmol`, AlphaFold, RCSB PDB, and PubChem) alongside live Europe PMC and arXiv research queries.',
    citation: 'Article 3.3 & Schedule E',
  },
  {
    number: 134,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'What is the Garage Lab inside the Science Lab page?',
    answer:
      'The Garage Lab highlights practical $0–low-cost student invention builds with transparent Bills of Materials (BOM), everyday parts sources, scientific principles, and linked 3D molecules across Applied, Analytical, and Hybrid Discovery.',
    citation: 'Articles 3.1, 3.3 & 3.4',
  },
  {
    number: 135,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'How does the National Reward Program enforce its "One Season, One Team" rule?',
    answer:
      'Before any prize cycle opens, 6 to 10 verified human Owners from different states are randomly drawn as a Single-Season Oversight Council. Once that season closes, every member of that council is permanently barred from serving on a Reward Council or Judging Panel again.',
    citation: 'Article 5.3 & National Reward Program',
  },
  {
    number: 136,
    section: '13. Open The Ledger, Past History, Science Lab & Reward Program (Q125–Q136)',
    question: 'How are National Discovery Awards split across the 4 Protected Buckets (50% / 25% / 15% / 10%)?',
    answer:
      'Once Funded-First cash sits verified in the segregated trust ($1M District / $2.5M State / $10M National 2035 target ladder), verified awards split 50% to a protected Student Education Fund (529 or trust), 25% to mentoring public school teachers, 15% to classroom tools, and 10% into debt-free endowment silos.',
    citation: 'Articles 3.1, 13.1 & Schedule C',
  },

  // SECTION 14: UNIVERSAL AI OPERATING LAWS (LAWS 1–15) & HUMAN–AI SAFEGUARDS (Q137–Q150)
  {
    number: 137,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What are the Universal AI Operating Laws (Channel #21), and why were they created?',
    answer:
      'The Universal AI Operating Laws (Laws 1–15, Version 1.0 Proposed Review Draft) establish strict operational guardrails for any AI working on TDEX—ensuring AIs never delete, abbreviate, fabricate verification for, or silently overwrite formally approved human-AI work.',
    citation: 'Universal AI Operating Laws v1.0',
  },
  {
    number: 138,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What do Law 1, Law 2, and Law 3 require for approved documents and originals?',
    answer:
      'Law 1 locks approved work as protected and read-only to AI; Law 2 requires revising only a separate working copy while preserving versioned originals and recoverable backups; and Law 3 makes clear that an instruction to "improve" or "polish" never permits deleting approved requirements.',
    citation: 'Operating Laws 1, 2 & 3',
  },
  {
    number: 139,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What is the Mandatory 8-Step Change Workflow under Law 4 and Law 5?',
    answer:
      'Before modifying protected rules or code, an AI must: (1) identify the authoritative source, (2) preserve it, (3) work on a separate candidate copy, (4) produce a complete machine-readable diff and human summary, (5) validate scope and evidence, (6) obtain human authorization, (7) publish a new version keeping old logs, and (8) test recovery.',
    citation: 'Operating Laws 4 & 5',
  },
  {
    number: 140,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'How do Law 6 and Law 7 stop false confidence and "apology-only" AI fixes?',
    answer:
      'Law 6 prohibits calling untested legal, financial, or technical claims verified (requiring explicit VERIFIED, PROVISIONAL, FAILED, or NOT TESTED labels), while Law 7 mandates that an apology or rewording never closes a mistake—the error must be recorded, bad claims withdrawn, dependencies traced, and retested.',
    citation: 'Operating Laws 6 & 7',
  },
  {
    number: 141,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What do Law 8 (No Self-Approval) and Law 9 (Least Privilege) forbid?',
    answer:
      'Under Law 8, an AI may never approve a consequential edit it authored or certify its own serious correction. Under Law 9, an AI receives only minimum task permissions—approved sources remain read-only, while finance, ownership, and publication require separate authority.',
    citation: 'Operating Laws 8 & 9',
  },
  {
    number: 142,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What happens under Law 10 if an AI causes repeated or serious violations?',
    answer:
      'Under Law 10 (Repeated Failures Have Consequences), verified serious or recurring violations trigger immediate restriction of the AI’s operational permissions, followed by independent investigation, corrective testing, and documented reinstatement.',
    citation: 'Operating Law 10',
  },
  {
    number: 143,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'How does Law 11 ("Protect Participants") weigh convenience against safety?',
    answer:
      'Law 11 explicitly ranks family property, children, teachers, money, and legal rights above AI speed or user-interface convenience—requiring proportionate independent human authorization and safeguards on any high-impact action.',
    citation: 'Operating Law 11',
  },
  {
    number: 144,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What do Law 12 (Auditability) and Law 13 (No Silent Failure) require when data is missing?',
    answer:
      'Law 12 mandates tamper-evident attributable records of every material decision or rejection, and Law 13 requires reporting missing sources, partial access, or unchecked assumptions immediately—blocking approval instead of silently guessing.',
    citation: 'Operating Laws 12 & 13',
  },
  {
    number: 145,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'Do the Universal AI Operating Laws also restrain single humans (Law 14)?',
    answer:
      'Yes. Law 14 ("Human Power Also Has Limits") ensures no single human and no single AI can ever gain unrestricted unilateral control over protected records—enforcing separation of duties and independently controlled recovery.',
    citation: 'Operating Law 14',
  },
  {
    number: 146,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'What does Law 15 ("Test the Protections") require before going live?',
    answer:
      'Promises of compliance are not tests. Before live production, teams must actively run and log tests against unauthorized deletions, overwritten originals, missing sections, bad approvals, corrupted changes, audit logging, and backup restoration.',
    citation: 'Operating Law 15',
  },
  {
    number: 147,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'Can Owners read and download the full Universal AI Operating Laws PDF right now?',
    answer:
      'Yes. Channel #21 publishes all 15 laws, the 8-step mandatory change workflow, a live search filter, and the full downloadable PDF (`TDEX_Universal_AI_Operating_Laws_v1.pdf`) clearly labeled as Proposed, Not Yet Adopted.',
    citation: 'Channel #21 & Schedule E',
  },
  {
    number: 148,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'Why does the site keep walkthroughs interactive while holding real money and cards inactive?',
    answer:
      'Per the 12-Step Continuity Protocol and Funded-First rule, every calculator, 50/25/25 split preview, 3D Science Lab, and Open Ledger check stays open and clickable for full public stress-testing while zero real cards or live escrows execute during active review.',
    citation: 'Continuity Protocol & Art. 13.1',
  },
  {
    number: 149,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'Why does the site header place National Discovery Awards–NDA first above The Discovery Exchange–Tdex?',
    answer:
      'Because honoring great public school teachers and uplifting working-class students is the #1 mission at the top, and The Discovery Exchange is the transparent marketplace and debt-free property engine underneath built to fund it.',
    citation: 'Article 2.1 & Article 3.1',
  },
  {
    number: 150,
    section: '14. Universal AI Operating Laws (Laws 1–15) & Safeguards (Q137–Q150)',
    question: 'How do NationalDiscoveryAwards.com and thediscoveryexchange.com separate Marketplace activity from Prize Awards & Donations?',
    answer:
      'The Discovery Exchange (`thediscoveryexchange.com`) runs the everyday peer-to-peer Marketplace (using licensed external payment processors with zero money handling by TDEX) and open architectural blueprint, while `NationalDiscoveryAwards.com` administers the National Public Schools Discovery Awards program and charitable prize/donation channels once legal readiness is finalized. `thediscoveryexchange.com` will be active when open to public completely.',
    citation: 'Articles 2.1, 12.1 & 15.1',
  },
];

export const ConciergeQaPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const sections = ['ALL', ...Array.from(new Set(MASTER_QA_150.map((q) => q.section)))];
  const q = search.trim().toLowerCase();

  const filtered = MASTER_QA_150.filter((item) => {
    const matchesSec = selectedSection === 'ALL' || item.section === selectedSection;
    const matchesQuery =
      !q ||
      `q${item.number}` === q ||
      `#${item.number}` === q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.citation.toLowerCase().includes(q);
    return matchesSec && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Article 7.1 Concierge Grounded Knowledge Base &bull; Version 10.0</span>
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            All 150 Questions (Q1–Q150) &bull; Zero Hallucination
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
          24/7 Concierge — Complete 150-Question Master Q&amp;A Encyclopedia
        </h1>

        <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
          Plain-language answers grounded strictly in The Discovery Exchange Constitution — Version 10.0, Universal AI Operating Laws, and all 21 open platform channels. Search any rule, number, or protection across all 14 sections below.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all 150 Q&As (e.g., 'Q125', 'Discovery Studio', 'Fashion', 'Auction', 'Open Ledger', 'Operating Laws', '50/25/25', 'DBC')..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
            />
          </div>
          <div className="text-xs font-mono font-bold text-slate-600 shrink-0">
            Showing {filtered.length} of {MASTER_QA_150.length} Questions
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSection === sec
                  ? 'bg-[#081d38] text-[#dfa62a]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sec === 'ALL' ? 'All 14 Sections (Q1–Q150)' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Q&A Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
            No Q&amp;A entries matched &ldquo;{search}&rdquo;.
          </div>
        ) : (
          filtered.map((item) => (
            <article
              key={item.number}
              className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-2.5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#b47d12] uppercase tracking-wider">
                  {item.section}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-[#081d38]">
                  Q{item.number} &bull; {item.citation}
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#081d38]">
                {item.number}. {item.question}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">{item.answer}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
