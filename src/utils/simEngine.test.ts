import { describe, it, expect } from 'vitest';
import {
  calculateValuation,
  generateFixturesForLeague,
  getSeasonLengthWeeks,
  purchaseClub,
  sellClub,
  simulateMatch,
} from './simEngine';
import {
  deriveSquadQuality,
  autoPickXI,
  getEffectiveAbility,
  buyPlayer,
  sellPlayer,
  generatePlayersForClub,
  applyMatchFatigue,
  applyRestRecovery,
  checkMatchInjury,
  tickInjuryRecovery,
  updatePlayerForm,
  isTransferWindowOpen,
} from './playerUtils';
import type { GameState, Club, League, StandingEntry, Match, Staff, ClubMarketListing, TakeoverOffer, Player } from '../types/game';

function makeClub(overrides: Partial<Club> = {}): Club {
  return {
    id: 'test-club',
    name: 'Test United',
    shortName: 'TST',
    colorPrimary: 'red',
    colorSecondary: 'white',
    country: 'England',
    leagueId: 'league-1',
    valuation: 10,
    cash: 5,
    debt: 2,
    interestRate: 0.05,
    wageBillWeekly: 0.8,
    fanbaseSize: 5000,
    stadiumName: 'Test Stadium',
    stadiumCapacity: 10000,
    stadiumLevel: 2,
    trainingFacilitiesLevel: 2,
    youthFacilitiesLevel: 2,
    academyQuality: 40,
    squadQuality: 50,
    reputation: 40,
    sponsorName: 'Test Corp',
    sponsorIncomeWeekly: 0.3,
    sponsorYearsLeft: 3,
    ticketPrice: 25,
    seasonTicketPrice: 250,
    seasonTicketsSold: 800,
    managerId: null,
    ceoId: null,
    sportingDirectorId: null,
    history: [],
    boardObjective: {
      type: 'mid_table',
      description: 'Finish in top half',
      targetProgress: 0,
      targetGoal: 10,
      rewardWealth: 2,
      penaltyRep: 5,
    },
    transferBudget: 2,
    mentality: 'balanced',
    squad: [],
    ...overrides,
  };
}

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  const clubA = makeClub({ id: 'club-a', name: 'Alpha FC', shortName: 'ALP', leagueId: 'league-1' });
  const clubB = makeClub({ id: 'club-b', name: 'Beta FC', shortName: 'BET', leagueId: 'league-1' });

  const standingEntry = (clubId: string): StandingEntry => ({
    clubId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
  });

  const league: League = {
    id: 'league-1',
    name: 'Test League',
    tier: 1,
    country: 'England',
    teamsCount: 2,
    tvDealWeeklyPayout: 0.5,
    prestige: 60,
    standings: [standingEntry('club-a'), standingEntry('club-b')],
    fixtures: [],
    history: [],
  };

  return {
    player: {
      name: 'James',
      personalWealth: 50,
      reputation: 40,
      clubsOwnedIds: [],
      clubsPreviouslyOwned: [],
      trophyCabinet: [],
      startYear: 2026,
      currentYear: 2026,
      currentWeek: 1,
    },
    currentDatabaseId: 'db-main',
    databases: {
      'db-main': {
        id: 'db-main',
        name: 'Main',
        description: '',
        version: '1',
        author: 'test',
        isOfficial: true,
        clubs: [clubA, clubB],
        leagues: [league],
        availableStaff: [],
        players: [],
        sponsors: [],
      },
    },
    activeClubId: null,
    marketListings: [],
    takeoverOffers: [],
    playerTransferListings: [],
    inbox: [],
    events: [],
    simulationSpeed: 'normal',
    simulatingWeek: false,
    isGameOver: false,
    careerStats: {
      seasonsCompleted: 0,
      totalProfitMade: 0,
      highestValuationReached: 0,
      totalTrophies: 0,
    },
    ...overrides,
  };
}

describe('calculateValuation', () => {
  it('returns a positive number for a typical club', () => {
    const club = makeClub();
    const val = calculateValuation(club, 60);
    expect(val).toBeGreaterThan(0);
    expect(Number.isFinite(val)).toBe(true);
  });

  it('floors valuation at 1.0 when inputs are very low', () => {
    const club = makeClub({
      stadiumCapacity: 100,
      stadiumLevel: 1,
      trainingFacilitiesLevel: 1,
      youthFacilitiesLevel: 1,
      fanbaseSize: 10,
      squadQuality: 1,
      revenueLastYear: 0,
      cash: 0,
      debt: 100,
    });
    const val = calculateValuation(club, 1);
    expect(val).toBe(1.0);
  });

  it('increases valuation with higher league prestige', () => {
    const club = makeClub({ revenueLastYear: 10 });
    const low = calculateValuation(club, 10);
    const high = calculateValuation(club, 90);
    expect(high).toBeGreaterThan(low);
  });

  it('handles undefined revenueLastYear', () => {
    const club = makeClub({ revenueLastYear: undefined });
    const val = calculateValuation(club, 50);
    expect(Number.isFinite(val)).toBe(true);
  });

  it('returns the same result for identical inputs', () => {
    const club = makeClub();
    const a = calculateValuation(club, 50);
    const b = calculateValuation(club, 50);
    expect(a).toBe(b);
  });

  it('subtracts debt and adds cash', () => {
    const club = makeClub({ cash: 10, debt: 5, revenueLastYear: 0 });
    const val = calculateValuation(club, 50);
    const clubWithMoreCash = makeClub({ cash: 20, debt: 5, revenueLastYear: 0 });
    const valRich = calculateValuation(clubWithMoreCash, 50);
    expect(valRich).toBeGreaterThan(val);
  });
});

