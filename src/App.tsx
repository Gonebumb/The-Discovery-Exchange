import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { ConciergePuppyWidget } from './components/ConciergePuppyWidget';
import { HomepageWindowGrid } from './components/HomepageWindowGrid';
import { OwnerPortalPage } from './components/OwnerPortalModal';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { AuctionPropertyWatchPage } from './pages/AuctionPropertyWatchPage';
import { BrickCoinPage } from './pages/BrickCoinPage';
import { ColumboInvestigationPage } from './pages/ColumboInvestigationPage';
import { ConciergeQaPage } from './pages/ConciergeQaPage';
import { ConstitutionPage } from './pages/ConstitutionPage';
import { DiscoveryStudiosPage } from './pages/DiscoveryStudiosPage';
import { DonatePage } from './pages/DonatePage';
import { FashionGroupPage } from './pages/FashionGroupPage';
import { HowTdexWorksPage } from './pages/HowTdexWorksPage';
import { JuryArbitrationPage } from './pages/JuryArbitrationPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MomPopBoardPage } from './pages/MomPopBoardPage';
import { NationalDiscoveryAwardsPage } from './pages/NationalDiscoveryAwardsPage';
import { NationalRewardProgramPage } from './pages/NationalRewardProgramPage';
import { OpenChatRoomPage } from './pages/OpenChatRoomPage';
import { OpenLedgerAuditPage } from './pages/OpenLedgerAuditPage';
import { ParentsAllianceDexpaPage } from './pages/ParentsAllianceDexpaPage';
import { PastHistoryLessonsPage } from './pages/PastHistoryLessonsPage';
import { PipitoGatekeepingPage } from './pages/PipitoGatekeepingPage';
import { SchoolDistrictAwardsPage } from './pages/SchoolDistrictAwardsPage';
import { ScienceLabPage } from './pages/ScienceLabPage';
import { UniversalAiOperatingLawsPage } from './pages/UniversalAiOperatingLawsPage';

