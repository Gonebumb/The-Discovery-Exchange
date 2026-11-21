import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Coins,
  Filter,
  Gavel,
  Home,
  ImagePlus,
  Layers,
  Lock,
  MapPin,
  PackagePlus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { getOwnerToken } from "../lib/ownerSession";
import {
  AUTHORIZED_SUPPLY_CEILING,
  CONSTITUTIONAL_DBC_POOLS,
  CrossNamespaceAtomicCoordinator,
  SupplyAllocationPoolShard,
  VestingRegistryStateShard,
  VestingSchedule,
  WalletBalanceStateShard,
  computeArticle11SplitCents,
  runCompleteBrickCoinVerificationSuite,
} from "../utils/brickcoinProtocolEngine";

interface DiscoveryMarketViewProps {
  onOpenConstitution?: () => void;
  onOpenOwnerSignup?: () => void;
}

interface GarageItem {
  id: string;
  title: string;
  category: string;
  material: string;
  itemType: string;
  imageUrl: string;
  price: number;
  location: string;
  sellerFamily: string;
  sellerEmail?: string;
  description: string;
  condition: string;
  badge?: string;
  iconType: string;
  deliveryMethod?: "local_pickup" | "free_shipping" | "flat_rate_shipping";
  shippingFeeUsd?: number;
}

const DEFAULT_PHOTO_BY_ID: Record<string, string> = {
  "item-telescope": "/src/assets/images/market_telescope_1795215571680.jpg",
  "item-tool-chest": "/src/assets/images/market_tool_chest_1795215571467.jpg",
  "item-violin": "/src/assets/images/market_violin_1795215572717.jpg",
  "item-trail-bike": "/src/assets/images/market_mountain_bike_1795215572605.jpg",
  "item-microscope": "/src/assets/images/market_microscope_1795215589823.jpg",
  "item-workbench": "/src/assets/images/market_workbench_1795215590068.jpg",
  "item-3d-printer": "/src/assets/images/market_3d_printer_1795215590079.jpg",
  "item-electric-guitar": "/src/assets/images/market_electric_guitar_1795215589789.jpg",
};

const DEFAULT_META_BY_ID: Record<string, { material: string; itemType: string }> = {
  "item-telescope": { material: "Aluminum & Glass Optics", itemType: "Optics & Lab Gear" },
  "item-tool-chest": { material: "Steel & Metal", itemType: "Hand & Shop Tools" },
  "item-violin": { material: "Wood", itemType: "Musical Instruments" },
  "item-trail-bike": { material: "Aluminum", itemType: "Bicycles & Outdoor" },
  "item-microscope": { material: "Glass & Optics", itemType: "Optics & Lab Gear" },
  "item-workbench": { material: "Wood & Steel", itemType: "Workbenches & Furniture" },
  "item-3d-printer": { material: "Electronics & Polymer", itemType: "3D & Tech Equipment" },
  "item-electric-guitar": { material: "Wood & Electronics", itemType: "Musical Instruments" },
};

function getFallbackPhotoForCategory(category: string): string {
  switch (category) {
    case "Tools & Workshop":
    case "Building & Materials":
    case "Auto & Garage":
      return "/src/assets/images/market_tool_chest_1795215571467.jpg";
    case "Science & Education":
    case "Electronics & Tech":
      return "/src/assets/images/market_3d_printer_1795215590079.jpg";
    case "Music & Arts":
      return "/src/assets/images/market_electric_guitar_1795215589789.jpg";
    case "Bikes & Sports":
    case "Kids & Family":
      return "/src/assets/images/market_mountain_bike_1795215572605.jpg";
    case "Home & Furniture":
      return "/src/assets/images/market_workbench_1795215590068.jpg";
    default:
      return "/src/assets/images/online_discovery_marketplace_1795199437252.jpg";
  }
}

function enrichMarketplaceItem(raw: Partial<GarageItem> & { id: string; title: string; category: string; price: number }): GarageItem {
  const idMeta = DEFAULT_META_BY_ID[raw.id];
  const imageUrl =
    (raw.imageUrl && raw.imageUrl.trim()) ||
    DEFAULT_PHOTO_BY_ID[raw.id] ||
    getFallbackPhotoForCategory(raw.category);
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category || "Tools & Workshop",
    material: raw.material || idMeta?.material || "Mixed Materials",
    itemType: raw.itemType || idMeta?.itemType || "Home & Garage Goods",
    imageUrl,
    price: Number(raw.price || 0),
    location: raw.location || "Local Community",
    sellerFamily: raw.sellerFamily || "Verified Family Listing",
    sellerEmail: raw.sellerEmail,
    description:
      raw.description ||
      "Item listed from a neighborhood garage—ready to build cooperative property equity.",
    condition: raw.condition || "Very Good",
    badge: raw.badge,
    iconType: raw.iconType || "tools",
    deliveryMethod: raw.deliveryMethod || "local_pickup",
    shippingFeeUsd: Number(raw.shippingFeeUsd || 0),
  };
}

const INITIAL_TRADE_ITEMS: GarageItem[] = [
  {
    id: "item-telescope",
    title: "Celestron 70mm Student Refractor Telescope",
    category: "Science & Education",
    material: "Aluminum & Glass Optics",
    itemType: "Optics & Lab Gear",
    imageUrl: "/src/assets/images/market_telescope_1795215571680.jpg",
    price: 120,
    location: "Oakland Hills, CA",
    sellerFamily: "The Miller Family",
    description: "Used for two middle-school astronomy terms. Includes full aluminum tripod, 20mm eyepiece, finder scope, and solar filter. Clean glass optics, ready for backyard stargazing or school science fairs.",
    condition: "Excellent",
    badge: "Student Science",
    iconType: "telescope",
  },
  {
    id: "item-tool-chest",
    title: "Craftsman 120-Piece Socket & Mechanics Chest",
    category: "Tools & Workshop",
    material: "Steel & Metal",
    itemType: "Hand & Shop Tools",
    imageUrl: "/src/assets/images/market_tool_chest_1795215571467.jpg",
    price: 100,
    location: "Columbus, OH",
    sellerFamily: "Dave & Sarah K.",
    description: "Classic red steel mechanics chest with chrome vanadium metric and SAE sockets, two quick-release ratchets, extensions, and hex keys. Complete 120-piece garage set with zero missing sockets.",
    condition: "Like New",
    badge: "Article 12.1 Anchor",
    iconType: "tools",
  },
  {
    id: "item-violin",
    title: "1/2 Size Student Violin with Horsehair Bow & Hard Case",
    category: "Music & Arts",
    material: "Wood",
    itemType: "Musical Instruments",
    imageUrl: "/src/assets/images/market_violin_1795215572717.jpg",
    price: 160,
    location: "Philadelphia, PA",
    sellerFamily: "The Chen Family",
    description: "Handcrafted solid spruce top and maple back with warm tone, ebony fingerboard, horsehair bow, and plush velvet-lined hard carrying case. Outgrown by our 6th grader who moved up to a full-size violin.",
    condition: "Very Good",
    badge: "Youth Arts",
    iconType: "music",
  },
  {
    id: "item-trail-bike",
    title: "Trek 24-Inch Aluminum Youth Mountain Bike",
    category: "Bikes & Sports",
    material: "Aluminum",
    itemType: "Bicycles & Outdoor",
    imageUrl: "/src/assets/images/market_mountain_bike_1795215572605.jpg",
    price: 80,
    location: "Austin, TX",
    sellerFamily: "The Jackson Family",
    description: "Lightweight blue-and-silver aluminum frame, brand-new trail tires, front suspension fork, 7-speed Shimano shifting, and freshly tuned brakes. Great for riding to school or weekend neighborhood trails.",
    condition: "Good",
    badge: "Neighborhood Active",
    iconType: "bike",
  },
  {
    id: "item-microscope",
    title: "AmScope 1200x Compound Student Microscope + Slide Box",
    category: "Science & Education",
    material: "Glass & Optics",
    itemType: "Optics & Lab Gear",
    imageUrl: "/src/assets/images/market_microscope_1795215589823.jpg",
    price: 90,
    location: "Denver, CO",
    sellerFamily: "Marcus T. (Science Teacher)",
    description: "Sturdy metal-body compound microscope with LED illumination, precision glass objective lenses, fine focus knobs, and a wooden box of 25 prepared biology specimen slides.",
    condition: "Like New",
    badge: "Public Schools Ready",
    iconType: "microscope",
  },
  {
    id: "item-workbench",
    title: "Solid Maple Garage Workbench with Dual Woodworking Vises",
    category: "Tools & Workshop",
    material: "Wood & Steel",
    itemType: "Workbenches & Furniture",
    imageUrl: "/src/assets/images/market_workbench_1795215590068.jpg",
    price: 240,
    location: "Pittsburgh, PA",
    sellerFamily: "The Alvarez Family",
    description: "Heavy-duty 5-foot butcher-block solid maple hardwood top with powder-coated steel legs, lower mesh storage shelf, and integrated cast-iron 7-inch woodworking vises.",
    condition: "Very Good",
    badge: "Garage Heavy",
    iconType: "workbench",
  },
  {
    id: "item-3d-printer",
    title: "Creality Ender-3 V2 3D Printer + 2 Filament Spools",
    category: "Electronics & Tech",
    material: "Electronics & Polymer",
    itemType: "3D & Tech Equipment",
    imageUrl: "/src/assets/images/market_3d_printer_1795215590079.jpg",
    price: 180,
    location: "Atlanta, GA",
    sellerFamily: "The Patel Family",
    description: "Rigid black aluminum extrusion frame with heated glass build plate, silent stepper motherboard, leveled and calibrated for youth robotics & STEM prototyping. Includes 2 spools of PLA filament.",
    condition: "Excellent",
    badge: "Invention Lab",
    iconType: "printer",
  },
  {
    id: "item-electric-guitar",
    title: "Fender Squier Mini Electric Guitar & Practice Amp",
    category: "Music & Arts",
    material: "Wood & Electronics",
    itemType: "Musical Instruments",
    imageUrl: "/src/assets/images/market_electric_guitar_1795215589789.jpg",
    price: 140,
    location: "Nashville, TN",
    sellerFamily: "The Ramirez Family",
    description: "Sunburst 3/4-size solid-body electric guitar with wooden display stand, braided instrument cable, and compact 10-watt Fender practice amplifier. Clean tone and ready for a young musician.",
    condition: "Excellent",
    badge: "Starter Gear",
    iconType: "guitar",
  },
];

const CATEGORIES = [
  "All Sections",
  "Tools & Workshop",
  "Science & Education",
  "Music & Arts",
  "Bikes & Sports",
  "Home & Furniture",
  "Electronics & Tech",
  "Building & Materials",
  "Kids & Family",
  "Auto & Garage",
  "Clothing & Gear",
  "Other Items",
] as const;

const MATERIAL_FILTERS = [
  "All Materials",
  "Wood",
  "Steel & Metal",
  "Aluminum",
  "Glass & Optics",
  "Electronics & Polymer",
  "Fabric & Leather",
  "Mixed Materials",
] as const;

