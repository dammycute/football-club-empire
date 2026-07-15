export interface PlayerProfile {
  name: string;
  personalWealth: number; // in millions of £
  reputation: number; // 1 to 100
  clubsOwnedIds: string[];
  clubsPreviouslyOwned: {
    clubId: string;
    clubName: string;
    boughtFor: number;
    soldFor: number;
    yearsOwned: number;
    trophiesWon: string[];
  }[];
  trophyCabinet: {
    trophyName: string;
    clubName: string;
    year: number;
  }[];
  startYear: number;
  currentYear: number;
  currentWeek: number; // 1 to 38
}

export type StaffRole = 'manager' | 'ceo' | 'sporting_director';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  age: number;
  rating: number; // 1 to 100
  salaryWeekly: number; // in £
  personality: string; // e.g. 'Risk Taker', 'Cost Cutter', 'Commercial Genius', 'Youth Developer', 'Tactician'
  avatar: string; // Tailwind emoji-based avatar description or character
  minLeagueTier?: number; // lowest league tier this staff is suitable for (default 1)
  maxLeagueTier?: number; // highest league tier this staff is suitable for (default 7)
}

export interface BoardObjective {
  type: 'promotion' | 'mid_table' | 'avoid_relegation' | 'make_profit' | 'develop_youth';
  description: string;
  targetProgress: number; // current value
  targetGoal: number; // target value
  rewardWealth: number; // in £m
  penaltyRep: number; // reputation loss if failed
}

export interface ClubHistoryEntry {
  year: number;
  leaguePosition: number;
  leagueName: string;
  revenue: number;
  profit: number;
  valuation: number;
  trophyWon?: string;
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  name: string;
  age: number;
  position: PlayerPosition;
  ability: number;       // 1-100, current true quality
  potential: number;     // 1-100, ceiling for young players
  morale: number;        // 1-100
  fitness: number;       // 1-100, drops with matches/no rest, recovers with rest weeks
  form: number;          // rolling modifier from recent performances, can go negative
  injuryWeeksRemaining: number; // 0 = fit
  wageWeekly: number;    // in millions of £
  contractYearsLeft: number;
  clubId: string | null; // null = free agent
  marketValue: number;   // derived, recalculated periodically
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  colorPrimary: string; // Tailwind color e.g., 'emerald' or hexadecimal
  colorSecondary: string;
  country: string;
  leagueId: string;
  valuation: number; // in millions of £
  cash: number; // in millions of £
  debt: number; // in millions of £
  interestRate: number; // e.g., 0.05 for 5% annual
  wageBillWeekly: number; // in millions of £
  fanbaseSize: number; // count of loyal fans
  stadiumName: string;
  stadiumCapacity: number;
  stadiumLevel: number; // upgrade level 1 to 5
  trainingFacilitiesLevel: number; // 1 to 5
  youthFacilitiesLevel: number; // 1 to 5
  academyQuality: number; // 1 to 100
  squadQuality: number; // 1 to 100 (derived from starting XI each week)
  reputation: number; // 1 to 100
  sponsorName: string;
  sponsorIncomeWeekly: number; // in millions of £
  sponsorYearsLeft: number;
  ticketPrice: number; // in £
  seasonTicketPrice: number; // in £
  seasonTicketsSold: number;
  managerId: string | null;
  ceoId: string | null;
  sportingDirectorId: string | null;
  mentality: 'attacking' | 'balanced' | 'defensive';
  squad: string[]; // player IDs belonging to this club
  history: ClubHistoryEntry[];
  boardObjective: BoardObjective;
  transferBudget: number; // in millions of £
  revenueLastYear?: number; // in millions of £
  profitLastYear?: number; // in millions of £
}

export interface PlayerTransferListing {
  id: string;
  playerId: string;
  askingPrice: number; // in millions of £
  sellingClubId: string;
  listingWeek: number;
  listingYear: number;
}

export interface StandingEntry {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

export interface Match {
  week: number;
  homeClubId: string;
  awayClubId: string;
  homeScore?: number;
  awayScore?: number;
  simulated: boolean;
  matchEvents?: string[]; // key action commentary
}

export interface League {
  id: string;
  name: string;
  tier: number; // 1 = highest, etc.
  country: string;
  teamsCount: number;
  tvDealWeeklyPayout: number; // in millions of £ per club
  prestige: number; // 1 to 100
  standings: StandingEntry[];
  fixtures: Match[];
  derbies?: [string, string][]; // club ID pairs for rivalry matches
  history: {
    year: number;
    winnerId: string;
    winnerName: string;
    runnerUpId: string;
    runnerUpName: string;
  }[];
}

export interface TakeoverOffer {
  id: string;
  clubId: string;
  buyerName: string;
  offerAmount: number; // in millions of £
  isHostile: boolean;
  weeksRemaining: number;
  motivation: string; // e.g. "Tycoon seeking ego project", "Consortium looking for distressed asset"
}

export interface ClubMarketListing {
  clubId: string;
  askingPrice: number; // in millions of £
  flexibility: 'very_high' | 'high' | 'medium' | 'low' | 'rigid';
  ownerMotivation: string; // e.g. "Quick sale", "wants stadium guarantees", "refuses rivals"
  hiddenMotives: string;
  forSale: boolean;
}

export type MessageActionType = 'takeover_offer' | 'sponsor_negotiation' | 'staff_resignation' | 'transfer_request' | 'financial_warning' | 'simple';

export interface InboxMessage {
  id: string;
  week: number;
  year: number;
  sender: string;
  senderRole?: string;
  subject: string;
  content: string;
  actionType?: MessageActionType;
  actionData?: Record<string, unknown>;
  read: boolean;
}

export interface EventLog {
  id: string;
  week: number;
  year: number;
  title: string;
  description: string;
  type: 'news' | 'financial' | 'sporting' | 'empire';
}

export interface GameDatabase {
  id: string; // Database ID/Name
  name: string;
  description: string;
  version: string;
  author: string;
  isOfficial: boolean;
  clubs: Club[];
  leagues: League[];
  availableStaff: Staff[];
  players: Player[];
  sponsors: { name: string; baseIncomeWeekly: number; tierMin: number }[];
}

export interface GameState {
  player: PlayerProfile;
  currentDatabaseId: string;
  databases: Record<string, GameDatabase>;
  activeClubId: string | null; // Currently owned club (if any)
  marketListings: ClubMarketListing[];
  takeoverOffers: TakeoverOffer[];
  playerTransferListings: PlayerTransferListing[];
  inbox: InboxMessage[];
  events: EventLog[];
  simulationSpeed: 'paused' | 'normal' | 'fast';
  simulatingWeek: boolean;
  isGameOver: boolean;
  careerStats: {
    seasonsCompleted: number;
    totalProfitMade: number;
    highestValuationReached: number;
    totalTrophies: number;
  };
}
