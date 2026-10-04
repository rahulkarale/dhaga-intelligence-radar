export type TabType = 'live-radar' | 'batch-pipeline' | 'fit-brief' | 'data-validator' | 'cost-roi' | 'logs';

export interface Vendor {
  id: string;
  name: string;
  hub: 'Jaipur' | 'Tiruppur' | 'Surat' | 'Delhi';
  category: 'Womenswear' | 'Kidswear' | 'Mens Basics';
  leadTimeDays: number;
  activeSkus: number;
  returnRate: number;
  topDefect: string;
  rating: number;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  orderDate: string;
  deliveredDate: string;
  returnDate: string;
  sku: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  category: 'Womenswear' | 'Kidswear' | 'Mens Basics';
  price: number;
  sizeOrdered: string;
  colorRaw: string;
  officialReturnReason: string;
  freeTextOtherReason: string;
  customerLanguage: 'Hinglish' | 'English' | 'Hindi';
  cod: boolean;
  status: 'Initiated' | 'In-Transit' | 'Inspected-Restocked' | 'Inspected-Rejected';
}

export interface SingleAnalysisResult {
  returnId: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  rawText: string;
  normalizedText: string;
  translatedEnglish: string;
  normalizedColor: string;
  garmentZone: 'Bust' | 'Waist' | 'Shoulder/Sleeve' | 'Length/Hem' | 'Neckline' | 'Fabric/Transparency' | 'General Quality';
  rootCause: 'Sizing Defect (Under-spec)' | 'Sizing Defect (Over-spec)' | 'Color Bleed / Fastness' | 'Fabric Transparency / Flaw' | 'Stitching / Trim Defect' | 'Transit / RTO Mismatch';
  confidenceScore: number;
  severityScore: number;
  routingTarget: 'Vendor Sourcing Action' | 'Listing Copy & Size Chart Fix' | 'Warehouse Quarantine' | 'Customer Proactive Resolution';
  actionableRecommendation: string;
  specCorrectionNote: string;
  timingMs: number;
  tokens: { prompt: number; completion: number; total: number };
  costUsd: number;
  mode: 'live' | 'simulation';
  errorNotice?: string;
}

export interface WeeklyFitBrief {
  briefId: string;
  generationDate: string;
  title: string;
  executiveSummary: string;
  highRiskSkus: Array<{
    sku: string;
    productName: string;
    vendorName: string;
    returnRatePercent: number;
    primaryIssue: string;
    recommendedSpecFix: string;
  }>;
  vendorScorecardSummary: Array<{
    vendorName: string;
    hub: string;
    sampleCount: number;
    fitDefectRate: number;
    actionRequired: string;
  }>;
  listingCopyFixes: Array<{
    sku: string;
    currentListingFlaw: string;
    suggestedAddendum: string;
  }>;
  financialImpact: {
    estimatedWeeklyReturnsPrevented: number;
    estimatedWeeklyLogisticsSavingsInr: number;
    annualizedProjectedSavingsInr: number;
  };
  evaluatorScore: {
    factualAccuracyScore: number;
    hallucinationCheckPassed: boolean;
    specFeasibilityScore: number;
    critiqueNotes: string;
    optimizerPasses: number;
  };
  mode: 'live' | 'simulation';
  totalPipelineTokens: number;
  totalCostUsd: number;
}

export interface ValidationCase {
  id: string;
  name: string;
  description: string;
  ruleCategory: 'Integrity' | 'Temporal' | 'Schema' | 'Business Logic';
  samplePayload: Record<string, unknown>;
  expectedValid: boolean;
  expectedError: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
  details?: Record<string, unknown>;
  latencyMs?: number;
  model?: string;
  tokens?: { prompt?: number; completion?: number; total?: number };
  costUsd?: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  environment: string;
  openRouter: {
    isConfigured: boolean;
    maskedKey: string | null;
    fastModel: string;
    judgeModel: string;
    baseUrl: string;
  };
  logs: {
    total: number;
    errors: number;
    warnings: number;
    apiCallsCount: number;
    totalTokens: number;
    totalCostUsd: number;
    totalCostInr: number;
    avgLatencyMs: number;
  };
}
