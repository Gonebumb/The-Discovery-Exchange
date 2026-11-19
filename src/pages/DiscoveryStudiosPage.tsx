import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Film,
  FlaskConical,
  Laugh,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react';

type StudioTab = 'reels' | 'build_sheets' | 'chronicles' | 'upload';
type ReelFilter = 'ALL' | 'Classroom Spotlight' | 'Parent & Mission' | 'Studio Shorts';
type TrackFilter = 'ALL' | 'Applied Discovery' | 'Analytical Discovery' | 'Hybrid Discovery';
type ChronicleSeries = 'ALL' | 'Studio Desk' | 'Trail & Donkey' | 'Next Dimension';

interface StudioReel {
  id: string;
  title: string;
  category: Exclude<ReelFilter, 'ALL'>;
  creator: string;
  duration: string;
  playbackRate: number;
  src: string;
  poster: string;
  summary: string;
  nonPrizeNotice?: string;
}

interface JuryLaureate {
  id: string;
  honorLabel: 'Winner of the Week' | 'Winner of the Month';
  packetId: string;
  title: string;
  division: string;
  track: Exclude<TrackFilter, 'ALL'>;
  rubricScore: string;
  juryNote: string;
  buildSheetId: string;
}

interface ClassroomBuildSheet {
  id: string;
  title: string;
  track: Exclude<TrackFilter, 'ALL'>;
  gradeBand: string;
  estimatedCost: string;
  duration: string;
  sha256Digest: string;
  materials: string[];
  scientificExplanation: string;
  classroomSteps: string[];
}

interface ComedyChronicleItem {
  id: string;
  episodeCode: string;
  title: string;
  series: Exclude<ChronicleSeries, 'ALL'>;
  image: string;
  cast: string[];
  caption: string;
  lessonNote: string;
}

interface CastMember {
  name: string;
  studioRole: string;
  constitutionalRole: string;
  motto: string;
}

interface StudioSubmissionRecord {
  trackingId: string;
  submittedAtUtc: string;
  ageDivision: string;
  track: string;
  anonymizedTitle: string;
  anonymizedSummary: string;
  materialsUsed: string;
  surprisePromptCode: string;
  surprisePromptText: string;
  videoUrl: string;
  evidenceHash: string;
  piiStatus: 'STRIPPED_BY_CONCIERGE';
  juryStatus: 'QUEUED_FOR_12_OWNER_OUT_OF_STATE_BLIND_JURY';
}

const STUDIO_REELS: StudioReel[] = [
  {
    id: 'reel-garage-future',
    title: 'From the Garage to the Future — Opening Studio Sequence',
    category: 'Classroom Spotlight',
    creator: 'Discovery Studio Collective (Non-Prize)',
    duration: '0:08',
    playbackRate: 1,
    src: '/assets/aistudio/AaHVeclBv8v6o0ndoHOuBQ-AaHVeclB9S-0S-AKzstalw__1__0e70fffa.mp4',
    poster: '/assets/aistudio/Grand_Master_G__A_New_Dimension_4db35072.webp',
    summary:
      'Visual introduction celebrating hands-on garage builders, public school shop classes, and neighborhood problem-solvers (Unreviewed Pre-Launch Illustration).',
    nonPrizeNotice: 'Article 6.3 Non-Prize Showcase',
  },
  {
    id: 'reel-momentum',
    title: 'Building Together — Community & Classroom Momentum',
    category: 'Classroom Spotlight',
    creator: 'Discovery Studio Collective (Non-Prize)',
    duration: '0:12',
    playbackRate: 0.5,
    src: '/assets/aistudio/AaHVYlzjqR8U6K7benvcVQ-AaHVYlzjG1J2aMin4R4R9g_831b7d7c.mp4',
    poster: '/assets/aistudio/Schoolgirls_with_signs_on_a_sunny_terrace_ecd4a986.webp',
    summary:
      'Slow-motion feature highlighting student energy, teacher encouragement, and parent-owned community chapters.',
    nonPrizeNotice: 'Article 6.3 Non-Prize Showcase',
  },
  {
    id: 'reel-open-chat',
    title: 'Kitchen-Table Conversations — Parents & Teachers Speaking Straight',
    category: 'Parent & Mission',
    creator: 'Community Voices Reel (Non-Prize)',
    duration: '0:08',
    playbackRate: 1,
    src: '/assets/aistudio/AaHeJG2rLXIHnQvyeAOFGw-AaHeJG2rrEZCIOKYz82u8Q_d9f9a0e1.mp4',
    poster: '/assets/aistudio/Sunny_Suburban_Garage_Sale_Scene_40932d66.webp',
    summary:
      'Why families and teachers want plain-English rules, zero hidden fees, and equal one-Owner, one-vote standing.',
    nonPrizeNotice: 'Article 6.3 Non-Prize Showcase',
  },
  {
    id: 'reel-concierge',
    title: 'Meet Your 24/7 Concierge — Privacy Shield & Q&A Guide',
    category: 'Studio Shorts',
    creator: 'TDEX Studio Orientation (Non-Prize)',
    duration: '0:10',
    playbackRate: 0.5,
    src: '/assets/aistudio/AaHfsR39I9gGUvS1Kwyv2g-AaHfsR39cf4iW774zmPajg_d99173ae.mp4',
    poster: '/src/assets/images/mascot_concierge_puppy_1794483065529.jpg',
    summary:
      'How Concierge automatically strips student emails, phone numbers, and ZIP codes before any blind jury sees a submission.',
    nonPrizeNotice: 'Article 7.1 Orientation Short',
  },
  {
    id: 'reel-next-dimension',
    title: 'Next Dimension Preview — Human Curiosity Meets AI Tools',
    category: 'Studio Shorts',
    creator: 'Discovery Studio Collective (Non-Prize)',
    duration: '0:08',
    playbackRate: 1,
    src: '/assets/aistudio/AaHV17U8c7zlxcM8bB_V3Q-AaHV17U8DoCm3OYVK7zjSw_2026ea43.mp4',
    poster: '/assets/aistudio/Grand_Master_G_s_Next_Dimension_Launch_689e71f1.webp',
    summary:
      'Studio motion preview reminding students that AI is a wrench, never a crutch for human critical thinking.',
    nonPrizeNotice: 'Article 6.3 Non-Prize Showcase',
  },
];

