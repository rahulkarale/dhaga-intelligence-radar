import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';
import { fetchLogs, clearAllLogs, triggerTestError } from '../api';
import {
  Terminal,
  RefreshCw,
  Trash2,
  Download,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Search,
  Zap,
  CheckCircle,
} from 'lucide-react';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLogs = async () => {
    try {
      const levelParam = selectedLevel === 'ALL' ? undefined : selectedLevel;
      const data = await fetchLogs({
        level: levelParam,
        search: searchQuery || undefined,
        limit: 150,
      });
      if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
      if (data && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch {
      // Quiet recovery during server reconnects or transient network lag
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedLevel, searchQuery]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        loadLogs();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedLevel, searchQuery]);

  const handleClearLogs = async () => {
    await clearAllLogs();
    await loadLogs();
  };

  const handleTriggerSimulatedError = async () => {
    setLoading(true);
    try {
      await triggerTestError();
      await loadLogs();
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dhaga-radar-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              Observability &amp; API Failure Monitoring System
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Real-time structured logging system for monitoring OpenRouter model latency, token expenditures, rate limits, and network anomalies.
              Keys and credentials are automatically sanitized from all payloads.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerSimulatedError}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Triggers a simulated 429 upstream error to test monitoring alerts"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              Simulate API Error
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>

            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Total Log Entries</span>
            <div className="text-xl font-bold text-white mt-1">{metrics.total}</div>
            <span className="text-[11px] text-slate-400">Ring-buffer capacity: 300</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Error Events</span>
            <div className={`text-xl font-bold mt-1 ${metrics.errors > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics.errors}
            </div>
            <span className="text-[11px] text-slate-400">Warnings: {metrics.warnings}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] block">LLM API Calls Tracked</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">{metrics.apiCallsCount}</div>
            <span className="text-[11px] text-slate-400">Avg Latency: {metrics.avgLatencyMs}ms</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Session Inference Cost</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              ${metrics.totalCostUsd.toFixed(5)}
            </div>
            <span className="text-[11px] text-slate-400">₹{metrics.totalCostInr.toFixed(3)} INR</span>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedLevel === lvl
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by keyword..."
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-56"
            />
          </div>

          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0"
            />
            <span>Auto-poll (3s)</span>
          </label>
        </div>
      </div>

      {/* Logs Table / Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No log entries found matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              let badgeColor = 'text-blue-400 bg-blue-950/60 border-blue-800';
              let Icon = Info;
              if (log.level === 'ERROR') {
                badgeColor = 'text-rose-400 bg-rose-950/80 border-rose-800';
                Icon = AlertCircle;
              } else if (log.level === 'WARN') {
                badgeColor = 'text-amber-400 bg-amber-950/80 border-amber-800';
                Icon = AlertTriangle;
              } else if (log.level === 'DEBUG') {
                badgeColor = 'text-purple-400 bg-purple-950/60 border-purple-800';
                Icon = Bug;
              }

              return (
                <div key={log.id} className="hover:bg-slate-850/40 transition-colors">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3.5 flex items-start gap-3 cursor-pointer"
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0 ${badgeColor}`}
                    >
                      <Icon className="w-3 h-3" />
                      {log.level}
                    </span>

                    <span className="text-slate-500 text-[11px] shrink-0 pt-0.5">
                      {log.timestamp.split('T')[1].replace('Z', '')}
                    </span>

                    <span className="text-slate-400 text-[11px] shrink-0 font-semibold text-slate-300">
                      [{log.source}]
                    </span>

                    <span className="text-slate-200 text-xs flex-1 break-all font-sans">
                      {log.message}
                    </span>

                    {log.latencyMs !== undefined && (
                      <span className="text-slate-400 text-[11px] shrink-0">
                        {log.latencyMs}ms
                      </span>
                    )}

                    {log.model && (
                      <span className="text-cyan-400 text-[11px] shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {log.model}
                      </span>
                    )}
                  </div>

                  {/* Expanded Metadata Details */}
                  {isExpanded && (
                    <div className="px-12 pb-3.5 pt-1 text-[11px] text-slate-300 space-y-2 bg-slate-950/80 border-t border-slate-850">
                      {log.tokens && (
                        <div className="flex gap-4 text-slate-400">
                          <span>Prompt: <strong className="text-white">{log.tokens.prompt}</strong></span>
                          <span>Completion: <strong className="text-white">{log.tokens.completion}</strong></span>
                          <span>Total: <strong className="text-white">{log.tokens.total}</strong></span>
                          {log.costUsd !== undefined && (
                            <span>Cost: <strong className="text-emerald-400">${log.costUsd.toFixed(6)}</strong></span>
                          )}
                        </div>
                      )}

                      {log.details && (
                        <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto text-[11px] text-amber-200">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