export default function App() {
  const [slotNdaNode, setSlotNdaNode] = useState<HTMLElement | null>(null);
  const [slotConstitutionNode, setSlotConstitutionNode] = useState<HTMLElement | null>(null);
  const [slotConciergeNode, setSlotConciergeNode] = useState<HTMLElement | null>(null);
  const [slotMemberCenterNode, setSlotMemberCenterNode] = useState<HTMLElement | null>(null);
  const [slotMomPopNode, setSlotMomPopNode] = useState<HTMLElement | null>(null);
  const [slotJuryNode, setSlotJuryNode] = useState<HTMLElement | null>(null);
  const [slotDexpaNode, setSlotDexpaNode] = useState<HTMLElement | null>(null);
  const [slotAwardsNode, setSlotAwardsNode] = useState<HTMLElement | null>(null);
  const [slotRewardProgramNode, setSlotRewardProgramNode] = useState<HTMLElement | null>(null);
  const [slotBrickCoinNode, setSlotBrickCoinNode] = useState<HTMLElement | null>(null);
  const [slotDonateNode, setSlotDonateNode] = useState<HTMLElement | null>(null);
  const [slotWtfChatNode, setSlotWtfChatNode] = useState<HTMLElement | null>(null);
  const [slotHeavenHellNode, setSlotHeavenHellNode] = useState<HTMLElement | null>(null);
  const [slotLabsNode, setSlotLabsNode] = useState<HTMLElement | null>(null);
  const [slotMarketplaceNode, setSlotMarketplaceNode] = useState<HTMLElement | null>(null);
  const [slotHowWorksNode, setSlotHowWorksNode] = useState<HTMLElement | null>(null);
  const [slotColumboNode, setSlotColumboNode] = useState<HTMLElement | null>(null);
  const [slotPipitoNode, setSlotPipitoNode] = useState<HTMLElement | null>(null);
  const [slotStudioNode, setSlotStudioNode] = useState<HTMLElement | null>(null);
  const [slot16Node, setSlot16Node] = useState<HTMLElement | null>(null);
  const [slot17Node, setSlot17Node] = useState<HTMLElement | null>(null);
  const [slot19Node, setSlot19Node] = useState<HTMLElement | null>(null);
  const [slot20Node, setSlot20Node] = useState<HTMLElement | null>(null);
  const [slot21Node, setSlot21Node] = useState<HTMLElement | null>(null);

  const [homeGridHost, setHomeGridHost] = useState<HTMLElement | null>(null);
  const [activeCustomPage, setActiveCustomPage] = useState<'columbo' | 'pipito' | null>(null);

  useEffect(() => {
    // Load the Drive LIVE_DIST_UPLOAD bundle once onto #root
    if (!document.querySelector('script[data-tdex-live-base="true"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/live-dist/assets/index-BUOPYDOV.js?v=20261118t';
      script.setAttribute('data-tdex-live-base', 'true');
      document.body.appendChild(script);
    }

    const syncSlots = () => {
      const nNda = document.getElementById('clean-page-nda');
      const nConstitution = document.getElementById('clean-page-constitution');
      const nConcierge = document.getElementById('clean-page-concierge_qa');
      const nMemberCenter = document.getElementById('clean-page-member_center');
      const nMomPop = document.getElementById('clean-page-mom_pop_board');
      const nJury = document.getElementById('clean-page-arbitration_board');
      const nDexpa = document.getElementById('clean-page-dexpa');
      const nAwards =
        document.getElementById('clean-page-awards') ??
        document.getElementById('clean-page-school_districts');
      const nRewardProgram =
        document.getElementById('clean-page-reward_program') ??
        document.getElementById('clean-page-national_reward');
      const nBrickCoin = document.getElementById('clean-page-brickcoin');
      const nDonate = document.getElementById('clean-page-donate');
      const nWtfChat =
        document.getElementById('clean-page-wtf_chat') ??
        document.getElementById('clean-page-chat_room') ??
        document.getElementById('clean-page-open_chat');
      const nHeavenHell = document.getElementById('clean-page-heaven_hell');
      const nLabs = document.getElementById('clean-page-labs');
      const nMarketplace = document.getElementById('clean-page-marketplace');
      const nHowWorks = document.getElementById('clean-page-how_tdex_works');
      const nColumbo = document.getElementById('clean-page-columbo');
      const nPipito = document.getElementById('clean-page-pipito');
      const nStudio =
        document.getElementById('clean-page-studio') ??
        document.getElementById('clean-page-coming_up_15');
      const n16 = document.getElementById('clean-page-coming_up_16');
      const n17 = document.getElementById('clean-page-coming_up_17');
      const n19 =
        document.getElementById('clean-page-coming_up_19') ??
        document.getElementById('clean-page-coming_up_18');
      const n20 = document.getElementById('clean-page-coming_up_20');
      const n21 = document.getElementById('clean-page-coming_up_21');

      setSlotNdaNode((prev) => (prev === nNda ? prev : nNda));
      setSlotConstitutionNode((prev) => (prev === nConstitution ? prev : nConstitution));
      setSlotConciergeNode((prev) => (prev === nConcierge ? prev : nConcierge));
      setSlotMemberCenterNode((prev) => (prev === nMemberCenter ? prev : nMemberCenter));
      setSlotMomPopNode((prev) => (prev === nMomPop ? prev : nMomPop));
      setSlotJuryNode((prev) => (prev === nJury ? prev : nJury));
      setSlotDexpaNode((prev) => (prev === nDexpa ? prev : nDexpa));
      setSlotAwardsNode((prev) => (prev === nAwards ? prev : nAwards));
      setSlotRewardProgramNode((prev) => (prev === nRewardProgram ? prev : nRewardProgram));
      setSlotBrickCoinNode((prev) => (prev === nBrickCoin ? prev : nBrickCoin));
      setSlotDonateNode((prev) => (prev === nDonate ? prev : nDonate));
      setSlotWtfChatNode((prev) => (prev === nWtfChat ? prev : nWtfChat));
      setSlotHeavenHellNode((prev) => (prev === nHeavenHell ? prev : nHeavenHell));
      setSlotLabsNode((prev) => (prev === nLabs ? prev : nLabs));
      setSlotMarketplaceNode((prev) => (prev === nMarketplace ? prev : nMarketplace));
      setSlotHowWorksNode((prev) => (prev === nHowWorks ? prev : nHowWorks));
      setSlotColumboNode((prev) => (prev === nColumbo ? prev : nColumbo));
      setSlotPipitoNode((prev) => (prev === nPipito ? prev : nPipito));
      setSlotStudioNode((prev) => (prev === nStudio ? prev : nStudio));
      setSlot16Node((prev) => (prev === n16 ? prev : n16));
      setSlot17Node((prev) => (prev === n17 ? prev : n17));
      setSlot19Node((prev) => (prev === n19 ? prev : n19));
      setSlot20Node((prev) => (prev === n20 ? prev : n20));
      setSlot21Node((prev) => (prev === n21 ? prev : n21));

      // Upgrade the homepage 12-card window grid to 15 cards (5 rows of 3) + QuickBridgePreviewModal
      const homeMain = document.querySelector('#root main:not([id^="clean-page-"])') as HTMLElement | null;
      if (homeMain) {
        const legacyGrid = homeMain.firstElementChild as HTMLElement | null;
        if (legacyGrid && legacyGrid.id !== 'tdex-15-window-host') {
          legacyGrid.style.display = 'none';
        }
        let host = homeMain.querySelector('#tdex-15-window-host') as HTMLElement | null;
        if (!host) {
          host = document.createElement('div');
          host.id = 'tdex-15-window-host';
          homeMain.appendChild(host);
        }
        setHomeGridHost((prev) => (prev === host ? prev : host));
      } else {
        setHomeGridHost(null);
      }
    };

    syncSlots();

    const rootEl = document.getElementById('root') ?? document.body;
    const observer = new MutationObserver(syncSlots);
    observer.observe(rootEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id'],
    });

    // Reset custom Columbo/Pipito full-page overlay whenever a top header nav button is clicked
    const handleHeaderClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#root header button')) {
        setActiveCustomPage(null);
      }
    };
    document.addEventListener('click', handleHeaderClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleHeaderClick, true);
    };
  }, []);

  // Hide homepage video hero banner when viewing full-page Columbo or Pipito overlay
  useEffect(() => {
    const homeMain = document.querySelector('#root main:not([id^="clean-page-"])') as HTMLElement | null;
    const heroSection = homeMain?.previousElementSibling as HTMLElement | null;
    if (heroSection && heroSection.tagName === 'SECTION') {
      heroSection.style.display = activeCustomPage ? 'none' : '';
    }
  }, [activeCustomPage, homeGridHost]);

  const navigateByButtonLabel = useCallback((label: string) => {
    setActiveCustomPage(null);
    const buttons = Array.from(document.querySelectorAll('#root header button'));
    const normalized = label.trim().toLowerCase();
    const targetBtn = buttons.find((btn) => {
      const txt = (btn.textContent || '').replace(/^[•\s]+/, '').trim().toLowerCase();
      return txt === normalized || txt.includes(normalized);
    }) as HTMLButtonElement | undefined;

    if (targetBtn) {
      targetBtn.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenCustomPage = useCallback((page: 'columbo' | 'pipito') => {
    setActiveCustomPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {homeGridHost &&
        createPortal(
          activeCustomPage ? (
            <div className="max-w-[1280px] mx-auto pt-8 space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCustomPage(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to 15 Homepage Windows</span>
                </button>
              </div>
              {activeCustomPage === 'columbo' ? (
                <ColumboInvestigationPage />
              ) : (
                <PipitoGatekeepingPage />
              )}
            </div>
          ) : (
            <HomepageWindowGrid
              onNavigateByButtonLabel={navigateByButtonLabel}
              onOpenCustomPage={handleOpenCustomPage}
            />
          ),
          homeGridHost
        )}
      {slotNdaNode && createPortal(<NationalDiscoveryAwardsPage />, slotNdaNode)}
      {slotConstitutionNode && createPortal(<ConstitutionPage />, slotConstitutionNode)}
      {slotConciergeNode && createPortal(<ConciergeQaPage />, slotConciergeNode)}
      {slotMemberCenterNode && createPortal(<OwnerPortalPage />, slotMemberCenterNode)}
      {slotMomPopNode && createPortal(<MomPopBoardPage />, slotMomPopNode)}
      {slotJuryNode && createPortal(<JuryArbitrationPage />, slotJuryNode)}
      {slotDexpaNode && createPortal(<ParentsAllianceDexpaPage />, slotDexpaNode)}
      {slotAwardsNode && createPortal(<SchoolDistrictAwardsPage />, slotAwardsNode)}
      {slotRewardProgramNode && createPortal(<NationalRewardProgramPage />, slotRewardProgramNode)}
      {slotBrickCoinNode && createPortal(<BrickCoinPage />, slotBrickCoinNode)}
      {slotDonateNode && createPortal(<DonatePage />, slotDonateNode)}
      {slotWtfChatNode && createPortal(<OpenChatRoomPage />, slotWtfChatNode)}
      {slotHeavenHellNode &&
        createPortal(
          <OpenChatRoomPage
            defaultChannel="open_debate"
            roomTitle="Open Heaven / Hell Room — Candid Review & Parent Opinion Line"
          />,
          slotHeavenHellNode
        )}
      {slotLabsNode && createPortal(<ScienceLabPage />, slotLabsNode)}
      {slotMarketplaceNode && createPortal(<MarketplacePage />, slotMarketplaceNode)}
      {slotHowWorksNode && createPortal(<HowTdexWorksPage />, slotHowWorksNode)}
      {slotColumboNode && createPortal(<ColumboInvestigationPage />, slotColumboNode)}
      {slotPipitoNode && createPortal(<PipitoGatekeepingPage />, slotPipitoNode)}
      {slotStudioNode && createPortal(<DiscoveryStudiosPage />, slotStudioNode)}
      {slot16Node && createPortal(<FashionGroupPage />, slot16Node)}
      {slot17Node && createPortal(<AuctionPropertyWatchPage />, slot17Node)}
      {slot19Node && createPortal(<OpenLedgerAuditPage />, slot19Node)}
      {slot20Node && createPortal(<PastHistoryLessonsPage />, slot20Node)}
      {slot21Node && createPortal(<UniversalAiOperatingLawsPage />, slot21Node)}
      <OfflineIndicator />
      <PWAInstallButton />
      <ConciergePuppyWidget />
    </>
  );
}
