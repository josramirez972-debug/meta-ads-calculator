import { AdvertisingMetricsInputs, AdvertisingCalculations } from "@/types/calculator";

/**
 * Calculates advertising metrics (Impressions, Clicks, CPC, CPM, CTR)
 * Handles division by zero gracefully and never returns NaN or Infinity.
 */
export function calculateAdvertisingMetrics(
  inputs: AdvertisingMetricsInputs
): AdvertisingCalculations {
  const budget = Math.max(0, inputs.budget || 0);
  const duration = Math.max(1, inputs.campaignDurationDays || 1);
  const dailyBudget = budget / duration;

  let impressions = 0;
  let clicks = 0;
  let effectiveCpc = 0;
  let effectiveCpm = 0;
  let effectiveCtr = 0;

  if (inputs.inputMode === "cpc_direct") {
    effectiveCpc = Math.max(0, inputs.manualCpc || 0);
    if (effectiveCpc > 0 && budget >= effectiveCpc) {
      clicks = budget / effectiveCpc;
    } else {
      clicks = 0;
    }

    effectiveCtr = Math.max(0, inputs.ctr || 1.0); // Supuesto de CTR si no se provee
    if (effectiveCtr > 0 && clicks > 0) {
      impressions = clicks / (effectiveCtr / 100);
      effectiveCpm = impressions > 0 ? (budget / impressions) * 1000 : 0;
    } else {
      impressions = 0;
      effectiveCpm = 0;
    }
  } else {
    // Mode cpm_ctr
    effectiveCpm = Math.max(0, inputs.cpm || 0);
    effectiveCtr = Math.max(0, inputs.ctr || 0);

    if (effectiveCpm > 0 && budget > 0) {
      impressions = (budget / effectiveCpm) * 1000;
    } else {
      impressions = 0;
    }

    if (impressions > 0 && effectiveCtr > 0) {
      const rawClicks = impressions * (effectiveCtr / 100);
      clicks = rawClicks >= 1 ? rawClicks : 0;
    } else {
      clicks = 0;
    }

    effectiveCpc = clicks > 0 ? budget / clicks : 0;
  }

  // Ensure finite and non-negative
  return {
    effectiveBudget: Number.isFinite(budget) ? budget : 0,
    dailyBudget: Number.isFinite(dailyBudget) ? dailyBudget : 0,
    impressions: Number.isFinite(impressions) ? impressions : 0,
    clicks: Number.isFinite(clicks) ? clicks : 0,
    effectiveCpc: Number.isFinite(effectiveCpc) ? effectiveCpc : 0,
    effectiveCpm: Number.isFinite(effectiveCpm) ? effectiveCpm : 0,
    effectiveCtr: Number.isFinite(effectiveCtr) ? effectiveCtr : 0,
  };
}
