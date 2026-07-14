import React from 'react';
import { Club, Staff } from '../types/game';
import { useToast } from './Toast';
import { Shield, TrendingUp, DollarSign, Award, Trash2, CheckCircle, UserPlus } from 'lucide-react';

interface StaffManagementProps {
  club: Club;
  availableStaff: Staff[];
  leagueTier: number;
  onHireStaff: (staffId: string) => void;
  onFireStaff: (role: 'manager' | 'ceo' | 'sporting_director') => void;
}

export default function StaffManagement({
  club,
  availableStaff,
  leagueTier,
  onHireStaff,
  onFireStaff
}: StaffManagementProps) {
  const { show: notify } = useToast();
  const currentManager = availableStaff.find((s) => s.id === club.managerId);
  const currentCeo = availableStaff.find((s) => s.id === club.ceoId);
  const currentSportingDirector = availableStaff.find((s) => s.id === club.sportingDirectorId);

  const getPersonalityDescription = (personality: string) => {
    switch (personality) {
      case 'Youth Developer':
        return 'Grows academy rating and squad quality by +1.5 every season.';
      case 'Cost Cutter':
        return 'Saves 7% of weekly player wage bill and 5% of executive salaries.';
      case 'Commercial Genius':
        return 'Increases corporate sponsorships and stadium ticket revenues by 15%.';
      case 'Risk Taker':
        return 'Increases match goal chances but raises random corporate expenses.';
      case 'Tactician':
        return 'Gives +5 quality bonus during match calculations.';
      case 'Transfer Specialist':
        return 'Lowers players squad purchase and upgrade cost by 15%.';
      default:
        return 'Provides standard administrative stability.';
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'manager') return 'First Team Manager';
    if (role === 'ceo') return 'Chief Executive Officer (CEO)';
    return 'Sporting Director';
  };

  const formatWeeklySalary = (sal: number) => {
    return `£${(sal * 1000).toFixed(0)}k/wk`;
  };

  // Filter out staff already employed elsewhere and those outside league tier range
  const hireableStaff = availableStaff.filter((s) => {
    if (s.id === club.managerId || s.id === club.ceoId || s.id === club.sportingDirectorId) return false;
    const minTier = s.minLeagueTier ?? 1;
    const maxTier = s.maxLeagueTier ?? 7;
    return leagueTier >= minTier && leagueTier <= maxTier;
  });

  return (
    <div className="flex flex-col gap-5" id="staff-management">
      {/* Active Boardroom section */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-300 font-display">Active Executive Boardroom</h3>

        {/* Manager Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl bg-slate-900 p-2 rounded-lg border border-slate-800">
              {currentManager?.avatar || '👔'}
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">First Team Manager</div>
              <h4 className="text-xs font-bold text-white">{currentManager?.name || 'No Hired Manager'}</h4>
              {currentManager && (
                <p className="text-[10px] text-indigo-400 mt-0.5">
                  Rating: <span className="font-bold">{currentManager.rating}%</span> • {currentManager.personality}
                </p>
              )}
            </div>
          </div>
          {currentManager ? (
            <div className="text-right flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">{formatWeeklySalary(currentManager.salaryWeekly)}</span>
              <button
                onClick={() => {
                  onFireStaff('manager');
                  notify('Manager fired. Contract termination fees paid.', 'info');
                }}
                className="text-[10px] px-2 py-1 text-rose-400 hover:text-white border border-rose-900/40 hover:bg-rose-950/40 rounded transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Sack
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-amber-500 font-bold bg-amber-950/20 px-2 py-1 rounded">Vulnerable</span>
          )}
        </div>

        {/* CEO Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl bg-slate-900 p-2 rounded-lg border border-slate-800">
              {currentCeo?.avatar || '📈'}
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Chief Executive (CEO)</div>
              <h4 className="text-xs font-bold text-white">{currentCeo?.name || 'No Appointed CEO'}</h4>
              {currentCeo && (
                <p className="text-[10px] text-indigo-400 mt-0.5">
                  Rating: <span className="font-bold">{currentCeo.rating}%</span> • {currentCeo.personality}
                </p>
              )}
            </div>
          </div>
          {currentCeo ? (
            <div className="text-right flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">{formatWeeklySalary(currentCeo.salaryWeekly)}</span>
              <button
                onClick={() => {
                  onFireStaff('ceo');
                  notify('CEO fired. Severance terms processed.', 'info');
                }}
                className="text-[10px] px-2 py-1 text-rose-400 hover:text-white border border-rose-900/40 hover:bg-rose-950/40 rounded transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Dismiss
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-amber-500 font-bold bg-amber-950/20 px-2 py-1 rounded">Vacant</span>
          )}
        </div>

        {/* Sporting Director Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl bg-slate-900 p-2 rounded-lg border border-slate-800">
              {currentSportingDirector?.avatar || '🔍'}
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Sporting Director</div>
              <h4 className="text-xs font-bold text-white">{currentSportingDirector?.name || 'No Sporting Director'}</h4>
              {currentSportingDirector && (
                <p className="text-[10px] text-indigo-400 mt-0.5">
                  Rating: <span className="font-bold">{currentSportingDirector.rating}%</span> • {currentSportingDirector.personality}
                </p>
              )}
            </div>
          </div>
          {currentSportingDirector ? (
            <div className="text-right flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">{formatWeeklySalary(currentSportingDirector.salaryWeekly)}</span>
              <button
                onClick={() => {
                  onFireStaff('sporting_director');
                  notify('Sporting Director contract terminated.', 'info');
                }}
                className="text-[10px] px-2 py-1 text-rose-400 hover:text-white border border-rose-900/40 hover:bg-rose-950/40 rounded transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Dismiss
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-amber-500 font-bold bg-amber-950/20 px-2 py-1 rounded">Vacant</span>
          )}
        </div>
      </div>

      {/* Available Executives List */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-300 font-display">Headhunting Agency Marketplace</h3>

        <div className="flex flex-col gap-3">
          {hireableStaff.map((staffMember) => (
            <div
              key={staffMember.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col gap-2 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {staffMember.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{staffMember.name}</h4>
                    <p className="text-[10px] text-slate-400">{getRoleLabel(staffMember.role)} • Age {staffMember.age}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white flex items-center gap-0.5 justify-end">
                    <Award className="w-3 h-3 text-indigo-400" />
                    {staffMember.rating}% Rating
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{formatWeeklySalary(staffMember.salaryWeekly)}</div>
                </div>
              </div>

              {/* Personality description */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg text-[10px] text-indigo-200 border border-indigo-950">
                <span className="font-bold text-indigo-400 uppercase tracking-wider">{staffMember.personality}:</span>{' '}
                {getPersonalityDescription(staffMember.personality)}
              </div>

              <button
                onClick={() => {
                  onHireStaff(staffMember.id);
                  notify(`${staffMember.name} is now our official ${getRoleLabel(staffMember.role)}!`, 'success');
                }}
                className="w-full py-1.5 mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Contract
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
