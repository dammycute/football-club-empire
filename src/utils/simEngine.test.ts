import { describe, it, expect } from 'vitest';
import {
  calculateValuation,
  generateFixturesForLeague,
  purchaseClub,
  sellClub,
} from './simEngine';
import type { GameState, Club, League, StandingEntry, Match, Staff, ClubMarketListing, TakeoverOffer } from '../types/game';

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
        sponsors: [],
      },
    },
    activeClubId: null,
    marketListings: [],
    takeoverOffers: [],
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

describe('generateFixturesForLeague', () => {
  it('returns empty array for non-4 club count', () => {
    expect(generateFixturesForLeague(['a', 'b'])).toEqual([]);
    expect(generateFixturesForLeague(['a', 'b', 'c', 'd', 'e'])).toEqual([]);
    expect(generateFixturesForLeague([])).toEqual([]);
  });

  it('returns 12 fixtures for 4 clubs', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const fixtures = generateFixturesForLeague(ids);
    expect(fixtures).toHaveLength(12);
  });

  it('covers all 6 weeks with 2 matches each', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const fixtures = generateFixturesForLeague(ids);
    for (let w = 1; w <= 6; w++) {
      const weekMatches = fixtures.filter((m) => m.week === w);
      expect(weekMatches).toHaveLength(2);
    }
  });

  it('creates a double round-robin (each unique pair appears twice)', () => {
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

  it('preserves club order contract: first half and reversed second half', () => {
    const ids = ['x', 'y', 'z', 'w'];
    const fixtures = generateFixturesForLeague(ids);
    // First 6 fixtures should have: x-y, z-w (week 1)
    expect(fixtures[0]).toMatchObject({ week: 1, homeClubId: 'x', awayClubId: 'y' });
    expect(fixtures[1]).toMatchObject({ week: 1, homeClubId: 'z', awayClubId: 'w' });
    // Reversed: y-x, w-z (week 4)
    expect(fixtures[6]).toMatchObject({ week: 4, homeClubId: 'y', awayClubId: 'x' });
    expect(fixtures[7]).toMatchObject({ week: 4, homeClubId: 'w', awayClubId: 'z' });
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
