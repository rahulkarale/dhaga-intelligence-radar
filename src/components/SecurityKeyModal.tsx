import React, { useState } from 'react';
import { SystemHealth } from '../types';
import { getStoredSessionKey, setStoredSessionKey, testOpenRouterConnection } from '../api';
import {
  ShieldCheck,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  RefreshCw,
  X,
} from 'lucide-react';

interface SecurityKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: SystemHealth | null;
  onRefreshHealth: () => void;
}

export const SecurityKeyModal: React.FC<SecurityKeyModalProps> = ({
  isOpen,
  onClose,
  health,
  onRefreshHealth,
}) => {
  const [sessionKey, setSessionKey] = useState(getStoredSessionKey());
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    model?: string;
    latencyMs?: number;
    response?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSaveSessionKey = () => {
    setStoredSessionKey(sessionKey);
    onRefreshHealth();
  };

  const handleClearSessionKey = () => {
    setSessionKey('');
    setStoredSessionKey('');
    onRefreshHealth();
  };

  const handleRunConnectionTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testOpenRouterConnection(sessionKey || undefined);
      setTestResult(res);
      onRefreshHealth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ success: false, error: msg });
    } finally {
      setTesting(false);
    }
  };

  const isServerConfigured = health?.openRouter.isConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">OpenRouter API Key & Security Governance</h2>
            <p className="text-xs text-slate-400">
              Enterprise secret handling guidelines & server-side proxy architecture
            </p>
          </div>
        </div>

        {/* Security Architecture Best Practices Checklist */}
        <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 text-xs">
          <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Security Implementation Audit
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-200">Zero Client Leakage:</span>
                <p className="text-slate-400 text-[11px]">
                  Raw API keys are NEVER bundled into client JavaScript. Browser calls <code className="text-slate-300">/api/radar/*</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-200">Environment Storage:</span>
                <p className="text-slate-400 text-[11px]">
                  Stored via server environment variable <code className="text-slate-300">OPENROUTER_API_KEY</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-200">Log Sanitization:</span>
                <p className="text-slate-400 text-[11px]">
                  Regex sanitizers redact all <code className="text-slate-300">sk-or-*</code> patterns from console & log entries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-200">Dual Model Partitioning:</span>
                <p className="text-slate-400 text-[11px]">
                  Fast Model (<code className="text-slate-300">{health?.openRouter.fastModel}</code>) &amp; Judge (<code className="text-slate-300">{health?.openRouter.judgeModel}</code>).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Server Environment Status */}
        <div className="mb-6 bg-slate-800/40 p-4 rounded-lg border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              Server Environment Key Status
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                isServerConfigured
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isServerConfigured ? 'Active in process.env' : 'Not Set in process.env'}
            </span>
          </div>

          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div>
              Masked Key: <span className="text-slate-200">{health?.openRouter.maskedKey || 'None'}</span>
            </div>
            <div>
              Gateway Base URL: <span className="text-slate-300">{health?.openRouter.baseUrl}</span>
            </div>
          </div>
        </div>

        {/* Session Override Key (For testing & review without server restart) */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Temporary Session Key Override (Optional)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Stored in memory/sessionStorage only
            </span>
          </label>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={sessionKey}
              onChange={(e) => setSessionKey(e.target.value)}
              placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono pr-20 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-200 text-xs px-2"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-400">
              Useful for ad-hoc reviews or testing custom OpenRouter tier credentials.
            </span>
            <div className="flex gap-2">
              {sessionKey && (
                <button
                  type="button"
                  onClick={handleClearSessionKey}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveSessionKey}
                className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Apply to Session
              </button>
            </div>
          </div>
        </div>

        {/* Live Connectivity Test Button */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-4">
          <button
            onClick={handleRunConnectionTest}
            disabled={testing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Test Connection Ping
          </button>

          <span className="text-xs text-slate-400">
            Pings OpenRouter via server proxy with 1-token test prompt
          </span>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-lg border text-xs ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold mb-1">
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Connection Successful ({testResult.latencyMs}ms)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Connection Test Warning
                </>
              )}
            </div>
            <p className="text-slate-300 text-[11px] font-mono">
              {testResult.message || testResult.error || `Model: ${testResult.model} | Response: "${testResult.response}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
