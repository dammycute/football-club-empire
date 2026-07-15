import React, { useState, useRef } from 'react';
import { GameDatabase, Club, League, Staff, Player } from '../types/game';
import { useToast } from './Toast';
import { Download, Upload, CheckCircle2, AlertTriangle, Plus, Trash2, Edit2, FileJson, Play } from 'lucide-react';

interface ModdingHubProps {
  databases: Record<string, GameDatabase>;
  currentDatabaseId: string;
  onSelectDatabase: (id: string) => void;
  onImportDatabase: (db: GameDatabase) => void;
  onDeleteDatabase: (id: string) => void;
  onStartCareer: () => void;
  activeClubId: string | null;
}

export default function ModdingHub({
  databases,
  currentDatabaseId,
  onSelectDatabase,
  onImportDatabase,
  onDeleteDatabase,
  onStartCareer,
  activeClubId
}: ModdingHubProps) {
  const [activeTab, setActiveTab] = useState<'packs' | 'create' | 'validate'>('packs');
  const [jsonText, setJsonText] = useState('');
  const [validationReport, setValidationReport] = useState<{ success: boolean; messages: string[] } | null>(null);
  const { show: notify } = useToast();
  
  // Custom creator states
  const [packName, setPackName] = useState('My Custom Football Universe');
  const [packDesc, setPackDesc] = useState('An exciting community-created custom division for Football Club Empire!');
  const [packAuthor, setPackAuthor] = useState('LegendaryModder');
  const [packVersion, setPackVersion] = useState('1.0.0');

  // Interactive local list for editing/creation
  const [clubsList, setClubsList] = useState<Partial<Club>[]>([
    { id: 'c-custom-1', name: 'West London Royals', shortName: 'WLR', colorPrimary: 'purple', colorSecondary: 'amber', country: 'England', leagueId: 'l-custom-1', valuation: 150, cash: 15, debt: 30, interestRate: 0.05, wageBillWeekly: 1.2, fanbaseSize: 500000, stadiumName: 'Royal Boulevard', stadiumCapacity: 30000, stadiumLevel: 3, trainingFacilitiesLevel: 3, youthFacilitiesLevel: 3, academyQuality: 70, squadQuality: 75, reputation: 72, sponsorName: 'Royal Casino', sponsorIncomeWeekly: 0.28, sponsorYearsLeft: 3, ticketPrice: 35, seasonTicketPrice: 490, seasonTicketsSold: 12000, managerId: null, ceoId: null, sportingDirectorId: null, history: [], boardObjective: { type: 'mid_table', description: 'Achieve middle standing', targetProgress: 0, targetGoal: 2, rewardWealth: 3.0, penaltyRep: 5 }, transferBudget: 6.0 }
  ]);

  const [leaguesList, setLeaguesList] = useState<Partial<League>[]>([
    { id: 'l-custom-1', name: 'Grand Premier', tier: 1, country: 'England', teamsCount: 4, tvDealWeeklyPayout: 0.5, prestige: 85, standings: [], fixtures: [], history: [] }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate database schema
  const validateDatabaseJSON = (text: string): { success: boolean; messages: string[]; parsedDb?: GameDatabase } => {
    const messages: string[] = [];
    try {
      const data = JSON.parse(text);
      
      if (!data.id) messages.push("❌ Missing main field 'id'");
      if (!data.name) messages.push("❌ Missing main field 'name'");
      if (!data.description) messages.push("❌ Missing main field 'description'");
      if (!data.clubs || !Array.isArray(data.clubs)) messages.push("❌ Missing or invalid 'clubs' array");
      if (!data.leagues || !Array.isArray(data.leagues)) messages.push("❌ Missing or invalid 'leagues' array");

      if (messages.length > 0) return { success: false, messages };

      // Validate clubs
      data.clubs.forEach((club: Record<string, unknown>, idx: number) => {
        const clubLabel = String(club.name || `Club #${idx + 1}`);
        if (!club.id) messages.push(`⚠️ Club '${clubLabel}' has no 'id' field`);
        if (!club.name) messages.push(`⚠️ Club #${idx + 1} is missing a 'name'`);
        if (!club.leagueId) messages.push(`⚠️ Club '${clubLabel}' is missing 'leagueId'`);
        const clubVal = club.valuation as number;
        const clubCash = club.cash as number;
        const clubDebt = club.debt as number;
        if (clubVal === undefined || isNaN(clubVal)) messages.push(`⚠️ Club '${clubLabel}' has invalid 'valuation'`);
        if (clubCash === undefined || isNaN(clubCash)) messages.push(`⚠️ Club '${clubLabel}' has invalid 'cash'`);
        if (clubDebt === undefined || isNaN(clubDebt)) messages.push(`⚠️ Club '${clubLabel}' has invalid 'debt'`);
      });

      // Validate leagues
      data.leagues.forEach((league: Record<string, unknown>, idx: number) => {
        const lgLabel = String(league.name || `League #${idx + 1}`);
        if (!league.id) messages.push(`⚠️ League '${lgLabel}' has no 'id' field`);
        if (!league.name) messages.push(`⚠️ League #${idx + 1} has no 'name'`);
        const leagueTier = league.tier as number;
        if (!leagueTier || isNaN(leagueTier)) messages.push(`⚠️ League '${lgLabel}' is missing a valid numeric 'tier'`);
      });

      if (messages.some(m => m.startsWith("❌"))) {
        return { success: false, messages };
      }

      messages.push("✅ Base schema verification successful!");
      messages.push(`📊 Detected ${data.clubs.length} Clubs and ${data.leagues.length} Leagues.`);
      messages.push("✅ Database is fully ready to be enabled for careers!");

      return { success: true, messages, parsedDb: data as GameDatabase };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, messages: [`❌ Invalid JSON Syntax: ${msg}`] };
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    if (text.trim() === '') {
      setValidationReport(null);
      return;
    }
    const report = validateDatabaseJSON(text);
    setValidationReport({ success: report.success, messages: report.messages });
  };

  const handleImport = () => {
    const report = validateDatabaseJSON(jsonText);
    if (report.success && report.parsedDb) {
      // Complete missing standard items
      const importedDb: GameDatabase = {
        ...report.parsedDb,
        isOfficial: false,
        version: report.parsedDb.version || '1.0.0',
        author: report.parsedDb.author || 'Imported User',
        availableStaff: report.parsedDb.availableStaff || [],
        players: report.parsedDb.players || [],
        sponsors: report.parsedDb.sponsors || []
      };

      // Autogenerate standings & fixtures if missing
      importedDb.leagues.forEach((l) => {
        const leagueClubs = importedDb.clubs.filter((c) => c.leagueId === l.id);
        if (!l.standings || l.standings.length === 0) {
          l.standings = leagueClubs.map((club) => ({
            clubId: club.id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0
          }));
        }
        if (!l.fixtures || l.fixtures.length === 0) {
          const ids = leagueClubs.map((c) => c.id);
          // Simple double round robin for 4 teams, pad if necessary
          if (ids.length >= 4) {
            // week fixtures
            l.fixtures = [
              { week: 1, homeClubId: ids[0], awayClubId: ids[1], simulated: false },
              { week: 1, homeClubId: ids[2], awayClubId: ids[3], simulated: false },
              { week: 2, homeClubId: ids[1], awayClubId: ids[2], simulated: false },
              { week: 2, homeClubId: ids[3], awayClubId: ids[0], simulated: false },
              { week: 3, homeClubId: ids[0], awayClubId: ids[2], simulated: false },
              { week: 3, homeClubId: ids[1], awayClubId: ids[3], simulated: false },
              { week: 4, homeClubId: ids[1], awayClubId: ids[0], simulated: false },
              { week: 4, homeClubId: ids[3], awayClubId: ids[2], simulated: false },
              { week: 5, homeClubId: ids[2], awayClubId: ids[1], simulated: false },
              { week: 5, homeClubId: ids[0], awayClubId: ids[3], simulated: false },
              { week: 6, homeClubId: ids[2], awayClubId: ids[0], simulated: false },
              { week: 6, homeClubId: ids[3], awayClubId: ids[1], simulated: false },
            ];
          }
        }
      });

      onImportDatabase(importedDb);
      notify('Custom Football Data Pack imported successfully!', 'success');
      setJsonText('');
      setValidationReport(null);
      setActiveTab('packs');
    } else {
      notify('Cannot import database. Please resolve verification reports first.', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      const report = validateDatabaseJSON(text);
      setValidationReport({ success: report.success, messages: report.messages });
      setActiveTab('validate');
    };
    reader.readAsText(file);
  };

  const handleExportBuilder = () => {
    // Package into complete GameDatabase schema
    const fullDb: GameDatabase = {
      id: `custom-pack-${Math.random().toString(36).substring(2, 9)}`,
      name: packName,
      description: packDesc,
      version: packVersion,
      author: packAuthor,
      isOfficial: false,
      clubs: clubsList.map((c, idx) => ({
        ...c,
        id: c.id || `c-custom-${idx}`,
        name: c.name || 'Fictional Rovers',
        shortName: c.shortName || 'ROV',
        colorPrimary: c.colorPrimary || 'indigo',
        colorSecondary: c.colorSecondary || 'slate',
        country: c.country || 'England',
        leagueId: c.leagueId || 'l-custom-1',
        valuation: c.valuation || 50,
        cash: c.cash || 5,
        debt: c.debt || 10,
        interestRate: c.interestRate || 0.05,
        wageBillWeekly: c.wageBillWeekly || 0.4,
        fanbaseSize: c.fanbaseSize || 100000,
        stadiumName: c.stadiumName || 'Custom Arena',
        stadiumCapacity: c.stadiumCapacity || 12000,
        stadiumLevel: 1,
        trainingFacilitiesLevel: 1,
        youthFacilitiesLevel: 1,
        academyQuality: 40,
        squadQuality: 50,
        reputation: 45,
        sponsorName: 'Global Brands',
        sponsorIncomeWeekly: 0.05,
        sponsorYearsLeft: 2,
        ticketPrice: 20,
        seasonTicketPrice: 240,
        seasonTicketsSold: 3500,
        managerId: null,
        ceoId: null,
        sportingDirectorId: null,
        history: [],
        boardObjective: { type: 'mid_table', description: 'Survive in mid tier', targetProgress: 0, targetGoal: 2, rewardWealth: 1.0, penaltyRep: 4 },
        transferBudget: 1.5,
        mentality: 'balanced',
        squad: []
      } as Club)),
      leagues: leaguesList.map(l => ({
        ...l,
        id: l.id || 'l-custom-1',
        name: l.name || 'League Tier One',
        tier: l.tier || 1,
        country: l.country || 'England',
        teamsCount: 4,
        tvDealWeeklyPayout: l.tvDealWeeklyPayout || 0.1,
        prestige: l.prestige || 50,
        standings: [],
        fixtures: [],
        history: []
      } as League)),
      availableStaff: [],
      players: [],
      sponsors: []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${packName.toLowerCase().replace(/ /g, '_')}_datapack.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const addClubToBuilder = () => {
    const nextId = `c-custom-${clubsList.length + 1}`;
    setClubsList([
      ...clubsList,
      {
        id: nextId,
        name: `Club ${clubsList.length + 1}`,
        shortName: `C${clubsList.length + 1}`,
        colorPrimary: 'blue',
        colorSecondary: 'white',
        country: 'England',
        leagueId: leaguesList[0]?.id || 'l-custom-1',
        valuation: 35,
        cash: 3.5,
        debt: 8.0,
        wageBillWeekly: 0.25,
        fanbaseSize: 120000,
        stadiumName: 'New Meadows',
        stadiumCapacity: 15000
      }
    ]);
  };

  const removeClubFromBuilder = (idx: number) => {
    setClubsList(clubsList.filter((_, i) => i !== idx));
  };

  const updateClubField = (idx: number, field: string, value: string | number | boolean) => {
    const updated = [...clubsList];
    updated[idx] = { ...updated[idx], [field]: value };
    setClubsList(updated);
  };

  return (
    <div className="flex flex-col gap-6" id="modding-hub">
      {/* Header section with quick statistics */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold font-display text-white mb-2">Modding & Custom Databases</h2>
        <p className="text-sm text-slate-400">
          Football Club Empire is built with an isolated open data architecture. Import, edit, or build real-world databases in JSON to completely customize your tycoon experience.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
        <button
          onClick={() => setActiveTab('packs')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'packs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Data Packs
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pack Creator
        </button>
        <button
          onClick={() => setActiveTab('validate')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'validate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          JSON Validation Hub
        </button>
      </div>

      {/* Content */}
      {activeTab === 'packs' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-white">Installed Databases</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .json File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(databases).map((db) => {
              const isActive = db.id === currentDatabaseId;
              return (
                <div
                  key={db.id}
                  className={`relative p-5 rounded-xl border flex flex-col gap-3 transition-all ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/80'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-base">{db.name}</h4>
                        {db.isOfficial && (
                          <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            OFFICIAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{db.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-900/80 pt-3">
                    <div>Author: <span className="text-slate-300 font-medium">{db.author}</span></div>
                    <div>Version: <span className="text-slate-300 font-medium">{db.version}</span></div>
                    <div>Clubs: <span className="text-slate-300 font-medium">{db.clubs.length}</span></div>
                  </div>

                  <div className="flex gap-2.5 mt-2">
                    <button
                      onClick={() => onSelectDatabase(db.id)}
                      disabled={isActive}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-900/40 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isActive ? 'Active Pack' : 'Enable Pack'}
                    </button>
                    {!db.isOfficial && (
                      <button
                        onClick={() => onDeleteDatabase(db.id)}
                        className="p-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 rounded-lg transition-all"
                        title="Delete Pack"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-indigo-950/20 border border-indigo-500/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-indigo-900/30 text-indigo-400 rounded-xl">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Ready to start your tycoon empire?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Start a fresh decades-long chairman career with your chosen active database pack.</p>
              </div>
            </div>
            <button
              onClick={onStartCareer}
              className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
            >
              Start New Career
            </button>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold font-display text-white">1. Core Pack Metadata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Database Name</label>
                <input
                  type="text"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Author Nickname</label>
                <input
                  type="text"
                  value={packAuthor}
                  onChange={(e) => setPackAuthor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-medium">Brief Description</label>
                <input
                  type="text"
                  value={packDesc}
                  onChange={(e) => setPackDesc(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold font-display text-white">2. Clubs Editor ({clubsList.length})</h3>
              <button
                onClick={addClubToBuilder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition-all font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Club
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {clubsList.map((club, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 relative">
                  <button
                    onClick={() => removeClubFromBuilder(idx)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"
                    title="Remove club"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Club Name</label>
                      <input
                        type="text"
                        value={club.name || ''}
                        onChange={(e) => updateClubField(idx, 'name', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Short Code</label>
                      <input
                        type="text"
                        maxLength={3}
                        value={club.shortName || ''}
                        onChange={(e) => updateClubField(idx, 'shortName', e.target.value.toUpperCase())}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Stadium Name</label>
                      <input
                        type="text"
                        value={club.stadiumName || ''}
                        onChange={(e) => updateClubField(idx, 'stadiumName', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Capacity</label>
                      <input
                        type="number"
                        value={club.stadiumCapacity || 0}
                        onChange={(e) => updateClubField(idx, 'stadiumCapacity', parseInt(e.target.value) || 0)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Valuation (£M)</label>
                      <input
                        type="number"
                        value={club.valuation || 0}
                        onChange={(e) => updateClubField(idx, 'valuation', parseFloat(e.target.value) || 0)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Cash (£M)</label>
                      <input
                        type="number"
                        value={club.cash || 0}
                        onChange={(e) => updateClubField(idx, 'cash', parseFloat(e.target.value) || 0)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Debt (£M)</label>
                      <input
                        type="number"
                        value={club.debt || 0}
                        onChange={(e) => updateClubField(idx, 'debt', parseFloat(e.target.value) || 0)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Weekly Wage (£M)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={club.wageBillWeekly || 0}
                        onChange={(e) => updateClubField(idx, 'wageBillWeekly', parseFloat(e.target.value) || 0)}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleExportBuilder}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Download Configured JSON
            </button>
          </div>
        </div>
      )}

      {activeTab === 'validate' && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-white">JSON Pack Schema Validation</h3>
              <p className="text-xs text-slate-400 mt-1">Paste your custom database schema below. We will immediately validate fields, IDs, and consistency to prevent any game-loop crashes.</p>
            </div>

            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              placeholder='{ "id": "my-custom-pack", "name": "Custom Division", ... }'
              className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            />

            {validationReport && (
              <div className={`p-4 rounded-xl border ${
                validationReport.success ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {validationReport.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <h4 className="font-bold text-white text-sm">
                    {validationReport.success ? 'Schema Passed Verification!' : 'Verification Reports & Warnings'}
                  </h4>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  {validationReport.messages.map((m, i) => (
                    <div key={i} className="text-xs text-slate-300 font-mono">
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!validationReport || !validationReport.success}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                validationReport && validationReport.success
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply and Import Database to Local Pack List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
