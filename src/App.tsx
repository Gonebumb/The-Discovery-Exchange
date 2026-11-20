import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { ConciergePuppyWidget } from './components/ConciergePuppyWidget';
import { HomepageWindowGrid } from './components/HomepageWindowGrid';
import { OwnerPortalPage } from './components/OwnerPortalModal';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { PrivateVaultPortal } from './components/PrivateVaultPortal';
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
  const [manifestoHost, setManifestoHost] = useState<HTMLElement | null>(null);
  const [sectionBannerHost, setSectionBannerHost] = useState<HTMLElement | null>(null);
  const [activeCustomPage, setActiveCustomPage] = useState<'columbo' | 'pipito' | null>(null);
  const [isVaultFullscreen, setIsVaultFullscreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/vault' ||
      window.location.hash === '#tdex-vault'
    );
  });

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

      // Replace the below-hero manifesto copy while keeping the legacy Read More button mounted for modal clicks
      const legacyManifesto = document.querySelector('#root .tdex-manifesto-copy') as HTMLElement | null;
      const manifestoParent = legacyManifesto?.parentElement ?? null;
      if (legacyManifesto && manifestoParent) {
        legacyManifesto.style.display = 'none';
        let mHost = manifestoParent.querySelector('#tdex-manifesto-override-host') as HTMLElement | null;
        if (!mHost) {
          mHost = document.createElement('div');
          mHost.id = 'tdex-manifesto-override-host';
          manifestoParent.appendChild(mHost);
        }
        setManifestoHost((prev) => (prev === mHost ? prev : mHost));
      } else {
        setManifestoHost(null);
      }

      // Replace the navy section banner above the 15 windows ("What Is Inside The Discovery Exchange")
      const bannerEl = homeMain?.previousElementSibling as HTMLElement | null;
      if (bannerEl && bannerEl.tagName === 'DIV' && bannerEl.querySelector('h2')) {
        Array.from(bannerEl.children).forEach((child) => {
          const el = child as HTMLElement;
          if (el.id !== 'tdex-section-banner-host') {
            el.style.display = 'none';
          }
        });
        let bHost = bannerEl.querySelector('#tdex-section-banner-host') as HTMLElement | null;
        if (!bHost) {
          bHost = document.createElement('div');
          bHost.id = 'tdex-section-banner-host';
          bannerEl.appendChild(bHost);
        }
        setSectionBannerHost((prev) => (prev === bHost ? prev : bHost));
      } else {
        setSectionBannerHost(null);
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

    const handleSecretVaultSync = () => {
      const wantsVault =
        window.location.pathname === '/vault' || window.location.hash === '#tdex-vault';
      setIsVaultFullscreen(wantsVault);
    };
    const handleSecretHotkey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toUpperCase() === 'V') {
        e.preventDefault();
        setIsVaultFullscreen((prev) => {
          const next = !prev;
          if (next) {
            window.history.replaceState(null, '', '#tdex-vault');
          } else if (window.location.hash === '#tdex-vault' || window.location.pathname === '/vault') {
            window.history.replaceState(null, '', '/');
          }
          return next;
        });
      }
    };
    window.addEventListener('hashchange', handleSecretVaultSync);
    window.addEventListener('popstate', handleSecretVaultSync);
    window.addEventListener('keydown', handleSecretHotkey);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleHeaderClick, true);
      window.removeEventListener('hashchange', handleSecretVaultSync);
      window.removeEventListener('popstate', handleSecretVaultSync);
      window.removeEventListener('keydown', handleSecretHotkey);
    };
  }, []);

  // Hide homepage video hero banner and section banner when viewing full-page Columbo or Pipito overlay
  useEffect(() => {
    const homeMain = document.querySelector('#root main:not([id^="clean-page-"])') as HTMLElement | null;
    const prevEl = homeMain?.previousElementSibling as HTMLElement | null;
    if (prevEl) {
      prevEl.style.display = activeCustomPage ? 'none' : '';
    }
    const heroSection =
      prevEl?.tagName === 'SECTION'
        ? prevEl
        : (prevEl?.previousElementSibling as HTMLElement | null);
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
      {sectionBannerHost &&
        createPortal(
          <div className="max-w-5xl mx-auto space-y-1.5 text-center">
            <h2 className="font-serif text-xl sm:text-2xl lg:text-[1.58rem] font-bold tracking-wide text-white">
              The Discovery Exchange (Tdex) &amp; National Discovery Awards (NDA)
            </h2>
            <p className="text-sm sm:text-base text-[#fcd34d] font-bold">
              1. Dexpa, 2. The Discovery Marketplace, and 3. Discovery Brick Coin (DBC).
            </p>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal max-w-4xl mx-auto">
              These three foundations empower parents to become not members, but Owners—shielding
              family savings from inflation while funding the Discovery Awards with zero financial
              burden on our families.
              <span className="block sm:whitespace-nowrap mt-0.5">
                21st Century — OF the People, BY the People, FOR the People.
              </span>
            </p>
          </div>,
          sectionBannerHost
        )}
      {manifestoHost &&
        createPortal(
          <div className="space-y-2 text-[12.5px] sm:text-[13px] lg:text-[13.5px] leading-[1.4] font-normal text-slate-100">
            <p>
              During our generation’s tenure, American public school students have fallen to 26th
              place globally. As if that weren’t alarming enough, in Oregon, students no longer have
              to prove they can read, write, or do math to graduate. The root issue isn’t
              educators—it’s a political bureaucracy spiraling out of control, making the 2006 film{' '}
              <em>Idiocracy</em> look less like a comedy and more like a warning.
            </p>
            <p>
              Inspired by the Nobel Prize, The Discovery Exchange has bypassed the bureaucracy by
              creating the National Discovery Awards (NDA)—motivating public school teachers and
              students nationwide with thousands of real cash prizes.
            </p>
            <p>
              <span className="text-white font-semibold">Phase 1 &amp; 1,000-Owner Credit Union Roadmap:</span> Once NDA’s legal nonprofit
              sponsorship is finalized, NDA will welcome charitable donations and grants to honor
              great teachers and lift working-class students—while building toward full
              self-sustainability by 2028 through three interlocked foundations:{' '}
              <span className="text-white">
                1. Dexpa, 2. The Discovery Marketplace, and 3. Discovery Brick Coin (DBC).
              </span>{' '}
              Prior to reaching 1,000 verified Owners, TDEX charges $0 fees and never touches any
              money; at <strong>1,000 verified Owners</strong>, the Owner Board and Pushers file
              with the NCUA to charter our own 100% Owner-governed Federal Credit Union.
            </p>
            <p>
              Learn how NDA’s three mutually benefiting foundations work together to shield family
              savings from inflation while funding the awards below.
            </p>
          </div>,
          manifestoHost
        )}
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
      {isVaultFullscreen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-[#071936]">
          <PrivateVaultPortal
            onExitFullscreen={() => {
              setIsVaultFullscreen(false);
              if (
                window.location.hash === '#tdex-vault' ||
                window.location.pathname === '/vault'
              ) {
                window.history.replaceState(null, '', '/');
              }
            }}
          />
        </div>
      )}
    </>
  );
}
