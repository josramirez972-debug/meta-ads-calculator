import {
  EconomicsCalculations,
  ProfitabilityCalculations,
} from "@/types/calculator";

/**
 * Calculates ROAS, Ad ROI, Total ROI and assigns financial health status.
 * Never confuses ROAS with ROI. Handles zero spend safely.
 */
export function calculateProfitability(
  economics: EconomicsCalculations
): ProfitabilityCalculations {
  const {
    totalNetRevenue,
    totalContributionMargin,
    totalAdSpend,
    totalFixedCosts,
    netProfit,
  } = economics;

  // ROAS: Gross/Net Revenue / Ad Spend
  const roas = totalAdSpend > 0 ? totalNetRevenue / totalAdSpend : 0;

  // Advertising ROI: (Contribution Margin - Ad Spend) / Ad Spend * 100
  const adRoiPercentage =
    totalAdSpend > 0
      ? ((totalContributionMargin - totalAdSpend) / totalAdSpend) * 100
      : 0;

  // Total ROI: Net Profit / (Ad Spend + Fixed Costs) * 100
  const totalInvestment = totalAdSpend + totalFixedCosts;
  const totalRoiPercentage =
    totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  let profitabilityStatus: "loss" | "breakeven" | "profitable" | "highly_profitable" =
    "loss";
  let profitabilityBadgeText = "En Pérdidas";

  if (totalInvestment <= 0) {
    profitabilityStatus = "breakeven";
    profitabilityBadgeText = "Sin inversión calculada";
  } else if (netProfit < 0) {
    profitabilityStatus = "loss";
    profitabilityBadgeText = "Proyección en Pérdida";
  } else if (netProfit <= totalInvestment * 0.05) {
    profitabilityStatus = "breakeven";
    profitabilityBadgeText = "En Punto de Equilibrio";
  } else if (totalRoiPercentage > 50) {
    profitabilityStatus = "highly_profitable";
    profitabilityBadgeText = "Alta Rentabilidad";
  } else {
    profitabilityStatus = "profitable";
    profitabilityBadgeText = "Rentabilidad Positiva";
  }

  return {
    roas: Number.isFinite(roas) ? roas : 0,
    adRoiPercentage: Number.isFinite(adRoiPercentage) ? adRoiPercentage : 0,
    totalRoiPercentage: Number.isFinite(totalRoiPercentage) ? totalRoiPercentage : 0,
    profitabilityStatus,
    profitabilityBadgeText,
  };
}
