import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  HeartHandshake,
  Scissors,
  Sparkles,
} from 'lucide-react';

type FashionTab = 'exchange' | 'student_design' | 'closet_calculator' | 'group_circle';

interface FashionListing {
  id: string;
  title: string;
  category: 'Women’s Apparel' | 'Kids & Teen Growth' | 'Formal & Prom' | 'Sewing & Upcycle';
  price: number;
  sizeLabel: string;
  sellerLabel: string;
  location: string;
  description: string;
}

const SAMPLE_FASHION_ITEMS: FashionListing[] = [
  {
    id: 'FASH-101',
    title: 'Classic Tailored Wool Blazer & Silk Scarf Set',
    category: 'Women’s Apparel',
    price: 80,
    sizeLabel: 'Size M',
    sellerLabel: 'Verified Owner (Mom & Teacher)',
    location: 'Las Vegas, NV',
    description:
      'Timeless navy wool-blend blazer paired with a floral silk scarf. Clean, crisp condition—ready for work or parent-teacher night.',
  },
  {
    id: 'FASH-102',
    title: 'High School Prom & Graduation Evening Gown (Emerald)',
    category: 'Formal & Prom',
    price: 120,
    sizeLabel: 'Size 6',
    sellerLabel: 'Verified Owner (Parent)',
    location: 'Columbus, OH',
    description:
      'Worn once for senior prom. Passing it forward so another working-class student shines without paying $500 retail.',
  },
  {
    id: 'FASH-103',
    title: 'Back-to-School Bundle: 5 Pairs Youth Jeans & Hoodies',
    category: 'Kids & Teen Growth',
    price: 60,
    sizeLabel: 'Youth 10–12',
    sellerLabel: 'Verified Owner (Family)',
    location: 'Austin, TX',
    description:
      'Outgrown in one semester! Sturdy denim, fleece hoodies, and clean sneakers bundled for growing kids.',
  },
  {
    id: 'FASH-104',
    title: 'Singer Heavy-Duty Sewing Machine + Starter Fabric Box',
    category: 'Sewing & Upcycle',
    price: 140,
    sizeLabel: 'Full Kit',
    sellerLabel: 'Verified Owner (Home Ec Mentor)',
    location: 'Denver, CO',
    description:
      'Includes bobbins, scissors, patterns, and 6 yards of cotton/denim fabric for public school textile design students.',
  },
];

