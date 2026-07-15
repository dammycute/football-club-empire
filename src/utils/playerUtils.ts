import { Player, PlayerPosition, Club, GameState, PlayerTransferListing, League } from '../types/game';

// Helper to compute season length (avoid circular import from simEngine)
function getSeasonLengthWeeks(teamsCount: number): number {
  if (teamsCount < 2) return 0;
  return teamsCount % 2 === 0 ? 2 * (teamsCount - 1) : 2 * teamsCount;
}

export function isTransferWindowOpen(currentWeek: number, maxSeasonWeeks: number): boolean {
  if (currentWeek <= 4) return true;
  const midStart = Math.floor(maxSeasonWeeks * 0.45);
  const midEnd = Math.floor(maxSeasonWeeks * 0.6);
  return currentWeek >= midStart && currentWeek <= midEnd;
}

const FIRST_NAMES = [
  'James', 'Harry', 'Jack', 'Oliver', 'Charlie', 'Thomas', 'George', 'Oscar',
  'William', 'Henry', 'Alfie', 'Jacob', 'Ethan', 'Noah', 'Liam', 'Mason',
  'Lucas', 'Alexander', 'Daniel', 'Samuel', 'Ryan', 'Luke', 'Matthew', 'Jamie',
  'Jordan', 'Kyle', 'Connor', 'Ben', 'Aaron', 'Nathan', 'Joseph', 'David',
  'Michael', 'Andrew', 'Chris', 'Joshua', 'Adam', 'Patrick', 'Declan', 'Sean',
  'Emma', 'Olivia', 'Amelia', 'Sophie', 'Mia', 'Lily', 'Ella', 'Chloe',
  'Charlotte', 'Ava', 'Grace', 'Isla', 'Freya', 'Poppy', 'Daisy', 'Evie',
  'Ivy', 'Emily', 'Isabella', 'Jessica', 'Kate', 'Lauren', 'Megan', 'Rachel',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore',
  'Jackson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Hill', 'Scott', 'Green', 'Adams', 'Baker',
  'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart',
  'Turner', 'Roberts', 'Gray', 'Watson', 'Brooks', 'Kelly', 'Davies', 'Morgan',
  'Cooper', 'Reed', 'Bailey', 'Bell', 'Murphy', 'Sullivan', 'Hart', 'Hughes',
  'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins',
  'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington',
  'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell',
  'Griffin', 'Dixon', 'Hayes', 'Burns', 'Gordon', 'Ford', 'Harvey', 'Hudson',
  'Murray', 'Gibson', 'Owen', 'Knight', 'Holmes', 'Mills', 'Richards', 'Palmer',
  'Bishop', 'Mason', 'Chapman', 'Walsh', 'Pearce', 'Mitchell', 'Ward', 'Cook',
  'Rogers', 'Morgan', 'Armstrong', 'Webb', 'Carter', 'Bentley', 'Chambers',
];

const makeId = (): string => Math.random().toString(36).substring(2, 11);

let nameIndex = 0;

function generatePlayerName(): string {
  const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length];
  nameIndex++;
  return `${first} ${last}`;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateMarketValue(ability: number, age: number, potential: number, contractYearsLeft: number): number {
  const ageFactor = age < 23 ? 1.4 : (age < 28 ? 1.2 : (age < 33 ? 0.8 : 0.5));
  const abilityFactor = ability / 100;
  const potentialBonus = potential > ability ? 1 + (potential - ability) / 200 : 1;
  const contractFactor = 1 + (contractYearsLeft - 1) * 0.1;
  const base = abilityFactor * 50 * ageFactor * potentialBonus * contractFactor;
  return Math.round(base * 10) / 10;
}

