export type AdCategory = 'Winner' | 'Underperformer' | 'Fatigued' | 'Moderate';

export interface RawAdRow {
  [key: string]: string | number | undefined;
}

export interface AdCreative {
  id: string;
  adName: string;
  creativeCopy: string;
  headline?: string;
  primaryText?: string;
  cta?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number; // percentage, e.g. 2.45
  conversions: number;
  revenue: number;
  cpa: number; // Cost per acquisition = spend / conversions
  roas: number; // Revenue / Spend
  cpc: number; // Cost per click = spend / clicks
  cpm: number; // Cost per 1k impressions = (spend / impressions) * 1000
  category: AdCategory;
  categoryReason?: string;
  dataHealthFlags?: string[];
}

export interface BenchmarkThresholds {
  targetCPA: number; // e.g. 35.00
  targetROAS: number; // e.g. 2.5
  minCTR: number; // e.g. 1.8
  minConversionsForWinner: number; // e.g. 5
}

export interface CleaningSummary {
  totalRows: number;
  validRows: number;
  repairedFields: number;
  calculatedFields: {
    cpaCount: number;
    roasCount: number;
    ctrCount: number;
  };
  warnings: string[];
  healthScore: number; // 0 to 100
}

export interface HookPattern {
  angleName: string; // e.g., "Problem - Direct Pain Point Callout"
  description: string;
  frequency: string; // e.g., "4 of 5 Top Ads"
  exampleExcerpt: string;
  impactScore: number; // 1 to 10
}

export interface PatternAnalysisResult {
  summary: string;
  winningHooks: HookPattern[];
  underperformerFlaws: string[];
  fatigueSignals: string[];
  copywritingTriggers: string[];
  audienceInsights: string;
  creativeRecommendations: string[];
  notice?: string;
  isFallback?: boolean;
}

export interface GeneratedAdCopy {
  id: string;
  title: string;
  hook: string;
  primaryCopy: string;
  headline: string;
  cta: string;
  angleType: string;
  targetPersona: string;
  whyItWorks: string;
  predictedHookScore: number; // 1 to 10
  format: 'meta' | 'google' | 'tiktok' | 'linkedin';
}

export interface AdGeneratorConfig {
  brandContext: string;
  targetAudience: string;
  selectedAngle: string;
  platformFormat: 'meta' | 'google' | 'tiktok' | 'linkedin';
  customInstructions: string;
}

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  industry: string;
  adCount: number;
  csvContent: string;
}
