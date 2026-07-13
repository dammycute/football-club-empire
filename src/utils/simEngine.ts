import { GameState, Club, League, Match, StandingEntry, InboxMessage, EventLog, Staff, TakeoverOffer, ClubMarketListing } from '../types/game';

// Helper to generate a random number within range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate UUID for inbox/takeover/events
const makeId = () => Math.random().toString(36).substring(2, 11);

// Standard names for takeover bidders
const BUYER_NAMES = [
  'Zeta Capital Partners', 'Sheikh Al-Hamad', 'Texas Sport Consortium', 
  'Redwood Sports Group', 'Hans Schmidt & Co', 'Knight Equity', 
  'Tokyo Media Group', 'Vanderbilt Holdings'
];

// Commentaries for goals
const GOAL_COMMENTARIES = [
  "Stunning long-range strike from the star midfielder!",
  "A clinical header from a beautifully delivered corner kick.",
  "Tapped in easily after a defense-splitting pass through the center.",
  "An absolute screamer into the top corner, leaving the goalkeeper hopeless!",
  "A scrambled tap-in following a chaotic goalmouth scramble.",
  "Pounced on a loose backpass and coolly slotted it past the keeper.",
  "A brilliantly taken penalty kick, firing low into the bottom corner."
];

// Commentaries for misses/saves
const MISS_COMMENTARIES = [
  "Hits the crossbar! So close to opening the score.",
  "An outstanding diving finger-tip save by the goalkeeper!",
  "Slices it wide of the post from point-blank range.",
  "The referee waves away a penalty appeal after a tackle in the box.",
  "Brilliant goal-line clearance saves a certain goal!",
  "Smashes it high over the crossbar into the stands."
];

// Simulate a match between home and away team
export function simulateMatch(home: Club, away: Club, homeManager: Staff | null, awayManager: Staff | null, week: number): { homeScore: number; awayScore: number; events: string[] } {
  // Base strength calculations
  const homeSquad = home.squadQuality;
  const awaySquad = away.squadQuality;

  const homeMgrRating = homeManager ? homeManager.rating : 50;
  const awayMgrRating = awayManager ? awayManager.rating : 50;

  // Home advantage boost
  const homeAdvantage = 4.5;

  // Total rating calculation
  const homeRating = (homeSquad * 0.75) + (homeMgrRating * 0.20) + (home.trainingFacilitiesLevel * 1) + homeAdvantage;
  const awayRating = (awaySquad * 0.75) + (awayMgrRating * 0.20) + (away.trainingFacilitiesLevel * 1);

  // Ratio of strength
  const total = homeRating + awayRating;
  const homeProb = homeRating / total; // e.g. 0.55 vs 0.45

  // Expected goals (usually 1 to 4)
  const baseMatchIntensity = randomRange(1.8, 3.8); // Total expected goals in the match
  
  // Calculate raw goals using poisson-like distribution
  let homeScore = 0;
  let awayScore = 0;
  const events: string[] = [];

  // Simulate up to 6 key attacks in the game
  const attacksCount = randomInt(4, 7);
  for (let i = 0; i < attacksCount; i++) {
    const isHomeAttack = Math.random() < homeProb;
    const time = randomInt(Math.max(1, i * 15), Math.min(90, (i + 1) * 15));
    
    // Prob of scoring a key attack is based on squad quality / 100
    const scoreProb = isHomeAttack ? (homeSquad / 150) + 0.15 : (awaySquad / 150) + 0.15;
    
    if (Math.random() < scoreProb) {
      if (isHomeAttack) {
        homeScore++;
        const comment = GOAL_COMMENTARIES[randomInt(0, GOAL_COMMENTARIES.length - 1)];
        events.push(`[${time}'] GOAL! ${home.name} scores! ${comment}`);
      } else {
        awayScore++;
        const comment = GOAL_COMMENTARIES[randomInt(0, GOAL_COMMENTARIES.length - 1)];
        events.push(`[${time}'] GOAL! ${away.name} scores! ${comment}`);
      }
    } else {
      if (Math.random() < 0.4) {
        const teamName = isHomeAttack ? home.name : away.name;
        const comment = MISS_COMMENTARIES[randomInt(0, MISS_COMMENTARIES.length - 1)];
        events.push(`[${time}'] Attempt! ${teamName}: ${comment}`);
      }
    }
  }

  if (events.length === 0) {
    events.push("0' Kickoff! Both teams sizing each other up early.");
    events.push("45' Half-Time: Tactical battle with few clear-cut chances.");
    events.push("90' Full-Time: A closely contested tactical stalemate.");
  } else {
    events.unshift("0' Kick-off! The stadium is packed and roaring with excitement.");
    events.push(`90' Full-Time. The final whistle blows: ${home.name} ${homeScore} - ${awayScore} ${away.name}`);
  }

  return { homeScore, awayScore, events };
}

