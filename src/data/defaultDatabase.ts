import { GameDatabase, Club, League, Staff, Match } from '../types/game';

// Helper to generate UUIDs
const uuid = () => Math.random().toString(36).substring(2, 11);

export const DEFAULT_DATABASE_ID = 'england-fictional-default';

export const getDefaultDatabase = (): GameDatabase => {
  const staff: Staff[] = [
    // MANAGERS
    { id: 'mgr-1', name: 'Jose Cardono', role: 'manager', age: 58, rating: 88, salaryWeekly: 0.12, personality: 'Tactician', avatar: '👔', minLeagueTier: 1, maxLeagueTier: 2 },
    { id: 'mgr-2', name: 'Pep Santis', role: 'manager', age: 51, rating: 94, salaryWeekly: 0.18, personality: 'Risk Taker', avatar: '🕶️', minLeagueTier: 1, maxLeagueTier: 1 },
    { id: 'mgr-3', name: 'Sean Dikes', role: 'manager', age: 52, rating: 74, salaryWeekly: 0.05, personality: 'Cost Cutter', avatar: '🦁', minLeagueTier: 2, maxLeagueTier: 4 },
    { id: 'mgr-4', name: 'Emma Hayes-Jones', role: 'manager', age: 46, rating: 85, salaryWeekly: 0.09, personality: 'Youth Developer', avatar: '👩‍💼', minLeagueTier: 1, maxLeagueTier: 2 },
    { id: 'mgr-5', name: 'Roy Hodges', role: 'manager', age: 74, rating: 71, salaryWeekly: 0.03, personality: 'Conservative', avatar: '👴', minLeagueTier: 3, maxLeagueTier: 5 },
    { id: 'mgr-6', name: 'Danny McKenn', role: 'manager', age: 39, rating: 78, salaryWeekly: 0.06, personality: 'Youth Developer', avatar: '🏃', minLeagueTier: 2, maxLeagueTier: 3 },
    { id: 'mgr-7', name: 'Gavin O\'Reilly', role: 'manager', age: 44, rating: 67, salaryWeekly: 0.02, personality: 'Risk Taker', avatar: '🧢', minLeagueTier: 4, maxLeagueTier: 6 },
    { id: 'mgr-8', name: 'Arthur Penhaligon', role: 'manager', age: 61, rating: 60, salaryWeekly: 0.015, personality: 'Cost Cutter', avatar: '👞', minLeagueTier: 5, maxLeagueTier: 7 },

    // CEOS
    { id: 'ceo-1', name: 'Richard Green', role: 'ceo', age: 55, rating: 92, salaryWeekly: 0.08, personality: 'Commercial Genius', avatar: '📈', minLeagueTier: 1, maxLeagueTier: 2 },
    { id: 'ceo-2', name: 'Victoria Sterling', role: 'ceo', age: 49, rating: 84, salaryWeekly: 0.06, personality: 'Aggressive Builder', avatar: '💄', minLeagueTier: 1, maxLeagueTier: 2 },
    { id: 'ceo-3', name: 'Alan Price', role: 'ceo', age: 62, rating: 72, salaryWeekly: 0.03, personality: 'Cost Cutter', avatar: '💼', minLeagueTier: 3, maxLeagueTier: 5 },
    { id: 'ceo-4', name: 'Marcus Vander', role: 'ceo', age: 41, rating: 79, salaryWeekly: 0.045, personality: 'Risk Taker', avatar: '📱', minLeagueTier: 2, maxLeagueTier: 4 },
    { id: 'ceo-5', name: 'Sarah Jenkins', role: 'ceo', age: 38, rating: 68, salaryWeekly: 0.025, personality: 'Conservative', avatar: '💻', minLeagueTier: 4, maxLeagueTier: 6 },

    // SPORTING DIRECTORS
    { id: 'sd-1', name: 'Ralf Ragnor', role: 'sporting_director', age: 63, rating: 91, salaryWeekly: 0.07, personality: 'Youth Developer', avatar: '👓', minLeagueTier: 1, maxLeagueTier: 2 },
    { id: 'sd-2', name: 'Monchi De Silla', role: 'sporting_director', age: 53, rating: 86, salaryWeekly: 0.05, personality: 'Transfer Specialist', avatar: '🔍', minLeagueTier: 1, maxLeagueTier: 2 },
    { id: 'sd-3', name: 'Steve Walshy', role: 'sporting_director', age: 59, rating: 76, salaryWeekly: 0.03, personality: 'Underdog Scout', avatar: '🗺️', minLeagueTier: 2, maxLeagueTier: 4 },
    { id: 'sd-4', name: 'Laura Martinez', role: 'sporting_director', age: 45, rating: 81, salaryWeekly: 0.04, personality: 'Commercial Genius', avatar: '📊', minLeagueTier: 1, maxLeagueTier: 3 },
    { id: 'sd-5', name: 'Tobias Lind', role: 'sporting_director', age: 35, rating: 70, salaryWeekly: 0.02, personality: 'Cost Cutter', avatar: '🧪', minLeagueTier: 4, maxLeagueTier: 6 },
  ];

  const leagues: League[] = [
    {
      id: 'l-premier',
      name: 'Premier Championship',
      tier: 1,
      country: 'England',
      teamsCount: 4,
      tvDealWeeklyPayout: 0.8, // £0.8M per week
      prestige: 95,
      standings: [],
      fixtures: [],
      history: [
        { year: 2025, winnerId: 'c-manc-tycoons', winnerName: 'Manchester Tycoons', runnerUpId: 'c-london-gunners', runnerUpName: 'London Gunners' }
      ]
    },
    {
      id: 'l-championship',
      name: 'Elite Division',
      tier: 2,
      country: 'England',
      teamsCount: 4,
      tvDealWeeklyPayout: 0.35, // £0.35M per week
      prestige: 75,
      standings: [],
      fixtures: [],
      history: [
        { year: 2025, winnerId: 'c-birmingham-blues', winnerName: 'Birmingham Blues', runnerUpId: 'c-sheffield-owls', runnerUpName: 'Sheffield Owls' }
      ]
    },
    {
      id: 'l-league-one',
      name: 'National League One',
      tier: 3,
      country: 'England',
      teamsCount: 4,
      tvDealWeeklyPayout: 0.12, // £0.12M per week
      prestige: 55,
      standings: [],
      fixtures: [],
      history: [
        { year: 2025, winnerId: 'c-portsmouth-blue', winnerName: 'Portsmouth Blue', runnerUpId: 'c-derby-rams', runnerUpName: 'Derby Rams' }
      ]
    },
    {
      id: 'l-league-two',
      name: 'National League Two',
      tier: 4,
      country: 'England',
      teamsCount: 4,
      tvDealWeeklyPayout: 0.04, // £0.04M per week
      prestige: 35,
      standings: [],
      fixtures: [],
      history: [
        { year: 2025, winnerId: 'c-wrexham-dragons', winnerName: 'Wrexham Dragons', runnerUpId: 'c-salford-city', runnerUpName: 'Salford City' }
      ]
    }
  ];

  const clubs: Club[] = [
    // TIER 1 CLUBS
    {
      id: 'c-man-tycoons',
      name: 'Manchester Tycoons',
      shortName: 'MNY',
      colorPrimary: 'sky',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-premier',
      valuation: 1250, // £1.25B
      cash: 85,
      debt: 120,
      interestRate: 0.045,
      wageBillWeekly: 4.8,
      fanbaseSize: 4200000,
      stadiumName: 'Etihad Oval',
      stadiumCapacity: 55000,
      stadiumLevel: 4,
      trainingFacilitiesLevel: 5,
      youthFacilitiesLevel: 5,
      academyQuality: 90,
      squadQuality: 92,
      reputation: 94,
      sponsorName: 'Crown Airlines',
      sponsorIncomeWeekly: 1.1,
      sponsorYearsLeft: 4,
      ticketPrice: 65,
      seasonTicketPrice: 950,
      seasonTicketsSold: 38000,
      managerId: 'mgr-2', // Pep Santis
      ceoId: 'ceo-1', // Richard Green
      sportingDirectorId: 'sd-2', // Monchi
      history: [
        { year: 2025, leaguePosition: 1, leagueName: 'Premier Championship', revenue: 640, profit: 35, valuation: 1200 }
      ],
      boardObjective: {
        type: 'promotion', // Or title in tier 1
        description: 'Win the Premier Championship title',
        targetProgress: 1,
        targetGoal: 1,
        rewardWealth: 15.0,
        penaltyRep: 12
      },
      transferBudget: 45.0
    },
    {
      id: 'c-london-gunners',
      name: 'London Gunners',
      shortName: 'GUN',
      colorPrimary: 'red',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-premier',
      valuation: 980,
      cash: 62,
      debt: 180,
      interestRate: 0.04,
      wageBillWeekly: 3.8,
      fanbaseSize: 3800000,
      stadiumName: 'Emirates Stadium',
      stadiumCapacity: 60000,
      stadiumLevel: 5,
      trainingFacilitiesLevel: 5,
      youthFacilitiesLevel: 4,
      academyQuality: 85,
      squadQuality: 88,
      reputation: 89,
      sponsorName: 'Aero Sport',
      sponsorIncomeWeekly: 0.9,
      sponsorYearsLeft: 2,
      ticketPrice: 70,
      seasonTicketPrice: 1050,
      seasonTicketsSold: 42000,
      managerId: 'mgr-1', // Jose Cardono
      ceoId: 'ceo-2', // Victoria Sterling
      sportingDirectorId: 'sd-1', // Ralf Ragnor
      history: [
        { year: 2025, leaguePosition: 2, leagueName: 'Premier Championship', revenue: 510, profit: 22, valuation: 940 }
      ],
      boardObjective: {
        type: 'mid_table', // or top 4
        description: 'Secure a top 2 finish',
        targetProgress: 2,
        targetGoal: 2,
        rewardWealth: 8.0,
        penaltyRep: 8
      },
      transferBudget: 30.0
    },
    {
      id: 'c-merseyside-giants',
      name: 'Merseyside Giants',
      shortName: 'MER',
      colorPrimary: 'rose',
      colorSecondary: 'red',
      country: 'England',
      leagueId: 'l-premier',
      valuation: 1050,
      cash: 40,
      debt: 90,
      interestRate: 0.05,
      wageBillWeekly: 4.2,
      fanbaseSize: 4500000,
      stadiumName: 'Anfield Gates',
      stadiumCapacity: 54000,
      stadiumLevel: 4,
      trainingFacilitiesLevel: 4,
      youthFacilitiesLevel: 4,
      academyQuality: 82,
      squadQuality: 89,
      reputation: 91,
      sponsorName: 'Global Mutual',
      sponsorIncomeWeekly: 1.0,
      sponsorYearsLeft: 3,
      ticketPrice: 60,
      seasonTicketPrice: 880,
      seasonTicketsSold: 36000,
      managerId: 'mgr-4', // Emma Hayes
      ceoId: 'ceo-4', // Marcus Vander
      sportingDirectorId: 'sd-4', // Laura Martinez
      history: [
        { year: 2025, leaguePosition: 3, leagueName: 'Premier Championship', revenue: 550, profit: 12, valuation: 1020 }
      ],
      boardObjective: {
        type: 'mid_table',
        description: 'Secure a top 3 finish',
        targetProgress: 3,
        targetGoal: 3,
        rewardWealth: 7.5,
        penaltyRep: 10
      },
      transferBudget: 25.0
    },
    {
      id: 'c-london-pensioners',
      name: 'London Pensioners',
      shortName: 'PEN',
      colorPrimary: 'blue',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-premier',
      valuation: 890,
      cash: 110, // Massive cash but high debt
      debt: 350,
      interestRate: 0.06,
      wageBillWeekly: 4.0,
      fanbaseSize: 3100000,
      stadiumName: 'Stamford Bridge',
      stadiumCapacity: 41000,
      stadiumLevel: 3,
      trainingFacilitiesLevel: 5,
      youthFacilitiesLevel: 5,
      academyQuality: 92,
      squadQuality: 85,
      reputation: 87,
      sponsorName: 'GoldBet',
      sponsorIncomeWeekly: 0.85,
      sponsorYearsLeft: 1,
      ticketPrice: 68,
      seasonTicketPrice: 920,
      seasonTicketsSold: 28000,
      managerId: 'mgr-6', // Danny McKenn
      ceoId: 'ceo-3', // Alan Price
      sportingDirectorId: 'sd-5', // Tobias Lind
      history: [
        { year: 2025, leaguePosition: 4, leagueName: 'Premier Championship', revenue: 470, profit: -45, valuation: 920 }
      ],
      boardObjective: {
        type: 'make_profit',
        description: 'Reduce weekly wage bill and balance budget',
        targetProgress: 4.0, // current wage bill
        targetGoal: 3.5, // target wage bill
        rewardWealth: 5.0,
        penaltyRep: 5
      },
      transferBudget: 50.0
    },

    // TIER 2 CLUBS (ELITE DIVISION)
    {
      id: 'c-birmingham-blues',
      name: 'Birmingham Blues',
      shortName: 'BCB',
      colorPrimary: 'indigo',
      colorSecondary: 'yellow',
      country: 'England',
      leagueId: 'l-championship',
      valuation: 145,
      cash: 12,
      debt: 45,
      interestRate: 0.055,
      wageBillWeekly: 0.95,
      fanbaseSize: 650000,
      stadiumName: 'St Andrews Road',
      stadiumCapacity: 29000,
      stadiumLevel: 2,
      trainingFacilitiesLevel: 3,
      youthFacilitiesLevel: 3,
      academyQuality: 70,
      squadQuality: 71,
      reputation: 68,
      sponsorName: 'Apex Telecom',
      sponsorIncomeWeekly: 0.22,
      sponsorYearsLeft: 2,
      ticketPrice: 35,
      seasonTicketPrice: 480,
      seasonTicketsSold: 18000,
      managerId: 'mgr-3', // Sean Dikes
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 1, leagueName: 'Elite Division', revenue: 75, profit: 4, valuation: 140 }
      ],
      boardObjective: {
        type: 'promotion',
        description: 'Earn promotion to the Premier Championship',
        targetProgress: 1,
        targetGoal: 1,
        rewardWealth: 4.0,
        penaltyRep: 6
      },
      transferBudget: 4.5
    },
    {
      id: 'c-sheffield-owls',
      name: 'Sheffield Owls',
      shortName: 'SHW',
      colorPrimary: 'blue',
      colorSecondary: 'slate',
      country: 'England',
      leagueId: 'l-championship',
      valuation: 120,
      cash: 6,
      debt: 38,
      interestRate: 0.06,
      wageBillWeekly: 0.8,
      fanbaseSize: 580000,
      stadiumName: 'Hillsborough Field',
      stadiumCapacity: 34000,
      stadiumLevel: 3,
      trainingFacilitiesLevel: 2,
      youthFacilitiesLevel: 3,
      academyQuality: 65,
      squadQuality: 69,
      reputation: 66,
      sponsorName: 'Steel Corp',
      sponsorIncomeWeekly: 0.18,
      sponsorYearsLeft: 1,
      ticketPrice: 32,
      seasonTicketPrice: 420,
      seasonTicketsSold: 16000,
      managerId: 'mgr-5', // Roy Hodges
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 2, leagueName: 'Elite Division', revenue: 62, profit: 2, valuation: 115 }
      ],
      boardObjective: {
        type: 'mid_table',
        description: 'Secure a solid top-half finish (top 2)',
        targetProgress: 2,
        targetGoal: 2,
        rewardWealth: 2.0,
        penaltyRep: 4
      },
      transferBudget: 2.2
    },
    {
      id: 'c-leeds-united',
      name: 'Leeds Athletic',
      shortName: 'LDS',
      colorPrimary: 'amber',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-championship',
      valuation: 165,
      cash: 8,
      debt: 55,
      interestRate: 0.05,
      wageBillWeekly: 1.1,
      fanbaseSize: 850000,
      stadiumName: 'Elland Park',
      stadiumCapacity: 37000,
      stadiumLevel: 3,
      trainingFacilitiesLevel: 4,
      youthFacilitiesLevel: 3,
      academyQuality: 74,
      squadQuality: 73,
      reputation: 72,
      sponsorName: 'Yorkshire Brew',
      sponsorIncomeWeekly: 0.25,
      sponsorYearsLeft: 3,
      ticketPrice: 38,
      seasonTicketPrice: 520,
      seasonTicketsSold: 22000,
      managerId: null,
      ceoId: null,
      sportingDirectorId: 'sd-3', // Steve Walshy
      history: [
        { year: 2025, leaguePosition: 3, leagueName: 'Elite Division', revenue: 84, profit: -8, valuation: 160 }
      ],
      boardObjective: {
        type: 'promotion',
        description: 'Achieve automatic promotion to Premier division',
        targetProgress: 3,
        targetGoal: 1,
        rewardWealth: 5.5,
        penaltyRep: 8
      },
      transferBudget: 5.0
    },
    {
      id: 'c-west-brom',
      name: 'West Bromwich Albion',
      shortName: 'WBA',
      colorPrimary: 'navy',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-championship',
      valuation: 95,
      cash: 4,
      debt: 22,
      interestRate: 0.05,
      wageBillWeekly: 0.65,
      fanbaseSize: 450000,
      stadiumName: 'The Hawthorns',
      stadiumCapacity: 26000,
      stadiumLevel: 2,
      trainingFacilitiesLevel: 3,
      youthFacilitiesLevel: 2,
      academyQuality: 62,
      squadQuality: 65,
      reputation: 63,
      sponsorName: 'Midland Auto',
      sponsorIncomeWeekly: 0.15,
      sponsorYearsLeft: 2,
      ticketPrice: 30,
      seasonTicketPrice: 390,
      seasonTicketsSold: 14000,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 4, leagueName: 'Elite Division', revenue: 48, profit: 1.5, valuation: 92 }
      ],
      boardObjective: {
        type: 'avoid_relegation',
        description: 'Avoid finishing in bottom place (maintain division)',
        targetProgress: 4,
        targetGoal: 3,
        rewardWealth: 1.5,
        penaltyRep: 5
      },
      transferBudget: 1.5
    },

    // TIER 3 CLUBS (NATIONAL DIVISION ONE)
    {
      id: 'c-portsmouth-blue',
      name: 'Portsmouth South',
      shortName: 'POM',
      colorPrimary: 'blue',
      colorSecondary: 'red',
      country: 'England',
      leagueId: 'l-league-one',
      valuation: 42,
      cash: 2.2,
      debt: 12,
      interestRate: 0.065,
      wageBillWeekly: 0.28,
      fanbaseSize: 280000,
      stadiumName: 'Fratton Field',
      stadiumCapacity: 20000,
      stadiumLevel: 2,
      trainingFacilitiesLevel: 2,
      youthFacilitiesLevel: 2,
      academyQuality: 55,
      squadQuality: 54,
      reputation: 52,
      sponsorName: 'Port Logistics',
      sponsorIncomeWeekly: 0.07,
      sponsorYearsLeft: 1,
      ticketPrice: 24,
      seasonTicketPrice: 280,
      seasonTicketsSold: 11000,
      managerId: 'mgr-7', // Gavin
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 1, leagueName: 'National League One', revenue: 18, profit: 0.8, valuation: 40 }
      ],
      boardObjective: {
        type: 'promotion',
        description: 'Gain promotion to Elite Division',
        targetProgress: 1,
        targetGoal: 1,
        rewardWealth: 1.8,
        penaltyRep: 4
      },
      transferBudget: 0.8
    },
    {
      id: 'c-bristol-red',
      name: 'Bristol Red',
      shortName: 'BRR',
      colorPrimary: 'red',
      colorSecondary: 'slate',
      country: 'England',
      leagueId: 'l-league-one',
      valuation: 35,
      cash: 1.5,
      debt: 8,
      interestRate: 0.06,
      wageBillWeekly: 0.22,
      fanbaseSize: 220000,
      stadiumName: 'Ashton Park',
      stadiumCapacity: 22000,
      stadiumLevel: 2,
      trainingFacilitiesLevel: 2,
      youthFacilitiesLevel: 2,
      academyQuality: 52,
      squadQuality: 50,
      reputation: 49,
      sponsorName: 'Avon Bridge Co',
      sponsorIncomeWeekly: 0.05,
      sponsorYearsLeft: 2,
      ticketPrice: 22,
      seasonTicketPrice: 250,
      seasonTicketsSold: 9000,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 2, leagueName: 'National League One', revenue: 14, profit: 0.4, valuation: 33 }
      ],
      boardObjective: {
        type: 'mid_table',
        description: 'Target a top 2 finish',
        targetProgress: 2,
        targetGoal: 2,
        rewardWealth: 1.2,
        penaltyRep: 3
      },
      transferBudget: 0.5
    },
    {
      id: 'c-derby-rams',
      name: 'Derby Rams',
      shortName: 'DER',
      colorPrimary: 'slate',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-league-one',
      valuation: 39,
      cash: 1.8,
      debt: 15,
      interestRate: 0.07,
      wageBillWeekly: 0.25,
      fanbaseSize: 250000,
      stadiumName: 'Pride Meadow',
      stadiumCapacity: 30000,
      stadiumLevel: 3,
      trainingFacilitiesLevel: 2,
      youthFacilitiesLevel: 2,
      academyQuality: 58,
      squadQuality: 52,
      reputation: 51,
      sponsorName: 'Rams Brewery',
      sponsorIncomeWeekly: 0.06,
      sponsorYearsLeft: 3,
      ticketPrice: 25,
      seasonTicketPrice: 300,
      seasonTicketsSold: 12000,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 3, leagueName: 'National League One', revenue: 16, profit: -1.2, valuation: 38 }
      ],
      boardObjective: {
        type: 'promotion',
        description: 'Win the league or earn promotion',
        targetProgress: 3,
        targetGoal: 1,
        rewardWealth: 2.0,
        penaltyRep: 4
      },
      transferBudget: 0.6
    },
    {
      id: 'c-plymouth-greens',
      name: 'Plymouth Greens',
      shortName: 'PLY',
      colorPrimary: 'emerald',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-league-one',
      valuation: 28,
      cash: 1.0,
      debt: 4,
      interestRate: 0.06,
      wageBillWeekly: 0.18,
      fanbaseSize: 180000,
      stadiumName: 'Home Park Lane',
      stadiumCapacity: 17000,
      stadiumLevel: 1,
      trainingFacilitiesLevel: 1,
      youthFacilitiesLevel: 1,
      academyQuality: 48,
      squadQuality: 47,
      reputation: 46,
      sponsorName: 'Devon Pasties',
      sponsorIncomeWeekly: 0.04,
      sponsorYearsLeft: 2,
      ticketPrice: 20,
      seasonTicketPrice: 240,
      seasonTicketsSold: 7500,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 4, leagueName: 'National League One', revenue: 11, profit: 0.1, valuation: 27 }
      ],
      boardObjective: {
        type: 'avoid_relegation',
        description: 'Maintain standing in Division One',
        targetProgress: 4,
        targetGoal: 3,
        rewardWealth: 0.8,
        penaltyRep: 3
      },
      transferBudget: 0.3
    },

    // TIER 4 CLUBS (NATIONAL DIVISION TWO)
    {
      id: 'c-wrexham-dragons',
      name: 'Wrexham Dragons',
      shortName: 'WRE',
      colorPrimary: 'red',
      colorSecondary: 'emerald',
      country: 'England',
      leagueId: 'l-league-two',
      valuation: 18.5,
      cash: 3.5, // High cash due to Hollywood ownership
      debt: 1.2,
      interestRate: 0.05,
      wageBillWeekly: 0.12,
      fanbaseSize: 140000,
      stadiumName: 'The Racecourse Field',
      stadiumCapacity: 12000,
      stadiumLevel: 2,
      trainingFacilitiesLevel: 2,
      youthFacilitiesLevel: 2,
      academyQuality: 45,
      squadQuality: 45,
      reputation: 42,
      sponsorName: 'Aero Travel',
      sponsorIncomeWeekly: 0.035,
      sponsorYearsLeft: 3,
      ticketPrice: 18,
      seasonTicketPrice: 210,
      seasonTicketsSold: 5500,
      managerId: 'mgr-8', // Arthur
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 1, leagueName: 'National League Two', revenue: 7.5, profit: 0.9, valuation: 17.0 }
      ],
      boardObjective: {
        type: 'promotion',
        description: 'Acquire promotion to National Division One',
        targetProgress: 1,
        targetGoal: 1,
        rewardWealth: 1.0,
        penaltyRep: 3
      },
      transferBudget: 0.9
    },
    {
      id: 'c-harrogate-town',
      name: 'Harrogate Miners',
      shortName: 'HAR',
      colorPrimary: 'amber',
      colorSecondary: 'black',
      country: 'England',
      leagueId: 'l-league-two',
      valuation: 8.2,
      cash: 0.6,
      debt: 1.8,
      interestRate: 0.075,
      wageBillWeekly: 0.065,
      fanbaseSize: 45000,
      stadiumName: 'EnviroVent Ground',
      stadiumCapacity: 5000,
      stadiumLevel: 1,
      trainingFacilitiesLevel: 1,
      youthFacilitiesLevel: 1,
      academyQuality: 35,
      squadQuality: 33,
      reputation: 30,
      sponsorName: 'Yorkshire Spa',
      sponsorIncomeWeekly: 0.015,
      sponsorYearsLeft: 1,
      ticketPrice: 15,
      seasonTicketPrice: 180,
      seasonTicketsSold: 22000,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 2, leagueName: 'National League Two', revenue: 3.2, profit: 0.1, valuation: 8.0 }
      ],
      boardObjective: {
        type: 'avoid_relegation',
        description: 'Survive in the league hierarchy',
        targetProgress: 2,
        targetGoal: 3,
        rewardWealth: 0.5,
        penaltyRep: 2
      },
      transferBudget: 0.12
    },
    {
      id: 'c-salford-city',
      name: 'Salford Peninsula',
      shortName: 'SAL',
      colorPrimary: 'red',
      colorSecondary: 'white',
      country: 'England',
      leagueId: 'l-league-two',
      valuation: 11.2,
      cash: 1.2,
      debt: 3.2,
      interestRate: 0.07,
      wageBillWeekly: 0.085,
      fanbaseSize: 65000,
      stadiumName: 'Peninsula Stadium',
      stadiumCapacity: 5100,
      stadiumLevel: 1,
      trainingFacilitiesLevel: 1,
      youthFacilitiesLevel: 2,
      academyQuality: 40,
      squadQuality: 38,
      reputation: 34,
      sponsorName: 'Manchester Finance',
      sponsorIncomeWeekly: 0.022,
      sponsorYearsLeft: 2,
      ticketPrice: 16,
      seasonTicketPrice: 190,
      seasonTicketsSold: 2800,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 3, leagueName: 'National League Two', revenue: 4.1, profit: -0.3, valuation: 10.8 }
      ],
      boardObjective: {
        type: 'promotion',
        description: 'Gain promotion to National Division One',
        targetProgress: 3,
        targetGoal: 1,
        rewardWealth: 0.8,
        penaltyRep: 3
      },
      transferBudget: 0.25
    },
    {
      id: 'c-notts-magpies',
      name: 'Nottingham Magpies',
      shortName: 'NOT',
      colorPrimary: 'slate',
      colorSecondary: 'black',
      country: 'England',
      leagueId: 'l-league-two',
      valuation: 9.8,
      cash: 0.8,
      debt: 2.5,
      interestRate: 0.065,
      wageBillWeekly: 0.075,
      fanbaseSize: 95000,
      stadiumName: 'Meadow Lane Ground',
      stadiumCapacity: 19500,
      stadiumLevel: 2,
      trainingFacilitiesLevel: 1,
      youthFacilitiesLevel: 1,
      academyQuality: 38,
      squadQuality: 36,
      reputation: 36,
      sponsorName: 'Magpie Energy',
      sponsorIncomeWeekly: 0.018,
      sponsorYearsLeft: 1,
      ticketPrice: 17,
      seasonTicketPrice: 200,
      seasonTicketsSold: 4200,
      managerId: null,
      ceoId: null,
      sportingDirectorId: null,
      history: [
        { year: 2025, leaguePosition: 4, leagueName: 'National League Two', revenue: 3.8, profit: -0.05, valuation: 9.5 }
      ],
      boardObjective: {
        type: 'mid_table',
        description: 'Secure a top 2 finish and establish stability',
        targetProgress: 4,
        targetGoal: 2,
        rewardWealth: 0.6,
        penaltyRep: 2
      },
      transferBudget: 0.18
    }
  ];

  const sponsors = [
    { name: 'Crown Airlines', baseIncomeWeekly: 1.0, tierMin: 1 },
    { name: 'Global Mutual', baseIncomeWeekly: 0.9, tierMin: 1 },
    { name: 'Aero Sport', baseIncomeWeekly: 0.8, tierMin: 1 },
    { name: 'GoldBet', baseIncomeWeekly: 0.75, tierMin: 1 },
    { name: 'Yorkshire Brew', baseIncomeWeekly: 0.25, tierMin: 2 },
    { name: 'Apex Telecom', baseIncomeWeekly: 0.2, tierMin: 2 },
    { name: 'Steel Corp', baseIncomeWeekly: 0.18, tierMin: 2 },
    { name: 'Midland Auto', baseIncomeWeekly: 0.15, tierMin: 2 },
    { name: 'Port Logistics', baseIncomeWeekly: 0.07, tierMin: 3 },
    { name: 'Avon Bridge Co', baseIncomeWeekly: 0.05, tierMin: 3 },
    { name: 'Rams Brewery', baseIncomeWeekly: 0.06, tierMin: 3 },
    { name: 'Devon Pasties', baseIncomeWeekly: 0.04, tierMin: 3 },
    { name: 'Aero Travel', baseIncomeWeekly: 0.035, tierMin: 4 },
    { name: 'Yorkshire Spa', baseIncomeWeekly: 0.015, tierMin: 4 },
    { name: 'Manchester Finance', baseIncomeWeekly: 0.022, tierMin: 4 },
    { name: 'Magpie Energy', baseIncomeWeekly: 0.018, tierMin: 4 },
  ];

  // Set up initial standings and fixtures for leagues
  leagues.forEach((league) => {
    const leagueClubs = clubs.filter((c) => c.leagueId === league.id);
    
    // Initial Standings
    league.standings = leagueClubs.map((club) => ({
      clubId: club.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
    }));

    // Generate Double Round Robin Fixtures (6 weeks of matches for 4 clubs)
    // For 4 clubs: A, B, C, D
    // Week 1: A-B, C-D
    // Week 2: B-C, D-A
    // Week 3: A-C, B-D
    // Week 4: B-A, D-C (reversed)
    // Week 5: C-B, A-D (reversed)
    // Week 6: C-A, D-B (reversed)
    const ids = leagueClubs.map((c) => c.id);
    if (ids.length === 4) {
      const schedule = [
        [ [ids[0], ids[1]], [ids[2], ids[3]] ], // week 1
        [ [ids[1], ids[2]], [ids[3], ids[0]] ], // week 2
        [ [ids[0], ids[3]], [ids[1], ids[2]] ], // week 3 (Wait, A-D and B-C, let's look: week 3 was A-C, B-D)
      ];

      // Let's explicitly build 6 weeks of fixtures
      const f1: Match = { week: 1, homeClubId: ids[0], awayClubId: ids[1], simulated: false };
      const f2: Match = { week: 1, homeClubId: ids[2], awayClubId: ids[3], simulated: false };

      const f3: Match = { week: 2, homeClubId: ids[1], awayClubId: ids[2], simulated: false };
      const f4: Match = { week: 2, homeClubId: ids[3], awayClubId: ids[0], simulated: false };

      const f5: Match = { week: 3, homeClubId: ids[0], awayClubId: ids[2], simulated: false };
      const f6: Match = { week: 3, homeClubId: ids[1], awayClubId: ids[3], simulated: false };

      // Reversed fixtures
      const f7: Match = { week: 4, homeClubId: ids[1], awayClubId: ids[0], simulated: false };
      const f8: Match = { week: 4, homeClubId: ids[3], awayClubId: ids[2], simulated: false };

      const f9: Match = { week: 5, homeClubId: ids[2], awayClubId: ids[1], simulated: false };
      const f10: Match = { week: 5, homeClubId: ids[0], awayClubId: ids[3], simulated: false };

      const f11: Match = { week: 6, homeClubId: ids[2], awayClubId: ids[0], simulated: false };
      const f12: Match = { week: 6, homeClubId: ids[3], awayClubId: ids[1], simulated: false };

      league.fixtures = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12];
    }
  });

  // Dynamically assign revenueLastYear and profitLastYear to ensure exact type conformity
  clubs.forEach((c) => {
    c.revenueLastYear = c.revenueLastYear || Math.round(c.valuation * 0.45 * 10) / 10;
    c.profitLastYear = c.profitLastYear || Math.round(c.valuation * 0.05 * 10) / 10;
  });

  return {
    id: DEFAULT_DATABASE_ID,
    name: 'Official English Structure',
    description: 'The standard English football tiers with realistic financials, facilities, and dynamic AI owners.',
    version: '1.0.0',
    author: 'Football Club Empire',
    isOfficial: true,
    clubs,
    leagues,
    availableStaff: staff,
    sponsors,
  };
};
