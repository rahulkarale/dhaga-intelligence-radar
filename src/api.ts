import {
  ReturnRecord,
  SingleAnalysisResult,
  WeeklyFitBrief,
  SystemHealth,
  LogEntry,
  ValidationCase,
} from './types';

const SESSION_KEY_STORAGE = 'dhaga_radar_session_key';

export function getStoredSessionKey(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredSessionKey(key: string): void {
  try {
    if (key.trim()) {
      sessionStorage.setItem(SESSION_KEY_STORAGE, key.trim());
    } else {
      sessionStorage.removeItem(SESSION_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const sessionKey = getStoredSessionKey();
  if (sessionKey) {
    headers['x-openrouter-key'] = sessionKey;
  }
  return headers;
}

// Resilient JSON fetcher: Prevents "Unexpected token '<', <!doctype... is not valid JSON"
async function safeJsonFetch<T>(res: Response, fallback: T): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    // Received HTML (e.g. 502/503 during restart or SPA fallback)
    return fallback;
  }
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchHealth(): Promise<SystemHealth> {
  const fallback: SystemHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'development',
    openRouter: {
      isConfigured: false,
      maskedKey: null,
      fastModel: 'google/gemini-2.5-flash',
      judgeModel: 'anthropic/claude-3.5-sonnet',
      baseUrl: 'https://openrouter.ai/api/v1',
    },
    logs: {
      total: 0,
      errors: 0,
      warnings: 0,
      apiCallsCount: 0,
      totalTokens: 0,
      totalCostUsd: 0,
      totalCostInr: 0,
      avgLatencyMs: 0,
    },
  };

  try {
    const res = await fetch('/api/health', { headers: getHeaders() });
    if (!res.ok) return fallback;
    return await safeJsonFetch(res, fallback);
  } catch {
    return fallback;
  }
}

export async function testOpenRouterConnection(keyToTest?: string): Promise<{
  success: boolean;
  mode?: string;
  latencyMs?: number;
  model?: string;
  response?: string;
  message?: string;
  error?: string;
}> {
  const fallback = {
    success: false,
    error: 'Could not contact server API. Please try again.',
  };
  try {
    const res = await fetch('/api/radar/test-connection', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ apiKey: keyToTest }),
    });
    return await safeJsonFetch(res, fallback);
  } catch {
    return fallback;
  }
}

export async function fetchDatasets(): Promise<{
  vendors: any[];
  sampleReturns: ReturnRecord[];
  validationCases: ValidationCase[];
  businessConstants: any;
}> {
  const fallback = {
    vendors: [],
    sampleReturns: [],
    validationCases: [],
    businessConstants: {},
  };
  try {
    const res = await fetch('/api/radar/datasets', { headers: getHeaders() });
    return await safeJsonFetch(res, fallback);
  } catch {
    return fallback;
  }
}

export async function fetchMetrics(): Promise<any> {
  const fallback = {
    radarEconomics: {
      costPerReturnAnalysisInr: 0.18,
      weeklyLlmInferenceCostInr: 1178,
      annualLlmInferenceCostInr: 61256,
      preventedReturnsPerWeek: 960,
      weeklyLogisticsSavingsInr: 115200,
      annualLogisticsSavingsInr: 5990400,
      roiMultiplier: 98,
    },
  };
  try {
    const res = await fetch('/api/radar/metrics', { headers: getHeaders() });
    return await safeJsonFetch(res, fallback);
  } catch {
    return fallback;
  }
}

export async function analyzeSingleRecord(record: ReturnRecord): Promise<SingleAnalysisResult> {
  const res = await fetch('/api/radar/analyze-single', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ record }),
  });
  if (!res.ok) {
    const errObj = await safeJsonFetch<{ error?: string }>(res, { error: res.statusText });
    throw new Error(errObj.error || `Analysis failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function analyzeBatchRecords(records?: ReturnRecord[]): Promise<{
  results: SingleAnalysisResult[];
  totalTimeMs: number;
  totalTokens: number;
  totalCostUsd: number;
  summaryByRootCause: Record<string, number>;
  summaryByVendor: Record<string, { returns: number; avgSeverity: number; primaryDefect: string }>;
}> {
  const res = await fetch('/api/radar/analyze-batch', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ records }),
  });
  if (!res.ok) {
    const errObj = await safeJsonFetch<{ error?: string }>(res, { error: res.statusText });
    throw new Error(errObj.error || `Batch analysis failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateFitBrief(analyzedRecords?: SingleAnalysisResult[]): Promise<WeeklyFitBrief> {
  const res = await fetch('/api/radar/generate-fit-brief', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ records: analyzedRecords }),
  });
  if (!res.ok) {
    const errObj = await safeJsonFetch<{ error?: string }>(res, { error: res.statusText });
    throw new Error(errObj.error || `Fit Brief generation failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function validateInputPayload(testCaseId: string, payload: Record<string, unknown>): Promise<{
  valid: boolean;
  errors: string[];
  checkedAt: string;
}> {
  const res = await fetch('/api/radar/validate-input', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ testCaseId, payload }),
  });
  const fallback = {
    valid: false,
    errors: ['Validation check failed at network boundary'],
    checkedAt: new Date().toISOString(),
  };
  return await safeJsonFetch(res, fallback);
}

export async function fetchLogs(options?: { level?: string; search?: string; limit?: number }): Promise<{
  logs: LogEntry[];
  metrics: any;
}> {
  const fallback = {
    logs: [],
    metrics: {
      total: 0,
      errors: 0,
      warnings: 0,
      apiCallsCount: 0,
      totalTokens: 0,
      totalCostUsd: 0,
      totalCostInr: 0,
      avgLatencyMs: 0,
    },
  };

  try {
    const params = new URLSearchParams();
    if (options?.level) params.set('level', options.level);
    if (options?.search) params.set('search', options.search);
    if (options?.limit) params.set('limit', String(options.limit));

    const res = await fetch(`/api/logs?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) return fallback;
    return await safeJsonFetch(res, fallback);
  } catch {
    return fallback;
  }
}

export async function clearAllLogs(): Promise<void> {
  try {
    await fetch('/api/logs/clear', { method: 'POST', headers: getHeaders() });
  } catch {
    // ignore
  }
}

export async function triggerTestError(): Promise<any> {
  try {
    const res = await fetch('/api/logs/test-error', { method: 'POST', headers: getHeaders() });
    return await safeJsonFetch(res, { success: true });
  } catch {
    return { success: false };
  }
}
