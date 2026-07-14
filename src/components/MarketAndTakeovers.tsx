import React, { useState, useMemo } from 'react';
import { Club, League, PlayerProfile } from '../types/game';
import { useToast } from './Toast';
import { 
  Landmark, 
  Users, 
  TrendingUp, 
  HelpCircle, 
  Coins, 
  ShieldAlert, 
  BadgeCheck, 
  CheckCircle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Sparkles,
  XCircle
} from 'lucide-react';

interface MarketAndTakeoversProps {
  clubs: Club[];
  leagues: League[];
  player: PlayerProfile;
  activeClubId: string | null;
  onAcquireClub: (clubId: string, price: number) => void;
}

export default function MarketAndTakeovers({
  clubs,
  leagues,
  player,
  activeClubId,
  onAcquireClub
}: MarketAndTakeoversProps) {
  const { show: notify } = useToast();
  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all');
  const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'valuation-desc' | 'tier-desc' | 'name-asc'>('price-asc');

  const formatMoney = (val: number) => {
    if (val >= 1000) return `£${(val / 1000).toFixed(2)}B`;
    return `£${val.toFixed(1)}M`;
  };

  // Pre-calculate market listing attributes for every club to ensure reliable sorting/filtering
  const processedClubs = useMemo(() => {
    return clubs.map((club) => {
      // Asking price multiplier: smaller clubs have quick distress (0.9x), giant clubs demand premium (1.2x)
      let mult = 1.0;
      let motive = 'Stable owner open to solid proposals.';
      
      if (club.valuation > 800) {
        mult = 1.25;
        motive = 'Owner demands high brand premium and long-term stadium development guarantees.';
      } else if (club.valuation > 100) {
        mult = 1.1;
        motive = 'Owner seeking to transition to other business portfolios. Rigid on price.';
      } else if (club.valuation > 20) {
        mult = 0.95;
        motive = 'Owner retiring soon. High flexibility for a quick takeover and immediate sale.';
      } else {
        mult = 0.85;
        motive = 'Distressed assets. Owner desperately looking for capital injection to avoid administration.';
      }

      const askingPrice = Math.round(club.valuation * mult * 10) / 10;
      const league = leagues.find((l) => l.id === club.leagueId);
      const isOwned = club.id === activeClubId;
      const isAffordable = player.personalWealth >= askingPrice;

      return {
        ...club,
        askingPrice,
        motive,
        league,
        isOwned,
        isAffordable
      };
    });
  }, [clubs, leagues, activeClubId, player.personalWealth]);

  // Compute count of affordable clubs
  const affordableCount = useMemo(() => {
    return processedClubs.filter(c => c.isAffordable && !c.isOwned).length;
  }, [processedClubs]);

  // Filter and sort the clubs dynamically
  const filteredAndSortedClubs = useMemo(() => {
    let result = [...processedClubs];

    // 1. Text Search Filter (Matches club name, short name, or division name)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.shortName.toLowerCase().includes(query) ||
          (c.league?.name && c.league.name.toLowerCase().includes(query))
      );
    }

    // 2. Division / League Filter
    if (selectedLeagueId !== 'all') {
      result = result.filter((c) => c.leagueId === selectedLeagueId);
    }

    // 3. Affordable Only Filter
    if (showOnlyAffordable) {
      result = result.filter((c) => c.isAffordable && !c.isOwned);
    }

    // 4. Sorting logic
    result.sort((a, b) => {
      // Put currently owned club always at the very top (or handle it naturally)
      if (a.isOwned && !b.isOwned) return -1;
      if (!a.isOwned && b.isOwned) return 1;

      switch (sortBy) {
        case 'price-asc':
          return a.askingPrice - b.askingPrice;
        case 'price-desc':
          return b.askingPrice - a.askingPrice;
        case 'valuation-desc':
          return b.valuation - a.valuation;
        case 'tier-desc':
          // League Tiers (e.g., Tier 4 first is descending tier number)
          const tierA = a.league?.tier ?? 4;
          const tierB = b.league?.tier ?? 4;
          return tierB - tierA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [processedClubs, searchQuery, selectedLeagueId, showOnlyAffordable, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLeagueId('all');
    setShowOnlyAffordable(false);
    setSortBy('price-asc');
  };

  return (
    <div className="flex flex-col gap-5" id="market-and-takeovers">
      {/* Banner introduction */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-xl">
          <h3 className="text-sm font-bold text-white font-display mb-1 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-indigo-400" />
            Acquisition Market
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Grow your football empire. Buy undervalued, distressed clubs in lower divisions, expand their brand value, and sell them for massive reinvestment funds. You have <span className="text-emerald-400 font-extrabold font-mono">£{player.personalWealth.toFixed(1)}M</span> to invest.
          </p>
        </div>
        
        {/* Quick status box showing affordable count */}
        <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl shrink-0 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Affordable Takeovers</div>
            <button
              onClick={() => {
                setShowOnlyAffordable(true);
                setSortBy('price-asc');
              }}
              className="text-xs font-mono font-bold text-emerald-400 hover:underline cursor-pointer text-left block"
            >
              {affordableCount} Clubs available
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter, Search, and Sort Console */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search Input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search club name, division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Quick toggle: Only Affordable */}
          <button
            onClick={() => setShowOnlyAffordable(!showOnlyAffordable)}
            className={`md:col-span-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showOnlyAffordable
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 shadow-md'
                : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-950/60'
            }`}
          >
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span>Show Affordable Only ({affordableCount})</span>
            {showOnlyAffordable && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 block animate-pulse ml-1" />
            )}
          </button>

          {/* Sort selection drop-down */}
          <div className="relative md:col-span-3">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="valuation-desc">Valuation: Highest</option>
              <option value="tier-desc">Lower Divisions First</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Division Horizontal Pills Selection */}
        <div className="border-t border-slate-850 pt-3 flex flex-wrap items-center gap-1.5 select-none">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Division:</span>
          <button
            onClick={() => setSelectedLeagueId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLeagueId === 'all'
                ? 'bg-slate-950 border border-indigo-500/50 text-white font-extrabold'
                : 'bg-slate-950/40 border border-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Divisions
          </button>
          {leagues.map((league) => {
            const leagueClubsCount = processedClubs.filter(c => c.leagueId === league.id).length;
            return (
              <button
                key={league.id}
                onClick={() => setSelectedLeagueId(league.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedLeagueId === league.id
                    ? 'bg-slate-950 border border-indigo-500/50 text-white font-extrabold'
                    : 'bg-slate-950/40 border border-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{league.name}</span>
                <span className="px-1 py-0.5 rounded text-[9px] bg-slate-900 font-mono text-slate-500">{leagueClubsCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filters status summary */}
      {(searchQuery || selectedLeagueId !== 'all' || showOnlyAffordable) && (
        <div className="flex items-center justify-between bg-slate-950 border border-slate-900 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Filtered View:</span>
            <span>Showing {filteredAndSortedClubs.length} of {clubs.length} Clubs</span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Clubs Catalog Grid */}
      <div className="flex flex-col gap-4">
        {filteredAndSortedClubs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
              <XCircle className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-display">No Takeover Targets Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                We couldn't locate any listings matching your search or filters. You currently have £{player.personalWealth.toFixed(1)}M available.
              </p>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          filteredAndSortedClubs.map((club) => {
            const isOwned = club.isOwned;
            const isAffordable = club.isAffordable;
            const askingPrice = club.askingPrice;
            const motive = club.motive;
            const league = club.league;

            return (
              <div
                key={club.id}
                className={`p-5 rounded-xl border flex flex-col gap-3 transition-all relative overflow-hidden ${
                  isOwned
                    ? 'bg-indigo-950/40 border-indigo-500'
                    : isAffordable
                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
                    : 'bg-slate-900/60 border-slate-900/80 opacity-75'
                }`}
              >
                {/* Header Badge */}
                {isOwned ? (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-black px-3.5 py-1 rounded-bl-xl flex items-center gap-1 shadow">
                    <BadgeCheck className="w-3 h-3" />
                    Your Club
                  </div>
                ) : isAffordable ? (
                  <div className="absolute top-0 right-0 bg-emerald-950 border-l border-b border-emerald-900 text-emerald-400 text-[9px] uppercase font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Affordable Deal
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 bg-slate-950 border-l border-b border-slate-900 text-slate-500 text-[9px] uppercase font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 font-mono">
                    Out of Budget
                  </div>
                )}

                {/* Title Section */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-black shrink-0 shadow-inner"
                    style={{ backgroundColor: club.colorPrimary === 'red' ? '#ef4444' : club.colorPrimary === 'blue' ? '#3b82f6' : club.colorPrimary === 'sky' ? '#0ea5e9' : club.colorPrimary === 'emerald' ? '#10b981' : '#a855f7' }}
                  >
                    {club.shortName}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{club.name}</span>
                      {isAffordable && !isOwned && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" title="Affordable takeover candidate" />
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400">{league?.name || 'Unknown League'} • Tier {league?.tier || 4}</p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-900/80 p-2.5 rounded-lg text-center mt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Valuation</span>
                    <span className="text-xs font-mono font-bold text-white">{formatMoney(club.valuation)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Cash Reserves</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{formatMoney(club.cash)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Debts</span>
                    <span className="text-xs font-mono font-bold text-rose-400">{formatMoney(club.debt)}</span>
                  </div>
                </div>

                {/* Motivations */}
                <div className="text-[10px] bg-slate-950/40 p-2.5 border border-slate-900/40 text-slate-400 rounded-lg leading-relaxed">
                  <span className="font-black text-slate-500 uppercase tracking-wider block mb-0.5">Owner Motivation:</span>
                  {motive}
                </div>

                {/* Purchase console */}
                <div className="flex items-center justify-between border-t border-slate-950/60 pt-3 mt-1 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Takeover Asking Price</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-mono font-black text-white">{formatMoney(askingPrice)}</span>
                      {!isOwned && (
                        <span className={`text-[10px] font-mono font-bold ${isAffordable ? 'text-emerald-400' : 'text-slate-500'}`}>
                          ({isAffordable ? 'Affordable' : 'Requires ' + formatMoney(askingPrice - player.personalWealth) + ' more'})
                        </span>
                      )}
                    </div>
                  </div>

                  {!isOwned && (
                    <button
                      onClick={() => {
                        if (!isAffordable) {
                          notify(`Insufficient wealth. Asking price is £${askingPrice}M, you only have £${player.personalWealth}M.`, 'error');
                          return;
                        }
                        
                        const confirmTakeover = activeClubId 
                          ? window.confirm("⚠️ Note: You already own a club. Acquiring this club will force you to liquidate and resign from your current club. Proceed?")
                          : window.confirm(`Proceed with the £${askingPrice}M acquisition of ${club.name}?`);

                        if (confirmTakeover) {
                          onAcquireClub(club.id, askingPrice);
                        }
                      }}
                      className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isAffordable
                          ? 'bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] text-white shadow-lg shadow-emerald-950/10'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                      }`}
                    >
                      Acquire Club
                    </button>
                  )}

                  {isOwned && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold bg-indigo-950/40 px-3.5 py-1.5 rounded-xl border border-indigo-900/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Hired Board Active
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