export function generatePlayersForClub(club: Club, count: number = 20): Player[] {
  const seed = club.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const players: Player[] = [];
  const baseAbility = club.squadQuality;

  const positions: PlayerPosition[] = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD',
    'GK', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'DEF', 'MID', 'FWD'];

  for (let i = 0; i < count; i++) {
    const r = seededRandom(seed + i * 7 + i);
    const r2 = seededRandom(seed + i * 13 + 3);
    const r3 = seededRandom(seed + i * 23 + 5);
    const position = positions[i % positions.length];

    const variance = (r - 0.5) * 24;
    const ability = clamp(Math.round(baseAbility + variance), 15, 99);

    const age = position === 'GK'
      ? Math.round(22 + r2 * 16)
      : Math.round(18 + r2 * 18);

    const potential = clamp(
      age < 23
        ? Math.round(ability + (1 - r3) * 20)
        : Math.round(ability - r3 * 15),
      15, 99
    );

    const wageWeekly = Math.round(((ability / 100) * (0.5 + r2 * 0.5) + 0.05) * 1000) / 1000;

    const player: Player = {
      id: `plr-${club.id}-${i}`,
      name: generatePlayerName(),
      age,
      position,
      ability,
      potential,
      morale: Math.round(50 + r2 * 30),
      fitness: Math.round(80 + r3 * 20),
      form: Math.round((r - 0.5) * 10),
      injuryWeeksRemaining: 0,
      wageWeekly,
      contractYearsLeft: Math.max(1, Math.round(1 + r3 * 3)),
      clubId: club.id,
      marketValue: 0,
    };
    player.marketValue = calculateMarketValue(player.ability, player.age, player.potential, player.contractYearsLeft);
    players.push(player);
  }

  return players;
}

export function getEffectiveAbility(player: Player): number {
  if (player.injuryWeeksRemaining > 0) return 0;
  const fitnessModifier = player.fitness / 100;
  const formModifier = 1 + player.form / 100;
  return player.ability * fitnessModifier * formModifier;
}

export function autoPickXI(players: Player[]): Player[] {
  const available = players.filter((p) => p.injuryWeeksRemaining === 0 && p.fitness >= 20);
  if (available.length < 11) return [...available];

  const sortByEffective = (a: Player, b: Player) => getEffectiveAbility(b) - getEffectiveAbility(a);

  const gks = available.filter((p) => p.position === 'GK').sort(sortByEffective);
  const defs = available.filter((p) => p.position === 'DEF').sort(sortByEffective);
  const mids = available.filter((p) => p.position === 'MID').sort(sortByEffective);
  const fwds = available.filter((p) => p.position === 'FWD').sort(sortByEffective);

  return [
    ...gks.slice(0, 1),
    ...defs.slice(0, 4),
    ...mids.slice(0, 4),
    ...fwds.slice(0, 2),
  ];
}

export function deriveSquadQuality(players: Player[]): number {
  const xi = autoPickXI(players);
  if (xi.length === 0) return 1;
  const total = xi.reduce((sum, p) => sum + getEffectiveAbility(p), 0);
  return Math.round((total / xi.length) * 10) / 10;
}

export function buyPlayer(
  state: GameState,
  listingId: string,
  buyerClubId: string
): GameState {
  const db = state.databases[state.currentDatabaseId];
  if (!db) return state;

  const listing = state.playerTransferListings.find((l) => l.id === listingId);
  if (!listing) return state;

  const buyerClub = db.clubs.find((c) => c.id === buyerClubId);
  if (!buyerClub) return state;

  const player = db.players.find((p) => p.id === listing.playerId);
  if (!player) return state;

  if (buyerClub.cash < listing.askingPrice) return state;

  // Transfer window check
  const allLeagues = Object.values(state.databases).flatMap((d) => d.leagues);
  const maxSeasonWeeks = allLeagues.length > 0
    ? Math.max(...allLeagues.map((l) => l.teamsCount > 0 ? getSeasonLengthWeeks(l.teamsCount) : 0), 0)
    : 0;
  if (!isTransferWindowOpen(state.player.currentWeek, maxSeasonWeeks)) return state;

  const updatedClubs = db.clubs.map((c) => {
    if (c.id === player.clubId) {
      return { ...c, cash: c.cash + listing.askingPrice, squad: c.squad.filter((pid) => pid !== player.id) };
    }
    if (c.id === buyerClubId) {
      return { ...c, cash: c.cash - listing.askingPrice, transferBudget: c.transferBudget - listing.askingPrice, squad: [...c.squad, player.id] };
    }
    return c;
  });

  const updatedPlayers = db.players.map((p) => {
    if (p.id === player.id) {
      return { ...p, clubId: buyerClubId };
    }
    return p;
  });

  const updatedListings = state.playerTransferListings.filter((l) => l.id !== listingId);

  const updatedDb = { ...db, clubs: updatedClubs, players: updatedPlayers };

  return {
    ...state,
    databases: { ...state.databases, [state.currentDatabaseId]: updatedDb },
    playerTransferListings: updatedListings,
  };
}