const JURY_LAUREATES: JuryLaureate[] = [
  {
    id: 'laureate-week',
    honorLabel: 'Winner of the Week',
    packetId: 'TDX-STD-2026-40812',
    title: 'Junkyard Alternator Wind Charger for Emergency Power',
    division: 'High School (Grades 9–12)',
    track: 'Applied Discovery',
    rubricScore: '9.6 / 10',
    juryNote:
      'Selected blindly by 12 out-of-state Owners (zero student PII shown). Salvaged parts outperformed commercial kit equivalents; surprise verification answer proved independent wiring mastery.',
    buildSheetId: 'bs-wind-charger',
  },
  {
    id: 'laureate-month',
    honorLabel: 'Winner of the Month',
    packetId: 'TDX-STD-2026-31945',
    title: 'Kitchen-Table Gravity Biofilter & Neighborhood Tap Water Audit',
    division: 'Middle School (Grades 6–8)',
    track: 'Hybrid Discovery',
    rubricScore: '9.8 / 10',
    juryNote:
      'Selected blindly by 12 out-of-state Owners on the 10-point anti-wealth rubric. Student fact-checked AI summary tables against real physical test strips across 12 samples.',
    buildSheetId: 'bs-biofilter',
  },
];

const CLASSROOM_BUILD_SHEETS: ClassroomBuildSheet[] = [
  {
    id: 'bs-wind-charger',
    title: 'Salvaged 12V Auto-Alternator Wind Charger',
    track: 'Applied Discovery',
    gradeBand: 'Grades 9–12 (Shop & Physics)',
    estimatedCost: '$12 (Salvage & Hardware)',
    duration: '3 Class Periods',
    sha256Digest: '8f3c91a4b2d067e19c45f08b32a71d9e40bc21f68a391e04d57b28c901a4f7e2',
    materials: [
      '1 salvaged 12V car alternator (from local junkyard or auto shop donor)',
      '3 PVC pipe blades cut longitudinally from 4-inch schedule-40 PVC pipe',
      '1 wooden hub block + 6 wood screws & washers',
      '12V bicycle or flashlight test bulb + alligator clip leads',
      'Multimeter (shared classroom unit) to record voltage vs. fan speed',
    ],
    scientificExplanation:
      'Faraday’s Law of Electromagnetic Induction states that changing magnetic flux through a wire coil induces voltage. Spinning the rotor inside the alternator’s copper stator windings converts mechanical wind energy into electrical current—teaching real energy conversion without costly lab kits.',
    classroomSteps: [
      'Sketch blade pitch angle (15°–20°) in notebook and predict RPM vs. voltage.',
      'Mount PVC blades symmetrically to wooden hub and bolt safely to alternator shaft.',
      'Test airflow using a box fan at Low, Medium, and High speeds; record voltage at each stage.',
      'Record a 2-minute unedited explanation answering the surprise verification prompt.',
    ],
  },
  {
    id: 'bs-biofilter',
    title: 'Gravity Biofilter & AI Fact-Check Water Lab',
    track: 'Hybrid Discovery',
    gradeBand: 'Grades 6–8 (Earth Science & Logic)',
    estimatedCost: '$6 (Household Materials)',
    duration: '2 Class Periods',
    sha256Digest: '3d94e2c71a80b56f2e19c04d8a31f7e560bc91a24f88d310e7b629c541f0a8d3',
    materials: [
      '1 clean 2-liter plastic bottle cut in half (top inverted as funnel)',
      '1 coffee filter or clean cotton cloth + rubber band',
      '1 cup washed play sand + 1 cup pea gravel',
      '1/2 cup aquarium activated charcoal (rinsed)',
      '10 basic pH/turbidity test strips + muddy tap water sample',
    ],
    scientificExplanation:
      'Layering gravel, fine sand, and activated charcoal demonstrates physical filtration (size exclusion of suspended particles) alongside chemical adsorption (charcoal trapping organic impurities). Comparing real test-strip measurements against an AI-generated water report trains students to treat AI as a tool—never an unquestioned authority.',
    classroomSteps: [
      'Invert the top bottle half with cloth secured over the neck; layer charcoal, sand, then gravel.',
      'Pour measured cloudy water through the column and time flow rate in seconds.',
      'Measure pH and clarity before and after filtration; compare against AI claims for errors.',
      'Publish findings on the Build Sheet log with zero student names or school street addresses.',
    ],
  },
  {
    id: 'bs-leverage-bridge',
    title: 'Popsicle & Cardboard Truss Load-Bearing Bridge',
    track: 'Analytical Discovery',
    gradeBand: 'Grades K–5 (Elementary Math & Geometry)',
    estimatedCost: '$3 (Classroom Crafts)',
    duration: '90 Minutes',
    sha256Digest: '5a71b0e84c92f13d6a40e98c12b74f5d30ac81e92b470f15d68c39a702e1b4f9',
    materials: [
      '100 wooden craft sticks + white school glue',
      'Scrap corrugated cardboard base strips',
      '1 plastic cup + coins or gravel for incremental weight testing',
      'Ruler and pencil for triangle geometry sketching',
    ],
    scientificExplanation:
      'Triangles distribute compression and tension forces evenly across all three sides without changing shape under load, whereas rectangles collapse laterally. Students measure weight held per gram of bridge material—proving structural efficiency beats expensive parts.',
    classroomSteps: [
      'Draw two side trusses using equilateral triangles and compare against a square frame.',
      'Assemble and let dry overnight; weigh the finished bridge first.',
      'Add coins slowly into the suspended cup until deflection occurs and record maximum load.',
      'Calculate load-to-weight ratio and explain why triangular bracing prevented collapse.',
    ],
  },
  {
    id: 'bs-solar-oven',
    title: 'Pizza-Box Parabolic Solar Cooker & Heat Retention Audit',
    track: 'Applied Discovery',
    gradeBand: 'Grades 6–12 (Thermal Physics)',
    estimatedCost: '$4 (Recycled Kitchen Foil & Box)',
    duration: '2 Class Periods',
    sha256Digest: 'c18e42f97b30a65d1e84c20b9f73a1d680ec52b49a173d08f46e19b820c7d5a1',
    materials: [
      '1 clean used cardboard pizza box',
      'Aluminum foil + black construction paper + clear plastic wrap',
      '1 wooden skewer or ruler to prop the reflector flap',
      '1 kitchen thermometer + cup of water or s’more test item',
    ],
    scientificExplanation:
      'Aluminum foil reflects sunlight (radiation) through the transparent plastic window, where black paper absorbs visible light and converts it to infrared heat trapped inside the insulated box (greenhouse effect).',
    classroomSteps: [
      'Cut a 3-sided flap in the box lid and wrap its underside smoothly with aluminum foil.',
      'Line the box floor with black paper and seal the opening tightly with plastic wrap.',
      'Record interior temperature every 5 minutes for 30 minutes at two reflector angles.',
      'Graph temperature delta and propose one insulation upgrade using scrap cardboard.',
    ],
  },
];