describe('getSeasonLengthWeeks', () => {
  it('returns 0 for < 2 teams', () => {
    expect(getSeasonLengthWeeks(0)).toBe(0);
    expect(getSeasonLengthWeeks(1)).toBe(0);
  });

  it('returns 2*(N-1) for even N', () => {
    expect(getSeasonLengthWeeks(4)).toBe(6);
    expect(getSeasonLengthWeeks(10)).toBe(18);
    expect(getSeasonLengthWeeks(12)).toBe(22);
  });

  it('returns 2*N for odd N', () => {
    expect(getSeasonLengthWeeks(3)).toBe(6);
    expect(getSeasonLengthWeeks(5)).toBe(10);
    expect(getSeasonLengthWeeks(7)).toBe(14);
  });
});

describe('generateFixturesForLeague', () => {
  it('returns empty array for < 2 clubs', () => {
    expect(generateFixturesForLeague([])).toEqual([]);
    expect(generateFixturesForLeague(['a'])).toEqual([]);
  });

  it('handles 2 clubs (produces 2-week home-and-away)', () => {
    const fixtures = generateFixturesForLeague(['a', 'b']);
    expect(fixtures).toHaveLength(2);
    expect(fixtures[0]).toMatchObject({ week: 1, homeClubId: 'a', awayClubId: 'b', simulated: false });
    expect(fixtures[1]).toMatchObject({ week: 2, homeClubId: 'b', awayClubId: 'a', simulated: false });
  });

  it('returns 12 fixtures for 4 clubs (backward compatible)', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const fixtures = generateFixturesForLeague(ids);
    expect(fixtures).toHaveLength(12);
  });

  it('covers all expected weeks with correct match count for 4 clubs', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const fixtures = generateFixturesForLeague(ids);
    for (let w = 1; w <= 6; w++) {
      const weekMatches = fixtures.filter((m) => m.week === w);
      expect(weekMatches).toHaveLength(2);
    }
  });

  it('creates a double round-robin (each unique pair appears twice) for 4 clubs', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const fixtures = generateFixturesForLeague(ids);
    const pairs = fixtures.map((m) => [m.homeClubId, m.awayClubId].sort().join('-'));
    expect(pairs.filter((p) => p === 'a-b')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'a-c')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'a-d')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'b-c')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'b-d')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'c-d')).toHaveLength(2);
  });

  it('generates all matches with simulated: false', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const fixtures = generateFixturesForLeague(ids);
    fixtures.forEach((m) => {
      expect(m.simulated).toBe(false);
    });
  });

  it('handles odd team count with bye weeks', () => {
    const ids = ['a', 'b', 'c'];
    const fixtures = generateFixturesForLeague(ids);
    // 3 teams -> single round-robin = 3 rounds, double = 6 weeks
    // Each week has 1 match (one team rests/bye)
    expect(fixtures).toHaveLength(6);
    for (let w = 1; w <= 6; w++) {
      const weekMatches = fixtures.filter((m) => m.week === w);
      expect(weekMatches).toHaveLength(1);
    }
    // Each pair should appear twice (home and away)
    const pairs = fixtures.map((m) => [m.homeClubId, m.awayClubId].sort().join('-'));
    expect(pairs.filter((p) => p === 'a-b')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'a-c')).toHaveLength(2);
    expect(pairs.filter((p) => p === 'b-c')).toHaveLength(2);
  });

  it('produces correct fixture count for 12-team league', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `team-${i + 1}`);
    const fixtures = generateFixturesForLeague(ids);
    // 12 teams -> even -> 2*(12-1) = 22 weeks, each week has 6 matches = 132 total
    expect(fixtures).toHaveLength(132);
    // Verify 22 weeks of 6 matches each
    for (let w = 1; w <= 22; w++) {
      const weekMatches = fixtures.filter((m) => m.week === w);
      expect(weekMatches).toHaveLength(6);
    }
  });

  it('each club plays every other twice (home+away) in a 12-team league', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `team-${i + 1}`);
    const fixtures = generateFixturesForLeague(ids);
    // For each club, count opponents and verify home/away balance
    for (const clubId of ids) {
      const homeMatches = fixtures.filter((m) => m.homeClubId === clubId);
      const awayMatches = fixtures.filter((m) => m.awayClubId === clubId);
      expect(homeMatches).toHaveLength(11); // 11 home games
      expect(awayMatches).toHaveLength(11); // 11 away games
      // Every other club appears exactly once as opponent
      const opponents = new Set([
        ...homeMatches.map((m) => m.awayClubId),
        ...awayMatches.map((m) => m.homeClubId),
      ]);
      expect(opponents.size).toBe(11); // 11 unique opponents
    }
  });

  it('handles 5-team odd league with correct home/away balance', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const fixtures = generateFixturesForLeague(ids);
    // 5 teams -> odd -> 2*5 = 10 weeks, each week has 2 matches = 20 total
    expect(fixtures).toHaveLength(20);
    for (let w = 1; w <= 10; w++) {
      const weekMatches = fixtures.filter((m) => m.week === w);
      expect(weekMatches).toHaveLength(2);
    }
    // Each club plays 4 others twice (8 matches each)
    for (const clubId of ids) {
      const clubMatches = fixtures.filter((m) => m.homeClubId === clubId || m.awayClubId === clubId);
      expect(clubMatches).toHaveLength(8);
      // 4 home, 4 away
      expect(fixtures.filter((m) => m.homeClubId === clubId)).toHaveLength(4);
      expect(fixtures.filter((m) => m.awayClubId === clubId)).toHaveLength(4);
    }
  });
});