// Calculate the market valuation of a club dynamically based on stats
export function calculateValuation(club: Club, leaguePrestige: number): number {
  // Stadium value: £1,200 per seat + £3M per level upgrade
  const stadiumVal = (club.stadiumCapacity * 0.0012) + (club.stadiumLevel * 3.5);
  
  // Facilities value: £4M per upgrade level
  const facilitiesVal = (club.trainingFacilitiesLevel * 4.5) + (club.youthFacilitiesLevel * 4.5);
  
  // Brand / Fanbase value: £12 per fan, adjusted by club reputation
  const brandVal = (club.fanbaseSize * 0.000015) * (club.reputation / 100);
  
  // Squad value: £2.5M per unit of squad quality
  const squadVal = club.squadQuality * 1.8;

  // Performance revenue base: revenue last year * league multiplier
  const revBase = club.revenueLastYear * (0.8 + (leaguePrestige / 100));

  // Combine and subtract debt, add cash
  let val = stadiumVal + facilitiesVal + brandVal + squadVal + revBase + club.cash - club.debt;
  
  // Ensure a positive floor
  if (val < 1.0) {
    val = 1.0;
  }

  // Rounded to 1 decimal place
  return Math.round(val * 10) / 10;
}

// Perform financial ticks for a single week
export function tickClubWeeklyFinances(club: Club, league: League, isHomeMatch: boolean, ceo: Staff | null): { 
  revenue: number; 
  expenses: number; 
  breakdown: {
    tickets: number;
    tv: number;
    sponsor: number;
    merch: number;
    wages: number;
    staff: number;
    facilities: number;
    interest: number;
  }
} {
  // --- REVENUE ---
  let ticketsRevenue = 0;
  if (isHomeMatch) {
    // Ticket revenue from home crowd
    const attendance = Math.min(club.stadiumCapacity, Math.floor(club.fanbaseSize * 0.05 * (club.reputation / 60)));
    // Season tickets are paid up-front but we amortize or calculate general walk-ins
    const walkIns = Math.max(0, attendance - club.seasonTicketsSold);
    ticketsRevenue = (walkIns * club.ticketPrice * 0.000001) + (club.seasonTicketsSold * (club.seasonTicketPrice / 19) * 0.000001); // 19 home games
  }

  // CEO Commercial boost
  const ceoMultiplier = ceo?.personality === 'Commercial Genius' ? 1.15 : (ceo?.personality === 'Cost Cutter' ? 0.95 : 1.0);
  ticketsRevenue *= ceoMultiplier;

  // TV deal payout weekly
  const tvRevenue = league.tvDealWeeklyPayout;

  // Weekly sponsor income
  const sponsorRevenue = club.sponsorIncomeWeekly * ceoMultiplier;

  // Merchandise revenue: based on fanbase size, squad quality, and rep
  let merchRevenue = (club.fanbaseSize * 0.015 * (club.reputation / 100) * (club.squadQuality / 100) * 12) / 52 * 0.000001; // £12 per fan per year amortized weekly
  merchRevenue *= ceoMultiplier;

  const totalRevenue = ticketsRevenue + tvRevenue + sponsorRevenue + merchRevenue;

  // --- EXPENSES ---
  // Players wage bill (weekly)
  let playerWages = club.wageBillWeekly;
  if (ceo?.personality === 'Cost Cutter') {
    playerWages *= 0.93; // 7% reduction in contracts
  }

  // Staff wages
  let staffWages = 0;
  // We assume club manager, ceo, and sporting director are paid weekly in Millions of £
  // Manager is around £50k/week = 0.05M
  // Let's check salaries in Staff (already in Millions of £)
  // Wait, in Staff we put Jose salary as 0.12M = £120k. This is perfect!
  const ceoSalary = ceo ? ceo.salaryWeekly : 0.01; // default fallback if no active hired CEO
  staffWages += ceoSalary;

  // Debt interest weekly (annual rate / 52)
  const interestExpense = (club.debt * club.interestRate) / 52;

  // Facilities maintenance (stadium capacity, training levels)
  const facilitiesMaintenance = (club.stadiumCapacity * 0.00002) + (club.trainingFacilitiesLevel * 0.015) + (club.youthFacilitiesLevel * 0.012);

  const totalExpenses = playerWages + staffWages + interestExpense + facilitiesMaintenance;

  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    breakdown: {
      tickets: Math.round(ticketsRevenue * 1000) / 1000,
      tv: Math.round(tvRevenue * 1000) / 1000,
      sponsor: Math.round(sponsorRevenue * 1000) / 1000,
      merch: Math.round(merchRevenue * 1000) / 1000,
      wages: Math.round(playerWages * 1000) / 1000,
      staff: Math.round(staffWages * 1000) / 1000,
      facilities: Math.round(facilitiesMaintenance * 1000) / 1000,
      interest: Math.round(interestExpense * 1000) / 1000,
    }
  };
}

