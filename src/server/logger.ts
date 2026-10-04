/**
 * Structured Logging System for Dhaga & Co. Intelligence Radar
 * Provides in-memory ring-buffer logging, console output, level filtering,
 * key sanitization, and metrics tracking for LLM API calls and system errors.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  details?: Record<string, unknown>;
  latencyMs?: number;
  model?: string;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  costUsd?: number;
}

const MAX_LOGS = 300;
const inMemoryLogs: LogEntry[] = [];
let logCounter = 0;

// Security Sanitizer: Strips out any API keys from stringified payloads
export function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return data
      .replace(/sk-or-[a-zA-Z0-9_-]{20,}/g, 'sk-or-***[REDACTED]')
      .replace(/AIza[a-zA-Z0-9_-]{35}/g, 'AIza***[REDACTED]')
      .replace(/Bearer\s+[a-zA-Z0-9_.-]{20,}/gi, 'Bearer ***[REDACTED]');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('key') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('auth')) {
        sanitized[key] = '***[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }
  return data;
}

export class Logger {
  private source: string;

  constructor(source: string) {
    this.source = source;
  }

  private addLog(
    level: LogLevel,
    message: string,
    meta?: {
      details?: Record<string, unknown>;
      latencyMs?: number;
      model?: string;
      tokens?: { prompt?: number; completion?: number; total?: number };
      costUsd?: number;
    }
  ): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${++logCounter}`,
      timestamp: new Date().toISOString(),
      level,
      source: this.source,
      message: String(sanitizeData(message)),
      details: meta?.details ? (sanitizeData(meta.details) as Record<string, unknown>) : undefined,
      latencyMs: meta?.latencyMs,
      model: meta?.model,
      tokens: meta?.tokens,
      costUsd: meta?.costUsd,
    };

    inMemoryLogs.unshift(entry);
    if (inMemoryLogs.length > MAX_LOGS) {
      inMemoryLogs.pop();
    }

    // Console output with color-coded formatting
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.source}]:`;
    if (level === 'ERROR') {
      console.error(prefix, entry.message, entry.details || '');
    } else if (level === 'WARN') {
      console.warn(prefix, entry.message, entry.details || '');
    } else {
      console.log(prefix, entry.message, entry.details || '');
    }

    return entry;
  }

  debug(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addLog('DEBUG', message, { details });
  }

  info(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addLog('INFO', message, { details });
  }

  warn(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addLog('WARN', message, { details });
  }

  error(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addLog('ERROR', message, { details });
  }

  logApiCall(meta: {
    model: string;
    action: string;
    latencyMs: number;
    tokens?: { prompt?: number; completion?: number; total?: number };
    costUsd?: number;
    success: boolean;
    error?: string;
    details?: Record<string, unknown>;
  }): LogEntry {
    const level: LogLevel = meta.success ? 'INFO' : 'ERROR';
    const message = meta.success
      ? `LLM ${meta.action} completed (${meta.model}) in ${meta.latencyMs}ms`
      : `LLM ${meta.action} failed (${meta.model}) after ${meta.latencyMs}ms: ${meta.error || 'Unknown error'}`;

    return this.addLog(level, message, {
      details: meta.details,
      latencyMs: meta.latencyMs,
      model: meta.model,
      tokens: meta.tokens,
      costUsd: meta.costUsd,
    });
  }
}

export function getLogs(options?: { level?: LogLevel; search?: string; limit?: number }): LogEntry[] {
  let filtered = inMemoryLogs;
  if (options?.level) {
    filtered = filtered.filter((log) => log.level === options.level);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        (log.model && log.model.toLowerCase().includes(q))
    );
  }
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  return filtered;
}

export function clearLogs(): void {
  inMemoryLogs.length = 0;
}

export function getLogMetrics() {
  const total = inMemoryLogs.length;
  const errors = inMemoryLogs.filter((l) => l.level === 'ERROR').length;
  const warnings = inMemoryLogs.filter((l) => l.level === 'WARN').length;
  const apiCalls = inMemoryLogs.filter((l) => l.model !== undefined);
  const totalTokens = apiCalls.reduce((sum, l) => sum + (l.tokens?.total || 0), 0);
  const totalCostUsd = apiCalls.reduce((sum, l) => sum + (l.costUsd || 0), 0);
  const avgLatency = apiCalls.length > 0
    ? Math.round(apiCalls.reduce((sum, l) => sum + (l.latencyMs || 0), 0) / apiCalls.length)
    : 0;

  return {
    total,
    errors,
    warnings,
    apiCallsCount: apiCalls.length,
    totalTokens,
    totalCostUsd,
    totalCostInr: totalCostUsd * 87.5,
    avgLatencyMs: avgLatency,
  };
}
