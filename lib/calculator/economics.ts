import {
  BusinessType,
  ServiceEconomicsInputs,
  EcommerceEconomicsInputs,
  FunnelCalculations,
  EconomicsCalculations,
} from "@/types/calculator";

/**
 * Calculates unit economics, total contribution margin, and net profit.
 */
export function calculateEconomics(params: {
  businessType: BusinessType;
  adSpend: number;
  funnel: FunnelCalculations;
  serviceEconomics?: ServiceEconomicsInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
}): EconomicsCalculations {
  const {
    businessType,
    adSpend,
    funnel,
    serviceEconomics,
    ecommerceEconomics,
  } = params;

  let unitPrice = 0;
  let unitVariableCost = 0;
  let unitContributionMargin = 0;
  let unitContributionMarginPercentage = 0;
  let totalNetRevenue = 0;
  let totalVariableCosts = 0;
  let totalContributionMargin = 0;
  let totalFixedCosts = 0;
  let managementFeeTotal = 0;
  let toolsTotal = 0;
  let otherMonthlyTotal = 0;
  let avgPurchases = 1;
  let ltvUnitRevenue = 0;
  let ltvUnitMargin = 0;
  let recurringRevenue = 0;
  let recurringMargin = 0;

  if (businessType === "services") {
    const rawPrice = Math.max(0, serviceEconomics?.pricePerClient || 0);
    avgPurchases = Math.max(1, serviceEconomics?.averagePurchasesPerClient || 1);

    // First purchase / single sale unit economics
    unitPrice = rawPrice;

    const deliveryCost = Math.max(0, serviceEconomics?.serviceDeliveryCost || 0);
    const otherVar = Math.max(0, serviceEconomics?.otherVariableCosts || 0);
    const advUnit = Math.max(0, serviceEconomics?.advancedUnitCost || 0);
    unitVariableCost = deliveryCost + otherVar + advUnit;

    unitContributionMargin = unitPrice - unitVariableCost;
    unitContributionMarginPercentage =
      unitPrice > 0 ? (unitContributionMargin / unitPrice) * 100 : 0;

    const clients = funnel.clients;
    totalNetRevenue = clients * unitPrice;
    totalVariableCosts = clients * unitVariableCost;
    totalContributionMargin = totalNetRevenue - totalVariableCosts;

    // Separate LTV / repeat purchases calculation (distinguishing first purchase from recurring)
    ltvUnitRevenue = unitPrice * avgPurchases;
    ltvUnitMargin = unitContributionMargin * avgPurchases;
    recurringRevenue = clients * unitPrice * Math.max(0, avgPurchases - 1);
    recurringMargin = clients * unitContributionMargin * Math.max(0, avgPurchases - 1);

    // Monthly fixed expenses (never deducted in unit margin)
    managementFeeTotal = Math.max(0, serviceEconomics?.managementFee || 0);
    toolsTotal = Math.max(0, serviceEconomics?.fixedCampaignCosts || 0);
    const additional = Math.max(0, serviceEconomics?.additionalCosts || 0);
    const otherMonthly = Math.max(0, serviceEconomics?.otherMonthlyExpenses || 0);
    const customSum = (serviceEconomics?.customMonthlyExpenses || []).reduce(
      (sum, item) => sum + Math.max(0, item.amount || 0),
      0
    );
    otherMonthlyTotal = additional + otherMonthly + customSum;
    totalFixedCosts = managementFeeTotal + toolsTotal + otherMonthlyTotal;
  } else {
    // Ecommerce
    const avgPrice = Math.max(0, ecommerceEconomics?.averageProductPrice || 0);
    const discountPct = Math.min(100, Math.max(0, ecommerceEconomics?.discountPercentage || 0)) / 100;
    avgPurchases = Math.max(1, ecommerceEconomics?.averagePurchasesPerClient || 1);
    unitPrice = avgPrice * (1 - discountPct);

    const cogs = Math.max(0, ecommerceEconomics?.cogs || 0);
    const packaging = Math.max(0, ecommerceEconomics?.packagingCost || 0);
    const shipping = Math.max(0, ecommerceEconomics?.shippingCostStore || 0);
    const gatewayPct = Math.min(100, Math.max(0, ecommerceEconomics?.gatewayFeePercentage || 0)) / 100;
    const otherVar = Math.max(0, ecommerceEconomics?.otherVariableCosts || 0);
    const advUnit = Math.max(0, ecommerceEconomics?.advancedUnitCost || 0);

    const gatewayCostUnit = unitPrice * gatewayPct;
    unitVariableCost = cogs + packaging + shipping + gatewayCostUnit + otherVar + advUnit;

    unitContributionMargin = unitPrice - unitVariableCost;
    unitContributionMarginPercentage =
      unitPrice > 0 ? (unitContributionMargin / unitPrice) * 100 : 0;

    const netOrders = funnel.netOrders;
    totalNetRevenue = netOrders * unitPrice;
    totalVariableCosts = netOrders * unitVariableCost;
    totalContributionMargin = totalNetRevenue - totalVariableCosts;

    ltvUnitRevenue = unitPrice * avgPurchases;
    ltvUnitMargin = unitContributionMargin * avgPurchases;
    recurringRevenue = netOrders * unitPrice * Math.max(0, avgPurchases - 1);
    recurringMargin = netOrders * unitContributionMargin * Math.max(0, avgPurchases - 1);

    managementFeeTotal = Math.max(0, ecommerceEconomics?.managementFee || 0);
    toolsTotal = Math.max(0, ecommerceEconomics?.fixedCampaignCosts || 0);
    const otherMonthly = Math.max(0, ecommerceEconomics?.otherMonthlyExpenses || 0);
    const customSum = (ecommerceEconomics?.customMonthlyExpenses || []).reduce(
      (sum, item) => sum + Math.max(0, item.amount || 0),
      0
    );
    otherMonthlyTotal = otherMonthly + customSum;
    totalFixedCosts = managementFeeTotal + toolsTotal + otherMonthlyTotal;
  }

  const adProfit = totalContributionMargin - adSpend;
  const netProfit = adProfit - totalFixedCosts;
  const netProfitWithLtv = netProfit + recurringMargin;

  return {
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    unitVariableCost: Number.isFinite(unitVariableCost) ? unitVariableCost : 0,
    unitContributionMargin: Number.isFinite(unitContributionMargin)
      ? unitContributionMargin
      : 0,
    unitContributionMarginPercentage: Number.isFinite(unitContributionMarginPercentage)
      ? unitContributionMarginPercentage
      : 0,
    totalNetRevenue: Number.isFinite(totalNetRevenue) ? totalNetRevenue : 0,
    totalVariableCosts: Number.isFinite(totalVariableCosts) ? totalVariableCosts : 0,
    totalContributionMargin: Number.isFinite(totalContributionMargin)
      ? totalContributionMargin
      : 0,
    totalFixedCosts: Number.isFinite(totalFixedCosts) ? totalFixedCosts : 0,
    totalAdSpend: Number.isFinite(adSpend) ? adSpend : 0,
    netProfit: Number.isFinite(netProfit) ? netProfit : 0,
    adProfit: Number.isFinite(adProfit) ? adProfit : 0,
    managementFeeTotal: Number.isFinite(managementFeeTotal) ? managementFeeTotal : 0,
    toolsTotal: Number.isFinite(toolsTotal) ? toolsTotal : 0,
    otherMonthlyTotal: Number.isFinite(otherMonthlyTotal) ? otherMonthlyTotal : 0,
    averagePurchasesPerClient: avgPurchases,
    ltvUnitRevenue: Number.isFinite(ltvUnitRevenue) ? ltvUnitRevenue : 0,
    ltvUnitMargin: Number.isFinite(ltvUnitMargin) ? ltvUnitMargin : 0,
    recurringRevenue: Number.isFinite(recurringRevenue) ? recurringRevenue : 0,
    recurringMargin: Number.isFinite(recurringMargin) ? recurringMargin : 0,
    netProfitWithLtv: Number.isFinite(netProfitWithLtv) ? netProfitWithLtv : 0,
  };
}
