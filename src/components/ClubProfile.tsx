import React, { useState } from 'react';
import { Club } from '../types/game';
import { useToast } from './Toast';
import { Building2, Landmark, Trophy, Users, Shield, ArrowUpCircle, AlertCircle, Coins } from 'lucide-react';

interface ClubProfileProps {
  club: Club;
  onUpgradeFacilities: (type: 'training' | 'youth' | 'stadium') => void;
  onUpdateTicketPrices: (ticket: number, season: number) => void;
  onPayoutDividend: (amount: number) => void;
  playerWealth: number;
}

export default function ClubProfile({
  club,
  onUpgradeFacilities,
  onUpdateTicketPrices,
  onPayoutDividend,
  playerWealth
}: ClubProfileProps) {
  const { show: notify } = useToast();
  const [ticketPrice, setTicketPrice] = useState(club.ticketPrice);
  const [seasonTicketPrice, setSeasonTicketPrice] = useState(club.seasonTicketPrice);
  const [dividendAmount, setDividendAmount] = useState(Math.floor(club.cash * 0.1));

  const formatMoney = (val: number) => {
    if (val >= 1000) return `£${(val / 1000).toFixed(2)}B`;
    return `£${val.toFixed(2)}M`;
  };

  const getUpgradeCost = (type: 'training' | 'youth' | 'stadium') => {
    if (type === 'training') return club.trainingFacilitiesLevel * 4.5;
    if (type === 'youth') return club.youthFacilitiesLevel * 4.5;
    return club.stadiumLevel * 6.0;
  };

  const canUpgrade = (type: 'training' | 'youth' | 'stadium') => {
    const cost = getUpgradeCost(type);
    return club.cash >= cost;
  };

  const handleSavePrices = () => {
    onUpdateTicketPrices(ticketPrice, seasonTicketPrice);
    notify('Matchday and Season ticket prices updated successfully!', 'success');
  };

  const handleDividendClick = () => {
    if (dividendAmount <= 0) return;
    if (dividendAmount > club.cash) {
      notify('Club does not have enough cash reserves.', 'error');
      return;
    }
    onPayoutDividend(dividendAmount);
    setDividendAmount(0);
  };

  return (
    <div className="flex flex-col gap-5" id="club-profile">
      {/* Club Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
               style={{ backgroundColor: club.colorPrimary === 'red' ? '#ef4444' : club.colorPrimary === 'blue' ? '#3b82f6' : club.colorPrimary === 'sky' ? '#0ea5e9' : club.colorPrimary === 'emerald' ? '#10b981' : '#a855f7' }}>
            {club.shortName}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{club.name}</h3>
            <p className="text-xs text-slate-400">Headquarters & Governance</p>
          </div>
        </div>
        <div className="z-10 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Market Value</div>
          <div className="text-sm font-mono font-black text-white">{formatMoney(club.valuation)}</div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-32 bg-indigo-600/5 blur-3xl pointer-events-none rounded-full" />
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/40 text-emerald-400 rounded-lg">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Cash Reserves</div>
            <div className="text-xs font-mono font-bold text-white">{formatMoney(club.cash)}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-950/40 text-rose-400 rounded-lg">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Outstanding Debt</div>
            <div className="text-xs font-mono font-bold text-white">{formatMoney(club.debt)}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/40 text-blue-400 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Fanbase Size</div>
            <div className="text-xs font-mono font-bold text-white">{(club.fanbaseSize / 1000).toFixed(0)}K Loyalists</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/40 text-amber-400 rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Reputation</div>
            <div className="text-xs font-mono font-bold text-white">{club.reputation}/100</div>
          </div>
        </div>
      </div>

      {/* Pricing Controls Slider Section */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Ticketing and Commercial Pricing</h4>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Matchday Ticket Price</span>
              <span className="text-white font-mono font-bold">£{ticketPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Season Pass Price</span>
              <span className="text-white font-mono font-bold">£{seasonTicketPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="20"
              value={seasonTicketPrice}
              onChange={(e) => setSeasonTicketPrice(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {ticketPrice > 50 && (
            <div className="flex items-start gap-2 bg-amber-950/20 text-amber-400 p-3 rounded-lg border border-amber-900/30 text-xs mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Warning: High ticket prices may discourage home attendance and slowly degrade overall fan satisfaction.</span>
            </div>
          )}

          <button
            onClick={handleSavePrices}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl mt-2 transition-all"
          >
            Apply Prices
          </button>
        </div>
      </div>

      {/* Facilities and Infrastructure upgrades */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Infrastructure Upgrades</h4>
        <div className="flex flex-col gap-3">
          {/* Training Facilities */}
          <div className="flex items-center justify-between border-b border-slate-950 pb-3">
            <div>
              <div className="text-xs font-bold text-white">Training Ground</div>
              <p className="text-[10px] text-slate-400">Level {club.trainingFacilitiesLevel}/5 • Improves Squad Quality growth</p>
            </div>
            <button
              onClick={() => onUpgradeFacilities('training')}
              disabled={!canUpgrade('training')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                canUpgrade('training')
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              £{getUpgradeCost('training')}M
            </button>
          </div>

          {/* Youth facilities */}
          <div className="flex items-center justify-between border-b border-slate-950 pb-3">
            <div>
              <div className="text-xs font-bold text-white">Youth Academy</div>
              <p className="text-[10px] text-slate-400">Level {club.youthFacilitiesLevel}/5 • Spawns Golden Generations</p>
            </div>
            <button
              onClick={() => onUpgradeFacilities('youth')}
              disabled={!canUpgrade('youth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                canUpgrade('youth')
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              £{getUpgradeCost('youth')}M
            </button>
          </div>

          {/* Stadium size */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Stadium Capacity</div>
              <p className="text-[10px] text-slate-400">{club.stadiumCapacity.toLocaleString()} seats • Increases Matchday Revenues</p>
            </div>
            <button
              onClick={() => onUpgradeFacilities('stadium')}
              disabled={!canUpgrade('stadium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                canUpgrade('stadium')
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              £{getUpgradeCost('stadium')}M
            </button>
          </div>
        </div>
      </div>

      {/* Dividend Payout Mechanic */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-950/40 text-indigo-400 rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Dividend Payout Engine</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Wire money directly to your personal wealth. High payouts anger supporters and lower your reputation.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Payout Amount</span>
            <span className="text-white font-mono font-bold">£{dividendAmount}M</span>
          </div>

          <input
            type="range"
            min="1"
            max={Math.max(1, Math.floor(club.cash * 0.4))}
            value={dividendAmount}
            onChange={(e) => setDividendAmount(parseInt(e.target.value) || 1)}
            className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-950 pt-3">
            <div>Resulting Club Cash: <span className="text-slate-300 font-bold">£{(club.cash - dividendAmount).toFixed(1)}M</span></div>
            <div>Fan Response: <span className="text-rose-400 font-bold">Angry protests (-{dividendAmount * 2} Rep)</span></div>
          </div>

          <button
            onClick={handleDividendClick}
            disabled={dividendAmount <= 0}
            className={`w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all ${
              dividendAmount <= 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : ''
            }`}
          >
            Authorize Dividend Payout
          </button>
        </div>
      </div>
    </div>
  );
}
