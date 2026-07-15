import { useState, useEffect, useRef } from 'react';
import { GameState, GameDatabase } from '../types/game';
import { useToast } from '../components/Toast';
import { getDefaultDatabase, DEFAULT_DATABASE_ID } from '../data/defaultDatabase';
import { getEnglandPyramidDatabase, ENGLAND_PYRAMID_DATABASE_ID } from '../data/englandPyramidDatabase';
import { getEnglandFullPyramidDatabase, ENGLAND_FULL_PYRAMID_DATABASE_ID } from '../data/englandFullPyramidDatabase';
import { simulateWeek, purchaseClub, sellClub } from '../utils/simEngine';

const LOCAL_STORAGE_KEY = 'fce-tycoon-career-state_v1';

const charName = 'James Sterling';
const charWealth = 25.0;

function createInitialState(): GameState {
  const defaultDb = getDefaultDatabase();
  const englandDb = getEnglandPyramidDatabase();
  const fullPyramidDb = getEnglandFullPyramidDatabase();
  return {
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
      [ENGLAND_PYRAMID_DATABASE_ID]: englandDb,
      [ENGLAND_FULL_PYRAMID_DATABASE_ID]: fullPyramidDb
    },
    activeClubId: null,
    marketListings: [],
    playerTransferListings: [],
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
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'office' | 'club' | 'market' | 'leagues' | 'modding'>('office');
  const [clubSubTab, setClubSubTab] = useState<'overview' | 'finances' | 'staff'>('overview');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const { show: notify } = useToast();
  const pendingStateRef = useRef<GameState | null>(null);
  const saveTimerRef = useRef<number | null>(null);

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
    setGameState(createInitialState());
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        cancelAnimationFrame(saveTimerRef.current);
      }
      const pending = pendingStateRef.current;
      if (pending) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
        } catch (e) {
          console.error('Failed to save game state to localStorage:', e);
        }
      }
    };
  }, []);

  const saveState = (newState: GameState) => {
    setGameState(newState);
    pendingStateRef.current = newState;
    if (saveTimerRef.current === null) {
      saveTimerRef.current = requestAnimationFrame(() => {
        saveTimerRef.current = null;
        const state = pendingStateRef.current;
        if (state) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
          } catch (e) {
            console.error('Failed to save game state to localStorage:', e);
          }
        }
      });
    }
  };

  if (!gameState) {
    return { gameState: null };
  }

  const db = gameState.databases[gameState.currentDatabaseId] || gameState.databases[DEFAULT_DATABASE_ID];
  const clubs = db.clubs;
  const leagues = db.leagues;
  const availableStaff = db.availableStaff;
  const activeClub = clubs.find((c) => c.id === gameState.activeClubId) || null;
  const unreadMails = gameState.inbox.filter((m) => !m.read).length;

  const handleAdvanceWeek = () => {
    setShowMatchOverlay(true);
  };

  const handleFinishSimulation = () => {
    setShowMatchOverlay(false);
    const nextState = simulateWeek(gameState);
    saveState(nextState);
  };

  const handleNewCareer = () => {
    const freshState = createInitialState();
    saveState(freshState);
    setActiveTab('office');
    notify('New Career began successfully!', 'success');
  };

  const handleUpgradeFacilities = (type: 'training' | 'youth' | 'stadium') => {
    if (!activeClub) return;

    let cost = 0;
    if (type === 'training') cost = activeClub.trainingFacilitiesLevel * 4.5;
    else if (type === 'youth') cost = activeClub.youthFacilitiesLevel * 4.5;
    else cost = activeClub.stadiumLevel * 6.0;

    if (activeClub.cash < cost) {
      notify('Club cash reserves are insufficient.', 'error');
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
    notify('Facilities upgrade started!', 'success');
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
    const updatedPlayer = {
      ...gameState.player,
      personalWealth: Math.round((gameState.player.personalWealth + amount) * 10) / 10
    };

    saveState({
      ...gameState,
      player: updatedPlayer,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });

    notify(`Dividend wired! £${amount}M transferred to your balance. Supporters are complaining about corporate greed.`, 'success');
  };

  const handleTakeLoan = (amount: number) => {
    if (!activeClub) return;

    const updatedClubs = clubs.map((c) => {
      if (c.id === activeClub.id) {
        return { ...c, cash: c.cash + amount, debt: c.debt + amount };
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
        return { ...c, cash: c.cash - amount, debt: Math.max(0, c.debt - amount) };
      }
      return c;
    });

    const updatedDb = { ...db, clubs: updatedClubs };
    saveState({
      ...gameState,
      databases: { ...gameState.databases, [gameState.currentDatabaseId]: updatedDb }
    });
  };

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

  const handleAcquireClub = (clubId: string, price: number) => {
    const nextState = purchaseClub(gameState, clubId, price);
    saveState(nextState);
    setActiveTab('club');
    setClubSubTab('overview');
  };

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

  const handleSelectDatabase = (id: string) => {
    saveState({
      ...gameState,
      currentDatabaseId: id
    });
    notify(`Custom Data Pack enabled! Start a new career to apply settings.`, 'info');
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

  return {
    gameState,
    activeTab, setActiveTab,
    clubSubTab, setClubSubTab,
    isMobileFrame, setIsMobileFrame,
    showMatchOverlay,
    db, clubs, leagues, availableStaff, activeClub,
    unreadMails, charName, charWealth,
    handleAdvanceWeek, handleFinishSimulation,
    handleNewCareer,
    handleUpgradeFacilities, handleUpdateTicketPrices, handlePayoutDividend,
    handleTakeLoan, handlePayLoan,
    handleHireStaff, handleFireStaff,
    handleAcquireClub, handleAcceptTakeover, handleRejectTakeover,
    handleMarkRead,
    handleSelectDatabase, handleImportDatabase, handleDeleteDatabase,
    handleResetSave,
  };
}