// Generate double round-robin fixtures for 4 teams
export function generateFixturesForLeague(clubIds: string[]): Match[] {
  if (clubIds.length !== 4) return [];
  const ids = [...clubIds];
  
  // Double round robin (6 weeks)
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

  return [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12];
}

// Core simulation week tick
export function simulateWeek(state: GameState): GameState {
  if (state.isGameOver) return state;

  const currentWeek = state.player.currentWeek;
  const currentYear = state.player.currentYear;
  const db = state.databases[state.currentDatabaseId];
  if (!db) return state;

  // Create deep clones
  const clubs = [...db.clubs];
  const leagues = [...db.leagues];
  const staff = [...db.availableStaff];
  let playerWealth = state.player.personalWealth;
  let playerRep = state.player.reputation;
  let inbox = [...state.inbox];
  let events = [...state.events];
  let takeoverOffers = [...state.takeoverOffers];

  // Week Event Logs
  const weeklyNews: EventLog[] = [];

  // 1. Simulate Matchday for each league
  leagues.forEach((league) => {
    const weeklyMatches = league.fixtures.filter((f) => f.week === currentWeek && !f.simulated);
    
    weeklyMatches.forEach((match) => {
      const homeClub = clubs.find((c) => c.id === match.homeClubId);
      const awayClub = clubs.find((c) => c.id === match.awayClubId);

      if (homeClub && awayClub) {
        const homeMgr = staff.find((s) => s.id === homeClub.managerId) || null;
        const awayMgr = staff.find((s) => s.id === awayClub.managerId) || null;

        const result = simulateMatch(homeClub, awayClub, homeMgr, awayMgr, currentWeek);
        match.homeScore = result.homeScore;
        match.awayScore = result.awayScore;
        match.simulated = true;
        match.matchEvents = result.events;

        // Log to News if it involves the player's club
        if (homeClub.id === state.activeClubId || awayClub.id === state.activeClubId) {
          weeklyNews.push({
            id: makeId(),
            week: currentWeek,
            year: currentYear,
            title: `Match Result: ${homeClub.name} ${result.homeScore} - ${result.awayScore} ${awayClub.name}`,
            description: `A thrilling clash on matchday ${currentWeek}! Check detail log for key match moments.`,
            type: 'sporting'
          });
        }
      }
    });

    // Recompute standings
    const standings: StandingEntry[] = league.standings.map((s) => ({
      clubId: s.clubId,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0
    }));

    league.fixtures.forEach((match) => {
      if (match.simulated && match.homeScore !== undefined && match.awayScore !== undefined) {
        const homeEntry = standings.find((s) => s.clubId === match.homeClubId);
        const awayEntry = standings.find((s) => s.clubId === match.awayClubId);

        if (homeEntry && awayEntry) {
          homeEntry.played++;
          awayEntry.played++;
          homeEntry.gf += match.homeScore;
          homeEntry.ga += match.awayScore;
          awayEntry.gf += match.awayScore;
          awayEntry.ga += match.homeScore;

          if (match.homeScore > match.awayScore) {
            homeEntry.won++;
            homeEntry.points += 3;
            awayEntry.lost++;
          } else if (match.homeScore < match.awayScore) {
            awayEntry.won++;
            awayEntry.points += 3;
            homeEntry.lost++;
          } else {
            homeEntry.drawn++;
            awayEntry.drawn++;
            homeEntry.points += 1;
            awayEntry.points += 1;
          }
        }
      }
    });

    // Sort standings: points desc, goal diff desc, goals for desc
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.gf - a.ga;
      const diffB = b.gf - b.ga;
      if (diffB !== diffA) return diffB - diffA;
      return b.gf - a.gf;
    });

    league.standings = standings;
  });

  // 2. Weekly Financial Tick for ALL clubs
  clubs.forEach((club) => {
    const league = leagues.find((l) => l.id === club.leagueId);
    if (!league) return;

    // Is playing home this week?
    const homeMatch = league.fixtures.find((f) => f.week === currentWeek && f.homeClubId === club.id);
    const hasHomeMatch = !!homeMatch;

    const ceo = staff.find((s) => s.id === club.ceoId) || null;
    const mgr = staff.find((s) => s.id === club.managerId) || null;
    const sd = staff.find((s) => s.id === club.sportingDirectorId) || null;

    // Calculate finances
    const finances = tickClubWeeklyFinances(club, league, hasHomeMatch, ceo);
    
    // Add profits/losses to cash
    const profitWeekly = finances.revenue - finances.expenses;
    club.cash += profitWeekly;

    // Manager/Executive weekly developments (training facilities, youth skills grow)
    if (mgr?.personality === 'Youth Developer' && Math.random() < 0.12) {
      club.academyQuality = Math.min(100, club.academyQuality + 1);
    }
    if (mgr && Math.random() < 0.08) {
      // Squad quality grows slightly with highly-rated manager
      const change = mgr.rating > 80 ? 0.4 : (mgr.rating > 60 ? 0.2 : 0.1);
      club.squadQuality = Math.min(100, club.squadQuality + change);
    }

    // Handle stadium upgrades completion if queued (not fully modeled in types, but we'll run simple growth checks)
    // Reduce sponsor contracts year-end or check if sponsors expire
    // Valuation update
    club.valuation = calculateValuation(club, league.prestige);

    // If this is the players club, log financial statement
    if (club.id === state.activeClubId) {
      weeklyNews.push({
        id: makeId(),
        week: currentWeek,
        year: currentYear,
        title: `Financial Statement - Week ${currentWeek}`,
        description: `Revenue: £${finances.revenue.toFixed(3)}M | Expenses: £${finances.expenses.toFixed(3)}M | Net Weekly Profit: £${profitWeekly.toFixed(3)}M. Balance: £${club.cash.toFixed(2)}M.`,
        type: 'financial'
      });
    }
  });

  // 3. Takeover Offer updates and generations
  // Expire existing takeover offers
  takeoverOffers = takeoverOffers.map((offer) => ({
    ...offer,
    weeksRemaining: offer.weeksRemaining - 1
  })).filter((offer) => offer.weeksRemaining > 0);

  // Random chance of generating a takeover offer for player's owned club!
  if (state.activeClubId && takeoverOffers.length === 0 && Math.random() < 0.18) {
    const playerClub = clubs.find((c) => c.id === state.activeClubId);
    if (playerClub) {
      // Offer is between 105% and 125% of valuation
      const pct = randomRange(1.05, 1.25);
      const offerAmt = Math.round(playerClub.valuation * pct * 10) / 10;
      const bidder = BUYER_NAMES[randomInt(0, BUYER_NAMES.length - 1)];
      const motivation = "Consortium looking to capitalize on team's current growing profile.";
      
      const newOffer: TakeoverOffer = {
        id: makeId(),
        clubId: playerClub.id,
        buyerName: bidder,
        offerAmount: offerAmt,
        isHostile: false,
        weeksRemaining: 4,
        motivation
      };
      
      takeoverOffers.push(newOffer);

      // Send inbox message
      inbox.unshift({
        id: makeId(),
        week: currentWeek,
        year: currentYear,
        sender: bidder,
        senderRole: 'Lead Acquisition Representative',
        subject: `TAKEOVER OFFER: Initial Bid for ${playerClub.name}`,
        content: `Dear Chairman,\n\nWe are formally writing to submit a binding offer of £${offerAmt}M to purchase 100% of the shareholdings of ${playerClub.name}. Our research indicates the club is primed for commercial expansion under our holding group.\n\nThis offer is valid for the next 4 weeks. We await your response.\n\nBest regards,\n${bidder}`,
        actionType: 'takeover_offer',
        actionData: { offerId: newOffer.id, amount: offerAmt },
        read: false
      });
    }
  }

  // 4. Random events generation (approx 10% chance per week)
  if (Math.random() < 0.12 && state.activeClubId) {
    const activeClub = clubs.find((c) => c.id === state.activeClubId);
    if (activeClub) {
      const eventChance = Math.random();
      if (eventChance < 0.25) {
        // Academy Golden Generation
        activeClub.academyQuality = Math.min(100, activeClub.academyQuality + 15);
        activeClub.squadQuality = Math.min(100, activeClub.squadQuality + 4);
        weeklyNews.push({
          id: makeId(),
          week: currentWeek,
          year: currentYear,
          title: "Golden Generation Discovered!",
          description: `Our youth scouting network reports an outstanding batch of raw talent entering the club's academy. Academy Quality increased by +15!`,
          type: 'sporting'
        });
        inbox.unshift({
          id: makeId(),
          week: currentWeek,
          year: currentYear,
          sender: 'Head Academy Scout',
          senderRole: 'Youth Academy Director',
          subject: 'GOLDEN GENERATION: Scout Report',
          content: `Chairman,\n\nI am thrilled to report that our latest intake is the finest I've seen in a decade. Several players show first-team potential already. We've fast-tracked them to our main development ranks, immediately raising our overall training squad capability.`,
          read: false
        });
      } else if (eventChance < 0.5) {
        // Fan Protest over Ticket Prices
        if (activeClub.ticketPrice > 45) {
          activeClub.reputation = Math.max(10, activeClub.reputation - 12);
          activeClub.fanbaseSize = Math.max(1000, Math.floor(activeClub.fanbaseSize * 0.95));
          weeklyNews.push({
            id: makeId(),
            week: currentWeek,
            year: currentYear,
            title: "Fan Protest at the Stadium!",
            description: "Supporters groups organized a protest prior to kickoff over ticket pricing. Club reputation has taken a hit.",
            type: 'news'
          });
          inbox.unshift({
            id: makeId(),
            week: currentWeek,
            year: currentYear,
            sender: 'Supporters Trust Coordinator',
            senderRole: 'Fan Liaison Officer',
            subject: 'PROTEST NOTICE: Ticket Pricing Anger',
            content: `Chairman,\n\nSlamming fans with high pricing during a tight economy has crossed a line. Fans are organizing a boycott. We strongly recommend reducing ticket prices in the stadium settings immediately to regain support.`,
            read: false
          });
        } else {
          // Sponsor bonus
          const bonus = Math.round(activeClub.valuation * 0.05 * 10) / 10;
          activeClub.cash += bonus;
          weeklyNews.push({
            id: makeId(),
            week: currentWeek,
            year: currentYear,
            title: "Merchandise Sales Spike!",
            description: `A viral social media trend featuring our club crest has caused replica kit sales to skyrocket. Earned £${bonus}M!`,
            type: 'financial'
          });
        }
      } else if (eventChance < 0.75) {
        // Manager resignation / Distressed
        const mgr = staff.find((s) => s.id === activeClub.managerId);
        if (mgr && mgr.rating > 80 && Math.random() < 0.5) {
          // Reluctance / demand budget
          inbox.unshift({
            id: makeId(),
            week: currentWeek,
            year: currentYear,
            sender: mgr.name,
            senderRole: 'Head Coach',
            subject: 'Squad Investment Needed!',
            content: `Chairman,\n\nI am frustrated by our lack of squad depth. To keep performing, I need an immediate approval of transfer and wage budgets. If we cannot compete, I may have to look at options elsewhere.`,
            actionType: 'simple',
            read: false
          });
        } else {
          // Loan Interest rates surge
          if (activeClub.debt > 10) {
            activeClub.interestRate = Math.min(0.12, activeClub.interestRate + 0.015);
            weeklyNews.push({
              id: makeId(),
              week: currentWeek,
              year: currentYear,
              title: "Refinancing Interest Surge!",
              description: "Central bank interest rate hikes have immediately raised our commercial debt repayment burdens. Restructure recommended.",
              type: 'financial'
            });
          }
        }
      } else {
        // Sponsor Bankruptcy
        const originalIncome = activeClub.sponsorIncomeWeekly;
        activeClub.sponsorIncomeWeekly = Math.max(0.01, Math.round(originalIncome * 0.4 * 100) / 100);
        activeClub.sponsorYearsLeft = 1;
        weeklyNews.push({
          id: makeId(),
          week: currentWeek,
          year: currentYear,
          title: "Sponsor Distress Warning!",
          description: `${activeClub.sponsorName} is undergoing corporate administration. Weekly sponsorship payouts have been cut by 60%.`,
          type: 'financial'
        });
        inbox.unshift({
          id: makeId(),
          week: currentWeek,
          year: currentYear,
          sender: 'Commercial Account Manager',
          senderRole: 'Chief Commercial Officer',
          subject: 'Sponsor Payments Halted',
          content: `Chairman,\n\nWe've received notice that ${activeClub.sponsorName} has entered bankruptcy protection. Our legal team is trying to recoup missing payments, but we will lose significant weekly revenue. We need to complete this season and seek a new sponsor.`,
          read: false
        });
      }
    }
  }

  // Combine and update events
  events = [...weeklyNews, ...events];

  // 5. SEASON END TRANSITIONS (Week 6)
  let isNewSeason = false;
  let newYear = currentYear;
  let newWeek = currentWeek + 1;
  let careerSeasonsCompleted = state.careerStats.seasonsCompleted;
  let careerTrophies = state.careerStats.totalTrophies;

  if (currentWeek >= 6) {
    isNewSeason = true;
    newYear = currentYear + 1;
    newWeek = 1;
    careerSeasonsCompleted++;

    // Let's execute Season-End logic:
    // Process Promotion, Relegation, objective grading, history logging, and fixture rescheduling!

    // Gather final tables
    const promotions: { fromLeague: string; toLeague: string; clubId: string; clubName: string }[] = [];
    const relegations: { fromLeague: string; toLeague: string; clubId: string; clubName: string }[] = [];

    // Let's order leagues by prestige (highest tier first)
    const sortedLeagues = [...leagues].sort((a, b) => a.tier - b.tier);

    // Process each league standings
    sortedLeagues.forEach((league, index) => {
      const standings = league.standings;
      if (standings.length < 4) return;

      const championEntry = standings[0];
      const runnerUpEntry = standings[1];
      const lastPlaceEntry = standings[standings.length - 1];

      const champClub = clubs.find((c) => c.id === championEntry.clubId);
      const runnerUpClub = clubs.find((c) => c.id === runnerUpEntry.clubId);
      const lastClub = clubs.find((c) => c.id === lastPlaceEntry.clubId);

      if (champClub && runnerUpClub && lastClub) {
        // Record League Winner and Runner-up in League history
        league.history.unshift({
          year: currentYear,
          winnerId: champClub.id,
          winnerName: champClub.name,
          runnerUpId: runnerUpClub.id,
          runnerUpName: runnerUpClub.name
        });

        // Award prize money and reputation boost
        const maxTierInDb = Math.max(...leagues.map((l) => l.tier));
        const prizeMoney = Math.max(1.0, (maxTierInDb + 1 - league.tier) * 6.0); // £24M for tier 1 in a 4-tier system, scaled dynamically
        champClub.cash += prizeMoney;
        champClub.reputation = Math.min(100, champClub.reputation + 8);
        runnerUpClub.reputation = Math.min(100, runnerUpClub.reputation + 4);
        lastClub.reputation = Math.max(10, lastClub.reputation - 6);

        // Record Trophy in cabinet if player's club won!
        if (champClub.id === state.activeClubId) {
          careerTrophies++;
          state.player.trophyCabinet.push({
            trophyName: `${league.name} Champions`,
            clubName: champClub.name,
            year: currentYear
          });

          // Add cash reward to player's personal wealth as dividend bonus!
          const dividendBonus = Math.round(prizeMoney * 0.15 * 10) / 10;
          playerWealth += dividendBonus;
          
          inbox.unshift({
            id: makeId(),
            week: 1,
            year: newYear,
            sender: 'Club Board of Directors',
            senderRole: 'Executive Committee',
            subject: 'CHAMPIONS! Season Dividend Awarded',
            content: `Dear Chairman,\n\nCONGRATULATIONS! Under your vision, ${champClub.name} has secured the championship title! In recognition of your outstanding leadership, the board has approved a personal dividend of £${dividendBonus}M paid directly to your personal net worth.\n\nLet's prepare for next season!`,
            read: false
          });
        }

        // Grade Board Objective
        if (champClub.id === state.activeClubId && champClub.boardObjective.type === 'promotion') {
          playerRep = Math.min(100, playerRep + 10);
          playerWealth += champClub.boardObjective.rewardWealth;
        }

        // Promotions & Relegations calculations
        // Elite tier (Tier 1) has no promotion
        // 1st place in Tier 2 gets promoted to Tier 1
        // 1st place in Tier 3 gets promoted to Tier 2
        // 1st place in Tier 4 gets promoted to Tier 3
        if (league.tier > 1) {
          const upperLeague = sortedLeagues.find((l) => l.tier === league.tier - 1);
          if (upperLeague) {
            promotions.push({
              fromLeague: league.id,
              toLeague: upperLeague.id,
              clubId: champClub.id,
              clubName: champClub.name
            });
          }
        }

        // Last place gets relegated
        // Dynamic relegation check based on maximum tier in active leagues list
        const maxTierInDbForReleg = Math.max(...leagues.map((l) => l.tier));
        if (league.tier < maxTierInDbForReleg) {
          const lowerLeague = sortedLeagues.find((l) => l.tier === league.tier + 1);
          if (lowerLeague) {
            relegations.push({
              fromLeague: league.id,
              toLeague: lowerLeague.id,
              clubId: lastClub.id,
              clubName: lastClub.name
            });
          }
        }
      }
    });

    // Apply promotions & relegations to club structures
    promotions.forEach((promo) => {
      const club = clubs.find((c) => c.id === promo.clubId);
      if (club) {
        club.leagueId = promo.toLeague;
        // Boost valuation, cash windfall on promotion
        club.cash += (5 - leagues.find((l) => l.id === promo.fromLeague)!.tier) * 4.0;
        
        if (club.id === state.activeClubId) {
          inbox.unshift({
            id: makeId(),
            week: 1,
            year: newYear,
            sender: 'Commercial Broadcast Union',
            senderRole: 'Media Broadcast Director',
            subject: 'PROMOTION WINDFALL: Broadcast Rights Payout',
            content: `Chairman,\n\nFollowing our successful promotion, we have finalized a much richer television broadcast rights package. The club's financial stability has vastly increased.`,
            read: false
          });
        }
      }
    });

    relegations.forEach((releg) => {
      const club = clubs.find((c) => c.id === releg.clubId);
      if (club) {
        club.leagueId = releg.toLeague;
        // Drop in cash due to relegation clause
        club.cash = Math.max(0.1, club.cash - 3.0);
        club.reputation = Math.max(15, club.reputation - 10);
        
        if (club.id === state.activeClubId) {
          playerRep = Math.max(5, playerRep - 15);
          inbox.unshift({
            id: makeId(),
            week: 1,
            year: newYear,
            sender: 'Finance Director',
            senderRole: 'CFO',
            subject: 'RELEGATION CRITICAL: Revenue Drop and Budget Cuts',
            content: `Chairman,\n\nThis is a dark day. Relegation has triggered immediate parachute clauses, slashing our broadcast income and ticketing values. We must urgently prune players' wages and seek cost restructuring to survive in the lower division.`,
            read: false
          });
        }
      }
    });

    // Reset fixtures and standings for all leagues
    leagues.forEach((league) => {
      const leagueClubs = clubs.filter((c) => c.leagueId === league.id);
      
      // Standings reset
      league.standings = leagueClubs.map((club) => ({
        clubId: club.id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0
      }));

      // Regenerate fixtures
      league.fixtures = generateFixturesForLeague(leagueClubs.map((c) => c.id));
    });

    // Log annual reports for clubs
    clubs.forEach((club) => {
      const league = leagues.find((l) => l.id === club.leagueId)!;
      const historyEntry = {
        year: currentYear,
        leaguePosition: league.standings.findIndex((s) => s.clubId === club.id) + 1,
        leagueName: league.name,
        revenue: club.revenueLastYear, // approximate placeholder
        profit: club.profitLastYear,
        valuation: club.valuation
      };
      club.history.unshift(historyEntry);

      // Reset annual objective based on tier
      club.boardObjective = {
        type: league.tier === 1 ? 'make_profit' : 'promotion',
        description: league.tier === 1 ? 'Maintain high profit and squad depth' : 'Gain promotion to next division',
        targetProgress: 0,
        targetGoal: 1,
        rewardWealth: league.tier === 1 ? 5.0 : 3.0,
        penaltyRep: 8
      };
    });

    // Log Global Season Summary Event
    events.unshift({
      id: makeId(),
      week: 1,
      year: newYear,
      title: `Welcome to the ${newYear} Football Season!`,
      description: `Promotions and relegations have been settled. Review team standings and schedule staff strategy for the upcoming campaign.`,
      type: 'news'
    });
  }

  // Increment profile times
  const updatedPlayer = {
    ...state.player,
    currentYear: newYear,
    currentWeek: newWeek,
    personalWealth: Math.round(playerWealth * 10) / 10,
    reputation: playerRep,
  };

  // Rebuild the final database with modified clubs, leagues
  const updatedDb = {
    ...db,
    clubs,
    leagues,
    availableStaff: staff
  };

  return {
    ...state,
    player: updatedPlayer,
    databases: {
      ...state.databases,
      [state.currentDatabaseId]: updatedDb
    },
    takeoverOffers,
    inbox,
    events,
    careerStats: {
      ...state.careerStats,
      seasonsCompleted: careerSeasonsCompleted,
      totalTrophies: careerTrophies,
      highestValuationReached: Math.max(state.careerStats.highestValuationReached, state.activeClubId ? (clubs.find(c => c.id === state.activeClubId)?.valuation || 0) : 0)
    }
  };
}