const ITEM_TYPE_FILTERS = [
  "All Item Types",
  "Hand & Shop Tools",
  "Bicycles & Outdoor",
  "Musical Instruments",
  "Optics & Lab Gear",
  "3D & Tech Equipment",
  "Workbenches & Furniture",
  "Home & Garage Goods",
] as const;

export const MarketplacePage: React.FC<DiscoveryMarketViewProps> = ({
  onOpenConstitution,
  onOpenOwnerSignup,
}) => {
  const [items, setItems] = useState<GarageItem[]>(INITIAL_TRADE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Sections");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All Materials");
  const [selectedItemType, setSelectedItemType] = useState<string>("All Item Types");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  // "Explore More" opens the full explanation window RIGHT ON TOP of the Marketplace
  const [showExploreModal, setShowExploreModal] = useState<boolean>(false);
  // Clicking any Marketplace item card opens its full Amazon-style description window on top
  const [selectedDetailItem, setSelectedDetailItem] = useState<GarageItem | null>(null);

  // Active receipt simulator state
  const [activeItemForReceipt, setActiveItemForReceipt] = useState<GarageItem | null>(null);
  const [simulatedTradesCount, setSimulatedTradesCount] = useState<number>(0);
  const [accumulatedSellerCash, setAccumulatedSellerCash] = useState<number>(0);
  const [accumulatedPropertyCredit, setAccumulatedPropertyCredit] = useState<number>(0);
  const [signedInWallet, setSignedInWallet] = useState<{
    email: string;
    accumulationBalanceUsd: number;
    sellerCashBalanceUsd: number;
    dbcBalance: number;
  } | null>(null);
  const [showSuccessStamp, setShowSuccessStamp] = useState(false);
  const [isTradeBusy, setIsTradeBusy] = useState(false);
  const [isListingBusy, setIsListingBusy] = useState(false);
  const [serverOrderAudit, setServerOrderAudit] = useState<{
    mode: string;
    columboAuditHash: string;
    notice: string;
    receiptId?: string;
    paypalOrderId?: string;
    approveUrl?: string;
  } | null>(null);

  // "Add Your Item" Modal State
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Tools & Workshop");
  const [newMaterial, setNewMaterial] = useState<string>("Steel & Metal");
  const [newItemType, setNewItemType] = useState<string>("Hand & Shop Tools");
  const [newCondition, setNewCondition] = useState<string>("Very Good");
  const [newPrice, setNewPrice] = useState<number>(75);
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newDeliveryMethod, setNewDeliveryMethod] = useState<
    "local_pickup" | "free_shipping" | "flat_rate_shipping"
  >("local_pickup");
  const [newShippingFeeUsd, setNewShippingFeeUsd] = useState<number>(12);
  const [acceptedSafetyPolicy, setAcceptedSafetyPolicy] = useState<boolean>(false);
  const [listingValidationError, setListingValidationError] = useState<string | null>(null);

  // Delivery Tracking (5-business-day carrier tracking) & Two-Way Blind Simultaneous 1–5 Star Ratings
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [savedTrackingMap, setSavedTrackingMap] = useState<Record<string, string>>({});
  const [ratingStateMap, setRatingStateMap] = useState<
    Record<
      string,
      {
        buyerStars: number;
        sellerStars: number;
        buyerSubmitted: boolean;
        sellerSubmitted: boolean;
        disputeFiled: boolean;
      }
    >
  >({});

  const getItemRatingState = (itemId: string) =>
    ratingStateMap[itemId] ?? {
      buyerStars: 5,
      sellerStars: 5,
      buyerSubmitted: false,
      sellerSubmitted: false,
      disputeFiled: false,
    };

  const formatDeliveryLabel = (item: GarageItem) => {
    if (item.deliveryMethod === "free_shipping") return "Free Shipping (5-Day Tracking)";
    if (item.deliveryMethod === "flat_rate_shipping") {
      return `Flat-Rate Shipping (+${formatUsd(item.shippingFeeUsd || 12)} to Seller)`;
    }
    return "Local Pickup Only (4-Digit Code)";
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 720;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setNewImageUrl(canvas.toDataURL("image/jpeg", 0.78));
        }
      };
      if (typeof reader.result === "string") {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const refreshPersistedMarketplace = useCallback(async () => {
    try {
      const res = await fetch("/api/marketplace/items");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items.map((rawItem: GarageItem) => enrichMarketplaceItem(rawItem)));
        }
        if (data.summary) {
          setSimulatedTradesCount(Number(data.summary.totalTrades || 0));
          setAccumulatedSellerCash(Number(data.summary.totalSellerCashUsd || 0));
          setAccumulatedPropertyCredit(Number(data.summary.totalPropertyAccumulationUsd || 0));
        }
      }
    } catch {
      // Retain seeded state when offline
    }

    const token = getOwnerToken();
    if (token) {
      try {
        const walletRes = await fetch("/api/wallets/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (walletRes.ok) {
          const w = await walletRes.json();
          setSignedInWallet({
            email: String(w.email || ""),
            accumulationBalanceUsd: Number(w.accumulationBalanceUsd || 0),
            sellerCashBalanceUsd: Number(w.sellerCashBalanceUsd || 0),
            dbcBalance: Number(w.dbcBalance || 0),
          });
        }
      } catch {
        // Ignore transient wallet fetch errors
      }
    }
  }, []);

  useEffect(() => {
    void refreshPersistedMarketplace();
  }, [refreshPersistedMarketplace]);

  // Live Calculator State
  const [customSalePrice, setCustomSalePrice] = useState<number>(100);

  // Foreclosure & Auction 20%-30% Discount + Discovery BrickCoin Value-Carrier Calculator State
  const [buildingMarketValue, setBuildingMarketValue] = useState<number>(5000000);
  const [auctionDiscountPct, setAuctionDiscountPct] = useState<20 | 25 | 30>(25);
  const [dbcMechanismTab, setDbcMechanismTab] = useState<"value-carrier" | "protocol-v2">(
    "value-carrier"
  );
  const [simBlockHeight, setSimBlockHeight] = useState<number>(500);
  const [simProportionalHold, setSimProportionalHold] = useState<boolean>(true);
  const [simGlobalQuarantine, setSimGlobalQuarantine] = useState<boolean>(false);
  const [selectedPoolKey, setSelectedPoolKey] = useState<string>("POOL_OWNER_COMMUNITY");
  const [protocolActionBanner, setProtocolActionBanner] = useState<{
    status: "pass" | "blocked";
    title: string;
    detail: string;
    compositeRootHex: string;
  } | null>(null);

  // Live deterministic 19-check verification & vesting simulation
  const verificationReport = useMemo(() => runCompleteBrickCoinVerificationSuite(), []);

  const liveVestingMath = useMemo(() => {
    const vShard = new VestingRegistryStateShard();
    const totalLot = 1_000_000;
    const sched = new VestingSchedule("LOT_ALPHA_1", totalLot, 0, 100, 1000);
    const reg = { OWNER_ALPHA: [sched] };
    const qMap = { OWNER_ALPHA: simGlobalQuarantine };
    const hKey = VestingRegistryStateShard.holdKey("OWNER_ALPHA", "LOT_ALPHA_1");
    const hMap = { [hKey]: simProportionalHold };

    const spendable = vShard.computeSpendableAllowanceFromState(
      reg,
      qMap,
      hMap,
      "OWNER_ALPHA",
      simBlockHeight,
      totalLot
    );
    const locked = totalLot - spendable;
    const vestingRootHex = vShard.computeRootHashFromState(reg, qMap, hMap).toHex();

    return {
      totalLot,
      spendable,
      locked,
      vestingRootHex,
      stageLabel:
        simGlobalQuarantine
          ? "Global Quarantine Active (0 Spendable)"
          : simBlockHeight < 100
          ? "Pre-Cliff Lock (Block < 100)"
          : simBlockHeight >= 1000
          ? "Post-Maturity (100% Unlocked)"
          : simProportionalHold
          ? "Linear Vesting + Proportional Hold Cap (Unvested Frozen, Vested Protected)"
          : "Linear Interval Release (Module 06 u128 Math)",
    };
  }, [simBlockHeight, simProportionalHold, simGlobalQuarantine]);

  const handleRunLiveProtocolScenario = (
    scenario: "issue-pool" | "valid-nonce" | "replay-gap" | "mid-commit-fault"
  ) => {
    const s = new SupplyAllocationPoolShard();
    const w = new WalletBalanceStateShard();
    const v = new VestingRegistryStateShard();
    w.forceMintInitialAllocation("OWNER_ALPHA", 1_000_000);
    v.registry["OWNER_ALPHA"] = [new VestingSchedule("LOT_ALPHA_1", 1_000_000, 0, 100, 1000)];
    const coord = new CrossNamespaceAtomicCoordinator(s, w, v);

    if (scenario === "issue-pool") {
      const sched = new VestingSchedule("LOT_AUCTION_START", 250_000, 0, 100, 1000);
      const pkg = coord.executeIsolatedStagingTransaction(
        "ISSUANCE_CREDIT",
        {
          poolKey: selectedPoolKey,
          recipientId: "OWNER_AUCTION_RESERVE",
          amount: 250_000,
          conditionalSchedule: sched,
        },
        500
      );
      if (pkg && coord.commitStagedPackage(pkg)) {
        setProtocolActionBanner({
          status: "pass",
          title: `Issued 250,000 DBC from ${selectedPoolKey} (Atomic Commit PASS)`,
          detail:
            "Unissued pool decremented, total issued supply incremented, and matched 1,000-block vesting schedule bound into all 3 shards.",
          compositeRootHex: pkg.compositeResultStateRoot.toHex(),
        });
      }
    } else if (scenario === "valid-nonce") {
      const pkg = coord.executeIsolatedStagingTransaction(
        "ORDINARY_TRANSFER_X",
        {
          senderId: "OWNER_ALPHA",
          recipientId: "OWNER_BETA",
          amount: 100_000,
          nonce: 1,
          enforceStrictNonce: true,
        },
        500
      );
      if (pkg && coord.commitStagedPackage(pkg)) {
        setProtocolActionBanner({
          status: "pass",
          title: "Sequential Nonce (+1) Transfer Committed (SCHEMA_V2 Root Updated)",
          detail:
            "Transferred 100,000 vested DBC at Block 500 with strict sequential nonce = 1. Both balance and nonce are cryptographically bound into the Wallet V2 & Composite SHA-256 root.",
          compositeRootHex: pkg.compositeResultStateRoot.toHex(),
        });
      }
    } else if (scenario === "replay-gap") {
      const preRoot = CrossNamespaceAtomicCoordinator.computeMasterCompositeRoot(
        s.computeRootHashFromState(s.remainingUnissuedBalances, s.totalIssuedSupply),
        w.computeRootHashFromState(w.ledger, w.nonces),
        v.computeRootHashFromState(v.registry, v.quarantineMap, v.scheduleHoldMap)
      ).toHex();
      const pkg = coord.executeIsolatedStagingTransaction(
        "ORDINARY_TRANSFER_X",
        {
          senderId: "OWNER_ALPHA",
          recipientId: "OWNER_BETA",
          amount: 100_000,
          nonce: 10, // Illegal gap nonce!
          enforceStrictNonce: true,
        },
        500
      );
      if (pkg === null) {
        setProtocolActionBanner({
          status: "blocked",
          title: "Replay / Nonce-Gap Attack Blocked (Zero State Drift)",
          detail:
            "Attempted transfer with Nonce 10 when registered Nonce was 0. Rejected at staging gate under strict sequential admission (incoming === current + 1).",
          compositeRootHex: preRoot,
        });
      }
    } else if (scenario === "mid-commit-fault") {
      const preRoot = CrossNamespaceAtomicCoordinator.computeMasterCompositeRoot(
        s.computeRootHashFromState(s.remainingUnissuedBalances, s.totalIssuedSupply),
        w.computeRootHashFromState(w.ledger, w.nonces),
        v.computeRootHashFromState(v.registry, v.quarantineMap, v.scheduleHoldMap)
      ).toHex();
      const pkg = coord.executeIsolatedStagingTransaction(
        "ORDINARY_TRANSFER_X",
        {
          senderId: "OWNER_ALPHA",
          recipientId: "OWNER_BETA",
          amount: 50_000,
          nonce: 1,
          enforceStrictNonce: true,
        },
        500
      );
      const committed = pkg ? coord.commitStagedPackage(pkg, true) : false;
      const postRoot = CrossNamespaceAtomicCoordinator.computeMasterCompositeRoot(
        s.computeRootHashFromState(s.remainingUnissuedBalances, s.totalIssuedSupply),
        w.computeRootHashFromState(w.ledger, w.nonces),
        v.computeRootHashFromState(v.registry, v.quarantineMap, v.scheduleHoldMap)
      ).toHex();
      if (!committed && preRoot === postRoot) {
        setProtocolActionBanner({
          status: "blocked",
          title: "Simulated Mid-Commit Fault → 100% Atomic Rollback Verified",
          detail:
            "Injected hardware exception mid-commit. All 3 shards (Supply, Wallet+Nonce, Vesting) rolled back automatically with byte-for-byte identical SHA-256 state roots.",
          compositeRootHex: postRoot,
        });
      }
    }
  };

  // 60-Second "Garage-to-Equity" 3-Step Visual Slider Story State
  const [storyStep, setStoryStep] = useState<1 | 2 | 3>(1);
  const [storyItemValue, setStoryItemValue] = useState<number>(120);
  const [storyItemLabel, setStoryItemLabel] = useState<string>(
    "Outgrown Kids' Bike & Stroller ($120)"
  );

  const safeCustomPrice = Number.isFinite(customSalePrice)
    ? Math.max(0, Math.min(10000, customSalePrice))
    : 0;
  const customSplit = computeArticle11SplitCents(Math.round(safeCustomPrice * 100));

  const formatUsd = (val: number) =>
    val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });

  // Filtered & sorted items across sections, materials, item types, and free-text search
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = items.filter((item) => {
      const matchesSection =
        selectedCategory === "All Sections" || item.category === selectedCategory;
      const matchesMaterial =
        selectedMaterial === "All Materials" ||
        item.material.toLowerCase().includes(selectedMaterial.toLowerCase().split(" ")[0]);
      const matchesType =
        selectedItemType === "All Item Types" || item.itemType === selectedItemType;
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q) ||
        item.itemType.toLowerCase().includes(q) ||
        item.condition.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.sellerFamily.toLowerCase().includes(q);
      return matchesSection && matchesMaterial && matchesType && matchesSearch;
    });

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [items, selectedCategory, selectedMaterial, selectedItemType, searchQuery, sortBy]);

  const handleSimulateCheckout = (item: GarageItem) => {
    setActiveItemForReceipt(item);
    setShowSuccessStamp(false);
    setServerOrderAudit(null);
  };

  const handlePayPalSandboxCheckout = async () => {
    if (!activeItemForReceipt || isTradeBusy) return;
    setIsTradeBusy(true);
    const token = getOwnerToken();

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/marketplace/create-paypal-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          itemId: activeItemForReceipt.id,
          itemTitle: activeItemForReceipt.title,
          priceUsd: activeItemForReceipt.price,
          sellerEmail: activeItemForReceipt.sellerEmail,
          buyerEmail: signedInWallet?.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setServerOrderAudit({
          receiptId: String(data.receipt?.receiptId || data.orderTrackingId || ""),
          paypalOrderId: String(data.id || ""),
          approveUrl: data.approveUrl ? String(data.approveUrl) : undefined,
          mode: String(data.mode || "PAYPAL_SANDBOX_ORDER"),
          columboAuditHash: String(data.columboAuditHash || ""),
          notice: String(
            data.notice ||
              "PayPal Sandbox 50/25/25 checkout active: segregated processor wallets updated (TDEX never holds funds)."
          ),
        });
        setShowSuccessStamp(true);
        await refreshPersistedMarketplace();
        if (!data.approveUrl) {
          setTimeout(() => {
            setActiveItemForReceipt(null);
            setShowSuccessStamp(false);
          }, 2800);
        }
        return;
      }
    } catch {
      // Fall through to local split fallback if offline
    } finally {
      setIsTradeBusy(false);
    }

    await handleConfirmSimulatedTrade();
  };

  const handleConfirmSimulatedTrade = async () => {
    if (!activeItemForReceipt || isTradeBusy) return;
    setIsTradeBusy(true);
    const token = getOwnerToken();

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/marketplace/execute-trade", {
        method: "POST",
        headers,
        body: JSON.stringify({
          itemId: activeItemForReceipt.id,
          itemTitle: activeItemForReceipt.title,
          priceUsd: activeItemForReceipt.price,
          sellerEmail: activeItemForReceipt.sellerEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setServerOrderAudit({
          receiptId: String(data.receipt?.receiptId || ""),
          mode: String(data.receipt?.mode || "SANDBOX_SIMULATED_ESCROW_HOLD"),
          columboAuditHash: String(data.receipt?.columboAuditHash || ""),
          notice: String(
            data.notice ||
              "Persisted 50/25/25 split recorded atomically in store and append-only ledger."
          ),
        });
        setShowSuccessStamp(true);
        await refreshPersistedMarketplace();
        setTimeout(() => {
          setActiveItemForReceipt(null);
          setShowSuccessStamp(false);
        }, 2500);
        return;
      }
    } catch {
      // Fallback below if running without server
    } finally {
      setIsTradeBusy(false);
    }

    const itemSplit = computeArticle11SplitCents(Math.round(activeItemForReceipt.price * 100));
    setShowSuccessStamp(true);
    setSimulatedTradesCount((p) => p + 1);
    setAccumulatedSellerCash((p) => p + itemSplit.sellerCashUsd);
    setAccumulatedPropertyCredit((p) => p + itemSplit.sellerEquityUsd + itemSplit.buyerEquityUsd);
    setTimeout(() => {
      setActiveItemForReceipt(null);
      setShowSuccessStamp(false);
    }, 2200);
  };

  const handleCreateNewListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedSafetyPolicy) {
      setListingValidationError(
        "You must confirm this item is legal, safe, not recalled, and contains zero prohibited items before publishing."
      );
      return;
    }
    if (!newTitle.trim() || newPrice <= 0 || isListingBusy) return;
    setListingValidationError(null);
    setIsListingBusy(true);

    const token = getOwnerToken();
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/marketplace/list-item", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          material: newMaterial,
          itemType: newItemType,
          condition: newCondition,
          imageUrl: newImageUrl || getFallbackPhotoForCategory(newCategory),
          price: newPrice,
          location: newLocation.trim() || "Local Community",
          description: newDescription.trim(),
          deliveryMethod: newDeliveryMethod,
          shippingFeeUsd: newDeliveryMethod === "flat_rate_shipping" ? newShippingFeeUsd : 0,
          safetyAttestationAccepted: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const persistedItem = enrichMarketplaceItem(data.item as GarageItem);
        setItems((prev) => [persistedItem, ...prev.filter((it) => it.id !== persistedItem.id)]);
        setIsListingModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewLocation("");
        setNewImageUrl("");
        setNewPrice(75);
        setNewDeliveryMethod("local_pickup");
        setNewShippingFeeUsd(12);
        setAcceptedSafetyPolicy(false);
        setSelectedDetailItem(persistedItem);
        return;
      }
    } catch {
      // Offline fallback below
    } finally {
      setIsListingBusy(false);
    }

    const newItem: GarageItem = {
      id: `item-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      material: newMaterial,
      itemType: newItemType,
      imageUrl: newImageUrl || getFallbackPhotoForCategory(newCategory),
      price: newPrice,
      deliveryMethod: newDeliveryMethod,
      shippingFeeUsd: newDeliveryMethod === "flat_rate_shipping" ? newShippingFeeUsd : 0,
      location: newLocation.trim() || "Local Community",
      sellerFamily: "You (Your Family Listing)",
      description:
        newDescription.trim() ||
        "Item listed from a neighborhood garage—ready to build cooperative property equity.",
      condition: newCondition,
      badge: "New Listing",
      iconType: "tools",
    };

    setItems((prev) => [newItem, ...prev]);
    setIsListingModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewLocation("");
    setNewImageUrl("");
    setNewDeliveryMethod("local_pickup");
    setNewShippingFeeUsd(12);
    setAcceptedSafetyPolicy(false);
    setNewPrice(75);
    setSelectedDetailItem(newItem);
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 rounded-2xl border border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-6 space-y-6">
        {/* ================================================================ */}
        {/* DIRECT LIVE MARKETPLACE — AMAZON-MEETS-TDEX WINDOWS              */}
        {/* ================================================================ */}
        <section className="space-y-5">
          {/* Top Marketplace Command Header: Prominent Add Your Item + Explore More */}
          <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fcd34d]">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Discovery Marketplace · Online Garage Sale · $0 Listing Fee</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Shop &amp; Sell Items — 50 / 25 / 25 Program
              </h1>
              <p className="text-xs sm:text-sm text-slate-200">
                Click any item window to view full details, or post your own item right now.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsListingModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-[#081d38] bg-[#dfa62a] hover:bg-[#facc15] border-2 border-amber-200 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <PackagePlus className="w-5 h-5 shrink-0" />
                <span>+ Post an Item</span>
              </button>
              <button
                type="button"
                onClick={() => setShowExploreModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-white/12 hover:bg-white/20 border-2 border-white/30 rounded-xl transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#fcd34d] shrink-0" />
                <span>Explore More</span>
              </button>
            </div>
          </div>

          {/* Search & Multi-Filter Bar (Sections, Materials, Item Types, Sort) */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-xs space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Primary Search Input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search items, materials (wood, steel, aluminum), sections, or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-sm text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#081d38] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Material Filter */}
              <div className="sm:col-span-2 relative">
                <select
                  aria-label="Filter by material"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#081d38] cursor-pointer"
                >
                  {MATERIAL_FILTERS.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Type Filter */}
              <div className="sm:col-span-3 relative">
                <select
                  aria-label="Filter by item type"
                  value={selectedItemType}
                  onChange={(e) => setSelectedItemType(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#081d38] cursor-pointer"
                >
                  {ITEM_TYPE_FILTERS.map((typeOpt) => (
                    <option key={typeOpt} value={typeOpt}>
                      {typeOpt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="sm:col-span-2 relative">
                <select
                  aria-label="Sort items"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "price-asc" | "price-desc")
                  }
                  className="w-full px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#081d38] cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#081d38] text-[#fcd34d] shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Live Count + Ticker + Active Filter Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-[#081d38]">
                  Showing {filteredItems.length} of {items.length} Listings
                </span>
                {(selectedCategory !== "All Sections" ||
                  selectedMaterial !== "All Materials" ||
                  selectedItemType !== "All Item Types" ||
                  searchQuery.trim() !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All Sections");
                      setSelectedMaterial("All Materials");
                      setSelectedItemType("All Item Types");
                      setSearchQuery("");
                    }}
                    className="text-xs font-bold text-[#0f4c81] hover:text-[#081d38] underline underline-offset-2 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Trades: {simulatedTradesCount}</span>
                  <span className="text-slate-400">|</span>
                  <span>Cash: {formatUsd(accumulatedSellerCash)}</span>
                  <span className="text-slate-400">|</span>
                  <span>25% Equity: {formatUsd(accumulatedPropertyCredit)}</span>
                </div>
                {signedInWallet && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-950">
                    <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      Wallet: {formatUsd(signedInWallet.accumulationBalanceUsd)} Equity ·{" "}
                      {formatUsd(signedInWallet.sellerCashBalanceUsd)} Cash
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amazon-Meets-TDEX Item Windows Grid (Locked 4 Columns on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const split = computeArticle11SplitCents(Math.round(item.price * 100));
              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedDetailItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDetailItem(item);
                    }
                  }}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-[#dfa62a] hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group cursor-pointer text-left"
                >
                  {/* Crisp Product Photo Window */}
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/src/assets/images/online_discovery_marketplace_1795199437252.jpg";
                        }}
                        className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#081d38]/90 text-[#fcd34d] shadow-xs">
                        {item.category}
                      </span>
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                        {item.condition}
                      </span>
                    </div>

                    {/* Concise Title + Short Preview Description */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#081d38] leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Material & Type Metadata */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-semibold text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {item.material}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {item.itemType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price + Compact 50/25/25 Strip + Click Prompt */}
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-[#081d38] tabular-nums">
                        {formatUsd(item.price)}
                      </span>
                      <span className="text-[11px] text-slate-500 inline-flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                      <div>
                        <div className="text-slate-500">50% Funds</div>
                        <div className="font-bold text-emerald-700">{formatUsd(split.sellerCashUsd)}</div>
                      </div>
                      <div className="border-x border-slate-200">
                        <div className="text-slate-500">25% Seller</div>
                        <div className="font-bold text-amber-800">{formatUsd(split.sellerEquityUsd)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">25% Buyer</div>
                        <div className="font-bold text-sky-800">{formatUsd(split.buyerEquityUsd)}</div>
                      </div>
                    </div>

                    <div className="text-[10.5px] font-semibold text-slate-600 inline-flex items-center gap-1 truncate">
                      <Truck className="w-3 h-3 text-[#081d38] shrink-0" />
                      <span className="truncate">{formatDeliveryLabel(item)}</span>
                    </div>

                    <div className="w-full py-2 px-3 rounded-xl bg-[#081d38] group-hover:bg-[#0f294d] text-[#fcd34d] text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                      <span>View Details &amp; Buy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Marketplace Peer-to-Peer Disclaimer Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="text-[#081d38]">Marketplace Disclaimer:</strong> The Discovery
              Exchange (TDEX) provides the peer-to-peer matching board only and does not inspect,
              own, take possession of, or guarantee any listed items. Individual sellers are solely
              responsible for item accuracy, safety, and legality.
            </div>
            <span className="font-mono text-[11px] font-bold text-[#9A6B0A] shrink-0">
              0% TDEX Fee &bull; Zero Custody
            </span>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No items matched your search or filters
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing a filter, searching another material or section, or be the first to add
                an item in this category!
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All Sections");
                    setSelectedMaterial("All Materials");
                    setSelectedItemType("All Item Types");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#081d38] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsListingModalOpen(true)}
                  className="px-4 py-2 text-xs font-extrabold text-[#081d38] bg-[#dfa62a] hover:bg-[#eab308] rounded-lg transition-colors cursor-pointer"
                >
                  + Add Your Item
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ================================================================== */}
      {/* OVERLAY MODAL 0: "EXPLORE MORE" EXPLANATION WINDOW ON TOP          */}
      {/* ================================================================== */}
      {showExploreModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Discovery Marketplace Complete Explanation Guide"
          className="fixed inset-0 z-[70] flex items-start justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExploreModal(false);
            }
          }}
        >
          <div className="w-full max-w-[1260px] my-2 bg-[#F8FAFC] rounded-2xl border-2 border-[#dfa62a] shadow-2xl overflow-hidden">
            {/* Sticky Top Bar inside Explore More Overlay */}
            <div className="sticky top-0 z-20 bg-[#081d38] text-white border-b-2 border-[#dfa62a] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fcd34d]">
                  <BookOpen className="w-4 h-4" />
                  <span>Discovery Marketplace — Complete Guide &amp; Article 12 Engine</span>
                </div>
                <p className="text-xs text-slate-200">
                  How the 50/25/25 Online Garage Sale, DEXPA Property Wallets, and Discovery Brick Coin work together.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowExploreModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-xs sm:text-sm font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  <span>Close &amp; Back to Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowExploreModal(false)}
                  aria-label="Close explanation window"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-8">
            {/* SECTION 1: STOREFRONT HERO — FROM THE GARAGE TO THE FUTURE */}
            <section className="bg-[#0B1F3A] rounded-2xl overflow-hidden border border-slate-800 grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-md">
              <div className="lg:col-span-7 relative min-h-[260px] bg-[#102A4C]">
                {!heroImgFailed ? (
                  <img
                    src="/assets/aistudio/Sunny_Suburban_Garage_Sale_Scene_40932d66.webp"
                    alt="Neighbors and parents trading a bicycle, guitar, and household goods in a sunny driveway"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-10 text-white">
                    <Home className="w-12 h-12 text-[#F3C969]" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-xs border border-white/20 text-xs text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Engine 2: 50% Cash · 25% Property Equity · 25% Buyer Cashback</span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center space-y-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-[#F3C969] border border-amber-400/30">
                    Article 12.1 Engine
                  </span>
                  <span className="text-xs text-slate-300">Peer-to-Peer Exchange</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-balance">
                  Discovery Marketplace · Online Garage Sale
                </h2>
                <p className="text-base font-semibold text-[#F3C969]">
                  From the Garage to the Future.
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Sell what you no longer need. Turn everyday bikes, tools, and guitars into cash today
                  while building permanent Shared Family Ownership in the Parents Alliance (DEXPA).
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExploreModal(false);
                      setIsListingModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-slate-950 bg-[#F3C969] hover:bg-[#e7bc55] rounded-xl transition-colors text-center max-w-full cursor-pointer shadow-sm"
                  >
                    <PackagePlus className="w-4 h-4 shrink-0" />
                    <span>+ Add Your Item Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenConstitution) {
                        setShowExploreModal(false);
                        onOpenConstitution();
                      } else {
                        document.getElementById("article-11-rules-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white border border-white/25 hover:bg-white/10 rounded-xl transition-colors text-center max-w-full cursor-pointer"
                  >
                    Read Article 12 Rules
                  </button>
                </div>
              </div>
            </section>

        {/* NON-CUSTODIAL OPEN PROJECT NOTICE */}
        <div
          role="region"
          aria-label="Open Project Non-Custodial Notice"
          className="tdex-prelaunch-banner w-full bg-white text-[#9A6B0A] border-2 border-[#dfa62a] rounded-xl px-4 sm:px-6 py-3 text-center text-xs sm:text-[13px] leading-snug shadow-xs"
        >
          <div className="font-bold text-[#B47D12] uppercase tracking-wide mb-0.5">
            TDEX is Building Something New.
          </div>
          <div className="font-semibold text-[#9A6B0A]">
            Your money always stays in your accounts. The Discovery Exchange (TDEX) never holds or collects your funds. Instead, you save up for a home in your own PayPal or personal account. When TDEX finds the property that’s a match, you send your funds straight to a licensed escrow company to close the deal safely.
          </div>
        </div>

        {/* UPGRADE 2: THE 60-SECOND "GARAGE-TO-EQUITY" 3-STEP VISUAL SLIDER STORY */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-[#0F2749]">
                  Kitchen-Table Visual Guide
                </span>
                <span aria-hidden="true">·</span>
                <span>Slide Through All 3 Steps in 10 Seconds</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                How Dusty Garage Stuff Turns Into Monthly Apartment Rent
              </h2>
            </div>

            {/* Pick a Sample Garage Item to Watch It Move Through All 3 Steps */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
              {[
                { label: "Kids' Bike ($80)", val: 80 },
                { label: "Tool Set ($100)", val: 100 },
                { label: "Bike & Stroller ($120)", val: 120 },
                { label: "Full Garage Cleanout ($400)", val: 400 },
              ].map((preset) => {
                const active = storyItemValue === preset.val;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setStoryItemValue(preset.val);
                      setStoryItemLabel(preset.label);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-[#0F2749] text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Step Scrubber Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  step: 1 as const,
                  title: "Step 1: Snap a Photo in the Garage",
                  subtitle: `List your ${storyItemLabel} instead of letting it collect dust.`,
                },
                {
                  step: 2 as const,
                  title: "Step 2: Instant Cash + Property Split",
                  subtitle: `${formatUsd(storyItemValue * 0.5)} cash in hand + ${formatUsd(
                    storyItemValue * 0.25
                  )} seller equity + ${formatUsd(storyItemValue * 0.25)} buyer equity.`,
                },
                {
                  step: 3 as const,
                  title: "Step 3: 70% Monthly Rent Drops In",
                  subtitle:
                    "Your family owns real apartment shares + 1 equal vote while funding kid inventors.",
                },
              ].map((s) => {
                const isSelected = storyStep === s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setStoryStep(s.step)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-sm"
                        : "bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? "text-[#F3C969]" : "text-[#0F2749]"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          isSelected ? "text-emerald-300" : "text-slate-400"
                        }`}
                      >
                        {s.step}/3
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isSelected ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {s.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Step Range Slider for Smooth Dragging */}
            <div className="flex items-center gap-4 px-2 pt-1">
              <span className="text-xs font-semibold text-slate-500 shrink-0">
                Slide Story:
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={storyStep}
                onChange={(e) => setStoryStep(Number(e.target.value) as 1 | 2 | 3)}
                aria-label="Slide through the 3 steps from garage item to monthly rent"
                className="w-full accent-[#0F2749] cursor-pointer"
              />
              <button
                type="button"
                onClick={() =>
                  setStoryStep((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)))
                }
                className="px-3 py-1.5 text-xs font-bold text-[#0F2749] bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* Visual Story Stage */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-6 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-xl p-4">
              <svg
                viewBox="0 0 640 210"
                className="w-full h-auto select-none"
                role="img"
                aria-label="3-step visual diagram showing garage clutter turning into cash, apartment building equity, and monthly family rent"
              >
                {/* Connecting Flow Track */}
                <line
                  x1="115"
                  y1="105"
                  x2="525"
                  y2="105"
                  stroke="#334155"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="115"
                  y1="105"
                  x2={storyStep === 1 ? 115 : storyStep === 2 ? 320 : 525}
                  y2="105"
                  stroke="#F3C969"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Node 1: The Garage */}
                <g
                  onClick={() => setStoryStep(1)}
                  className="cursor-pointer"
                >
                  <circle
                    cx="115"
                    cy="105"
                    r={storyStep === 1 ? 52 : 44}
                    fill={storyStep >= 1 ? "#1E293B" : "#0F172A"}
                    stroke={storyStep === 1 ? "#F3C969" : "#64748B"}
                    strokeWidth={storyStep === 1 ? "4" : "2"}
                  />
                  <text
                    x="115"
                    y="96"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    1. GARAGE
                  </text>
                  <text
                    x="115"
                    y="116"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {formatUsd(storyItemValue)}
                  </text>
                  <text
                    x="115"
                    y="182"
                    textAnchor="middle"
                    fill={storyStep === 1 ? "#F3C969" : "#94A3B8"}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    Snap Photo &amp; List
                  </text>
                </g>

                {/* Node 2: 50 / 25 / 25 Split */}
                <g
                  onClick={() => setStoryStep(2)}
                  className="cursor-pointer"
                >
                  <circle
                    cx="320"
                    cy="105"
                    r={storyStep === 2 ? 56 : 44}
                    fill={storyStep >= 2 ? "#1E293B" : "#0F172A"}
                    stroke={storyStep === 2 ? "#F3C969" : "#64748B"}
                    strokeWidth={storyStep === 2 ? "4" : "2"}
                  />
                  <text
                    x="320"
                    y="92"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    2. THE SPLIT
                  </text>
                  <text
                    x="320"
                    y="110"
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {formatUsd(storyItemValue * 0.5)} Cash
                  </text>
                  <text
                    x="320"
                    y="126"
                    textAnchor="middle"
                    fill="#FBBF24"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    +{formatUsd(storyItemValue * 0.5)} Equity
                  </text>
                  <text
                    x="320"
                    y="182"
                    textAnchor="middle"
                    fill={storyStep === 2 ? "#F3C969" : "#94A3B8"}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    50% Cash · 25% + 25% Deed
                  </text>
                </g>

                {/* Node 3: Monthly Family Rent + Kid Prize */}
                <g
                  onClick={() => setStoryStep(3)}
                  className="cursor-pointer"
                >
                  <circle
                    cx="525"
                    cy="105"
                    r={storyStep === 3 ? 56 : 44}
                    fill={storyStep === 3 ? "#1E293B" : "#0F172A"}
                    stroke={storyStep === 3 ? "#34D399" : "#64748B"}
                    strokeWidth={storyStep === 3 ? "4" : "2"}
                  />
                  <text
                    x="525"
                    y="92"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    3. RENT PAYOUT
                  </text>
                  <text
                    x="525"
                    y="110"
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    70% to Families
                  </text>
                  <text
                    x="525"
                    y="126"
                    textAnchor="middle"
                    fill="#F3C969"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    1 Human = 1 Vote
                  </text>
                  <text
                    x="525"
                    y="182"
                    textAnchor="middle"
                    fill={storyStep === 3 ? "#34D399" : "#94A3B8"}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    Real Apartment Income
                  </text>
                </g>
              </svg>
            </div>

            {/* Plain-English Kitchen Table Readout for Current Step */}
            <div className="lg:col-span-5 space-y-4">
              {storyStep === 1 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#F3C969]">
                    STEP 1 OF 3 · CLEAR OUT THE GARAGE
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Turn {storyItemLabel} Into Real Ownership
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Instead of letting good tools, bikes, or instruments sit in the
                    garage collecting dust, a parent snaps a photo and lists it for{" "}
                    <strong className="text-white">{formatUsd(storyItemValue)}</strong>.
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                    Zero listing fees · Neighbors get gear they need · Both families
                    build property shares together.
                  </div>
                </div>
              )}

              {storyStep === 2 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#F3C969]">
                    STEP 2 OF 3 · THE LOCKED 50 / 25 / 25 SPLIT
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Cash in Your Pocket Today + Property Shares for Both Families
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40">
                      <div className="text-[11px] text-slate-300">Seller Cash</div>
                      <div className="text-base font-mono font-bold text-emerald-300 tabular-nums mt-0.5">
                        {formatUsd(storyItemValue * 0.5)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-400/40">
                      <div className="text-[11px] text-slate-300">Seller Equity</div>
                      <div className="text-base font-mono font-bold text-[#F3C969] tabular-nums mt-0.5">
                        {formatUsd(storyItemValue * 0.25)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-sky-400/40">
                      <div className="text-[11px] text-slate-300">Buyer Equity</div>
                      <div className="text-base font-mono font-bold text-sky-300 tabular-nums mt-0.5">
                        {formatUsd(storyItemValue * 0.25)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Both the selling parent and the buying parent automatically receive
                    real property credits in the cooperative building fund.
                  </p>
                </div>
              )}

              {storyStep === 3 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-emerald-300">
                    STEP 3 OF 3 · 20%–30% AUCTION EDGE &amp; 70% MONTHLY RENT
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Bought 20%–30% Below Market at Foreclosure &amp; Auction
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    TDEX <strong>NEVER</strong> holds, pools, or touches any money. Your 25% accumulation credits stay inside your own segregated processor wallet (such as PayPal), and when TDEX matches a debt-free property from{" "}
                    <strong className="text-amber-300">
                      foreclosures and auctions at 20% to 30% below market value
                    </strong>
                    , TDEX opens licensed seller-side escrow so Owners fund closing directly from their wallets. Property-level{" "}
                    <strong className="text-white">Discovery BrickCoin (DBC)</strong> is
                    issued only after acquisition closes and the deed is recorded (zero presales, Article 11.2). Then{" "}
                    <strong className="text-emerald-300">
                      70% of net rent goes back to families
                    </strong>{" "}
                    and 30% funds the Public Schools Discovery Awards (Article 11.3)!
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs text-emerald-200 font-medium">
                    And remember: <strong>One Human = One Vote.</strong> A parent who
                    traded a stroller has the exact same single vote as a millionaire.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE 50 / 25 / 25 CUSTOM CHECKOUT CALCULATOR */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#0F2749]">
                Article 12.1 Interactive Calculator
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                Calculate Any Custom Household Sale
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Drag the slider or type any dollar amount to see how cash and equity divide in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="dm-sale-input"
                className="text-xs font-semibold text-slate-600"
              >
                Custom Sale Amount:
              </label>
              <input
                id="dm-sale-input"
                type="number"
                min={0}
                max={10000}
                step={5}
                value={safeCustomPrice}
                onChange={(e) => setCustomSalePrice(Number(e.target.value))}
                className="w-28 px-3 py-2 text-sm font-bold tabular-nums text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2749]"
              />
            </div>
          </div>

          {/* Range Slider */}
          <div>
            <input
              type="range"
              aria-label="Adjust household item sale price"
              min={10}
              max={1000}
              step={10}
              value={Math.min(1000, Math.max(10, safeCustomPrice))}
              onChange={(e) => setCustomSalePrice(Number(e.target.value))}
              className="w-full accent-[#0F2749] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>$10 Garage Trinket</span>
              <span>$500 Tool Set</span>
              <span>$1,000 Major Appliance</span>
            </div>
          </div>

          {/* 3 Big Visual Split Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>50% · Seller Cash</span>
                <span className="tabular-nums text-emerald-700 font-bold">In Seller’s Pocket</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatUsd(customSplit.sellerCashUsd)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate transaction cash paid to the selling family. No waiting periods.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0B1F3A] text-white border border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-[#F3C969]">
                <span>25% · Seller DEXPA Wallet</span>
                <span className="tabular-nums">Property Equity</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white tabular-nums">
                {formatUsd(customSplit.sellerEquityUsd)}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Credited directly toward the seller’s future share in our cooperative $5M commercial building.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0B1F3A] text-white border border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-[#F3C969]">
                <span>25% · Buyer DEXPA Wallet</span>
                <span className="tabular-nums">Buyer Cashback</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white tabular-nums">
                {formatUsd(customSplit.buyerEquityUsd)}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                The buying family earns an equal equity reward—making everyday purchases an engine for real estate ownership.
              </p>
            </div>
          </div>

          {/* Interactive 50/25/25 Split Walkthrough */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#0B1F3A] text-[#F3C969] text-[11px] font-bold tracking-wide">
                  50 / 25 / 25 Trade Walkthrough
                </span>
                <span className="text-xs font-bold text-slate-900">
                  0% TDEX Listing Fee · Optional Property Credit or 100% Cash
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Split for{" "}
                <strong className="text-slate-900 tabular-nums">{formatUsd(safeCustomPrice)}</strong>:{" "}
                <strong className="text-emerald-700 tabular-nums">{formatUsd(customSplit.sellerCashUsd)}</strong> Seller Cash (50%) ·{" "}
                <strong className="text-[#0F2749] tabular-nums">{formatUsd(customSplit.sellerEquityUsd)}</strong> Seller Property Credit (25%) ·{" "}
                <strong className="text-[#0F2749] tabular-nums">{formatUsd(customSplit.buyerEquityUsd)}</strong> Buyer Credit (25%). Walk through the trade below (no card charged in this draft).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSimulateCheckout({
                    id: `custom-calc-${Date.now()}`,
                    title: `Custom Household Trade (${formatUsd(safeCustomPrice)})`,
                    category: "Tools & Workshop",
                    material: "Metal & Steel",
                    itemType: "Tools & Equipment",
                    imageUrl: "/src/assets/images/market_tool_chest_1795215571467.jpg",
                    condition: "Good",
                    price: safeCustomPrice,
                    sellerFamily: "Walkthrough Neighbor",
                    location: "Local Neighborhood",
                    description:
                      "Interactive walkthrough of the 50/25/25 household trade split.",
                    badge: "Walkthrough",
                    iconType: "wrench",
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Walk {formatUsd(safeCustomPrice)} Trade Split
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3B: COMPLETE DISCOVERY BRICKCOIN (DBC) MECHANISM & 100M POOL COMMAND CENTER */}
        <div id="article-11-rules-ledger" className="scroll-mt-6" />
        <section
          id="dbc-complete-mechanism"
          className="bg-[#0B1F3A] text-white border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md"
        >
          {/* Top Header + Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F3C969]">
                <Coins className="w-4 h-4" />
                <span>Article 11 (11.1–11.8) &amp; Article 14 Complete Mechanism · 100,000,000 Fixed Supply Ceiling</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono text-[10px]">
                  {verificationReport.passCount}/{verificationReport.totalCount} Dual-QC Checks Passing
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                How Discovery BrickCoin (DBC) Works After Deed Recording &amp; Auction Acquisition
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Capped forever at <strong>100,000,000 DBC</strong> across Version 10.0 Schedule A Pools (Article 14). Marketplace 25% accumulation credits pool in segregated escrow to acquire debt-free <strong>foreclosure and auction properties at 20% to 30% below market value</strong>; Property-level DBC is issued <strong>only after closing and deed recording</strong> (Article 11.2, zero presales) while keeping <strong>1 Human Owner = 1 Vote</strong>.
              </p>
            </div>

            {/* 2-Tab Mode Switcher: Kitchen-Table Mechanism vs. 3-Shard V2 Protocol Engine */}
            <div className="flex items-center gap-1.5 bg-slate-900/95 p-1.5 rounded-xl border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => setDbcMechanismTab("value-carrier")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dbcMechanismTab === "value-carrier"
                    ? "bg-[#F3C969] text-slate-950 shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                1. Auction Edge &amp; 100M Pools
              </button>
              <button
                type="button"
                onClick={() => setDbcMechanismTab("protocol-v2")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  dbcMechanismTab === "protocol-v2"
                    ? "bg-emerald-400 text-slate-950 shadow-xs"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. 3-Shard V2 Protocol ({verificationReport.passCount}/{verificationReport.totalCount} PASS)</span>
              </button>
            </div>
          </div>

          {dbcMechanismTab === "value-carrier" ? (
            <div className="space-y-6">
              {/* PART 1: FORECLOSURE & AUCTION 20%-30% DISCOUNT CALCULATOR */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Step 1 · Capturing 20%–30% Below-Market Equity at Foreclosure &amp; Auction
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10">
                      {[
                        { label: "$1M Building", val: 1000000 },
                        { label: "$5M Building", val: 5000000 },
                        { label: "$10M Portfolio", val: 10000000 },
                      ].map((b) => (
                        <button
                          key={b.val}
                          type="button"
                          onClick={() => setBuildingMarketValue(b.val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            buildingMarketValue === b.val
                              ? "bg-[#F3C969] text-slate-950"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-emerald-400/30">
                      {([20, 25, 30] as const).map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setAuctionDiscountPct(pct)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            auctionDiscountPct === pct
                              ? "bg-emerald-400 text-slate-950"
                              : "text-emerald-200 hover:text-white"
                          }`}
                        >
                          -{pct}% Auction Discount
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>True Market Appraisal</span>
                      <span className="font-mono text-slate-400">Retail Value</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                      {formatUsd(buildingMarketValue)}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Full appraised market value of the commercial or apartment building.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-400/40 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#F3C969]">
                      <span>Foreclosure / Auction Price</span>
                      <span className="font-mono font-bold">-{auctionDiscountPct}% Discount</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F3C969] tabular-nums">
                      {formatUsd(buildingMarketValue * (1 - auctionDiscountPct / 100))}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Bought from bank foreclosure or courthouse auction at {auctionDiscountPct}% under market.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-400/40 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                      <span>Post-Closing Spread Carried by DBC</span>
                      <span className="font-mono font-bold">+{auctionDiscountPct}% Cushion</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300 tabular-nums">
                      +{formatUsd(buildingMarketValue * (auctionDiscountPct / 100))}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Built-in below-market spread captured at closing—with <strong>Discovery BrickCoin (DBC)</strong> issued only after deed recording and full escrow verification (Article 11.2, zero presales).
                    </p>
                  </div>
                </div>
              </div>

              {/* PART 2: THE 100,000,000 FIXED SUPPLY & VERSION 10.0 SCHEDULE A POOLS */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#F3C969]">
                      Step 2 · Hard Supply Cap: {AUTHORIZED_SUPPLY_CEILING.toLocaleString()} DBC (Zero Inflation)
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      Article 14 &amp; Schedule A Allocation Pools (SupplyAllocationPoolShard)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 px-2.5 py-1 rounded-lg">
                    95M Owner Community · 3M Contributors (50-Yr) · 1M Founder · 1M Future AI Concept
                  </span>
                </div>

                {/* Visual Segmented Supply Bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-950 border border-white/15">
                  <div
                    style={{ width: "95%" }}
                    className="bg-amber-400 h-full"
                    title="95% Owner Community & Operational Mission Structure (95,000,000 DBC)"
                  />
                  <div
                    style={{ width: "3%" }}
                    className="bg-emerald-400 h-full"
                    title="3% Extraordinary-Contributor Pool Over 50 Years (3,000,000 DBC)"
                  />
                  <div
                    style={{ width: "1%" }}
                    className="bg-sky-400 h-full"
                    title="1% Founder Economic Allocation (1,000,000 DBC)"
                  />
                  <div
                    style={{ width: "1%" }}
                    className="bg-violet-400 h-full"
                    title="1% Future AI Permanent Reserve (1,000,000 DBC)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {CONSTITUTIONAL_DBC_POOLS.map((pool) => (
                    <div
                      key={pool.key}
                      className={`p-3.5 rounded-xl border space-y-1 ${
                        pool.sharePct >= 50
                          ? "bg-slate-950/90 border-amber-400/40"
                          : "bg-slate-950/60 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-amber-300">
                          {pool.key}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white">
                          {pool.sharePct}%
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{pool.label}</div>
                      <div className="text-base font-mono font-bold text-emerald-300 tabular-nums">
                        {pool.allocation.toLocaleString()} DBC
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {pool.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PART 3: INTERACTIVE VESTING & PROPORTIONAL HOLD SHIELD (MODULE 06) */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      Step 3 · Anti-Dump Vesting &amp; Module 06 Proportional Hold Protection
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      Interactive Vesting &amp; Hold Calculator (1,000,000 DBC Sample Lot)
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSimProportionalHold((p) => !p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        simProportionalHold
                          ? "bg-amber-400/20 border-amber-400 text-amber-200"
                          : "bg-slate-800 border-white/15 text-slate-300"
                      }`}
                    >
                      {simProportionalHold
                        ? "✓ Proportional Hold Active (Freezes Unvested Only)"
                        : "Proportional Hold: OFF"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimGlobalQuarantine((p) => !p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        simGlobalQuarantine
                          ? "bg-rose-500/25 border-rose-400 text-rose-200"
                          : "bg-slate-800 border-white/15 text-slate-300"
                      }`}
                    >
                      {simGlobalQuarantine
                        ? "⚠️ Global Quarantine (GQ): ON"
                        : "Global Quarantine (GQ): OFF"}
                    </button>
                  </div>
                </div>

                {/* Block Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">
                      Slide Block Height (Start: 0 · Cliff: 100 · End: 1000):{" "}
                      <strong className="text-white font-mono">Block {simBlockHeight}</strong>
                    </span>
                    <span className="text-amber-300 font-mono text-[11px]">
                      {liveVestingMath.stageLabel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1200}
                    step={25}
                    value={simBlockHeight}
                    onChange={(e) => setSimBlockHeight(Number(e.target.value))}
                    aria-label="Adjust simulated vesting block height"
                    className="w-full accent-[#F3C969] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <button
                      type="button"
                      onClick={() => setSimBlockHeight(50)}
                      className="hover:text-white underline cursor-pointer"
                    >
                      Block 50 (Pre-Cliff = 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimBlockHeight(500)}
                      className="hover:text-white underline cursor-pointer"
                    >
                      Block 500 (50% Vested = 500k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimBlockHeight(1200)}
                      className="hover:text-white underline cursor-pointer"
                    >
                      Block 1200 (100% Vested = 1M)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-400/30">
                    <div className="text-xs text-slate-300">Spendable / Unlocked Allowance</div>
                    <div className="text-2xl font-mono font-bold text-emerald-300 tabular-nums mt-0.5">
                      {liveVestingMath.spendable.toLocaleString()} DBC
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Protected by Module 06 proportional hold math.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-400/30">
                    <div className="text-xs text-slate-300">Locked / Unvested Balance</div>
                    <div className="text-2xl font-mono font-bold text-[#F3C969] tabular-nums mt-0.5">
                      {liveVestingMath.locked.toLocaleString()} DBC
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Cannot be transferred or dumped before vesting.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                    <div className="text-xs text-slate-300">Live Vesting Shard SHA-256 Root</div>
                    <div className="text-xs font-mono font-bold text-sky-300 break-all mt-1">
                      {liveVestingMath.vestingRootHex.slice(0, 32)}...
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      One Owner, One Vote (Coins never vote).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: LIVE 3-SHARD V2 PROTOCOL SIMULATOR & 19/19 DUAL-QC SUITE */
            <div className="space-y-6">
              {/* Interactive 4-Button Atomic Coordinator Stress Tester */}
              <div className="bg-slate-900/90 border border-white/15 rounded-xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      CrossNamespaceAtomicCoordinator · Live Sandbox Demonstrator
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      Test Atomic Issuance, Strict Nonce (+1), Replay Defense &amp; Zero-Drift Rollback
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="dbc-pool-select" className="text-xs text-slate-300">
                      Source Pool:
                    </label>
                    <select
                      id="dbc-pool-select"
                      value={selectedPoolKey}
                      onChange={(e) => setSelectedPoolKey(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/20 text-xs font-mono text-[#F3C969]"
                    >
                      {CONSTITUTIONAL_DBC_POOLS.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.key} ({p.allocation.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRunLiveProtocolScenario("issue-pool")}
                    className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-emerald-400/40 text-left space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-emerald-300">
                      1. Atomic Pool Issuance
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Issue 250,000 DBC from selected pool with matched vesting schedule.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunLiveProtocolScenario("valid-nonce")}
                    className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-sky-400/40 text-left space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-sky-300">
                      2. Valid Nonce (+1) Transfer
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Execute transfer at Block 500 with strict sequential nonce = 1.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunLiveProtocolScenario("replay-gap")}
                    className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-amber-400/40 text-left space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#F3C969]">
                      3. Test Nonce-Gap Replay
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Submit out-of-order Nonce 10 → verify instant rejection &amp; zero drift.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunLiveProtocolScenario("mid-commit-fault")}
                    className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-rose-400/40 text-left space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-rose-300">
                      4. Inject Mid-Commit Fault
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Trigger exception mid-commit → verify 100% 3-shard rollback.
                    </p>
                  </button>
                </div>

                {protocolActionBanner && (
                  <div
                    className={`p-4 rounded-xl border space-y-1.5 ${
                      protocolActionBanner.status === "pass"
                        ? "bg-emerald-950/60 border-emerald-400/50 text-emerald-100"
                        : "bg-amber-950/60 border-amber-400/50 text-amber-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{protocolActionBanner.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                        SCHEMA_V1_0_16 + V2_NONCE_ROOT
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {protocolActionBanner.detail}
                    </p>
                    <div className="text-[11px] font-mono text-sky-300 break-all pt-1">
                      Composite State Root: {protocolActionBanner.compositeRootHex}
                    </div>
                  </div>
                )}
              </div>

              {/* 19/19 Dual-QC & Remediated Boundary Verification Matrix */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#F3C969]">
                      Complete 22-Check Dual-QC &amp; Adversarial Verification Suite (Modules 04–08)
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Big-Endian Serialization · Nonce (+1) Gate · Module 06 Hold Math · 50/25/25 &amp; 70/30 Conservation
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="/dbc_authoritative_node7_bundle.json"
                      download="dbc_authoritative_node7_bundle.json"
                      className="px-3 py-1 rounded-lg bg-[#F3C969] hover:bg-amber-300 text-slate-950 font-mono text-xs font-bold transition-colors"
                    >
                      ⬇ NODE_7 Source &amp; SHA-256 Bundle
                    </a>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                      {verificationReport.passCount} / {verificationReport.totalCount} PASS (0 FAIL)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {verificationReport.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            #{chk.id}. {chk.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {chk.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: THREE DISTINCT TOOLS — PLAIN-ENGLISH BOUNDARIES */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Clear Constitutional Boundaries · Zero Confusion
            </p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Wallet vs. Property Nugget vs. Discovery BrickCoin
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <article className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F2749]/10 text-[#0F2749] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  1. DEXPA Wallet Allocation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tracks your 25% Discovery Market allocations building toward
                  property participation. A wallet balance is a pathway credit,
                  not an automatic property deed.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 tabular-nums">
                Article 12 (Article 12.1) · Marketplace Pathway
              </div>
            </article>

            <article className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F2749]/10 text-[#0F2749] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Property Nugget (70 / 30 Net Rent)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A legal fractional interest in a real cooperative building
                  acquired at foreclosure or auction (20%–30% below market).
                  Net distributable rent splits 70% to participating Owners and 30%
                  permanently funding the National Public Schools Discovery Awards.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 tabular-nums">
                Article 11 (Article 11.3) · Article 4.1 (1 Owner, 1 Vote)
              </div>
            </article>

            <article className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F2749]/10 text-[#0F2749] flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  3. Discovery BrickCoin (DBC · 100M Cap)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fixed 100,000,000-supply transferable reward bridge under Article 14 &amp; Schedule A (95M Owner Community, 3M Contributors over 50 yrs, 1M Founder, and 1M Future AI Reserve), tied to verified deed recording while the underlying debt-free homes stay protected in the trust.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 tabular-nums">
                Article 11 (11.1–11.8) &amp; Article 14 · 100M Fixed Supply · 3-Shard V2
              </div>
            </article>
          </div>
        </section>

            {/* EXPLORE MORE MODAL BOTTOM CLOSE BAR */}
            <div className="bg-[#081d38] text-white border-2 border-[#dfa62a] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Ready to Browse or List an Item?
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  Close this explanation window and return straight to the Discovery Marketplace ($0 listing fee).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExploreModal(false)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-sm font-extrabold shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <span>Close &amp; Back to Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* OVERLAY MODAL 0B: AMAZON-STYLE ITEM DETAIL WINDOW ON TOP           */}
      {/* ================================================================== */}
      {selectedDetailItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedDetailItem.title}
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedDetailItem(null);
            }
          }}
        >
          {(() => {
            const detailSplit = computeArticle11SplitCents(
              Math.round(selectedDetailItem.price * 100)
            );
            return (
              <div className="w-full max-w-4xl max-h-[92dvh] overflow-y-auto bg-white rounded-2xl border-2 border-[#dfa62a] shadow-2xl">
                {/* Modal Top Bar */}
                <div className="sticky top-0 z-10 bg-[#081d38] text-white px-5 py-3.5 flex items-center justify-between gap-4 border-b border-amber-400/40">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fcd34d]">
                    <Tag className="w-4 h-4" />
                    <span>{selectedDetailItem.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-white">{selectedDetailItem.condition}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailItem(null)}
                    aria-label="Close item details"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Amazon-style 2-column Photo + Full Description Body */}
                <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                  <div className="sm:col-span-6 space-y-3">
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                      <img
                        src={selectedDetailItem.imageUrl}
                        alt={selectedDetailItem.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/src/assets/images/online_discovery_marketplace_1795199437252.jpg";
                        }}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-slate-500">Material</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {selectedDetailItem.material}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          Item Type
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {selectedDetailItem.itemType}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-slate-500">Seller</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {selectedDetailItem.sellerFamily}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          Location
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {selectedDetailItem.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-6 space-y-4">
                    <div className="space-y-1.5">
                      {selectedDetailItem.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                          {selectedDetailItem.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl font-bold text-[#081d38] leading-snug">
                        {selectedDetailItem.title}
                      </h2>
                      <div className="flex items-baseline gap-2.5 pt-1">
                        <span className="text-3xl font-extrabold text-[#081d38] tabular-nums">
                          {formatUsd(selectedDetailItem.price)}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          $0 TDEX Platform Fee
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Full Description
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {selectedDetailItem.description}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#081d38]">
                        Locked 50 / 25 / 25 Split When Purchased
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">50% Immediate Cash to Seller:</span>
                          <span className="font-bold text-emerald-700">
                            {formatUsd(detailSplit.sellerCashUsd)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">25% Seller Property Wallet:</span>
                          <span className="font-bold text-amber-800">
                            {formatUsd(detailSplit.sellerEquityUsd)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">25% Buyer Property Cashback:</span>
                          <span className="font-bold text-sky-800">
                            {formatUsd(detailSplit.buyerEquityUsd)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Method + Carrier Tracking (5-Business-Day Rule) */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-[#081d38] inline-flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#b47d12]" />
                          <span>Delivery Option: {formatDeliveryLabel(selectedDetailItem)}</span>
                        </span>
                        {selectedDetailItem.deliveryMethod === "flat_rate_shipping" && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10.5px]">
                            100% Shipping Fee Goes to Seller
                          </span>
                        )}
                      </div>
                      {selectedDetailItem.deliveryMethod === "local_pickup" ? (
                        <p className="text-[11.5px] text-slate-700 leading-relaxed">
                          Meet in <strong>daylight at public locations</strong> (police Safe
                          Exchange Zones, bank lobbies, or busy grocery lots—never alone inside
                          private homes). <strong>Inspect the item BEFORE</strong> handing over
                          your 4-digit Pickup Confirmation Code; once entered, pickup is final.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11.5px] text-slate-700 leading-relaxed">
                            Sellers must upload valid carrier tracking within{' '}
                            <strong>5 business days</strong>.
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Enter carrier tracking # (USPS / UPS / FedEx)"
                              value={trackingDraft[selectedDetailItem.id] ?? ""}
                              onChange={(e) =>
                                setTrackingDraft((prev) => ({
                                  ...prev,
                                  [selectedDetailItem.id]: e.target.value,
                                }))
                              }
                              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const code = (trackingDraft[selectedDetailItem.id] || "").trim();
                                if (!code) return;
                                setSavedTrackingMap((prev) => ({
                                  ...prev,
                                  [selectedDetailItem.id]: code,
                                }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#081d38] hover:bg-[#0f294d] text-[#fcd34d] text-xs font-bold cursor-pointer shrink-0"
                            >
                              Add Tracking
                            </button>
                          </div>
                          {savedTrackingMap[selectedDetailItem.id] && (
                            <div className="text-[11px] font-bold text-emerald-800">
                              Tracking Logged for Columbo Audit: {savedTrackingMap[selectedDetailItem.id]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Two-Way 1–5 Star Verified Rating System (Blind Simultaneous Reveal) + File a Dispute */}
                    {(() => {
                      const rState = getItemRatingState(selectedDetailItem.id);
                      const revealed = rState.buyerSubmitted && rState.sellerSubmitted;
                      return (
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 text-xs space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-[#081d38] inline-flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-[#b47d12]" />
                              <span>Two-Way 1–5 Star Verified Rating (Blind Simultaneous Reveal)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRatingStateMap((prev) => ({
                                  ...prev,
                                  [selectedDetailItem.id]: { ...rState, disputeFiled: true },
                                }))
                              }
                              className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Gavel className="w-3 h-3" />
                              <span>File a Dispute</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-amber-950 leading-snug">
                            Both ratings stay hidden until both buyer and seller submit—preventing
                            revenge reviews. False reviews or trade issues can be appealed to the
                            12-person Owner Review Jury via <strong>File a Dispute</strong>.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="p-2.5 rounded-lg bg-white border border-amber-200 space-y-1.5">
                              <div className="font-bold text-[11px] text-slate-700">Buyer Rating of Seller:</div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <button
                                    key={starVal}
                                    type="button"
                                    onClick={() =>
                                      setRatingStateMap((prev) => ({
                                        ...prev,
                                        [selectedDetailItem.id]: { ...rState, buyerStars: starVal },
                                      }))
                                    }
                                    className="cursor-pointer"
                                    aria-label={`Rate seller ${starVal} stars`}
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        starVal <= rState.buyerStars
                                          ? "fill-[#dfa62a] text-[#b47d12]"
                                          : "text-slate-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRatingStateMap((prev) => ({
                                      ...prev,
                                      [selectedDetailItem.id]: { ...rState, buyerSubmitted: true },
                                    }))
                                  }
                                  className="ml-auto px-2 py-0.5 rounded bg-[#081d38] text-[#fcd34d] text-[10px] font-bold cursor-pointer"
                                >
                                  {rState.buyerSubmitted ? "Sealed" : "Seal"}
                                </button>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-amber-200 space-y-1.5">
                              <div className="font-bold text-[11px] text-slate-700">Seller Rating of Buyer:</div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <button
                                    key={starVal}
                                    type="button"
                                    onClick={() =>
                                      setRatingStateMap((prev) => ({
                                        ...prev,
                                        [selectedDetailItem.id]: { ...rState, sellerStars: starVal },
                                      }))
                                    }
                                    className="cursor-pointer"
                                    aria-label={`Rate buyer ${starVal} stars`}
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        starVal <= rState.sellerStars
                                          ? "fill-[#dfa62a] text-[#b47d12]"
                                          : "text-slate-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRatingStateMap((prev) => ({
                                      ...prev,
                                      [selectedDetailItem.id]: { ...rState, sellerSubmitted: true },
                                    }))
                                  }
                                  className="ml-auto px-2 py-0.5 rounded bg-[#081d38] text-[#fcd34d] text-[10px] font-bold cursor-pointer"
                                >
                                  {rState.sellerSubmitted ? "Sealed" : "Seal"}
                                </button>
                              </div>
                            </div>
                          </div>
                          {revealed && (
                            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                              Simultaneous Reveal Unlocked — Buyer rated Seller {rState.buyerStars}/5 ★ · Seller rated Buyer {rState.sellerStars}/5 ★
                            </div>
                          )}
                          {rState.disputeFiled && (
                            <div className="text-[11px] font-bold text-red-900 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                              Dispute Ticket Logged — Routed to randomly drawn 12-person Owner Review Jury (Article 5.3) with Columbo tracking/code audit.
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const chosen = selectedDetailItem;
                          setSelectedDetailItem(null);
                          handleSimulateCheckout(chosen);
                        }}
                        className="flex-1 py-3 px-5 rounded-xl bg-[#081d38] hover:bg-[#0f294d] text-[#dfa62a] text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Buy / Simulate 50/25/25 Split</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailItem(null)}
                        className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL 1: SIMULATE CHECKOUT & COOPERATIVE RECEIPT MODAL */}
      {activeItemForReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !showSuccessStamp) {
              setActiveItemForReceipt(null);
            }
          }}
        >
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-2xl border-2 border-amber-300 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Article 12.1 Cooperative Checkout</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {activeItemForReceipt.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Seller: {activeItemForReceipt.sellerFamily} · {activeItemForReceipt.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveItemForReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Lock Bar */}
            <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Total Purchase Price:</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatUsd(activeItemForReceipt.price)}
              </span>
            </div>

            {/* The 50 / 25 / 25 Split Breakdown Card */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Instant Automatic Allocation:
              </div>

              {/* 1. Seller Cash */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>💵 50% Immediate Seller Cash</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 leading-tight">
                    Transferred directly to the selling family.
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-900 tabular-nums shrink-0">
                  {formatUsd(activeItemForReceipt.price * 0.5)}
                </span>
              </div>

              {/* 2. Seller Property Equity */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>🏡 25% Seller DEXPA Property Wallet</span>
                  </div>
                  <div className="text-[11px] text-amber-800 leading-tight">
                    Credited toward shared commercial property ownership.
                  </div>
                </div>
                <span className="text-base font-bold text-amber-900 tabular-nums shrink-0">
                  {formatUsd(activeItemForReceipt.price * 0.25)}
                </span>
              </div>

              {/* 3. Buyer Cashback */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <span>🎁 25% Buyer Cashback Wallet</span>
                  </div>
                  <div className="text-[11px] text-sky-800 leading-tight">
                    The buying family earns an equal property credit.
                  </div>
                </div>
                <span className="text-base font-bold text-sky-900 tabular-nums shrink-0">
                  {formatUsd(activeItemForReceipt.price * 0.25)}
                </span>
              </div>
            </div>

            {/* Safe Meetup, 4-Digit Pickup Code & Chargeback Protection Notice */}
            <div className="p-3.5 rounded-xl bg-[#0F2749] text-white text-xs space-y-2">
              <div>
                <div className="font-semibold text-amber-300">
                  Local Pickup Safety &amp; 4-Digit Code Rule:
                </div>
                <div className="text-slate-200 text-[11px] leading-relaxed">
                  Meet in daylight at police Safe Exchange Zones, bank lobbies, or busy grocery lots
                  (never inside private homes alone). Inspect the item BEFORE sharing your 4-digit
                  Pickup Confirmation Code—once entered, the pickup is final.
                </div>
              </div>
              <div className="border-t border-white/15 pt-2">
                <div className="font-semibold text-amber-300">
                  Article 5.3 Jury First &amp; Anti-Chargeback Rule:
                </div>
                <div className="text-slate-200 text-[11px] leading-relaxed">
                  Disputes must go first to the 12-person Owner Review Jury. Filing an external
                  PayPal/bank chargeback after delivery triggers Columbo tracking/4-digit pickup
                  evidence submission, ledger reversal of unearned 25% credits, and permanent
                  account suspension for fraudulent chargebacks.
                </div>
              </div>
            </div>

            {/* Action Buttons: Active Non-Custodial PayPal Sandbox & 50/25/25 Processor Wallet Checkout */}
            {!showSuccessStamp ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isTradeBusy}
                  onClick={handlePayPalSandboxCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {isTradeBusy
                      ? "Processing PayPal Sandbox Split..."
                      : "PayPal Sandbox Checkout — Build 50/25/25 Wallet"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={isTradeBusy}
                  onClick={handleConfirmSimulatedTrade}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Instant 50/25/25 Processor Wallet Split Test</span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Zero TDEX money custody — 50% seller payout + 25% seller wallet + 25% buyer wallet stay in segregated processor wallets.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-600 text-white text-center font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    50/25/25 Wallet Split Active
                    {serverOrderAudit?.paypalOrderId
                      ? ` (${serverOrderAudit.paypalOrderId})`
                      : serverOrderAudit?.receiptId
                      ? ` (${serverOrderAudit.receiptId})`
                      : ""}!
                  </span>
                </div>
                {serverOrderAudit?.approveUrl && (
                  <a
                    href={serverOrderAudit.approveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Approve Order on PayPal Sandbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
                {serverOrderAudit && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 font-mono">
                    <div>
                      <strong>{serverOrderAudit.mode}</strong> &bull; Columbo Hash:{" "}
                      {serverOrderAudit.columboAuditHash.slice(0, 18)}...
                    </div>
                    <div className="font-sans text-emerald-800 mt-0.5">{serverOrderAudit.notice}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: "LIST AN ITEM FROM YOUR GARAGE" MODAL */}
      {isListingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsListingModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F2749]">
                  <PackagePlus className="w-4 h-4 text-amber-600" />
                  <span>From the Garage to the Future</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  List an Item from Your Garage
                </h3>
                <p className="text-xs text-slate-500">
                  0% TDEX platform fee. Turn unused household items into 50% cash + 25% property equity + 25% buyer credit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsListingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewListing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Item Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Unused Student Microscope, Mountain Bike, Tool Set..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Section:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                  >
                    {CATEGORIES.filter((c) => c !== "All Sections").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Asking Price ($ USD):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={5000}
                    step={5}
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Material:</label>
                  <select
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                  >
                    {MATERIAL_FILTERS.filter((m) => m !== "All Materials").map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Item Type:</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                  >
                    {ITEM_TYPE_FILTERS.filter((t) => t !== "All Item Types").map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Condition:</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Item Photo (Optional — Upload from Device):</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="flex-1 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#081d38] file:text-[#fcd34d] hover:file:bg-[#0f294d] cursor-pointer"
                  />
                  {newImageUrl && (
                    <img
                      src={newImageUrl}
                      alt="Upload preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Your Neighborhood / City:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Brooklyn, NY or Dallas, TX"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Item Description:
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what you are selling, its material, condition, and what is included..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F2749]"
                />
              </div>

              {/* 3-Option Delivery Selector (Local Pickup / Free Shipping / Flat-Rate Shipping) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-[#081d38] inline-flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#b47d12]" />
                  <span>Delivery Option (Choose 1 of 3):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      id: "local_pickup",
                      title: "1. Local Pickup Only",
                      desc: "4-digit Pickup Confirmation Code",
                    },
                    {
                      id: "free_shipping",
                      title: "2. Free Shipping",
                      desc: "5-business-day carrier tracking",
                    },
                    {
                      id: "flat_rate_shipping",
                      title: "3. Flat-Rate Shipping",
                      desc: "100% shipping fee goes to seller",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setNewDeliveryMethod(
                          opt.id as "local_pickup" | "free_shipping" | "flat_rate_shipping"
                        )
                      }
                      className={`p-2.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        newDeliveryMethod === opt.id
                          ? "bg-[#081d38] text-white border-[#dfa62a]"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="font-bold text-[11px]">{opt.title}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          newDeliveryMethod === opt.id ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
                {newDeliveryMethod === "flat_rate_shipping" && (
                  <div className="flex items-center gap-3 pt-1">
                    <label className="text-xs font-bold text-slate-700 shrink-0">
                      Flat-Rate Shipping Fee ($ USD):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      step={1}
                      value={newShippingFeeUsd}
                      onChange={(e) => setNewShippingFeeUsd(Number(e.target.value))}
                      className="w-28 px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                    />
                    <span className="text-[11px] text-emerald-800 font-semibold">
                      100% paid directly to seller (5-day tracking required)
                    </span>
                  </div>
                )}
              </div>

              {/* Live Preview of your Split */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                  <span>When this item sells:</span>
                  <span className="font-mono text-slate-600">Total: {formatUsd(newPrice)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white border border-amber-200">
                    <div className="text-[10px] text-slate-500">You Get Cash:</div>
                    <div className="font-bold text-emerald-700">{formatUsd(newPrice * 0.5)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-amber-200">
                    <div className="text-[10px] text-slate-500">Your Property Wallet:</div>
                    <div className="font-bold text-amber-800">{formatUsd(newPrice * 0.25)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-amber-200">
                    <div className="text-[10px] text-slate-500">Buyer Cashback:</div>
                    <div className="font-bold text-sky-800">{formatUsd(newPrice * 0.25)}</div>
                  </div>
                </div>
              </div>

              {/* Hard-Coded Prohibited Items & Recall Policy Checklist */}
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wide text-red-900">
                  Restricted / Prohibited Categories &amp; Recall Policy (Hard-Coded Gate)
                </div>
                <p className="text-[11px] text-red-950 leading-relaxed">
                  Strictly prohibited: <strong>recalled baby cribs or infant sleepers</strong>,{' '}
                  <strong>car seats/boosters</strong>, <strong>prescription medications</strong>,{' '}
                  <strong>weapons/firearms/knives</strong>, <strong>gift cards/cash vouchers</strong>,{' '}
                  <strong>live animals</strong>, alcohol/tobacco/vapes, or stolen/counterfeit goods.
                </p>
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    acceptedSafetyPolicy
                      ? "bg-emerald-50 border-emerald-500"
                      : "bg-white border-red-300 hover:border-red-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={acceptedSafetyPolicy}
                    onChange={(e) => {
                      setAcceptedSafetyPolicy(e.target.checked);
                      if (e.target.checked) setListingValidationError(null);
                    }}
                    className="w-6 h-6 mt-0.5 rounded accent-[#081d38] shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    I confirm this item is legal, safe, not recalled, and contains zero prohibited
                    items.
                  </span>
                </label>
                {listingValidationError && (
                  <div className="text-xs font-bold text-red-700">{listingValidationError}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={!acceptedSafetyPolicy || isListingBusy}
                className="w-full py-3 px-4 rounded-xl bg-[#0F2749] hover:bg-[#173663] disabled:opacity-45 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <PackagePlus className="w-4 h-4 text-[#F3C969]" />
                <span>
                  {isListingBusy ? "Publishing Listing..." : "Publish Listing"}
                </span>
              </button>
              <p className="text-[10.5px] text-center text-slate-500 leading-snug">
                Marketplace Disclaimer: TDEX does not inspect, own, or guarantee peer-to-peer items;
                sellers are responsible for listing accuracy, safety, and legality.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const DiscoveryMarketView = MarketplacePage;