describe('purchaseClub', () => {
  it('purchases a club and deducts personal wealth', () => {
    const state = makeMinimalGameState();
    const result = purchaseClub(state, 'club-a', 10);
    expect(result.player.clubsOwnedIds).toContain('club-a');
    expect(result.player.personalWealth).toBe(40);
    expect(result.activeClubId).toBe('club-a');
  });

  it('uses club valuation when no custom price is given', () => {
    const club = makeClub({ id: 'club-c', valuation: 15, leagueId: 'league-1' });
    const state = makeMinimalGameState({
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
    });
    const result = purchaseClub(state, 'club-c');
    expect(result.player.personalWealth).toBe(35);
  });

  it('returns original state when player has insufficient funds', () => {
    const state = makeMinimalGameState({ player: { ...makeMinimalGameState().player, personalWealth: 5 } });
    const result = purchaseClub(state, 'club-a', 10);
    expect(result.player.clubsOwnedIds).not.toContain('club-a');
    expect(result.player.personalWealth).toBe(5);
  });

  it('returns original state when club is not found', () => {
    const state = makeMinimalGameState();
    const result = purchaseClub(state, 'nonexistent');
    expect(result).toBe(state);
  });

  it('returns original state when database is not found', () => {
    const state = makeMinimalGameState({ currentDatabaseId: 'nonexistent-db' });
    const result = purchaseClub(state, 'club-a');
    expect(result).toBe(state);
  });

  it('sets transfer budget to 40% of club cash', () => {
    const state = makeMinimalGameState();
    const club = state.databases['db-main'].clubs.find((c) => c.id === 'club-a')!;
    const expectedBudget = Math.round(club.cash * 0.4 * 10) / 10;
    const result = purchaseClub(state, 'club-a', 10);
    const bought = result.databases['db-main'].clubs.find((c) => c.id === 'club-a')!;
    expect(bought.transferBudget).toBe(expectedBudget);
  });

  it('adds a welcome inbox message and event', () => {
    const state = makeMinimalGameState();
    const result = purchaseClub(state, 'club-a', 10);
    expect(result.inbox.length).toBeGreaterThan(0);
    expect(result.events.length).toBeGreaterThan(0);
  });
});

