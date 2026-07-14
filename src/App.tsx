import React from 'react';
import { useGameState } from './hooks/useGameState';

import Header from './components/Header';
import Office from './components/Office';
import ClubProfile from './components/ClubProfile';
import FinancialStatements from './components/FinancialStatements';
import StaffManagement from './components/StaffManagement';
import MarketAndTakeovers from './components/MarketAndTakeovers';
import LeagueStandings from './components/LeagueStandings';
import InboxPanel from './components/InboxPanel';
import ModdingHub from './components/ModdingHub';
import MatchTicker from './components/MatchTicker';
import ErrorBoundary from './components/ErrorBoundary';

import {
  Building2, Landmark, Trophy, Users, Compass, Mail, Settings,
  Newspaper, FileJson, Coins, LogOut, Maximize2, Minimize2,
  Briefcase, Play
} from 'lucide-react';

export default function App() {
  const ctx = useGameState();

  if (!ctx.gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-500 animate-pulse">Initializing Boardroom Console...</span>
        </div>
      </div>
    );
  }

  const {
    gameState, activeTab, setActiveTab, clubSubTab, setClubSubTab,
    isMobileFrame, setIsMobileFrame, showMatchOverlay,
    clubs, leagues, availableStaff, activeClub, unreadMails,
    handleAdvanceWeek, handleFinishSimulation, handleNewCareer,
    handleUpgradeFacilities, handleUpdateTicketPrices, handlePayoutDividend,
    handleTakeLoan, handlePayLoan, handleHireStaff, handleFireStaff,
    handleAcquireClub, handleAcceptTakeover, handleRejectTakeover,
    handleMarkRead, handleSelectDatabase, handleImportDatabase,
    handleDeleteDatabase, handleResetSave,
  } = ctx;

  if (showMatchOverlay) {
    return (
      <MatchTicker
        leagues={leagues}
        clubs={clubs}
        currentWeek={gameState.player.currentWeek}
        currentYear={gameState.player.currentYear}
        onFinishSimulation={handleFinishSimulation}
        activeClubId={gameState.activeClubId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 antialiased flex flex-col justify-between selection:bg-indigo-500/35 pb-20 md:pb-6">
      <div className={`w-full ${isMobileFrame ? 'max-w-md mx-auto border-x border-slate-900 bg-slate-950 min-h-screen shadow-2xl relative flex flex-col justify-between overflow-hidden pb-16' : 'max-w-6xl mx-auto px-4 sm:px-6'}`}>

        <Header
          player={gameState.player}
          activeClub={activeClub}
          onAdvanceWeek={handleAdvanceWeek}
          simulatingWeek={gameState.simulatingWeek}
        />

        <div className={`py-6 flex flex-col md:flex-row gap-6 ${isMobileFrame ? 'pb-16' : ''}`}>
          <nav className={`hidden ${isMobileFrame ? '' : 'md:flex'} flex-col gap-1.5 w-48 shrink-0 select-none`}>
            <button onClick={() => setActiveTab('office')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'office' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}`}>
              <Compass className="w-4 h-4 shrink-0" />
              Office Desk
            </button>
            <button onClick={() => setActiveTab('club')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'club' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}`}>
              <Building2 className="w-4 h-4 shrink-0" />
              My Club
            </button>
            <button onClick={() => setActiveTab('market')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'market' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}`}>
              <Coins className="w-4 h-4 shrink-0" />
              Buy Clubs
            </button>
            <button onClick={() => setActiveTab('leagues')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'leagues' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}`}>
              <Trophy className="w-4 h-4 shrink-0" />
              Leagues
            </button>
            <button onClick={() => setActiveTab('modding')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'modding' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}`}>
              <FileJson className="w-4 h-4 shrink-0" />
              Mods
            </button>
          </nav>

          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <ErrorBoundary>
            {unreadMails > 0 && activeTab !== 'office' && (
              <div onClick={() => setActiveTab('office')}
                className="bg-indigo-950/40 border border-indigo-500/20 px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-900/30 transition-all select-none">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-indigo-400 animate-bounce" />
                  <span className="text-white">You have <strong className="font-extrabold text-indigo-300">{unreadMails} unread</strong> emails waiting in your executive inbox.</span>
                </div>
                <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase">Read</span>
              </div>
            )}

            {activeTab === 'office' && (
              <div className="flex flex-col gap-6">
                <Office player={gameState.player} events={gameState.events} careerStats={gameState.careerStats} />
                <InboxPanel messages={gameState.inbox} onMarkRead={handleMarkRead} onAcceptTakeover={handleAcceptTakeover} onRejectTakeover={handleRejectTakeover} />
              </div>
            )}

            {activeTab === 'club' && !activeClub && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center gap-4 my-2">
                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                  <Building2 className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-display">No Active Football Franchise</h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    To access stadium upgrades, financial statements, and hired executives, you must purchase an active football club first.
                  </p>
                </div>
                <button onClick={() => setActiveTab('market')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer">
                  <Coins className="w-4 h-4" />
                  Browse Takeover Market
                </button>
              </div>
            )}

            {activeTab === 'club' && activeClub && (
              <div className="flex flex-col gap-5">
                <div className="flex bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl select-none">
                  <button onClick={() => setClubSubTab('overview')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${clubSubTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-200'}`}>
                    Overview
                  </button>
                  <button onClick={() => setClubSubTab('finances')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${clubSubTab === 'finances' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-200'}`}>
                    Finances
                  </button>
                  <button onClick={() => setClubSubTab('staff')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${clubSubTab === 'staff' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-slate-200'}`}>
                    Executives
                  </button>
                </div>

                <div className="transition-all duration-200">
                  {clubSubTab === 'overview' && (
                    <ClubProfile club={activeClub} onUpgradeFacilities={handleUpgradeFacilities} onUpdateTicketPrices={handleUpdateTicketPrices} onPayoutDividend={handlePayoutDividend} playerWealth={gameState.player.personalWealth} />
                  )}
                  {clubSubTab === 'finances' && (
                    <FinancialStatements club={activeClub} league={leagues.find((l) => l.id === activeClub.leagueId)!} availableStaff={availableStaff} onTakeLoan={handleTakeLoan} onPayLoan={handlePayLoan} />
                  )}
                  {clubSubTab === 'staff' && (
                    <StaffManagement club={activeClub} availableStaff={availableStaff} leagueTier={leagues.find((l) => l.id === activeClub.leagueId)?.tier ?? 7} onHireStaff={handleHireStaff} onFireStaff={handleFireStaff} />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <MarketAndTakeovers clubs={clubs} leagues={leagues} player={gameState.player} activeClubId={gameState.activeClubId} onAcquireClub={handleAcquireClub} />
            )}

            {activeTab === 'leagues' && (
              <LeagueStandings leagues={leagues} clubs={clubs} currentWeek={gameState.player.currentWeek} />
            )}

            {activeTab === 'modding' && (
              <ModdingHub databases={gameState.databases} currentDatabaseId={gameState.currentDatabaseId} onSelectDatabase={handleSelectDatabase} onImportDatabase={handleImportDatabase} onDeleteDatabase={handleDeleteDatabase} onStartCareer={handleNewCareer} activeClubId={gameState.activeClubId} />
            )}
            </ErrorBoundary>
          </main>
        </div>

        <section className="mt-8 border-t border-slate-900 pt-6 pb-12 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Career Configurations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900/50 border border-slate-900/80 p-5 rounded-2xl flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-white text-xs font-display">Tycoon Franchise Career Mode</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Start or reset your career under the static tycoon franchise guidelines. You begin as an ambitious chairman managing strategic acquisitions.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-900/60 p-3 rounded-xl flex flex-col gap-2 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Chairman Persona</span>
                  <span className="text-white font-bold font-mono">James Sterling</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Starting Capital</span>
                  <span className="text-emerald-400 font-extrabold font-mono">£25.0M</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Reputation Tier</span>
                  <span className="text-indigo-400 font-bold font-mono">Tier 1 (Local Investor)</span>
                </div>
              </div>
              <button onClick={handleNewCareer}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 uppercase tracking-wider cursor-pointer">
                Reset Career &amp; Start Fresh
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-900/80 p-5 rounded-2xl flex flex-col gap-3 justify-between">
              <div>
                <h4 className="font-bold text-white text-xs font-display">Simulation Framework Controls</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Adjust device framing models or erase saved careers entirely from browser caches.</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button onClick={() => setIsMobileFrame(!isMobileFrame)}
                  className="w-full py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                  {isMobileFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  {isMobileFrame ? 'Expand Fullscreen' : 'Enable Mobile Smartphone Frame'}
                </button>
                <button onClick={handleResetSave}
                  className="w-full py-2 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  Erase local storage profile
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className={`md:hidden ${isMobileFrame ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 py-2 px-1 flex justify-around shadow-xl`}>
        <button onClick={() => setActiveTab('office')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${activeTab === 'office' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'}`}>
          <Compass className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Office</span>
        </button>
        <button onClick={() => setActiveTab('club')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${activeTab === 'club' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'}`}>
          <Building2 className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">My Club</span>
        </button>
        <button onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${activeTab === 'market' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'}`}>
          <Coins className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Buy Clubs</span>
        </button>
        <button onClick={() => setActiveTab('leagues')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${activeTab === 'leagues' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'}`}>
          <Trophy className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Leagues</span>
        </button>
        <button onClick={() => setActiveTab('modding')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${activeTab === 'modding' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'}`}>
          <FileJson className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Mods</span>
        </button>
      </nav>
    </div>
  );
}
