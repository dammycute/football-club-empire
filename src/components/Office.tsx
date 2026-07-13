import React from 'react';
import { PlayerProfile, EventLog } from '../types/game';
import { Trophy, Compass, Landmark, Users, TrendingUp, Newspaper, Award, Calendar } from 'lucide-react';

interface OfficeProps {
  player: PlayerProfile;
  events: EventLog[];
  careerStats: {
    seasonsCompleted: number;
    totalProfitMade: number;
    highestValuationReached: number;
    totalTrophies: number;
  };
}

export default function Office({ player, events, careerStats }: OfficeProps) {
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'financial':
        return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
      case 'sporting':
        return 'bg-blue-950/20 text-blue-400 border-blue-900/30';
      case 'empire':
        return 'bg-purple-950/20 text-purple-400 border-purple-900/30';
      default:
        return 'bg-slate-950/40 text-slate-400 border-slate-900/30';
    }
  };

  return (
    <div className="flex flex-col gap-5" id="office-panel">
      {/* Chairman Desk Banner */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="z-10">
          <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400">Tycoon Workspace</span>
          <h2 className="text-xl font-black font-display text-white mt-1">Chairman's Executive Office</h2>
          <p className="text-xs text-slate-400 mt-1">Review your growing personal wealth, trophy collections, and official global football press releases.</p>
        </div>
        <div className="flex items-center gap-2 z-10">
          <div className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-center min-w-[70px]">
            <div className="text-[9px] uppercase font-bold text-slate-500">Seasons</div>
            <div className="text-xs font-mono font-bold text-white">{careerStats.seasonsCompleted}</div>
          </div>
          <div className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-center min-w-[70px]">
            <div className="text-[9px] uppercase font-bold text-slate-500">Trophies</div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-0.5">
              <Trophy className="w-3 h-3 text-amber-400" />
              {careerStats.totalTrophies}
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-indigo-600/5 blur-3xl pointer-events-none rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* News Feed - Left */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-950">
            <Newspaper className="w-4 h-4 text-slate-500" />
            Global Football News & Press Releases
          </h3>

          <div className="flex flex-col gap-3">
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-10">No international press releases yet.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="bg-slate-950 border border-slate-900/60 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase shrink-0 ${getEventBadge(ev.type)}`}>
                      {ev.type === 'news' ? 'Press' : ev.type}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5 shrink-0">
                      <Calendar className="w-2.5 h-2.5" />
                      Y{ev.year}, W{ev.week}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{ev.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ev.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trophy Cabinet & Career stats - Right */}
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* Trophy Cabinet Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-950">
              <Trophy className="w-4 h-4 text-amber-500" />
              Trophy Cabinet
            </h3>

            {player.trophyCabinet.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-950/40 border border-slate-950 rounded-xl">
                <Award className="w-8 h-8 text-slate-800 mb-1.5" />
                <p className="text-[10px] text-slate-500 italic">Cabinet is currently empty.</p>
                <p className="text-[9px] text-slate-600 max-w-[150px] mt-1">Lead a division contender, win the league, and earn seasonal silverware.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {player.trophyCabinet.map((t, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-950 p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1">
                    <Trophy className="w-6 h-6 text-amber-400 drop-shadow-md" />
                    <span className="text-[9px] font-bold text-white line-clamp-2 leading-tight">{t.trophyName}</span>
                    <span className="text-[8px] text-slate-500 font-mono">Y{t.year} • {t.clubName.substring(0, 10)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Business Records */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-950">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Empire Business Records
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-950/40">
                <span className="text-slate-400">Highest Club Value</span>
                <span className="text-white font-mono font-bold">£{careerStats.highestValuationReached.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-950/40">
                <span className="text-slate-400">Previously Owned</span>
                <span className="text-white font-mono font-bold">{player.clubsPreviouslyOwned.length} franchises</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total Trophy Count</span>
                <span className="text-white font-mono font-bold">{careerStats.totalTrophies} Cups</span>
              </div>
            </div>

            {/* Previous Sales List */}
            {player.clubsPreviouslyOwned.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2 border-t border-slate-950 pt-2.5">
                <span className="text-[9px] uppercase font-black text-slate-500 block mb-1">Takeover Sell Log</span>
                {player.clubsPreviouslyOwned.map((p, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-950 text-[10px] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{p.clubName}</div>
                      <span className="text-[8px] text-slate-500 font-mono">Owned: {p.yearsOwned} yrs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-bold">Sold: £{p.soldFor}M</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