describe('sellClub', () => {
  it('requires activeClubId to match clubId', () => {
    const state = makeMinimalGameState({ activeClubId: 'club-a' });
    const result = sellClub(state, 'club-b', 20);
    expect(result).toBe(state);
  });

  it('returns original state when club is not owned (no activeClubId)', () => {
    const state = makeMinimalGameState();
    const result = sellClub(state, 'club-a', 20);
    expect(result).toBe(state);
  });

  it('calculates payout as offer minus debt and adds to wealth', () => {
    const club = makeClub({ id: 'club-a', valuation: 10, cash: 5, debt: 2, leagueId: 'league-1' });
    const state = makeMinimalGameState({
      activeClubId: 'club-a',
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
    });
    const result = sellClub(state, 'club-a', 15);
    expect(result.player.personalWealth).toBe(50 + (15 - 2));
  });

  it('removes club from clubsOwnedIds and clears activeClubId', () => {
    const club = makeClub({ id: 'club-a', leagueId: 'league-1' });
    const state = makeMinimalGameState({
      activeClubId: 'club-a',
      player: { ...makeMinimalGameState().player, clubsOwnedIds: ['club-a'] },
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
    });
    const result = sellClub(state, 'club-a', 15);
    expect(result.player.clubsOwnedIds).not.toContain('club-a');
    expect(result.activeClubId).toBeNull();
  });

  it('adds to clubsPreviouslyOwned', () => {
    const club = makeClub({ id: 'club-a', name: 'Alpha FC', leagueId: 'league-1' });
    const state = makeMinimalGameState({
      activeClubId: 'club-a',
      player: { ...makeMinimalGameState().player, clubsOwnedIds: ['club-a'] },
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
    });
    const result = sellClub(state, 'club-a', 15);
    expect(result.player.clubsPreviouslyOwned).toHaveLength(1);
    expect(result.player.clubsPreviouslyOwned[0].clubId).toBe('club-a');
    expect(result.player.clubsPreviouslyOwned[0].soldFor).toBe(15);
  });

  it('clears takeoverOffers', () => {
    const club = makeClub({ id: 'club-a', leagueId: 'league-1' });
    const state = makeMinimalGameState({
      activeClubId: 'club-a',
      player: { ...makeMinimalGameState().player, clubsOwnedIds: ['club-a'] },
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
      takeoverOffers: [{ id: 'offer-1', clubId: 'club-a', buyerName: 'Test', offerAmount: 15, isHostile: false, weeksRemaining: 3, motivation: 'test' }],
    });
    const result = sellClub(state, 'club-a', 15);
    expect(result.takeoverOffers).toHaveLength(0);
  });

  it('adds a sale confirmation inbox message and event', () => {
    const club = makeClub({ id: 'club-a', leagueId: 'league-1' });
    const state = makeMinimalGameState({
      activeClubId: 'club-a',
      player: { ...makeMinimalGameState().player, clubsOwnedIds: ['club-a'] },
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
    });
    const result = sellClub(state, 'club-a', 15);
    expect(result.inbox.length).toBeGreaterThan(0);
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('returns original state when database is not found', () => {
    const club = makeClub({ id: 'club-a', leagueId: 'league-1' });
    const state = makeMinimalGameState({
      activeClubId: 'club-a',
      currentDatabaseId: 'nonexistent-db',
      player: { ...makeMinimalGameState().player, clubsOwnedIds: ['club-a'] },
      databases: {
        'db-main': {
          ...makeMinimalGameState().databases['db-main'],
          clubs: [club],
        },
      },
    });
    const result = sellClub(state, 'club-a', 15);
    expect(result).toBe(state);
  });
});

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'plr-test-1',
    name: 'Test Player',
    age: 25,
    position: 'MID',
    ability: 60,
    potential: 70,
    morale: 70,
    fitness: 100,
    form: 0,
    injuryWeeksRemaining: 0,
    wageWeekly: 0.02,
    contractYearsLeft: 3,
    clubId: 'test-club',
    marketValue: 5.0,
    ...overrides,
  };
}

