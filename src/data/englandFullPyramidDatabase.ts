import { GameDatabase, Staff } from '../types/game';
import rawData from './england_full_pyramid.json';

export const ENGLAND_FULL_PYRAMID_DATABASE_ID = 'custom-england-full-pyramid';

const staff: Staff[] = [
  // ---- MANAGERS ----
  // Top tier (tier 1-2)
  { id: 'fp-mgr-1', name: 'Marcus Vance', role: 'manager', age: 47, rating: 78, salaryWeekly: 0.042, personality: 'Tactician', avatar: '👔', minLeagueTier: 1, maxLeagueTier: 2 },
  // Mid tier (tier 2-4)
  { id: 'fp-mgr-2', name: 'Robert Haine', role: 'manager', age: 55, rating: 74, salaryWeekly: 0.024, personality: 'Disciplinarian', avatar: '👔', minLeagueTier: 2, maxLeagueTier: 4 },
  { id: 'fp-mgr-3', name: 'Daniel Okafor', role: 'manager', age: 39, rating: 71, salaryWeekly: 0.018, personality: 'Man-Manager', avatar: '👔', minLeagueTier: 3, maxLeagueTier: 5 },
  // Budget (tier 5-7)
  { id: 'fp-mgr-4', name: 'Lee Bradbury', role: 'manager', age: 52, rating: 48, salaryWeekly: 0.005, personality: 'Cost Cutter', avatar: '🧢', minLeagueTier: 5, maxLeagueTier: 7 },
  { id: 'fp-mgr-5', name: 'Sarah Winter', role: 'manager', age: 44, rating: 38, salaryWeekly: 0.003, personality: 'Conservative', avatar: '🧢', minLeagueTier: 6, maxLeagueTier: 7 },
  { id: 'fp-mgr-6', name: 'Paul Stone', role: 'manager', age: 38, rating: 35, salaryWeekly: 0.002, personality: 'Youth Developer', avatar: '🧢', minLeagueTier: 6, maxLeagueTier: 7 },
  { id: 'fp-mgr-7', name: 'Ian Black', role: 'manager', age: 55, rating: 28, salaryWeekly: 0.0015, personality: 'Conservative', avatar: '🧢', minLeagueTier: 6, maxLeagueTier: 7 },

  // ---- CEOS ----
  // Top tier (tier 1-3)
  { id: 'fp-ceo-1', name: 'Elena Rostova', role: 'ceo', age: 42, rating: 84, salaryWeekly: 0.055, personality: 'Commercial Genius', avatar: '👩‍💼', minLeagueTier: 1, maxLeagueTier: 3 },
  { id: 'fp-ceo-2', name: 'Grace Whitfield', role: 'ceo', age: 51, rating: 76, salaryWeekly: 0.032, personality: 'Prudent Operator', avatar: '👩‍💼', minLeagueTier: 2, maxLeagueTier: 4 },
  // Budget (tier 5-7)
  { id: 'fp-ceo-3', name: 'Margaret Chen', role: 'ceo', age: 48, rating: 55, salaryWeekly: 0.008, personality: 'Cost Cutter', avatar: '💼', minLeagueTier: 5, maxLeagueTier: 7 },
  { id: 'fp-ceo-4', name: 'David Cross', role: 'ceo', age: 57, rating: 45, salaryWeekly: 0.005, personality: 'Conservative', avatar: '💼', minLeagueTier: 6, maxLeagueTier: 7 },
  { id: 'fp-ceo-5', name: 'Helen Pierce', role: 'ceo', age: 39, rating: 40, salaryWeekly: 0.003, personality: 'Prudent Operator', avatar: '💼', minLeagueTier: 6, maxLeagueTier: 7 },
  { id: 'fp-ceo-6', name: 'Frank Murphy', role: 'ceo', age: 61, rating: 32, salaryWeekly: 0.002, personality: 'Cost Cutter', avatar: '💼', minLeagueTier: 6, maxLeagueTier: 7 },

  // ---- SPORTING DIRECTORS ----
  // Top tier (tier 1-3)
  { id: 'fp-sd-1', name: 'Tomas Bergqvist', role: 'sporting_director', age: 44, rating: 80, salaryWeekly: 0.027, personality: 'Data-Driven', avatar: '📊', minLeagueTier: 1, maxLeagueTier: 3 },
  { id: 'fp-sd-2', name: 'Kwame Asante', role: 'sporting_director', age: 36, rating: 69, salaryWeekly: 0.012, personality: 'Youth Advocate', avatar: '📊', minLeagueTier: 3, maxLeagueTier: 5 },
  // Budget (tier 5-7)
  { id: 'fp-sd-3', name: 'James Ford', role: 'sporting_director', age: 50, rating: 50, salaryWeekly: 0.006, personality: 'Underdog Scout', avatar: '📋', minLeagueTier: 5, maxLeagueTier: 7 },
  { id: 'fp-sd-4', name: 'Olivia Marsh', role: 'sporting_director', age: 41, rating: 42, salaryWeekly: 0.004, personality: 'Youth Advocate', avatar: '📋', minLeagueTier: 6, maxLeagueTier: 7 },
  { id: 'fp-sd-5', name: 'Tom Fletcher', role: 'sporting_director', age: 46, rating: 38, salaryWeekly: 0.002, personality: 'Cost Cutter', avatar: '📋', minLeagueTier: 6, maxLeagueTier: 7 },
  { id: 'fp-sd-6', name: 'Diana King', role: 'sporting_director', age: 33, rating: 30, salaryWeekly: 0.0015, personality: 'Conservative', avatar: '📋', minLeagueTier: 6, maxLeagueTier: 7 },
];

export const getEnglandFullPyramidDatabase = (): GameDatabase => ({
  ...(rawData as any),
  availableStaff: staff,
  id: ENGLAND_FULL_PYRAMID_DATABASE_ID,
});