export function listPlayerForTransfer(playerId: string, sellingClub: Club, currentWeek: number, currentYear: number): PlayerTransferListing {
  return {
    id: makeId(),
    playerId,
    askingPrice: Math.round(sellingClub.valuation * 0.15 * 10) / 10,
    sellingClubId: sellingClub.id,
    listingWeek: currentWeek,
    listingYear: currentYear,
  };
}

export function sellPlayer(
  state: GameState,
  playerId: string,
  sellingClubId: string,
  currentWeek: number,
  currentYear: number
): GameState {
  const db = state.databases[state.currentDatabaseId];
  if (!db) return state;

  const player = db.players.find((p) => p.id === playerId && p.clubId === sellingClubId);
  if (!player) return state;

  const club = db.clubs.find((c) => c.id === sellingClubId);
  if (!club) return state;

  const listing = listPlayerForTransfer(playerId, club, currentWeek, currentYear);

  return {
    ...state,
    playerTransferListings: [...state.playerTransferListings, listing],
  };
}

export function removeTransferListing(
  state: GameState,
  listingId: string
): GameState {
  return {
    ...state,
    playerTransferListings: state.playerTransferListings.filter((l) => l.id !== listingId),
  };
}

// Fatigue: reduce fitness after playing a match
export function applyMatchFatigue(player: Player): Player {
  const fitnessDrop = 10 + Math.round(Math.random() * 15); // 10-25 drop
  return {
    ...player,
    fitness: Math.max(5, player.fitness - fitnessDrop),
  };
}

// Recovery: regain fitness on bye/rest weeks
export function applyRestRecovery(player: Player): Player {
  const recovery = 15 + Math.round(Math.random() * 15); // 15-30 recovery
  return {
    ...player,
    fitness: Math.min(100, player.fitness + recovery),
  };
}

// Injury: check if a player gets injured during a match
export function checkMatchInjury(player: Player): Player {
  // Base injury probability
  let injuryChance = 0.02;
  // Scale with low fitness
  if (player.fitness < 40) injuryChance *= 3;
  if (player.fitness < 20) injuryChance *= 5;

  if (Math.random() < injuryChance) {
    const weeksOut = 1 + Math.floor(Math.random() * 4); // 1-4 weeks
    return {
      ...player,
      injuryWeeksRemaining: weeksOut,
    };
  }
  return player;
}

// Weekly injury recovery: reduce injury weeks for all injured players
export function tickInjuryRecovery(player: Player): Player {
  if (player.injuryWeeksRemaining > 0) {
    return {
      ...player,
      injuryWeeksRemaining: player.injuryWeeksRemaining - 1,
    };
  }
  return player;
}

// Update player form based on match result
export function updatePlayerForm(player: Player, result: 'win' | 'draw' | 'loss'): Player {
  const formChange = result === 'win' ? 2 + Math.round(Math.random() * 3) : result === 'loss' ? -(2 + Math.round(Math.random() * 3)) : Math.round(Math.random() * 4) - 2;
  return {
    ...player,
    form: Math.max(-30, Math.min(30, player.form + formChange)),
  };
}