const COMEDY_CHRONICLES: ComedyChronicleItem[] = [
  {
    id: 'ep-studio-chalkboard',
    episodeCode: 'Studio 01',
    title: 'Where Are the Pictures?! (The Discovery Studio Chalkboard)',
    series: 'Studio Desk',
    image: '/assets/aistudio/Dex12_2__9872aabb.webp',
    cast: ['The Catalyst', 'The DEX Donkey', 'Copilot', 'Grand Master G', 'Pip', 'Relocating Cat'],
    caption:
      '“You’re right… I got so busy writing, I forgot the pictures.” Discovery Studio’s official wall checklist: Real Stories, Funny Moments, Useful Mistakes, Amazing Discoveries, People Like You.',
    lessonNote: 'Humor Keeps Us Human — led directly to TDEX’s visual multi-doorway design.',
  },
  {
    id: 'ep-full-team',
    episodeCode: 'Studio 02',
    title: 'You Forgot Columbo, Pipito & The Concierge!',
    series: 'Studio Desk',
    image: '/assets/aistudio/Designer_05056bb2.webp',
    cast: ['The Concierge', 'Columbo', 'Pipito', 'Grand Master G', 'Copilot', 'The DEX Donkey', 'Cat'],
    caption:
      '“The Concierge is the front door! How do you build a website and forget the one who talks to everyone?” Plus Columbo (“Every bug leaves a clue”) and Pipito reporting for duty.',
    lessonNote: 'Why every AI role in Article 7.1 stays distinct and visible.',
  },
  {
    id: 'ep-wrong-quote',
    episodeCode: 'Episode 001',
    title: 'The Wrong Quote Attribution',
    series: 'Studio Desk',
    image: '/assets/aistudio/Discovery_Exchange__The_Wrong_Quote_231adb84.webp',
    cast: ['The Catalyst', 'AI Bot', 'The DEX Donkey', 'Cat'],
    caption:
      '“If you cannot laugh at yourself, don’t worry, others will do it for you.” — Corrected attribution: R. Petrossian. Even the quote about laughing at mistakes had a mistake!',
    lessonNote: 'Mistakes make better stories — fact-check, double-check, still laugh.',
  },
  {
    id: 'ep-sitting-on-it',
    episodeCode: 'Trail 01',
    title: 'Homeboys… You’re Sitting On It',
    series: 'Trail & Donkey',
    image: '/assets/aistudio/the_dex_studio_1_6__bdb2f276.jpg',
    cast: ['The Catalyst', 'AI Bot', 'Cool Master G', 'The DEX Donkey', 'Relocating Cat'],
    caption:
      '“Hey guys, I think we need a donkey.” “I thought we were looking for my cat.” Cool Master G: “Homeboys… you’re sitting on it.” Donkey: “Next to you two, I’m a racehorse.”',
    lessonNote: 'Don’t overlook the obvious engine you are already riding.',
  },
  {
    id: 'ep-power-outlet',
    episodeCode: 'Trail 02',
    title: 'Donkey or Power Outlet?',
    series: 'Trail & Donkey',
    image: '/assets/aistudio/The_Discovery_Exchange__Donkey_or_Power_Outlet__6c8c9f44.webp',
    cast: ['The Catalyst', 'AI Bot', 'Grand Master G', 'The DEX Donkey'],
    caption:
      '“Guys, we cannot go very far without a donkey.” Grand Master G holding an orange extension cord: “I need a power outlet, not a donkey.”',
    lessonNote: 'Human common sense vs. AI infrastructure requirements on the open road.',
  },
  {
    id: 'ep-wrong-way-sign',
    episodeCode: 'Trail 03',
    title: 'Somewhere · Adventure · Probably the Wrong Way',
    series: 'Trail & Donkey',
    image: '/assets/aistudio/Dex_1_5aa9c980.webp',
    cast: ['The Catalyst', 'AI Bot', 'The DEX Donkey'],
    caption:
      '“Hey genius, we need a donkey.” “What the heck is a donkey?” While the trail signpost points straight toward “Probably the Wrong Way.”',
    lessonNote: 'Every breakthrough starts by admitting what you still need to learn.',
  },
  {
    id: 'ep-engine-room',
    episodeCode: 'Studio 03',
    title: 'The DEX Engine Room v5.0 — Just Plumbing, Folks',
    series: 'Studio Desk',
    image: '/assets/aistudio/Dex_10_d662bd9f.jpg',
    cast: ['Grand Master G', 'The Catalyst', 'AI Auditor', 'Relocating Cat'],
    caption:
      '“Look guys, it’s just plumbing. This isn’t theoretical physics anymore.” Meanwhile the audit bot yells: “STOP! The text on Rule #19.4 isn’t quite canonical enough!”',
    lessonNote: 'Keep the engine simple enough for real families while keeping Rule #19.4 airtight.',
  },
  {
    id: 'ep-mission-control',
    episodeCode: 'Studio 04',
    title: 'Homeboy #3 Mission Control & Pizza for the Team',
    series: 'Studio Desk',
    image: '/assets/aistudio/Dex_11_c48f4628.webp',
    cast: ['The Catalyst', 'ChatGPT', 'Grand Master G', 'The DEX Donkey', 'Cat'],
    caption:
      '“All systems connected! We’re finally a real team!” Website, Operator Bus, Mailboxes, Nodes, QC Verified — and a pizza box on the workbench.',
    lessonNote: 'Celebrates multi-AI + human collaboration before the cat relocates again.',
  },
  {
    id: 'ep-seven-ais',
    episodeCode: 'Trail 04',
    title: 'Seven AIs… Still Not Moving',
    series: 'Trail & Donkey',
    image: '/assets/aistudio/DEX_5_74b3e1a5.webp',
    cast: ['Grand Master G Twins', 'Five AI Bots', 'The DEX Donkey'],
    caption:
      'Seven AIs pulling ropes in opposite directions with maximum compute sweat while the donkey watches unimpressed: “Seven AIs… still not moving.”',
    lessonNote: 'Why TDEX enforces clear separation of duties instead of AI tug-of-war.',
  },
  {
    id: 'ep-five-green-lights',
    episodeCode: 'Next Dim. 01',
    title: 'Five Green Lights Cannon Leads the Way',
    series: 'Next Dimension',
    image: '/assets/aistudio/Designer_41eda7c1.jpg',
    cast: ['The Catalyst', 'Atlas (Gemini)', 'The Canon (ChatGPT)', 'Copilot (Beacon)', 'Pipito', 'Columbo', 'The DEX Donkey'],
    caption:
      '“Independent review. No kumbaya. Just truth.” Architecture, Security Review, Bigcoin Engine, Marketplace Logic, and Governance Alignment verified.',
    lessonNote: 'Real mistakes, real learning, real progress — from the garage to the future.',
  },
  {
    id: 'ep-new-dimension',
    episodeCode: 'Next Dim. 02',
    title: 'From the Garage to the Future — A New Dimension',
    series: 'Next Dimension',
    image: '/assets/aistudio/Grand_Master_G__A_New_Dimension_4db35072.webp',
    cast: ['Grand Master G', 'The Catalyst', 'The DEX Donkey', 'Pip', 'Students', 'Cat'],
    caption:
      '“To the next dimension… for the students, for the future, for all of us!” Featuring the actual TDEX storefront and team checklist right on the workbench.',
    lessonNote: 'Same mission, greater reach, bigger impact for public school students.',
  },
  {
    id: 'ep-launch-whee',
    episodeCode: 'Next Dim. 03',
    title: 'To the Next Dimension! Hold On Tight!',
    series: 'Next Dimension',
    image: '/assets/aistudio/Grand_Master_G_s_Next_Dimension_Launch_689e71f1.webp',
    cast: ['The DEX Donkey', 'Grand Master G', 'The Catalyst', 'Pip', 'Students'],
    caption:
      'Even the Common Sense Donkey hops aboard the launch sphere yelling “Whee!” while the George Washington Discovery medallion gleams beside the team log.',
    lessonNote: '“A little madness gives us the courage to be free.” — Zorba the Greek',
  },
];