// Purchase a club as an investor
export function purchaseClub(state: GameState, clubId: string, customPrice?: number): GameState {
  const db = state.databases[state.currentDatabaseId];
  if (!db) return state;

  const club = db.clubs.find((c) => c.id === clubId);
  if (!club) return state;

  const price = customPrice !== undefined ? customPrice : club.valuation;

  if (state.player.personalWealth < price) {
    // Insufficient funds
    return state;
  }

  // Deduct personal wealth
  const newWealth = Math.round((state.player.personalWealth - price) * 10) / 10;
  
  // Clone structures
  const updatedClubs = db.clubs.map((c) => {
    if (c.id === clubId) {
      // Initialize with board objective
      return {
        ...c,
        // Boost starting transfer budget and make user the official owner
        transferBudget: Math.round(c.cash * 0.4 * 10) / 10,
      };
    }
    return c;
  });

  const updatedPlayer = {
    ...state.player,
    personalWealth: newWealth,
    clubsOwnedIds: [...state.player.clubsOwnedIds, clubId]
  };

  const newInbox = [
    {
      id: makeId(),
      week: state.player.currentWeek,
      year: state.player.currentYear,
      sender: 'Supporters Trust Chairman',
      senderRole: 'Fans Liaison Coordinator',
      subject: `WELCOME ONBOARD: Message to our New Chairman`,
      content: `Dear Chairman,\n\nOn behalf of everyone at ${club.name}, we welcome you as our new official owner and Chairman!\n\nFor generations, this club has been the heart of our community. We are excited about your vision and financial backing. Let's grow together, improve our facilities, hire some world-class executives, and take us to the top!\n\nUp the ${club.shortName}!`,
      read: false
    },
    ...state.inbox
  ];

  const newEvents = [
    {
      id: makeId(),
      week: state.player.currentWeek,
      year: state.player.currentYear,
      title: `TAKEOVER COMPLETE: ${state.player.name} acquires ${club.name}`,
      description: `In a historic boardroom move, the aspiring investor completed the purchase of ${club.name} for £${price}M. Supporters are celebrating outside the gates.`,
      type: 'empire' as const
    },
    ...state.events
  ];

  const updatedDb = {
    ...db,
    clubs: updatedClubs
  };

  return {
    ...state,
    player: updatedPlayer,
    activeClubId: clubId,
    databases: {
      ...state.databases,
      [state.currentDatabaseId]: updatedDb
    },
    inbox: newInbox,
    events: newEvents
  };
}

