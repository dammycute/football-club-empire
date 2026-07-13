import React, { useState, useEffect } from 'react';
import { Match, Club, League } from '../types/game';
import { Play, FastForward, CheckCircle2, Trophy, Loader2, VolumeX, Volume2 } from 'lucide-react';

interface MatchTickerProps {
  leagues: League[];
  clubs: Club[];
  currentWeek: number;
  currentYear: number;
  onFinishSimulation: () => void;
  activeClubId: string | null;
}

export default function MatchTicker({
  leagues,
  clubs,
  currentWeek,
  currentYear,
  onFinishSimulation,
  activeClubId
}: MatchTickerProps) {
  const [matchMinute, setMatchMinute] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1 = normal, 2 = fast, 4 = instant
  const [liveFixtures, setLiveFixtures] = useState<Match[]>([]);
  const [tickerCommentary, setTickerCommentary] = useState<string[]>([]);

  const getClubName = (id: string) => clubs.find((c) => c.id === id)?.name || id;
  const getClubShort = (id: string) => clubs.find((c) => c.id === id)?.shortName || id;
  const getClubColor = (id: string) => clubs.find((c) => c.id === id)?.colorPrimary || 'indigo';

  // Extract all fixtures for the current active week across ALL divisions
  useEffect(() => {
    const activeFixtures: Match[] = [];
    leagues.forEach((league) => {
      const wkMatches = league.fixtures.filter((f) => f.week === currentWeek);
      activeFixtures.push(...wkMatches);
    });

    // Create mutable copies for live scores
    const initialized = activeFixtures.map((f) => ({
      ...f,
      homeScore: 0,
      awayScore: 0,
    }));

    setLiveFixtures(initialized);
    setTickerCommentary([`[0'] All matches across leagues kickoff simultaneously!`]);
  }, [leagues, currentWeek]);

  // Tick the minute
  useEffect(() => {
    if (!isSimulating || liveFixtures.length === 0) return;

    if (matchMinute >= 90) {
      setIsSimulating(false);
      setTickerCommentary((prev) => [`[90'] Full-Time: All matches concluded!`, ...prev]);
      return;
    }

    const interval = setTimeout(() => {
      const nextMin = matchMinute + Math.max(1, Math.floor(Math.random() * 5) * speedMultiplier);
      const cappedMin = Math.min(90, nextMin);
      setMatchMinute(cappedMin);

      // Check if any events occurred for active matches up to this minute
      const newCommentaries: string[] = [];
      const updatedFixtures = liveFixtures.map((liveMatch) => {
        // Find the source match from actual league to check simulated events
        const sourceLeague = leagues.find((l) =>
          l.fixtures.some((f) => f.week === currentWeek && f.homeClubId === liveMatch.homeClubId)
        );
        const sourceMatch = sourceLeague?.fixtures.find(
          (f) => f.week === currentWeek && f.homeClubId === liveMatch.homeClubId
        );

        if (!sourceMatch || !sourceMatch.matchEvents) return liveMatch;

        // Count how many goals happened before this minute in the pre-simulated events
        let homeGoals = 0;
        let awayGoals = 0;

        sourceMatch.matchEvents.forEach((ev) => {
          const matchTime = parseInt(ev.match(/\[(\d+)'\]/)?.[1] || '0');
          if (matchTime <= cappedMin && ev.includes('GOAL!')) {
            if (ev.includes(getClubName(liveMatch.homeClubId))) {
              homeGoals++;
            } else if (ev.includes(getClubName(liveMatch.awayClubId))) {
              awayGoals++;
            }
          }

          // Output commentary of active interest (e.g. player club or general key moment)
          if (matchTime > matchMinute && matchTime <= cappedMin) {
            const isPlayerInvolved =
              liveMatch.homeClubId === activeClubId || liveMatch.awayClubId === activeClubId;
            if (isPlayerInvolved || Math.random() < 0.2) {
              const leaguePrefix = sourceLeague ? `[${sourceLeague.name.split(' ')[0]}] ` : '';
              newCommentaries.push(`${leaguePrefix}${ev}`);
            }
          }
        });

        return {
          ...liveMatch,
          homeScore: homeGoals,
          awayScore: awayGoals,
        };
      });

      setLiveFixtures(updatedFixtures);
      if (newCommentaries.length > 0) {
        setTickerCommentary((prev) => [...newCommentaries, ...prev]);
      }
    }, 280 / speedMultiplier);

    return () => clearTimeout(interval);
  }, [matchMinute, isSimulating, liveFixtures, leagues, currentWeek, speedMultiplier]);

  const handleInstantSim = () => {
    setSpeedMultiplier(10);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col justify-between" id="matchday-simulation">
      {/* Header Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-[9px] uppercase font-black text-indigo-400">Matchday Simulation</span>
          <h2 className="text-sm font-bold text-white">Year {currentYear}, Week {currentWeek}/6</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2.5 : prev === 2.5 ? 5 : 1))}
            className="px-2.5 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 text-slate-300"
          >
            Speed: {speedMultiplier === 1 ? '1x' : speedMultiplier === 2.5 ? '2.5x' : '5x'}
          </button>
          <button
            onClick={handleInstantSim}
            className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all text-white shadow"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Live Stadium Ticker */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-5 flex flex-col gap-5 overflow-y-auto">
        {/* Progress Circular minute tracker */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Global Minute</div>
          <div className="text-4xl font-mono font-black text-white mt-1.5 flex items-center justify-center gap-1">
            {matchMinute}'
            {isSimulating && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
          </div>
          <div className="w-[85%] bg-slate-950 h-2 rounded-full overflow-hidden mt-4 border border-slate-800/60 shadow-inner">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(matchMinute / 90) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Scoreboard */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
          <h3 className="text-[10px] uppercase font-black text-slate-500 pb-1.5 border-b border-slate-950 tracking-wider">Simultaneous Live Scoreboard</h3>
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {liveFixtures.map((fixture, idx) => {
              const homeColor = getClubColor(fixture.homeClubId);
              const awayColor = getClubColor(fixture.awayClubId);
              const isPlayerClub = fixture.homeClubId === activeClubId || fixture.awayClubId === activeClubId;

              return (
                <div
                  key={idx}
                  className={`flex justify-between items-center py-1.5 px-2 rounded-lg ${
                    isPlayerClub ? 'bg-indigo-950/20 border border-indigo-900/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 w-[40%] text-right justify-end pr-1">
                    <span className="text-xs font-semibold text-slate-300 truncate">{getClubShort(fixture.homeClubId)}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: homeColor === 'red' ? '#ef4444' : homeColor === 'blue' ? '#3b82f6' : homeColor === 'sky' ? '#0ea5e9' : homeColor === 'emerald' ? '#10b981' : '#a855f7' }} />
                  </div>

                  <span className="px-3 py-1 bg-slate-950 border border-slate-850 rounded font-mono font-black text-xs text-white text-center min-w-[55px] shadow-inner">
                    {fixture.homeScore} - {fixture.awayScore}
                  </span>

                  <div className="flex items-center gap-2 w-[40%] text-left pl-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: awayColor === 'red' ? '#ef4444' : awayColor === 'blue' ? '#3b82f6' : awayColor === 'sky' ? '#0ea5e9' : awayColor === 'emerald' ? '#10b981' : '#a855f7' }} />
                    <span className="text-xs font-semibold text-slate-300 truncate">{getClubShort(fixture.awayClubId)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Text Commentators Ticker */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 flex flex-col gap-3 min-h-[140px] max-h-[180px] overflow-hidden relative">
          <h3 className="text-[10px] uppercase font-black text-slate-500 pb-1 border-b border-slate-950 tracking-wider">Live Commentary Teletype</h3>
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 select-none">
            {tickerCommentary.map((log, idx) => (
              <p
                key={idx}
                className={`text-[10px] leading-relaxed transition-all ${
                  idx === 0 ? 'text-indigo-300 font-bold' : 'text-slate-400'
                }`}
              >
                {log}
              </p>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Footer controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-center">
        <button
          onClick={onFinishSimulation}
          disabled={isSimulating}
          className={`w-full max-w-xs py-3 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg ${
            isSimulating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 hover:shadow-emerald-600/25'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Conclude Matchday
        </button>
      </div>
    </div>
  );
}
