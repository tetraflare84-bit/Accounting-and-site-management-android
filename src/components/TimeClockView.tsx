import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { TimeLog, ClientSite, CompanyProfile } from '../types';
import { GoogleSheetsExporter, downloadFile } from '../services/googleSheetsExporter';

interface TimeClockViewProps {
  timeLogs: TimeLog[];
  clients: ClientSite[];
  profile: CompanyProfile;
  onAddTimeLog: (log: TimeLog) => void;
  onDeleteTimeLog: (id: string) => void;
  onMarkBilled: (id: string) => void;
}

export const TimeClockView: React.FC<TimeClockViewProps> = ({
  timeLogs,
  clients,
  profile,
  onAddTimeLog,
  onDeleteTimeLog,
  onMarkBilled,
}) => {
  // Timer state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [startTimeString, setStartTimeString] = useState<string>('');

  const [activeClientId, setActiveClientId] = useState<string>(clients[0]?.id || '');
  const [workerName, setWorkerName] = useState<string>(profile.ownerName || 'Trevor Auton');
  const [hourlyRate, setHourlyRate] = useState<number>(65.0);
  const [taskDescription, setTaskDescription] = useState<string>(
    'Garden bed preparation & shrub planting'
  );

  // Manual Log Entry Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [manualMinutes, setManualMinutes] = useState<string>('120');

  // Interval hook for active punch clock
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Live billable earnings
  const liveEarnedAmount = ((secondsElapsed / 3600) * hourlyRate).toFixed(2);

  const handleStartTimer = () => {
    if (secondsElapsed === 0) {
      setStartTimeString(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleStopAndSave = () => {
    if (secondsElapsed < 30) {
      if (!confirm('Session is less than 30 seconds. Stop without saving?')) return;
      setIsRunning(false);
      setSecondsElapsed(0);
      return;
    }

    const matchedClient = clients.find((c) => c.id === activeClientId);
    const endTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const durationMins = Math.max(1, Math.round(secondsElapsed / 60));

    const newLog: TimeLog = {
      id: `time_${Date.now()}`,
      clientId: activeClientId,
      clientName: matchedClient?.name || 'Unassigned Site',
      employeeName: workerName,
      date: new Date().toISOString().split('T')[0],
      startTime: startTimeString || '09:00 AM',
      endTime: endTimeString,
      durationMinutes: durationMins,
      hourlyRate,
      taskDescription: taskDescription || 'General Field Labor',
      billed: false,
    };

    onAddTimeLog(newLog);
    setIsRunning(false);
    setSecondsElapsed(0);
    alert(`Logged ${durationMins} minutes ($${((durationMins / 60) * hourlyRate).toFixed(2)}) to ${newLog.clientName}!`);
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClient = clients.find((c) => c.id === activeClientId);
    const mins = parseInt(manualMinutes, 10) || 60;

    const newLog: TimeLog = {
      id: `time_${Date.now()}`,
      clientId: activeClientId,
      clientName: matchedClient?.name || 'Unassigned Site',
      employeeName: workerName,
      date: manualDate,
      startTime: 'Manual Log',
      endTime: 'Manual Log',
      durationMinutes: mins,
      hourlyRate,
      taskDescription: taskDescription || 'Field Labor',
      billed: false,
    };

    onAddTimeLog(newLog);
    setIsManualModalOpen(false);
  };

  const handleExportTimeLogsCsv = () => {
    const csvData = GoogleSheetsExporter.generateTimeLogsCsv(timeLogs);
    downloadFile(csvData, 'PlantPro_TimeTracking_GoogleSheets.csv');
  };

  const totalLoggedMinutes = timeLogs.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalLaborValue = timeLogs.reduce(
    (sum, t) => sum + (t.durationMinutes / 60) * t.hourlyRate,
    0
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Time Clock & Field Labor Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Track crew hours on site, auto-calculate billable labor & import to invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportTimeLogsCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span>Export to Google Sheets</span>
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Main Punch Clock Punch Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Punch Clock Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Job Site Punch Clock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client Site</label>
                <select
                  disabled={isRunning}
                  value={activeClientId}
                  onChange={(e) => setActiveClientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-medium disabled:opacity-60"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  disabled={isRunning}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono font-bold text-slate-900 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Task Activity Description</label>
              <input
                type="text"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="e.g. Garden bed preparation, boxwoods planting, edging"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>

            {/* Timer Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {!isRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 transition active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>{secondsElapsed > 0 ? 'Resume Timer' : 'Punch In (Start)'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition active:scale-95"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause Timer</span>
                </button>
              )}

              {secondsElapsed > 0 && (
                <button
                  onClick={handleStopAndSave}
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition active:scale-95"
                  title="Punch Out and Log Hours"
                >
                  <Square className="h-4 w-4 fill-white" />
                  <span>Punch Out & Log</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Real-Time Digital Display */}
          <div className="rounded-xl bg-slate-900 p-6 text-white text-center shadow-inner flex flex-col justify-center items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Elapsed Time Today
            </span>
            <div className="mt-2 font-mono text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums text-white">
              {formatTime(secondsElapsed)}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 w-full flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Worker</span>
                <span className="font-semibold text-slate-200">{workerName}</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[11px]">Billable Rate</span>
                <span className="font-mono font-semibold text-slate-200">${hourlyRate}/hr</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-emerald-400 block text-[11px] font-semibold">Live Earned</span>
                <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
                  ${liveEarnedAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Hours Tracked</p>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {(totalLoggedMinutes / 60).toFixed(1)} hrs
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Gross Labor Value</p>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-900 tabular-nums">
            ${totalLaborValue.toFixed(2)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Unbilled Sessions</p>
          <p className="mt-1 font-mono text-xl font-bold text-amber-600 tabular-nums">
            {timeLogs.filter((t) => !t.billed).length} sessions
          </p>
        </div>
      </div>

      {/* Time Logs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Time & Labor Log History
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client Site</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Task Description</th>
                <th className="px-4 py-3 text-right">Duration</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Labor Value ($)</th>
                <th className="px-4 py-3 text-center">Billed Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeLogs.map((log) => {
                const laborVal = (log.durationMinutes / 60) * log.hourlyRate;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">{log.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{log.clientName}</td>
                    <td className="px-4 py-3 text-slate-600">{log.employeeName}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{log.taskDescription}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums">
                      {(log.durationMinutes / 60).toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                      ${log.hourlyRate}/hr
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${laborVal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.billed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          <span>Billed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onMarkBilled(log.id)}
                          className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100"
                        >
                          Mark Billed
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onDeleteTimeLog(log.id)}
                        className="rounded p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Log Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Manual Labor Log</h3>
            <form onSubmit={handleSaveManualLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Site</label>
                <select
                  value={activeClientId}
                  onChange={(e) => setActiveClientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    step="15"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Description</label>
                <input
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 font-semibold text-white hover:bg-emerald-800"
                >
                  Save Time Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
