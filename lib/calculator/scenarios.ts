import {
  BusinessType,
  AdvertisingMetricsInputs,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  EcommerceEconomicsInputs,
  ServiceEconomicsInputs,
  ScenarioResult,
} from "@/types/calculator";
import { ScenarioParameters } from "@/types/benchmarks";
import { calculateAdvertisingMetrics } from "./advertising";
import { calculateFunnelMetrics } from "./funnel";
import { calculateEconomics } from "./economics";
import { calculateProfitability } from "./profitability";

export const DEFAULT_SCENARIO_PARAMETERS: ScenarioParameters = {
  pessimistic: {
    cpcMultiplier: 1.3, // CPC +30%
    conversionMultiplier: 0.7, // Conversiones -30%
  },
  optimistic: {
    cpcMultiplier: 0.8, // CPC -20%
    conversionMultiplier: 1.25, // Conversiones +25%
  },
};

export function calculateScenarios(params: {
  businessType: BusinessType;
  adSpend: number;
  advertising: AdvertisingMetricsInputs;
  serviceEconomics?: ServiceEconomicsInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
  serviceFunnel?: ServiceFunnelInputs;
  ecommerceFunnel?: EcommerceFunnelInputs;
  customParameters?: ScenarioParameters;
}): {
  pessimistic: ScenarioResult;
  realistic: ScenarioResult;
  optimistic: ScenarioResult;
} {
  const {
    businessType,
    adSpend,
    advertising,
    serviceEconomics,
    ecommerceEconomics,
    serviceFunnel,
    ecommerceFunnel,
    customParameters = DEFAULT_SCENARIO_PARAMETERS,
  } = params;

  function runSingleScenario(
    name: "Pessimistic" | "Realistic" | "Optimistic",
    label: string,
    cpcFactor: number,
    conversionFactor: number
  ): ScenarioResult {
    // Adjust advertising metrics based on CPC factor
    let modifiedAdvertising = { ...advertising, budget: adSpend };
    if (advertising.inputMode === "cpc_direct") {
      modifiedAdvertising.manualCpc = advertising.manualCpc * cpcFactor;
    } else {
      // In CPM mode, higher CPC means higher CPM or lower CTR
      modifiedAdvertising.cpm = advertising.cpm * cpcFactor;
    }

    const advCalc = calculateAdvertisingMetrics(modifiedAdvertising);

    // Adjust funnel rates
    let adjustedServiceFunnel: ServiceFunnelInputs | undefined;
    if (serviceFunnel) {
      adjustedServiceFunnel = {
        clickToLeadRate: serviceFunnel.clickToLeadRate * conversionFactor,
        leadToQualifiedRate: serviceFunnel.leadToQualifiedRate * conversionFactor,
        qualifiedToClientRate:
          serviceFunnel.qualifiedToClientRate * conversionFactor,
      };
    }

    let adjustedEcommerceFunnel: EcommerceFunnelInputs | undefined;
    if (ecommerceFunnel) {
      adjustedEcommerceFunnel = {
        clickToPurchaseRate:
          ecommerceFunnel.clickToPurchaseRate * conversionFactor,
      };
    }

    const funnelCalc = calculateFunnelMetrics({
      businessType,
      clicks: advCalc.clicks,
      adSpend,
      serviceFunnel: adjustedServiceFunnel,
      ecommerceFunnel: adjustedEcommerceFunnel,
      ecommerceEconomics,
    });

    const economicsCalc = calculateEconomics({
      businessType,
      adSpend,
      funnel: funnelCalc,
      serviceEconomics,
      ecommerceEconomics,
    });

    const profitabilityCalc = calculateProfitability(economicsCalc);

    const leadsOrPurchases =
      businessType === "services"
        ? funnelCalc.rawLeads
        : funnelCalc.initialPurchases;

    const clientsOrNetOrders =
      businessType === "services" ? funnelCalc.clients : funnelCalc.netOrders;

    const cpa =
      businessType === "services" ? funnelCalc.cpa : funnelCalc.effectiveCpa;

    return {
      name,
      label,
      adSpend,
      impressions: advCalc.impressions,
      clicks: advCalc.clicks,
      cpc: advCalc.effectiveCpc,
      leadsOrPurchases,
      clientsOrNetOrders,
      revenue: economicsCalc.totalNetRevenue,
      cpa,
      roas: profitabilityCalc.roas,
      adRoi: profitabilityCalc.adRoiPercentage,
      totalRoi: profitabilityCalc.totalRoiPercentage,
      netProfit: economicsCalc.netProfit,
      status: profitabilityCalc.profitabilityStatus,
    };
  }

  const pessimistic = runSingleScenario(
    "Pessimistic",
    "Escenario Pesimista",
    customParameters.pessimistic.cpcMultiplier,
    customParameters.pessimistic.conversionMultiplier
  );

  const realistic = runSingleScenario("Realistic", "Escenario Realista", 1.0, 1.0);

  const optimistic = runSingleScenario(
    "Optimistic",
    "Escenario Optimista",
    customParameters.optimistic.cpcMultiplier,
    customParameters.optimistic.conversionMultiplier
  );

  return { pessimistic, realistic, optimistic };
}