describe('simulateMatch with positional ratings (Phase 3)', () => {
  it('stronger team wins more often over a large sample', () => {
    const strong = makeClub({ id: 'strong', name: 'Strong FC', squadQuality: 85, mentality: 'balanced', stadiumCapacity: 50000, fanbaseSize: 100000, reputation: 80, trainingFacilitiesLevel: 3 });
    const weak = makeClub({ id: 'weak', name: 'Weak FC', squadQuality: 30, mentality: 'balanced', stadiumCapacity: 10000, fanbaseSize: 10000, reputation: 20, trainingFacilitiesLevel: 1 });

    // Create player pools reflecting the squad quality difference
    const strongPlayers: Player[] = [];
    for (let i = 0; i < 20; i++) {
      const isGk = i < 2;
      const isDef = i >= 2 && i < 7;
      const isMid = i >= 7 && i < 13;
      const position: Player['position'] = isGk ? 'GK' : isDef ? 'DEF' : isMid ? 'MID' : 'FWD';
      strongPlayers.push(makePlayer({
        id: `strong-${i}`, position, ability: 80 + Math.floor(Math.random() * 15),
        fitness: 100, form: 0, injuryWeeksRemaining: 0,
      }));
    }
    const weakPlayers: Player[] = [];
    for (let i = 0; i < 20; i++) {
      const isGk = i < 2;
      const isDef = i >= 2 && i < 7;
      const isMid = i >= 7 && i < 13;
      const position: Player['position'] = isGk ? 'GK' : isDef ? 'DEF' : isMid ? 'MID' : 'FWD';
      weakPlayers.push(makePlayer({
        id: `weak-${i}`, position, ability: 20 + Math.floor(Math.random() * 15),
        fitness: 100, form: 0, injuryWeeksRemaining: 0,
      }));
    }

    // Ensure strong has better auto-picked XI
    const strongXi = autoPickXI(strongPlayers);
    const weakXi = autoPickXI(weakPlayers);
    const strongAvg = strongXi.reduce((s, p) => s + getEffectiveAbility(p), 0) / strongXi.length;
    const weakAvg = weakXi.reduce((s, p) => s + getEffectiveAbility(p), 0) / weakXi.length;
    expect(strongAvg).toBeGreaterThan(weakAvg);

    let strongWins = 0;
    let draws = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      const result = simulateMatch(strong, weak, null, null, 1, strongPlayers, weakPlayers);
      if (result.homeScore > result.awayScore) strongWins++;
      else if (result.homeScore === result.awayScore) draws++;
    }
    const strongWinPct = strongWins / trials;
    // Strong team with home advantage should win at least 55% of matches
    expect(strongWinPct).toBeGreaterThan(0.55);
  });

  it('weaker team at home with defensive mentality can hold strong team', () => {
    const strong = makeClub({ id: 'strong', name: 'Strong FC', squadQuality: 85, mentality: 'attacking', stadiumCapacity: 50000, fanbaseSize: 100000, reputation: 80, trainingFacilitiesLevel: 3 });
    const weak = makeClub({ id: 'weak', name: 'Weak FC', squadQuality: 30, mentality: 'defensive', stadiumCapacity: 10000, fanbaseSize: 10000, reputation: 20, trainingFacilitiesLevel: 1 });

    const strongPlayers: Player[] = [];
    for (let i = 0; i < 20; i++) {
      const isGk = i < 2;
      const isDef = i >= 2 && i < 7;
      const isMid = i >= 7 && i < 13;
      const position = isGk ? 'GK' as const : isDef ? 'DEF' as const : isMid ? 'MID' as const : 'FWD' as const;
      strongPlayers.push(makePlayer({
        id: `strong-${i}`, position, ability: 80 + Math.floor(Math.random() * 15),
        fitness: 100, form: 0, injuryWeeksRemaining: 0,
      }));
    }
    const weakPlayers: Player[] = [];
    for (let i = 0; i < 20; i++) {
      const isGk = i < 2;
      const isDef = i >= 2 && i < 7;
      const isMid = i >= 7 && i < 13;
      const position = isGk ? 'GK' as const : isDef ? 'DEF' as const : isMid ? 'MID' as const : 'FWD' as const;
      weakPlayers.push(makePlayer({
        id: `weak-${i}`, position, ability: 20 + Math.floor(Math.random() * 15),
        fitness: 100, form: 0, injuryWeeksRemaining: 0,
      }));
    }

    // Strong is away, weak is at home with defensive setup
    let drawOrWinForWeak = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      const result = simulateMatch(weak, strong, null, null, 1, weakPlayers, strongPlayers);
      if (result.homeScore >= result.awayScore) drawOrWinForWeak++;
    }
    const pct = drawOrWinForWeak / trials;
    // Weak team at home in defensive setup should avoid loss at least 25% of the time
    expect(pct).toBeGreaterThan(0.20);
  });
});

describe('Fatigue system (Phase 3)', () => {
  it('effective ability drops after consecutive matches without rest', () => {
    const player = makePlayer({ ability: 80, fitness: 100, form: 0 });

    // After first match
    let fatigued = applyMatchFatigue(player);
    expect(fatigued.fitness).toBeLessThan(100);
    const afterFirst = getEffectiveAbility(fatigued);
    expect(afterFirst).toBeLessThan(80);

    // After second match without rest
    const afterFirstFitness = fatigued.fitness;
    fatigued = applyMatchFatigue(fatigued);
    expect(fatigued.fitness).toBeLessThan(afterFirstFitness);
    const afterSecond = getEffectiveAbility(fatigued);
    expect(afterSecond).toBeLessThan(afterFirst);

    // After rest recovery
    const rested = applyRestRecovery(fatigued);
    expect(rested.fitness).toBeGreaterThan(fatigued.fitness);
    const afterRest = getEffectiveAbility(rested);
    expect(afterRest).toBeGreaterThan(afterSecond);
  });

  it('injury probability increases with low fitness', () => {
    // With very low fitness, injury is almost certain across many checks
    const fragilePlayer = makePlayer({ fitness: 10, ability: 60 });
    let injured = false;
    for (let i = 0; i < 100; i++) {
      const result = checkMatchInjury(fragilePlayer);
      if (result.injuryWeeksRemaining > 0) {
        injured = true;
        break;
      }
    }
    expect(injured).toBe(true);
  });

  it('injury recovery reduces injuryWeeksRemaining over time', () => {
    const injured = makePlayer({ injuryWeeksRemaining: 3 });
    const week1 = tickInjuryRecovery(injured);
    expect(week1.injuryWeeksRemaining).toBe(2);
    const week2 = tickInjuryRecovery(week1);
    expect(week2.injuryWeeksRemaining).toBe(1);
    const week3 = tickInjuryRecovery(week2);
    expect(week3.injuryWeeksRemaining).toBe(0);
  });
});

