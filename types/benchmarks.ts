import { BusinessType, CampaignObjective } from "./business";

export type BenchmarkMetric =
  | "cpm"
  | "ctr"
  | "cpc"
  | "click_to_lead"
  | "lead_to_qualified"
  | "qualified_to_client"
  | "click_to_purchase";

export type ConfidenceLevel =
  | "indicative"
  | "historical"
  | "verified_sample"
  | "illustrative_assumption";

export interface BenchmarkRecord {
  id: string;
  countryCode: string; // ISO Code (CO, MX, US, ES, etc.) or "GLOBAL"
  sectorId: string;
  objective: CampaignObjective;
  businessType: BusinessType;
  metric: BenchmarkMetric;
  value: number;
  currency: string;
  sourceName: string;
  sourceUrl?: string;
  sourceDate: string;
  updatedAt: string;
  confidenceLevel: ConfidenceLevel;
  isActive: boolean;
  notes?: string;
}

export type MetricOriginType = "estimated" | "real" | "edited";

export interface MetricMetaInfo {
  key: string;
  label: string;
  value: number;
  origin: MetricOriginType;
  sourceDescription?: string;
  isCustomized?: boolean;
}

export interface ResolvedBenchmarkPackage {
  cpm: number;
  ctr: number;
  cpc: number;
  clickToLead: number;
  leadToQualified: number;
  qualifiedToClient: number;
  clickToPurchase: number;
  confidenceLevel: ConfidenceLevel;
  isIllustrative: boolean;
  sourceNotice: string;
  sourceDate: string;
}

export interface ScenarioParameters {
  pessimistic: {
    cpcMultiplier: number;
    conversionMultiplier: number;
  };
  optimistic: {
    cpcMultiplier: number;
    conversionMultiplier: number;
  };
}