const CAST_ROSTER: CastMember[] = [
  {
    name: 'The Catalyst (Human Founder / Pusher)',
    studioRole: 'Studio host, trail navigator, and straight-talking storyteller.',
    constitutionalRole: 'Article 1.3 Pusher & Equal 1-Vote Owner — zero permanent boss power.',
    motto: '“Don’t overthink it — test it in the real world.”',
  },
  {
    name: 'The DEX Donkey (Common Sense Dept.)',
    studioRole: 'Dry-humored realist who reminds everyone when seven AIs are pulling opposite ways.',
    constitutionalRole: 'Creative studio mascot only — represents plain kitchen-table common sense.',
    motto: '“Next to you two, I’m a racehorse.”',
  },
  {
    name: 'The Concierge (24/7 Front Door)',
    studioRole: 'Friendly headset guide welcoming parents, teachers, and students.',
    constitutionalRole: 'Article 7.1 Intake & Privacy Shield — answers from Q1–Q150 and strips PII.',
    motto: '“Good questions move big things.”',
  },
  {
    name: 'Columbo (Evidence & Math Detective)',
    studioRole: 'Trench-coat hound with magnifying glass hunting down arithmetic bugs.',
    constitutionalRole: 'Article 7.2 Investigation & Math Audit — verifies 50/25/25 and 70/30 penny math.',
    motto: '“Every bug leaves a clue.”',
  },
  {
    name: 'Pipito (Bounded Gatekeeper)',
    studioRole: 'Tiny determined robo-pup holding the scales of constitutional checks.',
    constitutionalRole: 'Article 7.3 Gatekeeper — halts rule violations; never holds funds or votes.',
    motto: '“Verify. Protect. Keep it honest.”',
  },
  {
    name: 'Grand Master G / Atlas & Beacon',
    studioRole: 'Gold-robed cosmic architect launching garage ideas into the next dimension.',
    constitutionalRole: 'Creative studio personas for engineering & independent AI stress-testing.',
    motto: '“No kumbaya. Just truth.”',
  },
];

const FALLBACK_PROMPTS = [
  {
    code: 'STD-4821',
    prompt:
      'Point to the trickiest part of your build and explain in 20 seconds what failed on your first try and how you fixed it.',
  },
  {
    code: 'STD-7394',
    prompt:
      'Hold up a handwritten slip with your Studio Verification Code and show two everyday household or garage materials you used.',
  },
  {
    code: 'STD-1956',
    prompt:
      'Explain your project’s core scientific or logical idea in plain English as if teaching a 4th grader at the kitchen table.',
  },
];

function clientPreviewScrubPii(raw: string): { cleaned: string; foundPii: boolean } {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const zipRegex = /\b\d{5}(?:-\d{4})?\b/g;

  const foundPii =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(raw) ||
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(raw) ||
    /\b\d{5}(?:-\d{4})?\b/.test(raw);

  const cleaned = raw
    .replace(emailRegex, '[REDACTED_EMAIL]')
    .replace(phoneRegex, '[REDACTED_PHONE]')
    .replace(zipRegex, '[REDACTED_ZIP]');

  return { cleaned, foundPii };
}