// Sell a club for personal profit
export function sellClub(state: GameState, clubId: string, offerAmount: number): GameState {
  if (state.activeClubId !== clubId) return state;

  const db = state.databases[state.currentDatabaseId];
  if (!db) return state;

  const club = db.clubs.find((c) => c.id === clubId);
  if (!club) return state;

  // Add offer amount directly to wealth, but subtract the debt!
  const payout = offerAmount - club.debt;
  const newWealth = Math.round((state.player.personalWealth + payout) * 10) / 10;

  // Track historically
  const yearsOwned = state.player.currentYear - state.player.startYear; // simplified
  const updatedPrevious = [
    ...state.player.clubsPreviouslyOwned,
    {
      clubId,
      clubName: club.name,
      boughtFor: Math.round(club.valuation * 0.7 * 10) / 10, // estimated starting buy price
      soldFor: offerAmount,
      yearsOwned: Math.max(1, yearsOwned),
      trophiesWon: state.player.trophyCabinet.filter((t) => t.clubName === club.name).map((t) => t.trophyName)
    }
  ];

  const updatedPlayer = {
    ...state.player,
    personalWealth: newWealth,
    clubsOwnedIds: state.player.clubsOwnedIds.filter((id) => id !== clubId),
    clubsPreviouslyOwned: updatedPrevious
  };

  // Remove staff from club (contract terminated/transferred to new owners)
  // Actually, we can keep them in database but unlinked or linked to new computer-controlled AI. Let's keep it simple.

  const newInbox = [
    {
      id: makeId(),
      week: state.player.currentWeek,
      year: state.player.currentYear,
      sender: 'Financial Press',
      senderRole: 'Media Correspondent',
      subject: `SALE CONFIRMED: £${offerAmount}M Deal Concluded`,
      content: `Chairman,\n\nWe have finalized the deal transferring 100% of ${club.name} shares to the acquisition consortium. All accounts have been settled. A total of £${payout.toFixed(2)}M (sale price minus your outstanding debt) has been wired to your personal accounts.\n\nYou are now a free agent in the football market, ready to scout your next giant acquisition.`,
      read: false
    },
    ...state.inbox
  ];

  const newEvents = [
    {
      id: makeId(),
      week: state.player.currentWeek,
      year: state.player.currentYear,
      title: `${club.name} Takeover Concluded for £${offerAmount}M`,
      description: `${state.player.name} sells ${club.name} for an immense profit, looking to acquire a bigger football franchise next.`,
      type: 'empire' as const
    },
    ...state.events
  ];

  return {
    ...state,
    player: updatedPlayer,
    activeClubId: null,
    takeoverOffers: [],
    inbox: newInbox,
    events: newEvents
  };
}
