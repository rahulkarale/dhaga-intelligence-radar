/**
 * OpenRouter LLM Gateway for Dhaga & Co. Intelligence Radar
 * Enforces security best practices:
 * - Environment variable isolation (never leak key to client)
 * - Sanitized request headers and error handling
 * - Model cost and token usage tracking
 * - High-fidelity deterministic fallback simulation when API key is missing or testing offline
 */

import { Logger } from './logger.js';

const logger = new Logger('OpenRouterClient');

export interface OpenRouterConfig {
  apiKey?: string;
  baseUrl: string;
  fastModel: string;
  judgeModel: string;
}

export function getOpenRouterConfig(overrideKey?: string): OpenRouterConfig {
  const envKey = process.env.OPENROUTER_API_KEY;
  const apiKey = overrideKey?.trim() || (envKey && envKey !== 'MY_OPENROUTER_API_KEY' ? envKey.trim() : undefined);
  return {
    apiKey,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    fastModel: process.env.OPENROUTER_MODEL_FAST || 'google/gemini-2.5-flash',
    judgeModel: process.env.OPENROUTER_MODEL_JUDGE || 'anthropic/claude-3.5-sonnet',
  };
}

export function getMaskedApiKey(key?: string): string | null {
  const target = key || process.env.OPENROUTER_API_KEY;
  if (!target || target === 'MY_OPENROUTER_API_KEY') return null;
  if (target.length <= 10) return '***[CONFIGURED]';
  const prefix = target.slice(0, 8);
  const suffix = target.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

// Approximate cost rates per 1,000,000 tokens for reporting
const MODEL_PRICING: Record<string, { promptPerM: number; completionPerM: number }> = {
  'google/gemini-2.5-flash': { promptPerM: 0.075, completionPerM: 0.30 },
  'google/gemini-2.5-pro': { promptPerM: 1.25, completionPerM: 5.00 },
  'meta-llama/llama-3.1-8b-instruct': { promptPerM: 0.05, completionPerM: 0.08 },
  'meta-llama/llama-3.3-70b-instruct': { promptPerM: 0.35, completionPerM: 0.40 },
  'anthropic/claude-3.5-sonnet': { promptPerM: 3.00, completionPerM: 15.00 },
  'anthropic/claude-3-haiku': { promptPerM: 0.25, completionPerM: 1.25 },
};

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = MODEL_PRICING[model] || { promptPerM: 0.15, completionPerM: 0.60 };
  const promptCost = (promptTokens / 1_000_000) * pricing.promptPerM;
  const completionCost = (completionTokens / 1_000_000) * pricing.completionPerM;
  return Number((promptCost + completionCost).toFixed(6));
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionResult {
  content: string;
  model: string;
  latencyMs: number;
  tokens: { prompt: number; completion: number; total: number };
  costUsd: number;
  mode: 'live' | 'simulation';
  errorNotice?: string;
}

export async function callOpenRouter(
  messages: ChatMessage[],
  options: {
    modelRole: 'fast' | 'judge';
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    overrideKey?: string;
    fallbackSimulatedContent?: () => string;
  }
): Promise<CompletionResult> {
  const config = getOpenRouterConfig(options.overrideKey);
  const targetModel = options.modelRole === 'fast' ? config.fastModel : config.judgeModel;
  const startTime = Date.now();

  // If no API key is provided, use deterministic fallback simulation with clear notice
  if (!config.apiKey) {
    logger.warn(`No OpenRouter API key provided. Using deterministic fallback for role '${options.modelRole}'.`);
    const simulated = options.fallbackSimulatedContent
      ? options.fallbackSimulatedContent()
      : '{"status": "simulated_success", "note": "Simulation fallback activated"}';
    
    const latencyMs = Math.floor(Math.random() * 80) + 120;
    const estPromptTokens = Math.round(messages.reduce((acc, m) => acc + m.content.length, 0) / 4);
    const estCompletionTokens = Math.round(simulated.length / 4);
    const cost = calculateCost(targetModel, estPromptTokens, estCompletionTokens);

    logger.logApiCall({
      model: `${targetModel} (Simulated)`,
      action: `Completion [${options.modelRole}]`,
      latencyMs,
      tokens: { prompt: estPromptTokens, completion: estCompletionTokens, total: estPromptTokens + estCompletionTokens },
      costUsd: cost,
      success: true,
      details: { simulation: true, reason: 'OPENROUTER_API_KEY_NOT_SET' },
    });

    return {
      content: simulated,
      model: targetModel,
      latencyMs,
      tokens: {
        prompt: estPromptTokens,
        completion: estCompletionTokens,
        total: estPromptTokens + estCompletionTokens,
      },
      costUsd: cost,
      mode: 'simulation',
      errorNotice: 'Running in deterministic fallback mode (OPENROUTER_API_KEY not configured in environment).',
    };
  }

  // Live call to OpenRouter with security precautions
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://dhaga-co-radar.internal',
        'X-Title': 'Dhaga & Co. Intelligence Radar',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: options.temperature ?? (options.modelRole === 'fast' ? 0.1 : 0.4),
        max_tokens: options.maxTokens ?? 2048,
        response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      }),
      signal: AbortSignal.timeout(45000), // 45s safety timeout
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const j = JSON.parse(errText);
        parsedErr = j.error?.message || errText;
      } catch {
        // use raw
      }

      logger.logApiCall({
        model: targetModel,
        action: `Completion [${options.modelRole}]`,
        latencyMs,
        success: false,
        error: `Status ${response.status}: ${parsedErr}`,
      });

      // If fallback content available, fallback gracefully while recording visible notice
      if (options.fallbackSimulatedContent) {
        logger.warn(`API returned ${response.status}. Falling back to simulation response.`);
        const fallbackText = options.fallbackSimulatedContent();
        return {
          content: fallbackText,
          model: targetModel,
          latencyMs,
          tokens: { prompt: 150, completion: 200, total: 350 },
          costUsd: 0.0001,
          mode: 'simulation',
          errorNotice: `OpenRouter returned status ${response.status} (${parsedErr}). Fell back to simulation.`,
        };
      }

      throw new Error(`OpenRouter Error (${response.status}): ${parsedErr}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || 100;
    const completionTokens = usage.completion_tokens || 100;
    const totalTokens = usage.total_tokens || promptTokens + completionTokens;
    const costUsd = calculateCost(targetModel, promptTokens, completionTokens);

    logger.logApiCall({
      model: targetModel,
      action: `Completion [${options.modelRole}]`,
      latencyMs,
      tokens: { prompt: promptTokens, completion: completionTokens, total: totalTokens },
      costUsd,
      success: true,
    });

    return {
      content,
      model: targetModel,
      latencyMs,
      tokens: { prompt: promptTokens, completion: completionTokens, total: totalTokens },
      costUsd,
      mode: 'live',
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errMessage = err instanceof Error ? err.message : String(err);
    logger.logApiCall({
      model: targetModel,
      action: `Completion [${options.modelRole}]`,
      latencyMs,
      success: false,
      error: errMessage,
    });

    if (options.fallbackSimulatedContent) {
      logger.warn(`OpenRouter network error: ${errMessage}. Activated fallback engine.`);
      return {
        content: options.fallbackSimulatedContent(),
        model: targetModel,
        latencyMs,
        tokens: { prompt: 150, completion: 250, total: 400 },
        costUsd: 0.0001,
        mode: 'simulation',
        errorNotice: `Live model call failed: ${errMessage}. Showing simulated response.`,
      };
    }

    throw err;
  }
}