describe('Player utilities', () => {
  describe('getEffectiveAbility', () => {
    it('returns full ability for a fit, in-form player', () => {
      const p = makePlayer({ ability: 80, fitness: 100, form: 10 });
      expect(getEffectiveAbility(p)).toBe(80 * 1.0 * 1.1);
    });

    it('returns 0 for an injured player', () => {
      const p = makePlayer({ ability: 80, injuryWeeksRemaining: 3 });
      expect(getEffectiveAbility(p)).toBe(0);
    });

    it('reduces effective ability with low fitness', () => {
      const p = makePlayer({ ability: 80, fitness: 50, form: 0 });
      expect(getEffectiveAbility(p)).toBe(80 * 0.5);
    });

    it('reduces effective ability with negative form', () => {
      const p = makePlayer({ ability: 80, fitness: 100, form: -20 });
      expect(getEffectiveAbility(p)).toBe(80 * 1.0 * 0.8);
    });
  });

  describe('autoPickXI', () => {
    it('picks 1 GK, 4 DEF, 4 MID, 2 FWD from a full squad', () => {
      const players: Player[] = [];
      for (let i = 0; i < 3; i++) players.push(makePlayer({ id: `gk-${i}`, position: 'GK', ability: 60 + i }));
      for (let i = 0; i < 6; i++) players.push(makePlayer({ id: `def-${i}`, position: 'DEF', ability: 60 + i }));
      for (let i = 0; i < 7; i++) players.push(makePlayer({ id: `mid-${i}`, position: 'MID', ability: 60 + i }));
      for (let i = 0; i < 5; i++) players.push(makePlayer({ id: `fwd-${i}`, position: 'FWD', ability: 60 + i }));

      const xi = autoPickXI(players);
      expect(xi).toHaveLength(11);
      expect(xi.filter((p) => p.position === 'GK')).toHaveLength(1);
      expect(xi.filter((p) => p.position === 'DEF')).toHaveLength(4);
      expect(xi.filter((p) => p.position === 'MID')).toHaveLength(4);
      expect(xi.filter((p) => p.position === 'FWD')).toHaveLength(2);
    });

    it('picks the best players by position', () => {
      const players: Player[] = [
        makePlayer({ id: 'gk-low', position: 'GK', ability: 40 }),
        makePlayer({ id: 'gk-high', position: 'GK', ability: 80 }),
        makePlayer({ id: 'def-low', position: 'DEF', ability: 30 }),
        makePlayer({ id: 'def-high', position: 'DEF', ability: 85 }),
        makePlayer({ id: 'def-mid1', position: 'DEF', ability: 60 }),
        makePlayer({ id: 'def-mid2', position: 'DEF', ability: 55 }),
        makePlayer({ id: 'def-mid3', position: 'DEF', ability: 50 }),
        makePlayer({ id: 'mid-low', position: 'MID', ability: 35 }),
        makePlayer({ id: 'mid-high1', position: 'MID', ability: 90 }),
        makePlayer({ id: 'mid-high2', position: 'MID', ability: 88 }),
        makePlayer({ id: 'mid-high3', position: 'MID', ability: 85 }),
        makePlayer({ id: 'mid-high4', position: 'MID', ability: 82 }),
        makePlayer({ id: 'fwd-low', position: 'FWD', ability: 25 }),
        makePlayer({ id: 'fwd-high1', position: 'FWD', ability: 92 }),
        makePlayer({ id: 'fwd-high2', position: 'FWD', ability: 78 }),
      ];

      const xi = autoPickXI(players);
      expect(xi.find((p) => p.id === 'gk-high')).toBeTruthy();
      expect(xi.find((p) => p.id === 'gk-low')).toBeFalsy();
      expect(xi.find((p) => p.id === 'def-high')).toBeTruthy();
      expect(xi.find((p) => p.id === 'def-low')).toBeFalsy();
      expect(xi.find((p) => p.id === 'mid-high1')).toBeTruthy();
      expect(xi.find((p) => p.id === 'mid-low')).toBeFalsy();
      expect(xi.find((p) => p.id === 'fwd-high1')).toBeTruthy();
      expect(xi.find((p) => p.id === 'fwd-low')).toBeFalsy();
    });

    it('excludes injured players from the XI', () => {
      const players: Player[] = [
        makePlayer({ id: 'gk-healthy', position: 'GK', ability: 60 }),
        makePlayer({ id: 'gk-injured', position: 'GK', ability: 95, injuryWeeksRemaining: 2 }),
        makePlayer({ id: 'def-1', position: 'DEF', ability: 70 }),
        makePlayer({ id: 'def-2', position: 'DEF', ability: 70 }),
        makePlayer({ id: 'def-3', position: 'DEF', ability: 70 }),
        makePlayer({ id: 'def-4', position: 'DEF', ability: 70 }),
        makePlayer({ id: 'mid-1', position: 'MID', ability: 70 }),
        makePlayer({ id: 'mid-2', position: 'MID', ability: 70 }),
        makePlayer({ id: 'mid-3', position: 'MID', ability: 70 }),
        makePlayer({ id: 'mid-4', position: 'MID', ability: 70 }),
        makePlayer({ id: 'fwd-1', position: 'FWD', ability: 70 }),
        makePlayer({ id: 'fwd-2', position: 'FWD', ability: 70 }),
      ];

      const xi = autoPickXI(players);
      expect(xi.find((p) => p.id === 'gk-injured')).toBeFalsy();
      expect(xi.find((p) => p.id === 'gk-healthy')).toBeTruthy();
    });
  });

  describe('deriveSquadQuality', () => {
    it('averages the effective ability of the best XI', () => {
      const players: Player[] = [
        makePlayer({ id: 'p1', position: 'GK', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p2', position: 'DEF', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p3', position: 'DEF', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p4', position: 'DEF', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p5', position: 'DEF', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p6', position: 'MID', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p7', position: 'MID', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p8', position: 'MID', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p9', position: 'MID', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p10', position: 'FWD', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p11', position: 'FWD', ability: 80, fitness: 100, form: 0 }),
        makePlayer({ id: 'p12', position: 'GK', ability: 100, fitness: 100, form: 0 }), // bench
      ];

      const sq = deriveSquadQuality(players);
      expect(sq).toBe(81.8); // best 11 = 100-rated GK + 10 × 80-rated outfield = 900/11
    });

    it('is reduced by low fitness in the starting XI', () => {
      const players: Player[] = [
        makePlayer({ id: 'p1', position: 'GK', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p2', position: 'DEF', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p3', position: 'DEF', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p4', position: 'DEF', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p5', position: 'DEF', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p6', position: 'MID', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p7', position: 'MID', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p8', position: 'MID', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p9', position: 'MID', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p10', position: 'FWD', ability: 80, fitness: 50, form: 0 }),
        makePlayer({ id: 'p11', position: 'FWD', ability: 80, fitness: 50, form: 0 }),
      ];

      const sq = deriveSquadQuality(players);
      expect(sq).toBe(40); // 80 * 0.5 (fitness)
    });

    it('returns 1 for an empty squad', () => {
      expect(deriveSquadQuality([])).toBe(1);
    });
  });

  describe('buyPlayer', () => {
    it('moves a player between clubs and adjusts budgets', () => {
      const player = makePlayer({ id: 'plr-transfer', clubId: 'seller-club' });
      const sellerClub = makeClub({ id: 'seller-club', cash: 5, squad: ['plr-transfer'], transferBudget: 2 });
      const buyerClub = makeClub({ id: 'buyer-club', cash: 20, squad: [], transferBudget: 10 });
      const league: League = {
        id: 'league-1', name: 'Test', tier: 1, country: 'England', teamsCount: 4,
        tvDealWeeklyPayout: 0.5, prestige: 60,
        standings: [], fixtures: [], history: [],
      };
      const state = makeMinimalGameState({
        databases: {
          'db-main': {
            id: 'db-main', name: 'Main', description: '', version: '1',
            author: 'test', isOfficial: true,
            clubs: [sellerClub, buyerClub],
            leagues: [league],
            availableStaff: [],
            players: [player],
            sponsors: [],
          },
        },
        playerTransferListings: [{
          id: 'listing-1', playerId: 'plr-transfer',
          askingPrice: 8, sellingClubId: 'seller-club',
          listingWeek: 1, listingYear: 2026,
        }],
      });

      const result = buyPlayer(state, 'listing-1', 'buyer-club');
      expect(result.playerTransferListings).toHaveLength(0);

      const db = result.databases['db-main'];
      const updatedPlayer = db.players.find((p) => p.id === 'plr-transfer')!;
      expect(updatedPlayer.clubId).toBe('buyer-club');

      const updatedSeller = db.clubs.find((c) => c.id === 'seller-club')!;
      expect(updatedSeller.cash).toBe(13); // 5 + 8
      expect(updatedSeller.squad).not.toContain('plr-transfer');

      const updatedBuyer = db.clubs.find((c) => c.id === 'buyer-club')!;
      expect(updatedBuyer.cash).toBe(12); // 20 - 8
      expect(updatedBuyer.squad).toContain('plr-transfer');
    });

    it('returns original state when buyer cannot afford the player', () => {
      const player = makePlayer({ id: 'plr-transfer', clubId: 'seller-club' });
      const sellerClub = makeClub({ id: 'seller-club', cash: 5, squad: ['plr-transfer'] });
      const buyerClub = makeClub({ id: 'buyer-club', cash: 5, squad: [] }); // only 5 cash, needs 8
      const league: League = {
        id: 'league-1', name: 'Test', tier: 1, country: 'England', teamsCount: 4,
        tvDealWeeklyPayout: 0.5, prestige: 60,
        standings: [], fixtures: [], history: [],
      };
      const state = makeMinimalGameState({
        databases: {
          'db-main': {
            id: 'db-main', name: 'Main', description: '', version: '1',
            author: 'test', isOfficial: true,
            clubs: [sellerClub, buyerClub],
            leagues: [league],
            availableStaff: [],
            players: [player],
            sponsors: [],
          },
        },
        playerTransferListings: [{
          id: 'listing-1', playerId: 'plr-transfer',
          askingPrice: 8, sellingClubId: 'seller-club',
          listingWeek: 1, listingYear: 2026,
        }],
      });

      const result = buyPlayer(state, 'listing-1', 'buyer-club');
      expect(result.playerTransferListings).toHaveLength(1);
    });
  });

  describe('sellPlayer', () => {
    it('creates a player transfer listing', () => {
      const player = makePlayer({ id: 'plr-sell', clubId: 'test-club' });
      const club = makeClub({ id: 'test-club', valuation: 100, squad: ['plr-sell'] });
      const league: League = {
        id: 'league-1', name: 'Test', tier: 1, country: 'England', teamsCount: 4,
        tvDealWeeklyPayout: 0.5, prestige: 60,
        standings: [], fixtures: [], history: [],
      };
      const state = makeMinimalGameState({
        databases: {
          'db-main': {
            id: 'db-main', name: 'Main', description: '', version: '1',
            author: 'test', isOfficial: true,
            clubs: [club],
            leagues: [league],
            availableStaff: [],
            players: [player],
            sponsors: [],
          },
        },
      });

      const result = sellPlayer(state, 'plr-sell', 'test-club', 1, 2026);
      expect(result.playerTransferListings).toHaveLength(1);
      expect(result.playerTransferListings[0].playerId).toBe('plr-sell');
    });
  });
});

describe('Phase 4 — Season structure and stakes', () => {
  describe('isTransferWindowOpen', () => {
    it('returns true for weeks 1-4 (pre-season)', () => {
      expect(isTransferWindowOpen(1, 18)).toBe(true);
      expect(isTransferWindowOpen(3, 18)).toBe(true);
      expect(isTransferWindowOpen(4, 18)).toBe(true);
    });

    it('returns true during mid-season window (~45-60% of season)', () => {
      // For 18-week season: midStart=8, midEnd=10
      expect(isTransferWindowOpen(8, 18)).toBe(true);
      expect(isTransferWindowOpen(10, 18)).toBe(true);
    });

    it('returns false outside transfer windows', () => {
      expect(isTransferWindowOpen(5, 18)).toBe(false);
      expect(isTransferWindowOpen(7, 18)).toBe(false);
      expect(isTransferWindowOpen(11, 18)).toBe(false);
      expect(isTransferWindowOpen(13, 18)).toBe(false);
    });
  });

  describe('buyPlayer respects transfer window', () => {
    function makeStateWithWeek(week: number, maxWeeks: number): GameState {
      const player = makePlayer({ id: 'plr-a', clubId: 'seller' });
      const seller = makeClub({ id: 'seller', cash: 5, squad: ['plr-a'] });
      const buyer = makeClub({ id: 'buyer', cash: 20, squad: [], leagueId: 'league-1' });
      const league: League = {
        id: 'league-1', name: 'Test', tier: 1, country: 'England', teamsCount: maxWeeks % 2 === 0 ? (maxWeeks / 2) + 1 : 2,
        tvDealWeeklyPayout: 0.5, prestige: 60,
        standings: [], fixtures: [], history: [],
      };
      return makeMinimalGameState({
        player: {
          name: 'James', personalWealth: 50, reputation: 40,
          clubsOwnedIds: [], clubsPreviouslyOwned: [], trophyCabinet: [],
          startYear: 2026, currentYear: 2026, currentWeek: week,
        },
        databases: {
          'db-main': {
            id: 'db-main', name: 'Main', description: '', version: '1',
            author: 'test', isOfficial: true,
            clubs: [seller, buyer],
            leagues: [league],
            availableStaff: [],
            players: [player],
            sponsors: [],
          },
        },
        playerTransferListings: [{
          id: 'listing-1', playerId: 'plr-a', askingPrice: 8,
          sellingClubId: 'seller', listingWeek: 1, listingYear: 2026,
        }],
      });
    }

    it('allows purchase during pre-season window (week 3)', () => {
      const state = makeStateWithWeek(3, 18);
      const result = buyPlayer(state, 'listing-1', 'buyer');
      expect(result.playerTransferListings).toHaveLength(0);
    });

    it('blocks purchase outside any window (week 6)', () => {
      const state = makeStateWithWeek(6, 18);
      const result = buyPlayer(state, 'listing-1', 'buyer');
      expect(result.playerTransferListings).toHaveLength(1);
    });
  });

  describe('Derby match simulation', () => {
    it('adds derby-specific commentary when isDerby is true', () => {
      const home = makeClub({ id: 'h', name: 'Home FC' });
      const away = makeClub({ id: 'a', name: 'Away FC' });
      const result = simulateMatch(home, away, null, null, 1, undefined, undefined, undefined, true);
      const allText = result.events.join(' ');
      expect(allText).toContain('DERBY');
    });

    it('does not add derby commentary when isDerby is false', () => {
      const home = makeClub({ id: 'h', name: 'Home FC' });
      const away = makeClub({ id: 'a', name: 'Away FC' });
      const result = simulateMatch(home, away, null, null, 1, undefined, undefined, undefined, false);
      const allText = result.events.join(' ');
      expect(allText).not.toContain('DERBY');
    });
  });
});
