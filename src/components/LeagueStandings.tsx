import React, { useState } from 'react';
import { League, Club } from '../types/game';
import { Trophy, Calendar, Award, AlignLeft } from 'lucide-react';

interface LeagueStandingsProps {
  leagues: League[];
  clubs: Club[];
  currentWeek: number;
}

export default function LeagueStandings({ leagues, clubs, currentWeek }: LeagueStandingsProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagues[0]?.id || '');
  const [viewTab, setViewTab] = useState<'standings' | 'fixtures' | 'history'>('standings');

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);

  const getClubName = (id: string) => {
    return clubs.find((c) => c.id === id)?.name || id;
  };

  const getClubShortName = (id: string) => {
    return clubs.find((c) => c.id === id)?.shortName || id;
  };

  const getClubColor = (id: string) => {
    return clubs.find((c) => c.id === id)?.colorPrimary || 'indigo';
  };

  return (
    <div className="flex flex-col gap-4" id="league-standings">
      {/* League Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeagueId(l.id)}
            className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
              selectedLeagueId === l.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/15'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
        <button
          onClick={() => setViewTab('standings')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            viewTab === 'standings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          League Table
        </button>
        <button
          onClick={() => setViewTab('fixtures')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            viewTab === 'fixtures' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Fixtures & Results
        </button>
        <button
          onClick={() => setViewTab('history')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            viewTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Champions History
        </button>
      </div>

      {/* Table Content */}
      {selectedLeague && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4">
          {viewTab === 'standings' && (
            <div className="flex flex-col">
              <div className="grid grid-cols-12 text-[10px] uppercase font-black text-slate-500 pb-2 border-b border-slate-950">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-5 text-left pl-1">Club</span>
                <span className="col-span-1 text-center">P</span>
                <span className="col-span-1 text-center">W</span>
                <span className="col-span-1 text-center">D</span>
                <span className="col-span-1 text-center">L</span>
                <span className="col-span-1 text-center">GD</span>
                <span className="col-span-1 text-center font-bold text-slate-300">PTS</span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                {selectedLeague.standings.map((entry, idx) => {
                  const clubColor = getClubColor(entry.clubId);
                  const isPromotionSpot = idx === 0;
                  const isRelegationSpot = idx === selectedLeague.standings.length - 1 && selectedLeague.tier < 4;

                  return (
                    <div
                      key={entry.clubId}
                      className="grid grid-cols-12 py-2 text-xs border-b border-slate-950/40 items-center hover:bg-slate-950/20 rounded px-1 transition-all"
                    >
                      {/* Pos */}
                      <span className="col-span-1 text-center font-mono font-bold text-slate-400 flex items-center justify-center">
                        {isPromotionSpot ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-950/30 text-emerald-400 text-[9px] border border-emerald-900/50 flex items-center justify-center" title="Promotion Spot">
                            {idx + 1}
                          </span>
                        ) : isRelegationSpot ? (
                          <span className="w-4 h-4 rounded-full bg-rose-950/30 text-rose-400 text-[9px] border border-rose-900/50 flex items-center justify-center" title="Relegation Spot">
                            {idx + 1}
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      {/* Club Name */}
                      <div className="col-span-5 flex items-center gap-2 pl-1">
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: clubColor === 'red' ? '#ef4444' : clubColor === 'blue' ? '#3b82f6' : clubColor === 'sky' ? '#0ea5e9' : clubColor === 'emerald' ? '#10b981' : '#a855f7' }}
                        />
                        <span className="font-semibold text-white truncate text-[11px]" title={getClubName(entry.clubId)}>
                          {getClubShortName(entry.clubId)}
                        </span>
                      </div>

                      {/* Played, Won, Drawn, Lost, GD, PTS */}
                      <span className="col-span-1 text-center font-mono font-medium text-slate-400">{entry.played}</span>
                      <span className="col-span-1 text-center font-mono font-medium text-slate-400">{entry.won}</span>
                      <span className="col-span-1 text-center font-mono font-medium text-slate-400">{entry.drawn}</span>
                      <span className="col-span-1 text-center font-mono font-medium text-slate-400">{entry.lost}</span>
                      <span className="col-span-1 text-center font-mono font-medium text-slate-400">
                        {entry.gf - entry.ga > 0 ? '+' : ''}{entry.gf - entry.ga}
                      </span>
                      <span className="col-span-1 text-center font-mono font-bold text-white text-[12px]">{entry.points}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewTab === 'fixtures' && (
            <div className="flex flex-col gap-4">
              {/* Show matches grouped by week */}
              {[1, 2, 3, 4, 5, 6].map((wk) => {
                const weekMatches = selectedLeague.fixtures.filter((f) => f.week === wk);
                const isCurrent = wk === currentWeek;

                return (
                  <div key={wk} className={`flex flex-col gap-2 p-3 rounded-xl border ${
                    isCurrent ? 'bg-indigo-950/15 border-indigo-500/20' : 'bg-slate-950/40 border-slate-900/60'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-900">
                      <span>Week {wk}</span>
                      {isCurrent && <span className="text-indigo-400 font-black animate-pulse">ACTIVE WEEK</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      {weekMatches.map((m, mIdx) => (
                        <div key={mIdx} className="flex justify-between items-center text-xs py-1">
                          <span className="text-slate-300 font-semibold text-right w-[40%] truncate">{getClubShortName(m.homeClubId)}</span>
                          <span className="px-3 py-1 bg-slate-900/80 border border-slate-800 rounded font-mono font-bold text-white text-[11px] min-w-[50px] text-center shadow-inner">
                            {m.simulated ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                          </span>
                          <span className="text-slate-300 font-semibold text-left w-[40%] truncate">{getClubShortName(m.awayClubId)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewTab === 'history' && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hall of Fame Champions</h4>
              {selectedLeague.history.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-5">No seasonal history registered yet. Complete the first campaign to log trophies!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedLeague.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-bold text-white">{h.winnerName}</div>
                          <p className="text-[10px] text-slate-500">Runner-up: {h.runnerUpName}</p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-400 font-bold">{h.year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