export const DiscoveryStudiosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('reels');

  // Tab 1: Reels & Cinema
  const [reelFilter, setReelFilter] = useState<ReelFilter>('ALL');
  const [selectedReel, setSelectedReel] = useState<StudioReel>(STUDIO_REELS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(STUDIO_REELS[0].playbackRate);

  // Tab 2: Build Sheets
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('ALL');
  const [buildSearch, setBuildSearch] = useState('');
  const [copiedSheetId, setCopiedSheetId] = useState<string | null>(null);

  // Tab 3: Comedy Chronicles & Lightbox
  const [seriesFilter, setSeriesFilter] = useState<ChronicleSeries>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Tab 4: Video Upload Intake
  const [ageDivision, setAgeDivision] = useState('High School (Grades 9–12)');
  const [uploadTrack, setUploadTrack] = useState<Exclude<TrackFilter, 'ALL'>>('Applied Discovery');
  const [projectTitle, setProjectTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [educatorEmail, setEducatorEmail] = useState('');
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [surprisePrompt, setSurprisePrompt] = useState(FALLBACK_PROMPTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<StudioSubmissionRecord | null>(null);
  const [queuedSubmissions, setQueuedSubmissions] = useState<StudioSubmissionRecord[]>([]);

  const filteredReels = useMemo(
    () => STUDIO_REELS.filter((r) => reelFilter === 'ALL' || r.category === reelFilter),
    [reelFilter]
  );

  const filteredBuildSheets = useMemo(() => {
    const q = buildSearch.trim().toLowerCase();
    return CLASSROOM_BUILD_SHEETS.filter((bs) => {
      const matchesTrack = trackFilter === 'ALL' || bs.track === trackFilter;
      const matchesQuery =
        !q ||
        bs.title.toLowerCase().includes(q) ||
        bs.scientificExplanation.toLowerCase().includes(q) ||
        bs.materials.some((m) => m.toLowerCase().includes(q));
      return matchesTrack && matchesQuery;
    });
  }, [trackFilter, buildSearch]);

  const filteredChronicles = useMemo(
    () =>
      COMEDY_CHRONICLES.filter(
        (item) => seriesFilter === 'ALL' || item.series === seriesFilter
      ),
    [seriesFilter]
  );

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/studios/submissions');
      if (res.ok) {
        const data = (await res.json()) as { submissions?: StudioSubmissionRecord[] };
        if (Array.isArray(data.submissions)) {
          setQueuedSubmissions(data.submissions);
        }
      }
    } catch {
      // Offline / static preview mode keeps local state cleanly
    }
  }, []);

  const refreshSurprisePrompt = async () => {
    try {
      const res = await fetch('/api/studios/surprise-prompt');
      if (res.ok) {
        const data = (await res.json()) as { code: string; prompt: string };
        setSurprisePrompt({ code: data.code, prompt: data.prompt });
        return;
      }
    } catch {
      // Fallback rotation if backend route is unavailable
    }
    const nextIdx =
      (FALLBACK_PROMPTS.findIndex((p) => p.code === surprisePrompt.code) + 1) %
      FALLBACK_PROMPTS.length;
    setSurprisePrompt(FALLBACK_PROMPTS[nextIdx]);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredChronicles.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredChronicles.length) % filteredChronicles.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredChronicles.length]);

  const handleSelectReel = (reel: StudioReel) => {
    setSelectedReel(reel);
    setPlaybackSpeed(reel.playbackRate);
  };

  const downloadBuildSheet = (sheet: ClassroomBuildSheet) => {
    const content = [
      'THE DISCOVERY EXCHANGE — SCHEDULE E CLASSROOM BUILD SHEET ($0 COST)',
      `Title: ${sheet.title}`,
      `Discovery Track: ${sheet.track} | Grade Band: ${sheet.gradeBand}`,
      `Estimated Household / Salvage Cost: ${sheet.estimatedCost} | Class Time: ${sheet.duration}`,
      `SHA-256 Verification Digest: ${sheet.sha256Digest}`,
      '',
      'EVERYDAY MATERIALS LIST:',
      ...sheet.materials.map((m, i) => `  ${i + 1}. ${m}`),
      '',
      'PLAIN-ENGLISH SCIENTIFIC / LOGICAL EXPLANATION:',
      sheet.scientificExplanation,
      '',
      'CLASSROOM & KITCHEN-TABLE STEPS:',
      ...sheet.classroomSteps.map((s, i) => `  ${i + 1}. ${s}`),
      '',
      'Published openly under Schedule E (Open Architectural Blueprint) — thediscoveryexchange.com',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TDEX_BuildSheet_${sheet.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMaterials = async (sheet: ClassroomBuildSheet) => {
    try {
      await navigator.clipboard.writeText(
        `${sheet.title}\nMaterials:\n- ${sheet.materials.join('\n- ')}`
      );
      setCopiedSheetId(sheet.id);
      setTimeout(() => setCopiedSheetId(null), 2200);
    } catch {
      // Clipboard blocked in restricted frames
    }
  };

  const piiPreview = useMemo(
    () => clientPreviewScrubPii(`${projectTitle} ${summary} ${materialsUsed}`),
    [projectTitle, summary, materialsUsed]
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!guardianConsent || !educatorEmail.trim()) {
      setSubmitError(
        'Article 4.5 & 13.2 Gate: Parental/guardian consent and non-family public school educator attestation are mandatory.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/studios/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageDivision,
          track: uploadTrack,
          projectTitle,
          summary,
          materialsUsed,
          videoUrl,
          surprisePromptCode: surprisePrompt.code,
          surprisePromptText: surprisePrompt.prompt,
          guardianConsentSigned: guardianConsent,
          educatorWitnessEmail: educatorEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Submission blocked by safety verification gate.');
      } else {
        setReceipt(data as StudioSubmissionRecord);
        setQueuedSubmissions((prev) => [data as StudioSubmissionRecord, ...prev]);
        setProjectTitle('');
        setSummary('');
        setMaterialsUsed('');
        setVideoUrl('');
      }
    } catch {
      setSubmitError('Network error while submitting to Discovery Studio intake.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeLightboxItem =
    lightboxIndex !== null && filteredChronicles[lightboxIndex]
      ? filteredChronicles[lightboxIndex]
      : null;

  return (
    <div className="space-y-8">
      {/* HERO SPLIT SHOWCASE */}
      <section className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#dfa62a] flex flex-wrap items-center gap-2">
                <span>Channel #15</span>
                <span aria-hidden="true">&middot;</span>
                <span>Articles 3.3, 4.5, 5.3, 6.3 &amp; 8.4</span>
                <span aria-hidden="true">&middot;</span>
                <span>Schedule E Open Blueprint</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white [text-wrap:balance]">
                Discovery Studio — Real Stories, Funny Moments &amp; Useful Mistakes
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                Celebrating public school teachers, garage builders, and working families across
                America. Watch 2-minute unedited demonstrations, download free Schedule E Classroom
                Build Sheets, and laugh along with our Human + AI comedy chronicles&mdash;kept
                strictly separate from formal audit, escrow, and governance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 bg-[#dfa62a] hover:bg-[#c99524] text-[#06182f] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Upload 2-Min Demo Video</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('build_sheets')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-[#dfa62a]" aria-hidden="true" />
                <span>Download $0 Build Sheets</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-slate-950">
            {!failedImages['hero-studio'] ? (
              <img
                src="/assets/aistudio/Dex12_2__9872aabb.webp"
                alt="Discovery Studio — Real Stories, Funny Moments, Useful Mistakes, Amazing Discoveries, People Like You"
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, 'hero-studio': true }))
                }
                className="w-full h-full object-cover block"
              />
            ) : (
              <div className="w-full h-full min-h-[260px] bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Film className="w-10 h-10 text-[#dfa62a]" aria-hidden="true" />
                <span className="font-serif text-lg font-bold text-white">
                  Discovery Studio Chalkboard
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
              <p className="text-xs text-slate-200 leading-snug">
                <strong className="text-[#dfa62a]">Humor Keeps Us Human:</strong> Creative &amp;
                comedy stories live here (Article 6.3 Non-Prize), separate from public schools blind
                jury awards and financial ledgers.
              </p>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Summary Strip Below Hero Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/15 bg-slate-950/60 border-t border-white/15 text-xs">
          <div className="p-4 space-y-1">
            <div className="font-bold text-[#dfa62a]">01. 2-Min Unedited Video</div>
            <p className="text-slate-300 leading-relaxed">
              Live surprise prompt + guardian consent + educator attestation before upload (Q101).
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="font-bold text-[#dfa62a]">02. Blind 12-Owner Jury</div>
            <p className="text-slate-300 leading-relaxed">
              Weekly &amp; monthly Laureates picked by out-of-state Owner Juries—never click votes (Q102).
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="font-bold text-[#dfa62a]">03. $0 Classroom Build Sheets</div>
            <p className="text-slate-300 leading-relaxed">
              Schedule E materials lists, plain-English physics, and SHA-256 verification digests (Q103).
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="font-bold text-[#dfa62a]">04. Non-Prize Comedy Vault</div>
            <p className="text-slate-300 leading-relaxed">
              Founders &amp; Pushers never win prizes (Article 6.3); Human + AI comics stay separate.
            </p>
          </div>
        </div>
      </section>

      {/* STUDIO NAVIGATION TABS */}
      <nav
        aria-label="Discovery Studio Sections"
        className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-2"
      >
        {[
          { id: 'reels', label: '1. Video Reels & Jury Laureates' },
          { id: 'build_sheets', label: '2. Classroom Build Sheets ($0)' },
          { id: 'chronicles', label: '3. Human + AI Comedy & Cast (Non-Prize)' },
          { id: 'upload', label: '4. Upload 2-Min Video (Art. 13.2)' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center max-w-full ${
                active
                  ? 'bg-[#081d38] text-[#dfa62a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ===================================================================== */}
      {/* TAB 1: FEATURED VIDEO REELS & BLIND-JURY LAUREATES                    */}
      {/* ===================================================================== */}
      {activeTab === 'reels' && (
        <div className="space-y-8">
          {/* Active Cinema Player */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 bg-[#081d38] relative flex items-center justify-center">
                <video
                  key={selectedReel.id}
                  src={selectedReel.src}
                  poster={selectedReel.poster}
                  controls
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.defaultPlaybackRate = playbackSpeed;
                    e.currentTarget.playbackRate = playbackSpeed;
                  }}
                  onPlay={(e) => {
                    e.currentTarget.defaultPlaybackRate = playbackSpeed;
                    e.currentTarget.playbackRate = playbackSpeed;
                  }}
                  className="w-full aspect-video object-contain bg-black block"
                />
              </div>

              <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 tabular-nums">
                    <span className="font-semibold text-[#b47d12]">{selectedReel.category}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{selectedReel.duration}</span>
                    {selectedReel.nonPrizeNotice && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span>{selectedReel.nonPrizeNotice}</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38] leading-snug">
                    {selectedReel.title}
                  </h2>

                  <div className="text-xs font-medium text-slate-500">{selectedReel.creator}</div>

                  <p className="text-sm text-slate-700 leading-relaxed">{selectedReel.summary}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600 mr-1">Speed:</span>
                    {[0.5, 1, 1.25].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2.5 py-1 rounded text-xs font-bold tabular-nums cursor-pointer transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-[#081d38] text-[#dfa62a]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-3.5 py-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Submit Classroom Video
                  </button>
                </div>
              </div>
            </div>

            {/* Reel Selector Strip */}
            <div className="p-5 border-t border-slate-200 bg-[#fbfaf7] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-base font-bold text-[#081d38]">
                  Studio Video Library ({filteredReels.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      'ALL',
                      'Parent & Mission',
                      'Classroom Spotlight',
                      'Studio Shorts',
                    ] as ReelFilter[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setReelFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                        reelFilter === cat
                          ? 'bg-[#081d38] text-[#dfa62a]'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Reels' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredReels.map((reel) => {
                  const isCurrent = selectedReel.id === reel.id;
                  return (
                    <button
                      key={reel.id}
                      type="button"
                      onClick={() => handleSelectReel(reel)}
                      className={`text-left rounded-xl p-4 border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-white border-[#081d38] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                          <span className="font-semibold text-[#b47d12]">{reel.category}</span>
                          <span>{reel.duration}</span>
                        </div>
                        <div className="font-serif text-sm font-bold text-[#081d38] leading-snug">
                          {reel.title}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{reel.summary}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#081d38]">
                        <Play className="w-3.5 h-3.5 text-[#dfa62a] fill-current" aria-hidden="true" />
                        <span>{isCurrent ? 'Now Playing in Cinema' : 'Load in Cinema'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Winner of the Week & Winner of the Month (Blind 12-Owner Jury Showcase) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
                  Blind-Jury Laureates — Winner of the Week &amp; Winner of the Month
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                  <strong>No Click-Farm Voting (Q102 &amp; Article 5.3):</strong> Weekly and
                  monthly Laureates are scored blindly on the 10-point anti-wealth rubric by a
                  randomly drawn 12-person out-of-state Owner Review Jury.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {JURY_LAUREATES.map((laureate) => {
                const linkedSheet = CLASSROOM_BUILD_SHEETS.find(
                  (s) => s.id === laureate.buildSheetId
                );
                return (
                  <article
                    key={laureate.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                        <span className="font-bold text-[#b47d12] uppercase tracking-wide">
                          {laureate.honorLabel}
                        </span>
                        <span className="font-mono">{laureate.packetId}</span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#081d38]">
                        {laureate.title}
                      </h3>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 tabular-nums">
                        <span>{laureate.division}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{laureate.track}</span>
                        <span aria-hidden="true">&middot;</span>
                        <strong className="text-[#081d38]">
                          Blind Jury Score: {laureate.rubricScore}
                        </strong>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {laureate.juryNote}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-500">
                        Advances to Annual National Discovery Awards
                      </span>
                      {linkedSheet && (
                        <button
                          type="button"
                          onClick={() => downloadBuildSheet(linkedSheet)}
                          className="px-3.5 py-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Download Build Sheet ($0)</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SCHEDULE E CLASSROOM BUILD SHEETS ($0 COST)                    */}
      {/* ===================================================================== */}
      {activeTab === 'build_sheets' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
                  Schedule E Classroom Build Sheets ($0 Cost Open Blueprint)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                  Every verified Discovery Studio build publishes an everyday materials list,
                  plain-English scientific explanation, and SHA-256 verification digest so any
                  public school classroom or kitchen table can replicate it free (Q103).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    'ALL',
                    'Applied Discovery',
                    'Analytical Discovery',
                    'Hybrid Discovery',
                  ] as TrackFilter[]
                ).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setTrackFilter(tr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                      trackFilter === tr
                        ? 'bg-[#081d38] text-[#dfa62a]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tr === 'ALL' ? 'All Discovery Tracks' : tr}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-72">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={buildSearch}
                  onChange={(e) => setBuildSearch(e.target.value)}
                  placeholder="Search materials or physics..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#081d38]"
                />
              </div>
            </div>
          </div>

          {filteredBuildSheets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              No Classroom Build Sheets matched &ldquo;{buildSearch}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredBuildSheets.map((sheet) => (
                <article
                  key={sheet.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 tabular-nums">
                      <span className="font-bold text-[#b47d12]">{sheet.track}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{sheet.gradeBand}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{sheet.estimatedCost}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{sheet.duration}</span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#081d38]">
                      {sheet.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {sheet.scientificExplanation}
                    </p>

                    <div className="bg-[#fbfaf7] border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                      <div className="text-xs font-bold text-[#081d38]">
                        Everyday Materials List:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                        {sheet.materials.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 break-all">
                      SHA-256: {sheet.sha256Digest}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadBuildSheet(sheet)}
                      className="px-4 py-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Download Classroom Build Sheet (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyMaterials(sheet)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#081d38] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {copiedSheetId === sheet.id ? 'Copied Materials!' : 'Copy Materials'}
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: HUMAN + AI COMEDY CHRONICLES & CAST (NON-PRIZE SHOWCASE)       */}
      {/* ===================================================================== */}
      {activeTab === 'chronicles' && (
        <div className="space-y-8">
          <div className="bg-amber-50 border border-[#dfa62a] rounded-xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-[#081d38]">
            <Laugh className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <div className="font-bold">
                Non-Prize Creative &amp; Comedy Showcase (Article 6.3 &amp; Front-Door V19 Separation)
              </div>
              <p className="text-slate-700 leading-relaxed">
                Founders and Pushers never compete for Discovery Studio or National Discovery Award
                payouts. These Human + AI adventure comics capture real studio mistakes and laughs,
                kept completely separate from formal financial audits, escrow, and governance.
              </p>
            </div>
          </div>

          {/* Series Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
              Joint Venture Comedy &amp; Founding Chronicles ({filteredChronicles.length})
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(
                ['ALL', 'Studio Desk', 'Trail & Donkey', 'Next Dimension'] as ChronicleSeries[]
              ).map((ser) => (
                <button
                  key={ser}
                  type="button"
                  onClick={() => setSeriesFilter(ser)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                    seriesFilter === ser
                      ? 'bg-[#081d38] text-[#dfa62a]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {ser === 'ALL' ? 'All Episodes' : ser}
                </button>
              ))}
            </div>
          </div>

          {/* Media-First Bento / Grid Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChronicles.map((item, idx) => {
              const isFeatured = idx === 0 && seriesFilter === 'ALL';
              return (
                <article
                  key={item.id}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#081d38] ${
                    isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative w-full overflow-hidden bg-slate-900 text-left cursor-pointer"
                  >
                    {!failedImages[item.id] ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className={`w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] block ${
                          isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'
                        }`}
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-[#081d38] flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <Sparkles className="w-8 h-8 text-[#dfa62a]" aria-hidden="true" />
                        <span className="font-serif text-base font-bold text-white">
                          {item.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        Click to Expand Full Comic
                      </span>
                      <span className="text-xs font-mono text-[#dfa62a] tabular-nums">
                        {item.episodeCode}
                      </span>
                    </div>
                  </button>

                  <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#b47d12]">{item.series}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{item.cast.slice(0, 3).join(', ')}</span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#081d38]">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                      {item.lessonNote}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Cast & Character Guide (3-in-a-Row Grid) */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
                Studio Cast vs. Constitutional Software Roles (Article 7.1)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Creative comic personalities keep the journey human, while real software roles obey
                strict Article 7 separation of duties.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAST_ROSTER.map((member) => (
                <div
                  key={member.name}
                  className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
                >
                  <h3 className="font-serif text-base font-bold text-[#081d38]">{member.name}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Studio Persona:</strong> {member.studioRole}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Actual System Role:</strong> {member.constitutionalRole}
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-xs italic text-[#b47d12]">
                    {member.motto}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: UPLOAD 2-MINUTE DEMO VIDEO (ARTICLE 4.5 & 13.2 SAFE INTAKE)    */}
      {/* ===================================================================== */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Intake Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
                Upload a 2-Minute Unedited Demonstration Video
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Zero entry cost. Concierge verifies guardian consent (Article 4.5), requires a
                non-family educator email for attestation, and strips student PII before blind
                12-person out-of-state Owner Jury review (Q101 &amp; Article 8.4).
              </p>
            </div>

            {/* Live Surprise Verification Prompt Generator */}
            <div className="bg-[#fbfaf7] border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#081d38]">
                  <Video className="w-4 h-4 text-[#b47d12]" aria-hidden="true" />
                  <span>
                    Surprise Verification Prompt (Code:{' '}
                    <span className="font-mono text-[#b47d12]">{surprisePrompt.code}</span>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={refreshSurprisePrompt}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-[#081d38] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>New Prompt</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                Answer this on camera during your unedited 2-minute video:{' '}
                <strong>&ldquo;{surprisePrompt.prompt}&rdquo;</strong>
              </p>
            </div>

            {receipt ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-serif text-lg font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  <span>Anonymized Studio Packet Queued!</span>
                </div>
                <div className="text-xs text-emerald-950 space-y-1 font-mono tabular-nums">
                  <div>Tracking ID: {receipt.trackingId}</div>
                  <div>PII Status: {receipt.piiStatus}</div>
                  <div>Jury Status: {receipt.juryStatus}</div>
                  <div className="break-all">SHA-256: {receipt.evidenceHash}</div>
                </div>
                <p className="text-xs text-emerald-900">
                  Stripped Title: <strong>{receipt.anonymizedTitle}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="px-4 py-2 bg-[#081d38] text-[#dfa62a] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Submit Another Video
                </button>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                    <span>Student Age Division</span>
                    <select
                      value={ageDivision}
                      onChange={(e) => setAgeDivision(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal bg-white focus:outline-none focus:border-[#081d38]"
                    >
                      <option>Elementary (Grades K–5)</option>
                      <option>Middle School (Grades 6–8)</option>
                      <option>High School (Grades 9–12)</option>
                    </select>
                  </label>

                  <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                    <span>Discovery Track (Article 3.3)</span>
                    <select
                      value={uploadTrack}
                      onChange={(e) =>
                        setUploadTrack(e.target.value as Exclude<TrackFilter, 'ALL'>)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal bg-white focus:outline-none focus:border-[#081d38]"
                    >
                      <option value="Applied Discovery">Applied Discovery (Hands-On Build)</option>
                      <option value="Analytical Discovery">
                        Analytical Discovery (Logic &amp; Research)
                      </option>
                      <option value="Hybrid Discovery">Hybrid Discovery (Build + Analysis)</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                  <span>Project / Episode Title (No Student Names or School Streets)</span>
                  <input
                    required
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., Cardboard Solar Concentrator Built From Scrap Foil"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:border-[#081d38]"
                  />
                </label>

                <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                  <span>Everyday Materials Used (Garage / Classroom Items)</span>
                  <input
                    required
                    type="text"
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
                    placeholder="e.g., Salvaged pizza box, foil, thermometer, rubber bands"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:border-[#081d38]"
                  />
                </label>

                <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                  <span>Plain-English Project Summary &amp; What You Learned</span>
                  <textarea
                    required
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Explain what problem you tested, what failed first, and how you proved your result..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:border-[#081d38]"
                  />
                </label>

                <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                  <span>2-Minute Unedited Video URL (Unlisted Link or School Share)</span>
                  <input
                    required
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:border-[#081d38]"
                  />
                </label>

                <label className="block space-y-1 text-xs font-bold text-[#081d38]">
                  <span>Non-Family Public School Teacher / Mentor Attestation Email (Kept in PII Vault)</span>
                  <input
                    required
                    type="email"
                    value={educatorEmail}
                    onChange={(e) => setEducatorEmail(e.target.value)}
                    placeholder="teacher@publicschool.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:border-[#081d38]"
                  />
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#fbfaf7] border border-slate-200 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-0.5 accent-[#081d38] cursor-pointer"
                  />
                  <span>
                    <strong>Parent / Guardian Consent (Article 4.5 &amp; 13.2):</strong> I confirm parent or guardian permission for this walkthrough entry; Concierge automatically redacts PII before saving.
                  </span>
                </label>

                {piiPreview.foundPii && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950">
                    <strong>Concierge PII Shield Active:</strong> We detected an email, phone
                    number, or ZIP code inside your public title/summary fields. Concierge will
                    automatically redact it before saving!
                  </div>
                )}

                {submitError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#081d38] hover:bg-[#0f2b52] disabled:opacity-60 text-[#dfa62a] text-sm font-bold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {submitting
                      ? 'Running Concierge PII Strip & Intake...'
                      : 'Submit Anonymized Video to Discovery Studio'}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Live Queued Submissions & Rules */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#081d38] text-white border border-[#dfa62a] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-[#dfa62a]">
                <Award className="w-5 h-5" aria-hidden="true" />
                <span>How Blind Jury Selection Works (Q102)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 leading-relaxed list-disc list-inside">
                <li>
                  <strong>100% Free Entry:</strong> No paid equipment, fancy kits, or entry fees.
                </li>
                <li>
                  <strong>Zero Click-Farm Manipulation:</strong> Winners are never chosen by public
                  likes or social media shares.
                </li>
                <li>
                  <strong>12-Person Out-of-State Jury:</strong> Randomly drawn Owners outside your
                  state score anonymized packets on the 10-point anti-wealth rubric.
                </li>
                <li>
                  <strong>50 / 25 / 15 / 10 Protected Payouts:</strong> 50% goes into a protected
                  student education fund (529 or trust), 25% honors the mentoring public school teacher, 15%
                  buys classroom tools, and 10% grows permanent debt-free endowment silos.
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-base font-bold text-[#081d38]">
                  Recent Anonymized Studio Queue
                </h3>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {queuedSubmissions.length} queued
                </span>
              </div>

              {queuedSubmissions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <FlaskConical className="w-4 h-4 text-[#b47d12] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    No new classroom videos queued in this session yet. Submit a 2-minute
                    demonstration on the left to test Concierge PII stripping and SHA-256 intake!
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {queuedSubmissions.map((sub) => (
                    <div
                      key={sub.trackingId}
                      className="p-3.5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 text-slate-500 tabular-nums">
                        <span className="font-mono font-bold text-[#081d38]">{sub.trackingId}</span>
                        <span>{sub.track}</span>
                      </div>
                      <div className="font-bold text-[#081d38]">{sub.anonymizedTitle}</div>
                      <p className="text-slate-600 line-clamp-2">{sub.anonymizedSummary}</p>
                      <div className="text-[11px] font-mono text-emerald-700">
                        {sub.piiStatus} &middot; Prompt {sub.surprisePromptCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN COMIC LIGHTBOX MODAL */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200"
          >
            <div className="bg-[#081d38] text-white px-5 py-3.5 flex items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-semibold text-[#dfa62a] truncate">
                {activeLightboxItem.episodeCode} &middot; {activeLightboxItem.title}
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close lightbox"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={activeLightboxItem.image}
                alt={activeLightboxItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-5 space-y-3 bg-white">
              <p className="text-sm text-slate-800 leading-relaxed">{activeLightboxItem.caption}</p>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">
                  Cast: {activeLightboxItem.cast.join(' · ')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null
                          ? null
                          : (prev - 1 + filteredChronicles.length) % filteredChronicles.length
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#081d38] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null ? null : (prev + 1) % filteredChronicles.length
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
