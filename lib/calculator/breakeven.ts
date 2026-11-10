import {
  BusinessType,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  EcommerceEconomicsInputs,
  EconomicsCalculations,
  BreakEvenCalculations,
} from "@/types/calculator";

/**
 * Calculates break-even thresholds: Max CPA, Max CPL, Max CPC,
 * minimum orders to cover fixed costs, and safety margin.
 */
export function calculateBreakEven(params: {
  businessType: BusinessType;
  economics: EconomicsCalculations;
  desiredProfitPerSale?: number;
  serviceFunnel?: ServiceFunnelInputs;
  ecommerceFunnel?: EcommerceFunnelInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
}): BreakEvenCalculations {
  const {
    businessType,
    economics,
    desiredProfitPerSale = 0,
    serviceFunnel,
    ecommerceFunnel,
    ecommerceEconomics,
  } = params;

  const unitMargin = Math.max(0, economics.unitContributionMargin);
  const maxBreakevenCpa = unitMargin;

  let overallClickToCustomerRate = 0;
  let overallLeadToCustomerRate = 0;

  if (businessType === "services") {
    const clickToLead = Math.max(0, serviceFunnel?.clickToLeadRate || 0) / 100;
    const leadToQual = Math.max(0, serviceFunnel?.leadToQualifiedRate || 0) / 100;
    const qualToClient = Math.max(0, serviceFunnel?.qualifiedToClientRate || 0) / 100;

    overallLeadToCustomerRate = leadToQual * qualToClient;
    overallClickToCustomerRate = clickToLead * overallLeadToCustomerRate;
  } else {
    // Ecommerce
    const clickToPurchase = Math.max(0, ecommerceFunnel?.clickToPurchaseRate || 0) / 100;
    const cancelPct = Math.min(100, Math.max(0, ecommerceEconomics?.cancellationRatePercentage || 0)) / 100;
    const returnPct = Math.min(100, Math.max(0, ecommerceEconomics?.returnRatePercentage || 0)) / 100;

    // Net conversion rate per click
    overallClickToCustomerRate = clickToPurchase * (1 - cancelPct) * (1 - returnPct);
    overallLeadToCustomerRate = 0;
  }

  const maxBreakevenCpl = maxBreakevenCpa * overallLeadToCustomerRate;
  const maxBreakevenCpc = maxBreakevenCpa * overallClickToCustomerRate;

  // Target profit CPA
  const safeProfit = Math.max(0, desiredProfitPerSale);
  const targetProfitCpa = Math.max(0, unitMargin - safeProfit);

  // Minimum volume to cover fixed costs (agency fee + fixed campaign costs)
  let minOrdersForBreakeven = 0;
  let minRevenueForBreakeven = 0;

  if (unitMargin > 0 && economics.totalFixedCosts > 0) {
    minOrdersForBreakeven = Math.ceil(economics.totalFixedCosts / unitMargin);
    minRevenueForBreakeven = minOrdersForBreakeven * economics.unitPrice;
  }

  // Safety margin: ((Projected Revenue - Breakeven Revenue) / Projected Revenue) * 100
  let safetyMarginPercentage = 0;
  if (economics.totalNetRevenue > 0 && minRevenueForBreakeven > 0) {
    safetyMarginPercentage =
      ((economics.totalNetRevenue - minRevenueForBreakeven) /
        economics.totalNetRevenue) *
      100;
  } else if (economics.totalNetRevenue > 0 && economics.totalFixedCosts === 0) {
    safetyMarginPercentage = 100;
  }

  return {
    maxBreakevenCpa: Number.isFinite(maxBreakevenCpa) ? maxBreakevenCpa : 0,
    maxBreakevenCpl: Number.isFinite(maxBreakevenCpl) ? maxBreakevenCpl : 0,
    maxBreakevenCpc: Number.isFinite(maxBreakevenCpc) ? maxBreakevenCpc : 0,
    targetProfitCpa: Number.isFinite(targetProfitCpa) ? targetProfitCpa : 0,
    minOrdersForBreakeven: Number.isFinite(minOrdersForBreakeven)
      ? minOrdersForBreakeven
      : 0,
    minRevenueForBreakeven: Number.isFinite(minRevenueForBreakeven)
      ? minRevenueForBreakeven
      : 0,
    safetyMarginPercentage: Number.isFinite(safetyMarginPercentage)
      ? safetyMarginPercentage
      : 0,
  };
}