export const FashionGroupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FashionTab>('exchange');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [closetSalePrice, setClosetSalePrice] = useState<number>(100);
  const [reservedItemId, setReservedItemId] = useState<string | null>(null);
  const [orderAuditNotice, setOrderAuditNotice] = useState<{
    itemId: string;
    columboAuditHash: string;
    mode: string;
    notice: string;
  } | null>(null);

  const handlePreviewSplitWithBackend = (item: FashionListing) => {
    setReservedItemId(item.id);
    const cash50 = (item.price * 0.5).toFixed(2);
    const credit25 = (item.price * 0.25).toFixed(2);
    setOrderAuditNotice({
      itemId: item.id,
      columboAuditHash: `WALK-${item.id}`,
      mode: 'SPLIT_WALKTHROUGH',
      notice: `Walkthrough split: $${cash50} immediate seller cash · $${credit25} seller property credit · $${credit25} buyer property cashback (no card charged).`,
    });
  };

  const filteredItems = SAMPLE_FASHION_ITEMS.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  const sellerCash50 = closetSalePrice * 0.5;
  const sellerEquity25 = closetSalePrice * 0.25;
  const buyerEquity25 = closetSalePrice * 0.25;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Channel #16 &bull; Article 12 (50/25/25) &amp; Article 3.3 (Public Schools Design)</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold rounded">
            Closet-to-Equity &bull; Student Textile Awards
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
          Fashion, Style &amp; Closet-to-Equity Group
        </h1>

        <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
          Every closet holds untapped family value. Trade women&rsquo;s fashion, formal dresses, and outgrown kids&rsquo; clothes under the locked <strong>50 / 25 / 25 Marketplace Split</strong> (<strong>Article 12.1</strong>)—turning wardrobe refreshes into immediate spending cash, debt-free apartment equity, and <strong>Public Schools Fashion &amp; Textile Discovery Awards</strong>.
        </p>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-[#dfa62a]">1. Closet-to-Equity (Art. 12.1)</div>
            <div className="text-base font-bold text-white">50% Cash &bull; 25% + 25% Property</div>
            <p className="text-xs text-slate-300">
              Sell a $100 dress or coat: get $50 cash immediately + $25 property credit for you + $25 property credit for the buyer.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-emerald-300">2. Growing Kids Wardrobe Loop</div>
            <div className="text-base font-bold text-white">Zero Waste for Moms &amp; Families</div>
            <p className="text-xs text-slate-300">
              Kids outgrow clothes every 6 months. Swap bundles with neighbor families while building real estate Nuggets.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-sky-300">3. Public Schools Textile &amp; Design Track</div>
            <div className="text-base font-bold text-white">Applied &amp; Hybrid Discovery</div>
            <p className="text-xs text-slate-300">
              High school and middle school students enter upcycled garments, sewing engineering, and sustainable fabrics in the NDA.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2">
        {[
          { id: 'exchange', label: '1. Community Closet & Style Board' },
          { id: 'closet_calculator', label: '2. Closet-to-Equity Calculator (50/25/25)' },
          { id: 'student_design', label: '3. Public Schools Student Fashion & Upcycle Track' },
          { id: 'group_circle', label: '4. Women & Mom Pushers Circle' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as FashionTab)}
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

      {/* TAB 1: COMMUNITY CLOSET & STYLE BOARD */}
      {activeTab === 'exchange' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'Women’s Apparel', 'Formal & Prom', 'Kids & Teen Growth', 'Sewing & Upcycle'].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#081d38] text-[#dfa62a]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Style Categories' : cat}
                  </button>
                )
              )}
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Preview Board &bull; Article 12.1 50/25/25 Split
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-[#081d38]">{item.sizeLabel}</span>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-[#081d38]">{item.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="p-3 rounded-lg bg-[#fbfaf7] border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs tabular-nums">
                    <div>
                      <div className="text-[10px] text-slate-500">Seller Cash (50%)</div>
                      <div className="font-bold text-emerald-700">${(item.price * 0.5).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Seller Property (25%)</div>
                      <div className="font-bold text-[#081d38]">${(item.price * 0.25).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Buyer Credit (25%)</div>
                      <div className="font-bold text-[#b47d12]">${(item.price * 0.25).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      {item.sellerLabel} &bull; {item.location}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePreviewSplitWithBackend(item)}
                      className="px-4 py-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold rounded-lg cursor-pointer"
                    >
                      {reservedItemId === item.id
                        ? `Walkthrough Shown ($${item.price})`
                        : `Walk $${item.price} Split (50/25/25)`}
                    </button>
                  </div>
                  {orderAuditNotice && orderAuditNotice.itemId === item.id && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-mono">
                      <div>
                        <strong>{orderAuditNotice.mode}</strong> &bull; Hash:{' '}
                        {orderAuditNotice.columboAuditHash.slice(0, 16)}...
                      </div>
                      <div className="font-sans text-emerald-800 mt-0.5">{orderAuditNotice.notice}</div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLOSET-TO-EQUITY CALCULATOR */}
      {activeTab === 'closet_calculator' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Closet-to-Equity Calculator (Article 12.1 — 50 / 25 / 25)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Slide to see how selling unused outfits, handbags, or kids&rsquo; clothes turns into immediate cash and debt-free apartment equity.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-[#081d38] text-sm tabular-nums">
                Closet Sale Amount: ${closetSalePrice}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                0% TDEX Listing Fee (Standard Processor &amp; Shipping Apply)
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={closetSalePrice}
              onChange={(e) => setClosetSalePrice(Number(e.target.value))}
              className="w-full accent-[#081d38] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 tabular-nums">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-xs font-bold uppercase text-emerald-900">
                50% Immediate Cash to You
              </div>
              <div className="text-2xl font-bold text-emerald-950">
                ${sellerCash50.toFixed(2)}
              </div>
              <p className="text-xs text-emerald-800">
                Spending money in your pocket right away.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold uppercase text-[#081d38]">
                25% Your Property Accumulation
              </div>
              <div className="text-2xl font-bold text-[#081d38]">
                ${sellerEquity25.toFixed(2)}
              </div>
              <p className="text-xs text-slate-600">
                Builds toward debt-free apartment Nuggets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="text-xs font-bold uppercase text-amber-950">
                25% Buyer Property Cashback
              </div>
              <div className="text-2xl font-bold text-[#b47d12]">
                ${buyerEquity25.toFixed(2)}
              </div>
              <p className="text-xs text-amber-900">
                Rewards the neighbor who buys your item.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLIC SCHOOLS STUDENT FASHION & UPCYCLE TRACK */}
      {activeTab === 'student_design' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#b47d12]">
              <Scissors className="w-4 h-4" />
              <span>Article 3.3 &bull; Hands-On Garment &amp; Textile Engineering</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Applied &amp; Hybrid Textile Discovery (Article 3.3)
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Students in public schools who sew, mend, upcycle thrift-store fabrics, or engineer weather-resistant winter coats out of everyday materials can enter their designs at <strong>$0 cost</strong> in the National Discovery Awards.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-700">
              <Award className="w-4 h-4" />
              <span>Article 13.1 &bull; Funded-First Classroom Support</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              15% Classroom Sewing &amp; Art Supply Grants
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              When a student wins in textile or wearable design, <strong>50%</strong> goes into a protected student education fund, <strong>25%</strong> honors their mentoring public school teacher, and <strong>15%</strong> buys sewing machines, fabric, and tools for their school classroom.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: WOMEN & MOM PUSHERS CIRCLE */}
      {activeTab === 'group_circle' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#b47d12]">
            <HeartHandshake className="w-4 h-4" />
            <span>Article 1.3 &amp; Article 4.1 &bull; Equal Ownership Leadership</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            How Women, Moms &amp; Educators Lead Local Chapters (Article 1.3 &amp; 4.1)
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            In everyday households, moms and women lead most family budgeting, school coordination, and wardrobe purchases. Under <strong>Article 1.3</strong>, any woman or parent who organizes a local Fashion &amp; Closet-to-Equity drive acts as a <strong>Pusher</strong>—bringing neighbors together while upholding <strong>One Human Owner = One Vote (Article 4.1)</strong> with zero corporate bosses.
          </p>
          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              Every local Closet-to-Equity chapter follows isolated domestic property silos (Article 1.4 &amp; 9.1), 100% debt-free real estate rules (Article 10.6), and strict child-privacy safeguards (Article 8.4).
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
