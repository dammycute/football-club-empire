import React from 'react';
import { PlayerProfile, Club } from '../types/game';
import { Award, Briefcase, Calendar, TrendingUp, Compass } from 'lucide-react';

interface HeaderProps {
  player: PlayerProfile;
  activeClub: Club | null;
  onAdvanceWeek: () => void;
  simulatingWeek: boolean;
}

export default function Header({ player, activeClub, onAdvanceWeek, simulatingWeek }: HeaderProps) {
  // Format wealth elegantly: e.g. £1,250.0M or £12.4M
  const formatWealth = (wealth: number) => {
    if (wealth >= 1000) {
      return `£${(wealth / 1000).toFixed(2)}B`;
    }
    return `£${wealth.toFixed(1)}M`;
  };

  return (
    <header className="bg-slate-950 border-b border-slate-900 sticky top-0 z-40 px-4 py-3" id="game-header">
      <div className="max-w-md mx-auto flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {player.name}
              </h1>
              <p className="text-[10px] text-slate-400">Chairman Profile</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Chairman Wealth</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatWealth(player.personalWealth)}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Reputation</span>
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-0.5">
                <Award className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
                {player.reputation}%
              </span>
            </div>
          </div>
        </div>

        {/* Calendar and Active Club bar */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-900 pt-2 mt-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-mono font-medium">
              Year {player.currentYear}, Week {player.currentWeek}/6
            </span>
          </div>

          {activeClub ? (
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              <div 
                className={`w-2 h-2 rounded-full`}
                style={{ backgroundColor: activeClub.colorPrimary === 'red' ? '#ef4444' : activeClub.colorPrimary === 'blue' ? '#3b82f6' : activeClub.colorPrimary === 'sky' ? '#0ea5e9' : activeClub.colorPrimary === 'emerald' ? '#10b981' : '#a855f7' }}
              />
              <span className="text-[10px] font-bold text-white">
                {activeClub.name} ({activeClub.shortName})
              </span>
            </div>
          ) : (
            <span className="text-[10px] bg-amber-950/20 text-amber-300 border border-amber-900/40 px-2 py-0.5 rounded-full">
              No Active Club
            </span>
          )}

          <button
            onClick={onAdvanceWeek}
            disabled={simulatingWeek}
            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 ${
              simulatingWeek
                ? 'bg-indigo-800/50 text-indigo-300 cursor-not-allowed animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
            }`}
          >
            {simulatingWeek ? 'Simulating...' : 'Next Week'}
          </button>
        </div>
      </div>
    </header>
  );
}
