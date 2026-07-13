import React, { useState, useEffect } from 'react';
import { GameState, GameDatabase, Club, League, Staff, InboxMessage } from './types/game';
import { getDefaultDatabase, DEFAULT_DATABASE_ID } from './data/defaultDatabase';
import { getEnglandPyramidDatabase, ENGLAND_PYRAMID_DATABASE_ID } from './data/englandPyramidDatabase';
import { simulateWeek, purchaseClub, sellClub, calculateValuation } from './utils/simEngine';

// Sub-components
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

// Icons
import { 
  Building2, 
  Landmark, 
  Trophy, 
  Users, 
  Compass, 
  Mail, 
  Settings, 
  Newspaper, 
  FileJson, 
  Coins, 
  LogOut, 
  Maximize2, 
  Minimize2,
  Briefcase,
  Play
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'fce-tycoon-career-state_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'office' | 'club' | 'market' | 'leagues' | 'modding'>('office');
  const [clubSubTab, setClubSubTab] = useState<'overview' | 'finances' | 'staff'>('overview');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);

  // Character creation constants (strictly static and non-customizable as requested)
  const charName = 'James Sterling';
  const charWealth = 25.0; // £25.0M start capital

  // Load game state
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }

    // Default Initialization
    const defaultDb = getDefaultDatabase();
    const englandDb = getEnglandPyramidDatabase();
    const initialState: GameState = {
      player: {
        name: charName,
        personalWealth: charWealth,
        reputation: 40,
        clubsOwnedIds: [],
        clubsPreviouslyOwned: [],
        trophyCabinet: [],
        startYear: 2026,
        currentYear: 2026,
        currentWeek: 1
      },
      currentDatabaseId: DEFAULT_DATABASE_ID,
      databases: {
        [DEFAULT_DATABASE_ID]: defaultDb,
        [ENGLAND_PYRAMID_DATABASE_ID]: englandDb
      },
      activeClubId: null,
      marketListings: [],
      takeoverOffers: [],
      inbox: [
        {
          id: 'init-msg-1',
          week: 1,
          year: 2026,
          sender: 'Football Finance Weekly',
          senderRole: 'Chief Editor',
          subject: 'YOUR CAREER: Aspiring Chairman, Welcome!',
          content: `Dear Investor,\n\nWelcome to your brand new football ownership career!\n\nYou start with £${charWealth}M in personal capital. Your primary objective is to build personal wealth through the strategic acquisition, growth, and subsequent sale of football clubs.\n\nCurrently, you do not own an active club. Head over to the "Acquire Clubs" tab to evaluate small, undervalued, or distressed non-league clubs within your starting budget. Once acquired, hire executives, expand facilities, adjust ticketing pricing, and maximize commercial revenues to elevate the club's valuation and start receiving massive tycoon takeover bids.\n\nGood luck, Chairman!\n\nBest regards,\nFootball Finance Press`,
          read: false
        }
      ],
      events: [
        {
          id: 'init-evt-1',
          week: 1,
          year: 2026,
          title: `Aspiring Investor ${charName} Enters the Football Arena`,
          description: `With £${charWealth}M in liquid funds, the financial market is anticipating rapid acquisitions across lower football leagues.`,
          type: 'empire'
        }
      ],
      simulationSpeed: 'normal',
      simulatingWeek: false,
      isGameOver: false,
      careerStats: {
        seasonsCompleted: 0,
        totalProfitMade: 0,
        highestValuationReached: 0,
        totalTrophies: 0
      }
    };

    setGameState(initialState);
  }, []);

  // Save game state
  const saveState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-500 animate-pulse">Initializing Boardroom Console...</span>
        </div>
      </div>
    );
  }

  // Handle name or starting wealth changes for New Career resets
  const handleNewCareer = () => {
    const defaultDb = getDefaultDatabase();
    const englandDb = getEnglandPyramidDatabase();
    const freshState: GameState = {
      player: {
        name: charName,
        personalWealth: charWealth,
        reputation: 40,
        clubsOwnedIds: [],
        clubsPreviouslyOwned: [],
        trophyCabinet: [],
        startYear: 2026,
        currentYear: 2026,
        currentWeek: 1
      },
      currentDatabaseId: DEFAULT_DATABASE_ID,
      databases: {
        [DEFAULT_DATABASE_ID]: defaultDb,
        [ENGLAND_PYRAMID_DATABASE_ID]: englandDb
      },
      activeClubId: null,
      marketListings: [],
      takeoverOffers: [],
      inbox: [
        {
          id: 'init-msg-2',
          week: 1,
          year: 2026,
          sender: 'Football Finance Weekly',
          senderRole: 'Chief Editor',
          subject: 'CAREER STARTED: Build your Empire',
          content: `Chairman,\n\nYour new tycoon saga has launched! Head over to the Buy Clubs catalog, select an undervalued division partner, and back them with your starting budget of £${charWealth}M.\n\nLet the game begin!`,
          read: false
        }
      ],
      events: [
        {
          id: 'init-evt-2',
          week: 1,
          year: 2026,
          title: `Tycoon Career Initiated by ${charName}`,
          description: `Starting capital of £${charWealth}M logged successfully. Ready for acquisition.`,
          type: 'empire'
        }
      ],
      simulationSpeed: 'normal',
      simulatingWeek: false,
      isGameOver: false,
      careerStats: {
        seasonsCompleted: 0,
        totalProfitMade: 0,
        highestValuationReached: 0,
        totalTrophies: 0
      }
    };

    saveState(freshState);
    setActiveTab('office');
    alert('🎮 New Career began successfully!');
  };

  // Setup databases & clubs variables
  const db = gameState.databases[gameState.currentDatabaseId] || gameState.databases[DEFAULT_DATABASE_ID];
  const clubs = db.clubs;
  const leagues = db.leagues;
  const availableStaff = db.availableStaff;
  const activeClub = clubs.find((c) => c.id === gameState.activeClubId) || null;

  // Header handlers
  const handleAdvanceWeek = () => {
    // Show match simulation overlay
    setShowMatchOverlay(true);
  };

  const handleFinishSimulation = () => {
    setShowMatchOverlay(false);
    const nextState = simulateWeek(gameState);
    saveState(nextState);
  };

  // Club Profile handlers
  const handleUpgradeFacilities = (type: 'training' | 'youth' | 'stadium') => {
    if (!activeClub) return;

    let cost = 0;
    if (type === 'training') cost = activeClub.trainingFacilitiesLevel * 4.5;
    else if (type === 'youth') cost = activeClub.youthFacilitiesLevel * 4.5;
    else cost = activeClub.stadiumLevel * 6.0;

    if (activeClub.cash < cost) {
      alert('❌ Club cash reserves are insufficient.');
      return;
    }

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          cash: c.cash - cost,
          trainingFacilitiesLevel: type === 'training' ? Math.min(5, c.trainingFacilitiesLevel + 1) : c.trainingFacilitiesLevel,
          youthFacilitiesLevel: type === 'youth' ? Math.min(5, c.youthFacilitiesLevel + 1) : c.youthFacilitiesLevel,
          stadiumLevel: type === 'stadium' ? Math.min(5, c.stadiumLevel + 1) : c.stadiumLevel,
          stadiumCapacity: type === 'stadium' ? Math.floor(c.stadiumCapacity * 1.2) : c.stadiumCapacity,
        };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
    alert(`🏗️ Upgrade started! Facilities improved successfully.`);
  };

  const handleUpdateTicketPrices = (ticket: number, season: number) => {
    if (!activeClub) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return { ...c, ticketPrice: ticket, seasonTicketPrice: season };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
  };

  const handlePayoutDividend = (amount: number) => {
    if (!activeClub) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          cash: c.cash - amount,
          reputation: Math.max(10, c.reputation - Math.floor(amount * 2)),
          fanbaseSize: Math.max(1000, Math.floor(c.fanbaseSize * (1 - (amount * 0.02))))
        };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    
    // Wire dividend directly to player personal wallet!
    const updatedPlayer = {
      ...gameState.player,
      personalWealth: Math.round((gameState.player.personalWealth + amount) * 10) / 10
    };

    saveState({
      ...gameState,
      player: updatedPlayer,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });

    alert(`💰 Dividend wired! £${amount}M transferred safely to your chairman balance. Supporters are complaining about corporate greed.`);
  };

  // Financial page handlers
  const handleTakeLoan = (amount: number) => {
    if (!activeClub) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          cash: c.cash + amount,
          debt: c.debt + amount
        };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
  };

  const handlePayLoan = (amount: number) => {
    if (!activeClub) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          cash: c.cash - amount,
          debt: Math.max(0, c.debt - amount)
        };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
  };

  // Staff Management handlers
  const handleHireStaff = (staffId: string) => {
    if (!activeClub) return;

    const staffMember = availableStaff.find((s) => s.id === staffId);
    if (!staffMember) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          managerId: staffMember.role === 'manager' ? staffId : c.managerId,
          ceoId: staffMember.role === 'ceo' ? staffId : c.ceoId,
          sportingDirectorId: staffMember.role === 'sporting_director' ? staffId : c.sportingDirectorId,
        };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
  };

  const handleFireStaff = (role: 'manager' | 'ceo' | 'sporting_director') => {
    if (!activeClub) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          managerId: role === 'manager' ? null : c.managerId,
          ceoId: role === 'ceo' ? null : c.ceoId,
          sportingDirectorId: role === 'sporting_director' ? null : c.sportingDirectorId,
        };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
  };

  // Acquisition handlers
  const handleAcquireClub = (clubId: string, price: number) => {
    // Standard purchase routine
    const nextState = purchaseClub(gameState, clubId, price);
    saveState(nextState);
    setActiveTab('club');
    setClubSubTab('overview');
  };

  // Takeovers / Mails handlers
  const handleAcceptTakeover = (offerId: string, amount: number) => {
    if (!gameState.activeClubId) return;
    const nextState = sellClub(gameState, gameState.activeClubId, amount);
    saveState(nextState);
    setActiveTab('market');
  };

  const handleRejectTakeover = (offerId: string) => {
    const remainingOffers = gameState.takeoverOffers.filter((o) => o.id !== offerId);
    saveState({
      ...gameState,
      takeoverOffers: remainingOffers,
      inbox: gameState.inbox.map((m) => {
        if (m.actionType === 'takeover_offer' && m.actionData?.offerId === offerId) {
          return { ...m, content: `${m.content}\n\n[STATUS: REJECTED BY CHAIRMAN]`, actionType: 'simple' };
        }
        return m;
      })
    });
  };

  const handleMarkRead = (id: string) => {
    const updatedInbox = gameState.inbox.map((m) => {
      if (m.id === id) return { ...m, read: true };
      return m;
    });
    saveState({
      ...gameState,
      inbox: updatedInbox
    });
  };

  // Modding Hub handlers
  const handleSelectDatabase = (id: string) => {
    saveState({
      ...gameState,
      currentDatabaseId: id
    });
    alert(`📂 Custom Data Pack enabled! Start a new career to apply settings.`);
  };

  const handleImportDatabase = (newDb: GameDatabase) => {
    saveState({
      ...gameState,
      databases: {
        ...gameState.databases,
        [newDb.id]: newDb
      }
    });
  };

  const handleDeleteDatabase = (id: string) => {
    const updatedDbs = { ...gameState.databases };
    delete updatedDbs[id];
    saveState({
      ...gameState,
      currentDatabaseId: DEFAULT_DATABASE_ID,
      databases: updatedDbs
    });
  };

  const handleResetSave = () => {
    if (window.confirm('⚠️ Are you sure you want to completely erase all local career states and reset database profiles?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  // Render match overlay
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

  // Get unread inbox count
  const unreadMails = gameState.inbox.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 antialiased flex flex-col justify-between selection:bg-indigo-500/35 pb-20 md:pb-6">
      {/* Upper desktop responsive framer wrapper */}
      <div className={`w-full ${isMobileFrame ? 'max-w-md mx-auto border-x border-slate-900 bg-slate-950 min-h-screen shadow-2xl relative flex flex-col justify-between overflow-hidden pb-16' : 'max-w-6xl mx-auto px-4 sm:px-6'}`}>
        
        {/* Top Navbar */}
        <Header
          player={gameState.player}
          activeClub={activeClub}
          onAdvanceWeek={handleAdvanceWeek}
          simulatingWeek={gameState.simulatingWeek}
        />

        {/* Outer Grid Wrapper */}
        <div className={`py-6 flex flex-col md:flex-row gap-6 ${isMobileFrame ? 'pb-16' : ''}`}>
          {/* Main Dashboard Sidebar Navigation (Desktop Only) */}
          <nav className={`hidden ${isMobileFrame ? '' : 'md:flex'} flex-col gap-1.5 w-48 shrink-0 select-none`}>
            <button
              onClick={() => setActiveTab('office')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'office' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              Office Desk
            </button>

            <button
              onClick={() => setActiveTab('club')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'club' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              My Club
            </button>

            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'market' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Coins className="w-4 h-4 shrink-0" />
              Buy Clubs
            </button>

            <button
              onClick={() => setActiveTab('leagues')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'leagues' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              Leagues
            </button>

            <button
              onClick={() => setActiveTab('modding')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'modding' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileJson className="w-4 h-4 shrink-0" />
              Mods
            </button>
          </nav>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Inbox Quick Entry Alert when there are unread mails */}
            {unreadMails > 0 && activeTab !== 'office' && (
              <div 
                onClick={() => setActiveTab('office')}
                className="bg-indigo-950/40 border border-indigo-500/20 px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-900/30 transition-all select-none"
              >
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-indigo-400 animate-bounce" />
                  <span className="text-white">You have <strong className="font-extrabold text-indigo-300">{unreadMails} unread</strong> emails waiting in your executive inbox.</span>
                </div>
                <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase">Read</span>
              </div>
            )}

            {/* Render selected tabs */}
            {activeTab === 'office' && (
              <div className="flex flex-col gap-6">
                <Office
                  player={gameState.player}
                  events={gameState.events}
                  careerStats={gameState.careerStats}
                />
                <InboxPanel
                  messages={gameState.inbox}
                  onMarkRead={handleMarkRead}
                  onAcceptTakeover={handleAcceptTakeover}
                  onRejectTakeover={handleRejectTakeover}
                />
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
                <button
                  onClick={() => setActiveTab('market')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  Browse Takeover Market
                </button>
              </div>
            )}

            {activeTab === 'club' && activeClub && (
              <div className="flex flex-col gap-5">
                {/* Secondary navigation tab bar inside My Club */}
                <div className="flex bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl select-none">
                  <button
                    onClick={() => setClubSubTab('overview')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      clubSubTab === 'overview'
                        ? 'bg-indigo-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setClubSubTab('finances')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      clubSubTab === 'finances'
                        ? 'bg-indigo-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Finances
                  </button>
                  <button
                    onClick={() => setClubSubTab('staff')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      clubSubTab === 'staff'
                        ? 'bg-indigo-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Executives
                  </button>
                </div>

                <div className="transition-all duration-200">
                  {clubSubTab === 'overview' && (
                    <ClubProfile
                      club={activeClub}
                      onUpgradeFacilities={handleUpgradeFacilities}
                      onUpdateTicketPrices={handleUpdateTicketPrices}
                      onPayoutDividend={handlePayoutDividend}
                      playerWealth={gameState.player.personalWealth}
                    />
                  )}

                  {clubSubTab === 'finances' && (
                    <FinancialStatements
                      club={activeClub}
                      league={leagues.find((l) => l.id === activeClub.leagueId)!}
                      onTakeLoan={handleTakeLoan}
                      onPayLoan={handlePayLoan}
                    />
                  )}

                  {clubSubTab === 'staff' && (
                    <StaffManagement
                      club={activeClub}
                      availableStaff={availableStaff}
                      onHireStaff={handleHireStaff}
                      onFireStaff={handleFireStaff}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <MarketAndTakeovers
                clubs={clubs}
                leagues={leagues}
                player={gameState.player}
                activeClubId={gameState.activeClubId}
                onAcquireClub={handleAcquireClub}
              />
            )}

            {activeTab === 'leagues' && (
              <LeagueStandings
                leagues={leagues}
                clubs={clubs}
                currentWeek={gameState.player.currentWeek}
              />
            )}

            {activeTab === 'modding' && (
              <ModdingHub
                databases={gameState.databases}
                currentDatabaseId={gameState.currentDatabaseId}
                onSelectDatabase={handleSelectDatabase}
                onImportDatabase={handleImportDatabase}
                onDeleteDatabase={handleDeleteDatabase}
                onStartCareer={handleNewCareer}
                activeClubId={gameState.activeClubId}
              />
            )}
          </main>
        </div>

        {/* Global Game Settings & static career resets */}
        <section className="mt-8 border-t border-slate-900 pt-6 pb-12 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Career Configurations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Static starting configuration card */}
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

              <button
                onClick={handleNewCareer}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 uppercase tracking-wider cursor-pointer"
              >
                Reset Career &amp; Start Fresh
              </button>
            </div>

            {/* Desktop frame controls */}
            <div className="bg-slate-900/50 border border-slate-900/80 p-5 rounded-2xl flex flex-col gap-3 justify-between">
              <div>
                <h4 className="font-bold text-white text-xs font-display">Simulation Framework Controls</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Adjust device framing models or erase saved careers entirely from browser caches.</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setIsMobileFrame(!isMobileFrame)}
                  className="w-full py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isMobileFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  {isMobileFrame ? 'Expand Fullscreen' : 'Enable Mobile Smartphone Frame'}
                </button>

                <button
                  onClick={handleResetSave}
                  className="w-full py-2 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Erase local storage profile
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Tab Bar (Visible on mobile/simulated frame screens only) */}
      <nav className={`md:hidden ${isMobileFrame ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 py-2 px-1 flex justify-around shadow-xl`}>
        <button
          onClick={() => setActiveTab('office')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === 'office' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'
          }`}
        >
          <Compass className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Office</span>
        </button>

        <button
          onClick={() => setActiveTab('club')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === 'club' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'
          }`}
        >
          <Building2 className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">My Club</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === 'market' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'
          }`}
        >
          <Coins className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Buy Clubs</span>
        </button>

        <button
          onClick={() => setActiveTab('leagues')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === 'leagues' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'
          }`}
        >
          <Trophy className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Leagues</span>
        </button>

        <button
          onClick={() => setActiveTab('modding')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === 'modding' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300 font-medium'
          }`}
        >
          <FileJson className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-tight">Mods</span>
        </button>
      </nav>
    </div>
  );
}
