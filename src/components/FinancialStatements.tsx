import React, { useState, useMemo } from 'react';
import { Club, League, Staff } from '../types/game';
import { tickClubWeeklyFinances } from '../utils/simEngine';
import { useToast } from './Toast';
import { ArrowDownRight, ArrowUpRight, Percent, Landmark, HelpCircle, RefreshCw } from 'lucide-react';

interface FinancialStatementsProps {
  club: Club;
  league: League;
  availableStaff: Staff[];
  onTakeLoan: (amount: number) => void;
  onPayLoan: (amount: number) => void;
}

export default function FinancialStatements({
  club,
  league,
  availableStaff,
  onTakeLoan,
  onPayLoan
}: FinancialStatementsProps) {
  const [loanInput, setLoanInput] = useState(10); // £10M by default
  const { show: notify } = useToast();

  const ceo = useMemo(() => availableStaff.find((s) => s.id === club.ceoId) || null, [availableStaff, club.ceoId]);

  // Get estimated weekly finances using the actual hired CEO (if any)
  const homeStatement = useMemo(() => tickClubWeeklyFinances(club, league, true, ceo), [club, league, ceo]);
  const awayStatement = useMemo(() => tickClubWeeklyFinances(club, league, false, ceo), [club, league, ceo]);

  const formatMoney = (val: number) => {
    return `£${val.toFixed(3)}M`;
  };

  const ffp = useMemo(() => {
    // 38 match weeks (19 home, 19 away)
    const annualRev = (homeStatement.revenue * 19) + (awayStatement.revenue * 19);
    const annualExp = (homeStatement.expenses * 19) + (awayStatement.expenses * 19);
    const profit = annualRev - annualExp;
    return { rev: annualRev, exp: annualExp, profit };
  }, [homeStatement, awayStatement]);

  const ffpPassed = ffp.profit > -15.0; // Allowed losses of up to £15M under PSR/FFP rules!

  return (
    <div className="flex flex-col gap-5" id="financial-statements">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-300 font-display mb-3">Profitability & Sustainability Compliance</h3>
        
        <div className="flex items-center justify-between border-b border-slate-950 pb-3 mb-3">
          <div>
            <div className="text-xs text-slate-400">Estimated Annual Income</div>
            <div className="text-base font-mono font-bold text-white">£{ffp.rev.toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Estimated Annual Spend</div>
            <div className="text-base font-mono font-bold text-white">£{ffp.exp.toFixed(1)}M</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Projected Season Net Margin</div>
            <div className={`text-sm font-mono font-bold flex items-center gap-1 ${
              ffp.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {ffp.profit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {ffp.profit >= 0 ? '+' : ''}£{ffp.profit.toFixed(1)}M
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
              ffpPassed
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                : 'bg-rose-950/20 text-rose-400 border-rose-900/30'
            }`}>
              {ffpPassed ? 'FFP SAFE' : 'FFP WARNING'}
            </span>
            <p className="text-[9px] text-slate-500 mt-1">PSR limits losses to £15.0M</p>
          </div>
        </div>
      </div>

      {/* P&L Statement Grid */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Weekly Income Statement</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Revenues */}
          <div>
            <h5 className="text-[10px] font-black uppercase text-slate-500 mb-2 border-b border-slate-950 pb-1">Weekly Revenue Streams</h5>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Matchday Ticketing (Home matches)</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.tickets)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">TV Broadcast Rights</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.tv)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Corporate Sponsorships</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.sponsor)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Merchandise Franchise Sales</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.merch)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold border-t border-slate-950 pt-1.5 text-white">
                <span>Total Home Revenue</span>
                <span className="font-mono text-emerald-400">{formatMoney(homeStatement.revenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenditures */}
          <div>
            <h5 className="text-[10px] font-black uppercase text-slate-500 mb-2 border-b border-slate-950 pb-1">Weekly Expenditures</h5>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Player Squad Wage Bill</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.wages)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Executives & Chairman Staff</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.staff)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Facilities Maintenance</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.facilities)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Loan Interest Cost</span>
                <span className="text-slate-200 font-mono font-medium">{formatMoney(homeStatement.breakdown.interest)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold border-t border-slate-950 pt-1.5 text-white">
                <span>Total Weekly Costs</span>
                <span className="font-mono text-rose-400">{formatMoney(homeStatement.expenses)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debt Financing Restructuring */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 bg-indigo-950/40 text-indigo-400 rounded-lg">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Loan & Refinancing Console</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Inject immediate liquid cash into the club's bank account or restructure outstanding debt. Current interest rate is <span className="text-slate-300 font-bold">{(club.interestRate * 100).toFixed(1)}% APR</span>.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="150"
              value={loanInput}
              onChange={(e) => setLoanInput(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
              placeholder="Amount in £M"
            />
            <span className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 flex items-center">
              £M
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (loanInput <= 0) return;
                onTakeLoan(loanInput);
                notify(`Loan approved! Added £${loanInput}M to club cash.`, 'success');
              }}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
            >
              Take Loan (+£{loanInput}M Cash)
            </button>
            <button
              onClick={() => {
                if (loanInput <= 0) return;
                if (club.cash < loanInput) {
                  notify('Club does not have enough cash.', 'error');
                  return;
                }
                onPayLoan(loanInput);
                notify(`Loan paid off! Weekly interest expense will drop.`, 'success');
              }}
              disabled={club.cash < loanInput}
              className={`flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all ${
                club.cash < loanInput ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : ''
              }`}
            >
              Pay Debt (-£{loanInput}M Cash)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
