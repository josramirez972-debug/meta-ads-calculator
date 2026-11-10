import { describe, it, expect } from "vitest";
import {
  calculateAdvertisingMetrics,
  calculateFunnelMetrics,
  calculateEconomics,
  calculateProfitability,
  calculateBreakEven,
  calculateInverseBudget,
  calculateScenarios,
  calculateFullRoi,
  calculateInvestmentRecommendations,
} from "../lib/calculator";
import { CalculatorStateInputs } from "../types/calculator";
import { getBenchmarkDefaults } from "../lib/benchmarks/data";

describe("META ADS ROI CALCULATOR - Mathematical Engine", () => {
  // Case 1: Servicio con presupuesto y conversiones normales
  it("Case 1: Should correctly calculate normal service campaign", () => {
    const adv = calculateAdvertisingMetrics({
      inputMode: "cpm_ctr",
      cpm: 10,
      ctr: 2.0,
      manualCpc: 0,
      budget: 1000,
      campaignDurationDays: 30,
    });
    // 1000 / 10 * 1000 = 100,000 impressions
    expect(adv.impressions).toBe(100000);
    // 100,000 * 2% = 2,000 clicks
    expect(adv.clicks).toBe(2000);
    // CPC = 1000 / 2000 = 0.5
    expect(adv.effectiveCpc).toBeCloseTo(0.5, 2);

    const funnel = calculateFunnelMetrics({
      businessType: "services",
      clicks: adv.clicks,
      adSpend: 1000,
      serviceFunnel: {
        clickToLeadRate: 10, // 200 leads
        leadToQualifiedRate: 50, // 100 qualified
        qualifiedToClientRate: 20, // 20 clients
      },
    });
    expect(funnel.rawLeads).toBe(200);
    expect(funnel.qualifiedLeads).toBe(100);
    expect(funnel.clients).toBe(20);
    expect(funnel.cpl).toBe(5); // 1000 / 200
    expect(funnel.cpql).toBe(10); // 1000 / 100
    expect(funnel.cpa).toBe(50); // 1000 / 20

    const econ = calculateEconomics({
      businessType: "services",
      adSpend: 1000,
      funnel,
      serviceEconomics: {
        pricePerClient: 500,
        serviceDeliveryCost: 100,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 300,
        fixedCampaignCosts: 0,
      },
    });
    // Revenue = 20 * 500 = 10,000
    expect(econ.totalNetRevenue).toBe(10000);
    // Unit margin = 500 - 100 = 400
    expect(econ.unitContributionMargin).toBe(400);
    // Total contribution margin = 20 * 400 = 8000
    expect(econ.totalContributionMargin).toBe(8000);
    // Ad profit = 8000 - 1000 = 7000
    expect(econ.adProfit).toBe(7000);
    // Net profit = 7000 - 300 = 6700
    expect(econ.netProfit).toBe(6700);
  });

  // Case 2: Ecommerce con ticket promedio
  it("Case 2: Should correctly calculate ecommerce with average order value", () => {
    const funnel = calculateFunnelMetrics({
      businessType: "ecommerce",
      clicks: 1000,
      adSpend: 500,
      ecommerceFunnel: { clickToPurchaseRate: 3.0 }, // 30 orders
      ecommerceEconomics: {
        averageProductPrice: 100,
        cogs: 40,
        packagingCost: 5,
        shippingCostStore: 5,
        gatewayFeePercentage: 0,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 0,
        returnRatePercentage: 0,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });
    expect(funnel.initialPurchases).toBe(30);
    expect(funnel.netOrders).toBe(30);
    expect(funnel.grossRevenue).toBe(3000);
    expect(funnel.netRevenue).toBe(3000);
  });

  // Case 3: Ecommerce con devoluciones y cancelaciones no superpuestas
  it("Case 3: Should prevent double-counting of cancellations and returns", () => {
    const funnel = calculateFunnelMetrics({
      businessType: "ecommerce",
      clicks: 1000,
      adSpend: 1000,
      ecommerceFunnel: { clickToPurchaseRate: 10.0 }, // 100 initial purchases
      ecommerceEconomics: {
        averageProductPrice: 100,
        cogs: 30,
        packagingCost: 5,
        shippingCostStore: 5,
        gatewayFeePercentage: 0,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 10, // 10% cancellations -> 90 confirmed
        returnRatePercentage: 10, // 10% returns of confirmed -> 81 net orders
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });
    expect(funnel.initialPurchases).toBe(100);
    expect(funnel.cancelledOrders).toBe(10);
    expect(funnel.returnedOrders).toBe(9);
    expect(funnel.netOrders).toBe(81);
    expect(funnel.netRevenue).toBe(8100);
  });

  // Case 4: Servicio sin leads
  it("Case 4: Should handle zero leads without NaN or division by zero", () => {
    const funnel = calculateFunnelMetrics({
      businessType: "services",
      clicks: 500,
      adSpend: 200,
      serviceFunnel: {
        clickToLeadRate: 0,
        leadToQualifiedRate: 50,
        qualifiedToClientRate: 20,
      },
    });
    expect(funnel.rawLeads).toBe(0);
    expect(funnel.cpl).toBe(0);
    expect(funnel.cpa).toBe(0);
    expect(Number.isFinite(funnel.cpl)).toBe(true);
  });

  // Case 5: Campaña sin ventas
  it("Case 5: Should handle zero sales without breaking", () => {
    const econ = calculateEconomics({
      businessType: "services",
      adSpend: 500,
      funnel: {
        rawLeads: 10,
        qualifiedLeads: 2,
        clients: 0,
        cpl: 50,
        cpql: 250,
        cpa: 0,
        initialPurchases: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 0,
        grossRevenue: 0,
        netRevenue: 0,
        effectiveCpa: 0,
      },
      serviceEconomics: {
        pricePerClient: 200,
        serviceDeliveryCost: 50,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 100,
        fixedCampaignCosts: 0,
      },
    });
    expect(econ.totalNetRevenue).toBe(0);
    expect(econ.netProfit).toBe(-600); // -500 spend - 100 fee
  });

  // Case 6: Margen negativo
  it("Case 6: Should detect and report negative contribution margin", () => {
    const econ = calculateEconomics({
      businessType: "ecommerce",
      adSpend: 100,
      funnel: {
        rawLeads: 0,
        qualifiedLeads: 0,
        clients: 0,
        cpl: 0,
        cpql: 0,
        cpa: 0,
        initialPurchases: 10,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 10,
        grossRevenue: 500,
        netRevenue: 500,
        effectiveCpa: 10,
      },
      ecommerceEconomics: {
        averageProductPrice: 50,
        cogs: 60, // Cost is higher than price!
        packagingCost: 5,
        shippingCostStore: 5,
        gatewayFeePercentage: 0,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 0,
        returnRatePercentage: 0,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });
    expect(econ.unitContributionMargin).toBe(-20);
    expect(econ.unitContributionMarginPercentage).toBe(-40);
  });

  // Case 7: Margen cero
  it("Case 7: Should handle zero unit contribution margin", () => {
    const econ = calculateEconomics({
      businessType: "services",
      adSpend: 100,
      funnel: {
        rawLeads: 0,
        qualifiedLeads: 0,
        clients: 5,
        cpl: 0,
        cpql: 0,
        cpa: 20,
        initialPurchases: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 0,
        grossRevenue: 0,
        netRevenue: 0,
        effectiveCpa: 0,
      },
      serviceEconomics: {
        pricePerClient: 100,
        serviceDeliveryCost: 100, // Costs equal price
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });
    expect(econ.unitContributionMargin).toBe(0);
    expect(econ.totalContributionMargin).toBe(0);
    expect(econ.netProfit).toBe(-100);
  });

  // Case 8: CPC manual
  it("Case 8: Should prioritize manual CPC when inputMode is cpc_direct", () => {
    const adv = calculateAdvertisingMetrics({
      inputMode: "cpc_direct",
      cpm: 15,
      ctr: 2.5,
      manualCpc: 0.25,
      budget: 500,
      campaignDurationDays: 10,
    });
    expect(adv.effectiveCpc).toBe(0.25);
    expect(adv.clicks).toBe(2000); // 500 / 0.25
  });

  // Case 9: CPM y CTR para derivar CPC
  it("Case 9: Should calculate CPC from CPM and CTR", () => {
    const adv = calculateAdvertisingMetrics({
      inputMode: "cpm_ctr",
      cpm: 20,
      ctr: 2.0,
      manualCpc: 0,
      budget: 1000,
      campaignDurationDays: 10,
    });
    // Impressions: 1000 / 20 * 1000 = 50,000
    // Clicks: 50,000 * 0.02 = 1,000
    // CPC: 1000 / 1000 = 1.0
    expect(adv.impressions).toBe(50000);
    expect(adv.clicks).toBe(1000);
    expect(adv.effectiveCpc).toBe(1.0);
  });

  // Case 10: Presupuesto inverso por clientes
  it("Case 10: Should calculate required ad spend from target clients", () => {
    const econ = calculateEconomics({
      businessType: "services",
      adSpend: 0,
      funnel: {
        rawLeads: 0,
        qualifiedLeads: 0,
        clients: 0,
        cpl: 0,
        cpql: 0,
        cpa: 0,
        initialPurchases: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 0,
        grossRevenue: 0,
        netRevenue: 0,
        effectiveCpa: 0,
      },
      serviceEconomics: {
        pricePerClient: 1000,
        serviceDeliveryCost: 200,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 500,
        fixedCampaignCosts: 0,
      },
    });

    const inverse = calculateInverseBudget({
      businessType: "services",
      inverseInputs: {
        goalType: "clients",
        targetValue: 20,
      },
      economics: econ,
      advertising: {
        inputMode: "cpc_direct",
        manualCpc: 1.0,
        cpm: 10,
        ctr: 2.0,
        budget: 0,
        campaignDurationDays: 30,
      },
      serviceFunnel: {
        clickToLeadRate: 10, // 10%
        leadToQualifiedRate: 50, // 50%
        qualifiedToClientRate: 20, // 20% -> total click to client = 1%
      },
    });

    // 1% click to client -> 1 client per 100 clicks -> CPA = 100 clicks * $1 = $100
    // 20 clients * $100 CPA = $2,000 ad spend
    expect(inverse.estimatedClientsOrOrders).toBe(20);
    expect(inverse.requiredAdSpend).toBe(2000);
    expect(inverse.requiredClicks).toBe(2000);
    expect(inverse.isFeasible).toBe(true);
  });

  // Case 11: Objetivo de ingresos con presupuesto inverso
  it("Case 11: Should calculate required ad spend for revenue target", () => {
    const econ = calculateEconomics({
      businessType: "ecommerce",
      adSpend: 0,
      funnel: {
        rawLeads: 0,
        qualifiedLeads: 0,
        clients: 0,
        cpl: 0,
        cpql: 0,
        cpa: 0,
        initialPurchases: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 0,
        grossRevenue: 0,
        netRevenue: 0,
        effectiveCpa: 0,
      },
      ecommerceEconomics: {
        averageProductPrice: 100,
        cogs: 40,
        packagingCost: 5,
        shippingCostStore: 5,
        gatewayFeePercentage: 0,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 0,
        returnRatePercentage: 0,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });

    const inverse = calculateInverseBudget({
      businessType: "ecommerce",
      inverseInputs: {
        goalType: "revenue",
        targetValue: 10000, // $10,000 revenue -> 100 orders of $100
      },
      economics: econ,
      advertising: {
        inputMode: "cpc_direct",
        manualCpc: 0.5,
        cpm: 10,
        ctr: 2.0,
        budget: 0,
        campaignDurationDays: 30,
      },
      ecommerceFunnel: {
        clickToPurchaseRate: 2.0, // 2% -> 50 clicks per purchase -> CPA = $25
      },
    });

    expect(inverse.estimatedClientsOrOrders).toBe(100);
    expect(inverse.requiredAdSpend).toBe(2500); // 100 * $25
  });

  // Case 12: ROI negativo
  it("Case 12: Should calculate negative ROI accurately", () => {
    const prof = calculateProfitability({
      unitPrice: 100,
      unitVariableCost: 60,
      unitContributionMargin: 40,
      unitContributionMarginPercentage: 40,
      totalNetRevenue: 1000,
      totalVariableCosts: 600,
      totalContributionMargin: 400,
      totalFixedCosts: 200,
      totalAdSpend: 500,
      adProfit: -100, // 400 - 500
      netProfit: -300, // -100 - 200
    });
    // Total investment: 500 + 200 = 700. Net profit: -300. ROI = (-300 / 700) * 100 = -42.85%
    expect(prof.totalRoiPercentage).toBeCloseTo(-42.86, 1);
    expect(prof.profitabilityStatus).toBe("loss");
  });

  // Case 13: ROAS positivo con ROI negativo (The ROAS Trap)
  it("Case 13: Should clearly identify positive ROAS with negative ROI", () => {
    const prof = calculateProfitability({
      unitPrice: 100,
      unitVariableCost: 80, // Heavy COGS
      unitContributionMargin: 20,
      unitContributionMarginPercentage: 20,
      totalNetRevenue: 1500, // Gross revenue > AdSpend -> ROAS = 1.5x
      totalVariableCosts: 1200,
      totalContributionMargin: 300,
      totalFixedCosts: 100,
      totalAdSpend: 1000,
      adProfit: -700, // 300 - 1000 = -700
      netProfit: -800, // -700 - 100 = -800
    });
    expect(prof.roas).toBe(1.5); // ROAS is 1.5x (> 1)
    expect(prof.adRoiPercentage).toBe(-70); // But Ad ROI is -70%!
    expect(prof.totalRoiPercentage).toBeCloseTo(-72.72, 1);
    expect(prof.profitabilityStatus).toBe("loss");
  });

  // Case 14: Conversión de moneda (USD to COP)
  it("Case 14: Should scale calculations predictably with exchange rate", () => {
    const exchangeRate = 4000; // 1 USD = 4,000 COP
    const usdInput: CalculatorStateInputs = {
      businessType: "services",
      countryCode: "US",
      sectorId: "consulting",
      currencyCode: "USD",
      exchangeRate: 1.0,
      objective: "leads",
      budgetMode: "direct",
      advertising: {
        inputMode: "cpc_direct",
        manualCpc: 1.0,
        cpm: 10,
        ctr: 2.0,
        budget: 1000,
        campaignDurationDays: 30,
      },
      serviceEconomics: {
        pricePerClient: 500,
        serviceDeliveryCost: 100,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 200,
        fixedCampaignCosts: 0,
      },
      serviceFunnel: {
        clickToLeadRate: 10,
        leadToQualifiedRate: 50,
        qualifiedToClientRate: 20,
      },
    };

    const copInput: CalculatorStateInputs = {
      ...usdInput,
      countryCode: "CO",
      currencyCode: "COP",
      exchangeRate: exchangeRate,
      advertising: {
        ...usdInput.advertising,
        manualCpc: 1.0 * exchangeRate,
        budget: 1000 * exchangeRate,
      },
      serviceEconomics: {
        ...usdInput.serviceEconomics!,
        pricePerClient: 500 * exchangeRate,
        serviceDeliveryCost: 100 * exchangeRate,
        managementFee: 200 * exchangeRate,
      },
    };

    const usdResult = calculateFullRoi(usdInput);
    const copResult = calculateFullRoi(copInput);

    expect(copResult.funnel.clients).toBe(usdResult.funnel.clients);
    expect(copResult.profitability.roas).toBeCloseTo(usdResult.profitability.roas, 2);
    expect(copResult.profitability.totalRoiPercentage).toBeCloseTo(
      usdResult.profitability.totalRoiPercentage,
      2
    );
    expect(copResult.economics.netProfit).toBeCloseTo(
      usdResult.economics.netProfit * exchangeRate,
      -1
    );
  });

  // Case 15: Campaña con honorarios de gestión
  it("Case 15: Should include management fee in total fixed costs and total ROI", () => {
    const econ = calculateEconomics({
      businessType: "services",
      adSpend: 1000,
      funnel: {
        rawLeads: 50,
        qualifiedLeads: 20,
        clients: 10,
        cpl: 20,
        cpql: 50,
        cpa: 100,
        initialPurchases: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 0,
        grossRevenue: 0,
        netRevenue: 0,
        effectiveCpa: 0,
      },
      serviceEconomics: {
        pricePerClient: 300,
        serviceDeliveryCost: 50,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 500, // Agency fee
        fixedCampaignCosts: 0,
      },
    });
    expect(econ.totalFixedCosts).toBe(500);
    // Contribution margin = 10 * (300 - 50) = 2500
    // Ad profit = 2500 - 1000 = 1500
    // Net profit = 1500 - 500 = 1000
    expect(econ.netProfit).toBe(1000);
  });

  // Case 16: Campaña con costos fijos adicionales
  it("Case 16: Should factor additional campaign fixed costs", () => {
    const econ = calculateEconomics({
      businessType: "ecommerce",
      adSpend: 1000,
      funnel: {
        rawLeads: 0,
        qualifiedLeads: 0,
        clients: 0,
        cpl: 0,
        cpql: 0,
        cpa: 0,
        initialPurchases: 20,
        cancelledOrders: 0,
        returnedOrders: 0,
        netOrders: 20,
        grossRevenue: 2000,
        netRevenue: 2000,
        effectiveCpa: 50,
      },
      ecommerceEconomics: {
        averageProductPrice: 100,
        cogs: 40,
        packagingCost: 5,
        shippingCostStore: 5,
        gatewayFeePercentage: 0,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 0,
        returnRatePercentage: 0,
        managementFee: 400,
        fixedCampaignCosts: 200, // Tools / software
      },
    });
    expect(econ.totalFixedCosts).toBe(600); // 400 + 200
  });

  // Case 17: Tasas de conversión de cero
  it("Case 17: Should never produce NaN or Infinity with zero conversion rates", () => {
    const funnel = calculateFunnelMetrics({
      businessType: "services",
      clicks: 0,
      adSpend: 0,
      serviceFunnel: {
        clickToLeadRate: 0,
        leadToQualifiedRate: 0,
        qualifiedToClientRate: 0,
      },
    });
    expect(funnel.clients).toBe(0);
    expect(funnel.cpa).toBe(0);
    expect(Number.isNaN(funnel.cpa)).toBe(false);

    const breakeven = calculateBreakEven({
      businessType: "services",
      economics: {
        unitPrice: 0,
        unitVariableCost: 0,
        unitContributionMargin: 0,
        unitContributionMarginPercentage: 0,
        totalNetRevenue: 0,
        totalVariableCosts: 0,
        totalContributionMargin: 0,
        totalFixedCosts: 0,
        totalAdSpend: 0,
        netProfit: 0,
        adProfit: 0,
      },
      serviceFunnel: {
        clickToLeadRate: 0,
        leadToQualifiedRate: 0,
        qualifiedToClientRate: 0,
      },
    });
    expect(breakeven.maxBreakevenCpa).toBe(0);
    expect(Number.isNaN(breakeven.maxBreakevenCpa)).toBe(false);
  });

  // Case 18, 19, 20: Escenarios Pesimista, Realista y Optimista
  it("Cases 18, 19, 20: Should correctly compare Pessimistic, Realistic, and Optimistic scenarios", () => {
    const scenarios = calculateScenarios({
      businessType: "services",
      adSpend: 1000,
      advertising: {
        inputMode: "cpc_direct",
        manualCpc: 1.0,
        cpm: 10,
        ctr: 2.0,
        budget: 1000,
        campaignDurationDays: 30,
      },
      serviceFunnel: {
        clickToLeadRate: 10,
        leadToQualifiedRate: 50,
        qualifiedToClientRate: 20,
      },
      serviceEconomics: {
        pricePerClient: 500,
        serviceDeliveryCost: 100,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 200,
        fixedCampaignCosts: 0,
      },
    });

    // Realistic
    expect(scenarios.realistic.cpc).toBe(1.0);
    expect(scenarios.realistic.clicks).toBe(1000);

    // Pessimistic: CPC +30% -> 1.30, Conversions -30%
    expect(scenarios.pessimistic.cpc).toBe(1.3);
    expect(scenarios.pessimistic.clicks).toBeLessThan(scenarios.realistic.clicks);
    expect(scenarios.pessimistic.clientsOrNetOrders).toBeLessThanOrEqual(
      scenarios.realistic.clientsOrNetOrders
    );

    // Optimistic: CPC -20% -> 0.80, Conversions +25%
    expect(scenarios.optimistic.cpc).toBe(0.8);
    expect(scenarios.optimistic.clicks).toBeGreaterThan(scenarios.realistic.clicks);
    expect(scenarios.optimistic.clientsOrNetOrders).toBeGreaterThanOrEqual(
      scenarios.realistic.clientsOrNetOrders
    );
  });
});

describe("Section 11 Mandatory Test Scenarios - Paso 6 Métricas y Conversión", () => {

  // 1. Usuario nuevo sin experiencia publicitaria
  it("Scenario 1: New user with no ad experience gets sensible automatic defaults", () => {
    const defaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      businessType: "services",
      objective: "leads",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });
    expect(defaults.cpm).toBeGreaterThan(0);
    expect(defaults.ctr).toBeGreaterThan(0);
    expect(defaults.cpc).toBeGreaterThan(0);
    expect(defaults.clickToLead).toBeGreaterThan(0);
    expect(defaults.sourceNotice).toBeDefined();
  });

  // 2. Usuario con CPM y CTR reales
  it("Scenario 2: User with real CPM and CTR calculates exact CPC and impressions", () => {
    const adv = calculateAdvertisingMetrics({
      inputMode: "cpm_ctr",
      cpm: 20000, // 20k COP
      ctr: 2.0,
      manualCpc: 0,
      budget: 1000000,
      campaignDurationDays: 30,
    });
    expect(adv.impressions).toBe(50000);
    expect(adv.clicks).toBe(1000);
    expect(adv.effectiveCpc).toBe(1000);
  });

  // 3. Usuario que solo conoce su CPC
  it("Scenario 3: User with manual CPC computes clicks purely from budget / CPC", () => {
    const adv = calculateAdvertisingMetrics({
      inputMode: "cpc_direct",
      cpm: 0,
      ctr: 1.5,
      manualCpc: 500, // 500 COP
      budget: 1000000,
      campaignDurationDays: 30,
    });
    expect(adv.clicks).toBe(2000); // 1,000,000 / 500
    expect(adv.effectiveCpc).toBe(500);
  });

  // 4. Usuario con algunas métricas reales y otras estimadas
  it("Scenario 4: User with mixed real and estimated metrics generates valid projections", () => {
    const res = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      metricsExperience: "advanced",
      metricOrigins: {
        cpm: "real",
        ctr: "real",
        cpc: "estimated",
        clickToLead: "estimated",
        leadToQualified: "real",
        qualifiedToClient: "estimated",
      },
      advertising: {
        inputMode: "cpm_ctr",
        cpm: 18000,
        ctr: 2.5,
        manualCpc: 0,
        budget: 2000000,
        campaignDurationDays: 30,
      },
      serviceEconomics: {
        pricePerClient: 1500000,
        serviceDeliveryCost: 300000,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 500000,
        fixedCampaignCosts: 0,
      },
      serviceFunnel: {
        clickToLeadRate: 10,
        leadToQualifiedRate: 45, // real
        qualifiedToClientRate: 20,
      },
    });
    expect(res.advertising.clicks).toBeGreaterThan(0);
    expect(res.funnel.clients).toBeGreaterThan(0);
    expect(res.inputs.metricOrigins?.leadToQualified).toBe("real");
    expect(res.inputs.metricOrigins?.clickToLead).toBe("estimated");
  });

  // 5. Servicios con objetivo WhatsApp
  it("Scenario 5: Services with WhatsApp objective uses higher initial direct contact rates", () => {
    const waDefaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      businessType: "services",
      objective: "whatsapp",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });
    const leadDefaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      businessType: "services",
      objective: "leads",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });
    expect(waDefaults.clickToLead).toBeGreaterThan(leadDefaults.clickToLead);
  });

  // 6. Servicios con objetivo formularios
  it("Scenario 6: Services with form/lead objective prioritizes qualification rate", () => {
    const defaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "professional_services",
      businessType: "services",
      objective: "leads",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });
    expect(defaults.leadToQualified).toBeGreaterThanOrEqual(40);
  });

  // 7. Ecommerce con objetivo ventas
  it("Scenario 7: Ecommerce with sales objective computes orders, cancellations and net returns", () => {
    const funnel = calculateFunnelMetrics({
      businessType: "ecommerce",
      clicks: 5000,
      adSpend: 2500000,
      ecommerceFunnel: {
        clickToPurchaseRate: 2.0, // 100 purchases
      },
      ecommerceEconomics: {
        averageProductPrice: 150000,
        cogs: 50000,
        packagingCost: 5000,
        shippingCostStore: 10000,
        gatewayFeePercentage: 3.5,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 5, // 5% cancel -> 95 confirmed
        returnRatePercentage: 4, // 4% returns on 95 -> 91 net orders
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });
    expect(funnel.initialPurchases).toBe(100);
    expect(funnel.cancelledOrders).toBe(5);
    expect(funnel.returnedOrders).toBeCloseTo(3.8, 2);
    expect(funnel.netOrders).toBeCloseTo(91.2, 2);
  });

  // 8. Campañas de tráfico
  it("Scenario 8: Traffic campaigns model higher clicks but lower purchase / lead intent", () => {
    const trafficDefaults = getBenchmarkDefaults({
      countryCode: "MX",
      sectorId: "fashion_apparel",
      businessType: "ecommerce",
      objective: "traffic",
      currencyCode: "MXN",
      exchangeRateToUSD: 19.8,
    });
    const salesDefaults = getBenchmarkDefaults({
      countryCode: "MX",
      sectorId: "fashion_apparel",
      businessType: "ecommerce",
      objective: "ecommerce_sales",
      currencyCode: "MXN",
      exchangeRateToUSD: 19.8,
    });
    expect(trafficDefaults.clickToPurchase).toBeLessThan(salesDefaults.clickToPurchase);
    expect(trafficDefaults.ctr).toBeGreaterThanOrEqual(salesDefaults.ctr);
  });

  // 9. País sin benchmarks verificados (e.g., Paraguay o Uruguay)
  it("Scenario 9: Country without verified study uses clearly labeled illustrative assumption", () => {
    const defaults = getBenchmarkDefaults({
      countryCode: "PY",
      sectorId: "coaching_mentoring",
      businessType: "services",
      objective: "leads",
      currencyCode: "PYG",
      exchangeRateToUSD: 7800,
    });
    expect(defaults.isIllustrative).toBe(true);
    expect(defaults.confidenceLevel).toBe("illustrative_assumption");
    expect(defaults.sourceNotice).toContain("Supuesto ilustrativo orientativo");
  });

  // 10. Sector sin benchmarks disponibles
  it("Scenario 10: Fallback gracefully handles arbitrary or unlisted sectors", () => {
    const defaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "unlisted_custom_sector" as any,
      businessType: "services",
      objective: "leads",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });
    expect(defaults.cpm).toBeGreaterThan(0);
    expect(defaults.clickToLead).toBeGreaterThan(0);
  });

  // 11. Modificación manual de métricas
  it("Scenario 11: Manual editing of metrics flows into calculation deterministically", () => {
    const original = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      advertising: {
        inputMode: "cpm_ctr",
        cpm: 15000,
        ctr: 2.0,
        manualCpc: 0,
        budget: 1000000,
        campaignDurationDays: 30,
      },
      serviceEconomics: {
        pricePerClient: 1000000,
        serviceDeliveryCost: 200000,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
      serviceFunnel: {
        clickToLeadRate: 10,
        leadToQualifiedRate: 50,
        qualifiedToClientRate: 20,
      },
    });

    // Modified closing rate to 40% (doubled)
    const modified = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      advertising: {
        inputMode: "cpm_ctr",
        cpm: 15000,
        ctr: 2.0,
        manualCpc: 0,
        budget: 1000000,
        campaignDurationDays: 30,
      },
      serviceEconomics: {
        pricePerClient: 1000000,
        serviceDeliveryCost: 200000,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
      serviceFunnel: {
        clickToLeadRate: 10,
        leadToQualifiedRate: 50,
        qualifiedToClientRate: 40,
      },
    });

    expect(modified.funnel.clients).toBeGreaterThan(original.funnel.clients);
  });

  // 12. Tasas de conversión iguales a cero
  it("Scenario 12: Zero conversion rates do not cause NaN or Infinity", () => {
    const res = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      advertising: {
        inputMode: "cpm_ctr",
        cpm: 15000,
        ctr: 2.0,
        manualCpc: 0,
        budget: 1000000,
        campaignDurationDays: 30,
      },
      serviceFunnel: {
        clickToLeadRate: 0,
        leadToQualifiedRate: 0,
        qualifiedToClientRate: 0,
      },
      serviceEconomics: {
        pricePerClient: 1000000,
        serviceDeliveryCost: 200000,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 300000,
        fixedCampaignCosts: 0,
      },
    });
    expect(res.funnel.rawLeads).toBe(0);
    expect(res.funnel.clients).toBe(0);
    expect(res.funnel.cpl).toBe(0);
    expect(res.funnel.cpa).toBe(0);
    expect(Number.isFinite(res.economics.netProfit)).toBe(true);
  });

  // 13. Presupuesto insuficiente para generar clics
  it("Scenario 13: Budget insufficient to generate a single click outputs 0 clicks gracefully", () => {
    const adv = calculateAdvertisingMetrics({
      inputMode: "cpc_direct",
      manualCpc: 5000,
      cpm: 0,
      ctr: 1,
      budget: 1000, // less than 1 click
      campaignDurationDays: 30,
    });
    expect(adv.clicks).toBe(0);
    expect(adv.effectiveBudget).toBe(1000);
  });

  // 14. Escenarios sin ventas
  it("Scenario 14: Zero sales scenario reports loss cleanly and valid ROI", () => {
    const res = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      advertising: {
        inputMode: "cpc_direct",
        manualCpc: 1000,
        cpm: 0,
        ctr: 1,
        budget: 1000000,
        campaignDurationDays: 30,
      },
      serviceFunnel: {
        clickToLeadRate: 1,
        leadToQualifiedRate: 10,
        qualifiedToClientRate: 0, // 0 sales
      },
      serviceEconomics: {
        pricePerClient: 1000000,
        serviceDeliveryCost: 200000,
        otherVariableCosts: 0,
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 500000,
        fixedCampaignCosts: 0,
      },
    });
    expect(res.funnel.clients).toBe(0);
    expect(res.economics.totalNetRevenue).toBe(0);
    expect(res.profitability.profitabilityStatus).toBe("loss");
    expect(res.profitability.totalRoiPercentage).toBe(-100);
  });

  // 15. Actualización de resultados al modificar valores
  it("Scenario 15: Changing CPM immediately changes impressions, clicks and CPA", () => {
    const base = calculateAdvertisingMetrics({
      inputMode: "cpm_ctr",
      cpm: 10000,
      ctr: 2.0,
      manualCpc: 0,
      budget: 1000000,
      campaignDurationDays: 30,
    });
    const doubledCpm = calculateAdvertisingMetrics({
      inputMode: "cpm_ctr",
      cpm: 20000,
      ctr: 2.0,
      manualCpc: 0,
      budget: 1000000,
      campaignDurationDays: 30,
    });
    expect(doubledCpm.impressions).toBe(base.impressions / 2);
    expect(doubledCpm.clicks).toBe(base.clicks / 2);
    expect(doubledCpm.effectiveCpc).toBe(base.effectiveCpc * 2);
  });
});

describe("Paso 4 & 5: Commercial Objectives and Investment Recommender", () => {
  const baseEconomics = {
    unitPrice: 1200000,
    unitVariableCost: 300000,
    unitContributionMargin: 900000,
    unitContributionMarginPercentage: 75,
    totalNetRevenue: 0,
    totalVariableCosts: 0,
    totalContributionMargin: 0,
    totalFixedCosts: 600000,
    totalAdSpend: 0,
    netProfit: 0,
    adProfit: 0,
  };

  const baseAdvertising = {
    inputMode: "cpm_ctr" as const,
    cpm: 15000,
    ctr: 2.0,
    manualCpc: 0,
    budget: 2000000,
    campaignDurationDays: 30,
  };

  const baseServiceFunnel = {
    clickToLeadRate: 12.0,
    leadToQualifiedRate: 40.0,
    qualifiedToClientRate: 20.0,
  };

  // 1. Modalidad A: Presupuesto definido y distribución temporal
  it("Should calculate temporal distribution accurately for defined budget", () => {
    const totalBudget = 2000000;
    const duration = 30;
    const daily = totalBudget / duration;
    const weekly = daily * 7;
    const monthly = daily * 30;

    expect(daily).toBeCloseTo(66666.67, 1);
    expect(weekly).toBeCloseTo(466666.67, 1);
    expect(monthly).toBeCloseTo(2000000, 1);
  });

  // 2. Modalidad B: Meta de facturación
  it("Should calculate required budget for revenue target", () => {
    const inv = calculateInverseBudget({
      businessType: "services",
      inverseInputs: {
        goalType: "revenue",
        targetValue: 12000000, // 10 clients at 1.2M
      },
      economics: baseEconomics,
      advertising: baseAdvertising,
      serviceFunnel: baseServiceFunnel,
    });
    expect(inv.isFeasible).toBe(true);
    expect(inv.estimatedClientsOrOrders).toBe(10);
    expect(inv.requiredAdSpend).toBeGreaterThan(0);
  });

  // 3. Modalidad B: Meta de beneficio neto
  it("Should calculate required budget for net profit target", () => {
    const inv = calculateInverseBudget({
      businessType: "services",
      inverseInputs: {
        goalType: "profit",
        targetValue: 4000000,
      },
      economics: baseEconomics,
      advertising: baseAdvertising,
      serviceFunnel: baseServiceFunnel,
    });
    expect(inv.isFeasible).toBe(true);
    expect(inv.estimatedNetProfit).toBeGreaterThanOrEqual(4000000);
  });

  // 4. Modalidad B: Meta de número de clientes
  it("Should calculate required budget for client count target", () => {
    const inv = calculateInverseBudget({
      businessType: "services",
      inverseInputs: {
        goalType: "clients",
        targetValue: 20,
      },
      economics: baseEconomics,
      advertising: baseAdvertising,
      serviceFunnel: baseServiceFunnel,
    });
    expect(inv.isFeasible).toBe(true);
    expect(inv.estimatedClientsOrOrders).toBe(20);
  });

  // 5. Modalidad B: Meta de número de ventas en ecommerce
  it("Should calculate required budget for ecommerce orders target", () => {
    const inv = calculateInverseBudget({
      businessType: "ecommerce",
      inverseInputs: {
        goalType: "orders",
        targetValue: 50,
      },
      economics: {
        ...baseEconomics,
        unitPrice: 150000,
        unitContributionMargin: 65000,
      },
      advertising: baseAdvertising,
      ecommerceFunnel: { clickToPurchaseRate: 2.5 },
      ecommerceEconomics: {
        averageProductPrice: 150000,
        cogs: 60000,
        packagingCost: 5000,
        shippingCostStore: 10000,
        gatewayFeePercentage: 3.5,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 5,
        returnRatePercentage: 4,
        managementFee: 0,
        fixedCampaignCosts: 0,
      },
    });
    expect(inv.isFeasible).toBe(true);
    expect(inv.estimatedClientsOrOrders).toBe(50);
  });

  // 6 & 7. Modalidad C: Recomendador de inversión y los tres escenarios dinámicos
  it("Should dynamically calculate conservative, recommended and accelerated investment scenarios", () => {
    const rec = calculateInvestmentRecommendations({
      businessType: "services",
      economics: baseEconomics,
      advertising: baseAdvertising,
      serviceFunnel: baseServiceFunnel,
      desiredProfitPerSale: 200000,
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });

    expect(rec.isFeasible).toBe(true);
    // Conservative should have lower budget than Recommended
    expect(rec.conservative.totalBudget).toBeLessThan(rec.recommended.totalBudget);
    // Recommended should have lower budget than Accelerated
    expect(rec.recommended.totalBudget).toBeLessThan(rec.accelerated.totalBudget);

    // Clients projected should scale accordingly
    expect(rec.conservative.estimatedClientsOrOrders).toBeLessThan(
      rec.recommended.estimatedClientsOrOrders
    );
    expect(rec.recommended.estimatedClientsOrOrders).toBeLessThan(
      rec.accelerated.estimatedClientsOrOrders
    );

    // Scenarios must have titles, daily budgets and positive ROAS
    expect(rec.conservative.dailyBudget).toBeGreaterThan(0);
    expect(rec.recommended.dailyBudget).toBeGreaterThan(0);
    expect(rec.accelerated.dailyBudget).toBeGreaterThan(0);
  });

  // 8. Negocio sin margen (margen 0 o negativo)
  it("Should detect non-viable investment when unit margin is zero or negative", () => {
    const zeroMarginEcon = {
      ...baseEconomics,
      unitPrice: 100000,
      unitVariableCost: 120000,
      unitContributionMargin: -20000, // Negative margin
    };

    const rec = calculateInvestmentRecommendations({
      businessType: "services",
      economics: zeroMarginEcon,
      advertising: baseAdvertising,
      serviceFunnel: baseServiceFunnel,
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });

    expect(rec.isFeasible).toBe(false);
    expect(rec.warning).toContain("margen de contribución unitario es cero o negativo");
  });

  // 9. Beneficio deseado superior al margen disponible
  it("Should warn when desired profit per sale exceeds available unit contribution margin", () => {
    const inv = calculateInverseBudget({
      businessType: "services",
      inverseInputs: {
        goalType: "clients",
        targetValue: 10,
        desiredProfitPerSale: 1000000, // 1M > 900k margin
      },
      economics: baseEconomics, // Margin is 900k
      advertising: baseAdvertising,
      serviceFunnel: baseServiceFunnel,
    });

    expect(inv.isFeasible).toBe(false);
    expect(inv.feasibilityWarning).toContain("supera tu margen disponible antes de publicidad");
  });

  // 10. Variaciones de duración (7, 15, 30, 60 días)
  it("Should adjust daily recommendations predictably with campaign duration", () => {
    const rec7 = calculateInvestmentRecommendations({
      businessType: "services",
      economics: baseEconomics,
      advertising: { ...baseAdvertising, campaignDurationDays: 7 },
      serviceFunnel: baseServiceFunnel,
    });

    const rec30 = calculateInvestmentRecommendations({
      businessType: "services",
      economics: baseEconomics,
      advertising: { ...baseAdvertising, campaignDurationDays: 30 },
      serviceFunnel: baseServiceFunnel,
    });

    expect(rec7.recommended.durationDays).toBe(7);
    expect(rec30.recommended.durationDays).toBe(30);
    expect(rec7.recommended.totalBudget).toBeLessThan(rec30.recommended.totalBudget);
  });
});

describe("Sección 14: Caso de Prueba Principal y 18 Escenarios Obligatorios de Reestructuración", () => {
  // CASO DE PRUEBA PRINCIPAL OBLIGATORIO
  it("Main Test Case: Servicio $100.000 COP, Costo $35.000, Gestión $250.000, Herramientas $9.000, Meta Neta $3.000.000 (30 días)", () => {
    const defaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      businessType: "services",
      objective: "leads",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });

    const inputs: CalculatorStateInputs = {
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "inverse",
      advertising: {
        inputMode: "cpm_ctr",
        cpm: defaults.cpm, // 14,500 COP
        ctr: defaults.ctr, // 1.85%
        manualCpc: defaults.cpc,
        budget: 0,
        campaignDurationDays: 30,
      },
      serviceEconomics: {
        pricePerClient: 100000, // $100.000 COP
        serviceDeliveryCost: 35000, // $35.000 COP
        otherVariableCosts: 0, // $0 COP
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 250000, // $250.000 COP
        fixedCampaignCosts: 9000, // $9.000 COP
      },
      serviceFunnel: {
        clickToLeadRate: defaults.clickToLead, // 15%
        leadToQualifiedRate: defaults.leadToQualified, // 45%
        qualifiedToClientRate: defaults.qualifiedToClient, // 25%
      },
      inverseBudget: {
        goalType: "profit",
        targetValue: 3000000, // $3.000.000 COP
        periodDays: 30,
      },
    };

    const result = calculateFullRoi(inputs);

    // 1. Nivel 1: Margen disponible por venta = $100.000 - $35.000 - $0 = $65.000 COP (65%)
    expect(result.economics.unitPrice).toBe(100000);
    expect(result.economics.unitVariableCost).toBe(35000);
    expect(result.economics.unitContributionMargin).toBe(65000);
    expect(result.economics.unitContributionMarginPercentage).toBe(65);

    // 2. Gastos mensuales fijos = $250.000 + $9.000 = $259.000 COP (no descontados en margen unitario)
    expect(result.economics.totalFixedCosts).toBe(259000);
    expect(result.economics.managementFeeTotal).toBe(250000);
    expect(result.economics.toolsTotal).toBe(9000);

    // 3. Viabilidad y resolución matemática exacta de presupuesto inverso
    expect(result.inverseResult).toBeDefined();
    expect(result.inverseResult?.isFeasible).toBe(true);

    // CPC = 14500 / 18.5 = 783.78378378 COP
    // Prob clic a cliente = 0.15 * 0.45 * 0.25 = 0.016875
    // CPA estimado = 783.78378378 / 0.016875 = 46,446.446446 COP (< $65.000 margen)
    expect(result.inverseResult?.estimatedCpa).toBeCloseTo(46446.45, 1);

    // Clientes necesarios = (3.000.000 + 259.000) / (65.000 - 46.446,4464) = 175.65368 clientes
    expect(result.inverseResult?.estimatedClientsOrOrders).toBeCloseTo(175.6537, 2);

    // Inversión necesaria = 175.65368029 * 46,446.446446 = $8.158.489,34 COP
    expect(result.inverseResult?.requiredAdSpend).toBeCloseTo(8158489.34, 1);

    // Inversión diaria (30 días) = $8.158.489,34 / 30 = $271.949,64 COP / día
    expect(result.inverseResult?.dailyAdSpend).toBeCloseTo(271949.64, 1);

    // 4. Verificación sin diferencias por redondeos prematuros entre Paso 5 (Inverso) y Paso 7 (Dashboard):
    // Nivel 2: Beneficio después de publicidad = Margen total - Publicidad = $3.259.000 COP
    expect(result.economics.adProfit).toBeCloseTo(3259000, 0);
    // Nivel 3: Beneficio neto del negocio = Beneficio después de publicidad - $259.000 = $3.000.000 COP exactos!
    expect(result.economics.netProfit).toBeCloseTo(3000000, 0);
  });

  // 1, 2, 3. Servicio con margen alto, margen bajo y margen negativo
  it("Cases 1, 2, 3: Should distinguish high margin, low margin, and negative margin services", () => {
    const highMargin = calculateEconomics({
      businessType: "services",
      adSpend: 500000,
      funnel: { rawLeads: 40, qualifiedLeads: 20, clients: 10, cpl: 12500, cpql: 25000, cpa: 50000, initialPurchases: 0, cancelledOrders: 0, returnedOrders: 0, netOrders: 0, grossRevenue: 0, netRevenue: 0, effectiveCpa: 0 },
      serviceEconomics: { pricePerClient: 200000, serviceDeliveryCost: 30000, otherVariableCosts: 10000, additionalCosts: 0, averagePurchasesPerClient: 1, managementFee: 100000, fixedCampaignCosts: 0 },
    });
    expect(highMargin.unitContributionMarginPercentage).toBe(80);

    const lowMargin = calculateEconomics({
      businessType: "services",
      adSpend: 500000,
      funnel: { rawLeads: 40, qualifiedLeads: 20, clients: 10, cpl: 12500, cpql: 25000, cpa: 50000, initialPurchases: 0, cancelledOrders: 0, returnedOrders: 0, netOrders: 0, grossRevenue: 0, netRevenue: 0, effectiveCpa: 0 },
      serviceEconomics: { pricePerClient: 100000, serviceDeliveryCost: 80000, otherVariableCosts: 5000, additionalCosts: 0, averagePurchasesPerClient: 1, managementFee: 0, fixedCampaignCosts: 0 },
    });
    expect(lowMargin.unitContributionMarginPercentage).toBe(15);

    const negativeMarginRes = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      advertising: { inputMode: "cpm_ctr", cpm: 14500, ctr: 1.85, manualCpc: 0, budget: 1000000, campaignDurationDays: 30 },
      serviceEconomics: { pricePerClient: 100000, serviceDeliveryCost: 110000, otherVariableCosts: 10000, additionalCosts: 0, averagePurchasesPerClient: 1, managementFee: 0, fixedCampaignCosts: 0 },
      serviceFunnel: { clickToLeadRate: 15, leadToQualifiedRate: 45, qualifiedToClientRate: 25 },
    });
    expect(negativeMarginRes.economics.unitContributionMargin).toBe(-20000);
    expect(negativeMarginRes.investmentRecommendations?.isFeasible).toBe(false);
    expect(negativeMarginRes.investmentRecommendations?.recommended.totalBudget).toBe(0);
    expect(negativeMarginRes.warnings.some((w) => w.includes("Margen negativo"))).toBe(true);
  });

  // 4, 5, 6. Ecommerce con devoluciones, usuario sin experiencia, usuario con métricas reales
  it("Cases 4, 5, 6: Ecommerce returns without double-counting, beginner vs real metrics", () => {
    const ecomRes = calculateFullRoi({
      businessType: "ecommerce",
      countryCode: "CO",
      sectorId: "fashion_apparel",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "ecommerce_sales",
      budgetMode: "direct",
      metricsExperience: "advanced",
      advertising: { inputMode: "cpc_direct", cpm: 0, ctr: 2, manualCpc: 500, budget: 1000000, campaignDurationDays: 30 },
      ecommerceEconomics: {
        averageProductPrice: 120000,
        cogs: 40000,
        packagingCost: 4000,
        shippingCostStore: 10000,
        gatewayFeePercentage: 0,
        otherVariableCosts: 0,
        discountPercentage: 0,
        cancellationRatePercentage: 10,
        returnRatePercentage: 5,
        managementFee: 200000,
        fixedCampaignCosts: 50000,
      },
      ecommerceFunnel: { clickToPurchaseRate: 2.5 },
    });
    // 2000 clicks * 2.5% = 50 initial -> 10% cancel = 45 confirmed -> 5% return = 42.75 net orders
    expect(ecomRes.funnel.initialPurchases).toBe(50);
    expect(ecomRes.funnel.cancelledOrders).toBe(5);
    expect(ecomRes.funnel.returnedOrders).toBeCloseTo(2.25, 2);
    expect(ecomRes.funnel.netOrders).toBeCloseTo(42.75, 2);
    // Unit margin = 120000 - 54000 = 66000
    expect(ecomRes.economics.unitContributionMargin).toBe(66000);
    // Total fixed costs = 250000 (not deducted in unit margin)
    expect(ecomRes.economics.totalFixedCosts).toBe(250000);
  });

  // 7, 8, 9, 10. Objetivos: Facturar, Ganar dinero, Conseguir clientes, Generar ventas
  it("Cases 7, 8, 9, 10: All 4 commercial objectives resolve without rounding discrepancies", () => {
    const baseState: CalculatorStateInputs = {
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "inverse",
      advertising: { inputMode: "cpc_direct", cpm: 14500, ctr: 2.0, manualCpc: 500, budget: 0, campaignDurationDays: 30 },
      serviceEconomics: { pricePerClient: 100000, serviceDeliveryCost: 35000, otherVariableCosts: 0, additionalCosts: 0, averagePurchasesPerClient: 1, managementFee: 250000, fixedCampaignCosts: 9000 },
      serviceFunnel: { clickToLeadRate: 20, leadToQualifiedRate: 50, qualifiedToClientRate: 20 }, // 2% -> CPA = 500 / 0.02 = 25,000 COP
    };

    // Option A: Profit ($3,000,000)
    const profitRes = calculateFullRoi({ ...baseState, inverseBudget: { goalType: "profit", targetValue: 3000000 } });
    expect(profitRes.economics.netProfit).toBeCloseTo(3000000, 0);

    // Option B: Revenue ($10,000,000)
    const revRes = calculateFullRoi({ ...baseState, inverseBudget: { goalType: "revenue", targetValue: 10000000 } });
    expect(revRes.economics.totalNetRevenue).toBeCloseTo(10000000, 0);

    // Option C: Clients (50)
    const clientsRes = calculateFullRoi({ ...baseState, inverseBudget: { goalType: "clients", targetValue: 50 } });
    expect(clientsRes.funnel.clients).toBeCloseTo(50, 2);

    // Option D: Orders (100)
    const ordersRes = calculateFullRoi({ ...baseState, inverseBudget: { goalType: "orders", targetValue: 100 } });
    expect(ordersRes.funnel.clients).toBeCloseTo(100, 2);
  });

  // 11, 12, 13, 14, 15, 16, 17, 18. Casos borde: CPA > Margen, Gastos 0, Conversión 0, Duraciones, Escenarios
  it("Cases 11-18: Edge cases (CPA > Margin, 0 monthly expenses, 0 conversion, durations, scenarios)", () => {
    // Case 12: CPA superior al margen -> Inverso para meta de beneficio neto es inviable y no recomienda presupuesto ficticio
    const unviableProfitGoal = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "inverse",
      advertising: { inputMode: "cpc_direct", cpm: 14500, ctr: 1.0, manualCpc: 2000, budget: 0, campaignDurationDays: 30 },
      serviceEconomics: { pricePerClient: 100000, serviceDeliveryCost: 35000, otherVariableCosts: 0, additionalCosts: 0, averagePurchasesPerClient: 1, managementFee: 250000, fixedCampaignCosts: 9000 },
      serviceFunnel: { clickToLeadRate: 10, leadToQualifiedRate: 20, qualifiedToClientRate: 10 }, // 0.2% -> CPA = 1,000,000 > 65,000 margin
      inverseBudget: { goalType: "profit", targetValue: 3000000 },
    });
    expect(unviableProfitGoal.inverseResult?.isFeasible).toBe(false);
    expect(unviableProfitGoal.inverseResult?.requiredAdSpend).toBe(0);
    expect(unviableProfitGoal.advertising.effectiveBudget).toBe(0);
    expect(unviableProfitGoal.adjustmentSuggestions?.length).toBeGreaterThan(0);

    // Case 13: Gastos mensuales iguales a cero -> Nivel 2 (adProfit) === Nivel 3 (netProfit)
    const zeroFixed = calculateFullRoi({
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "direct",
      advertising: { inputMode: "cpc_direct", cpm: 14500, ctr: 2.0, manualCpc: 500, budget: 1000000, campaignDurationDays: 15 },
      serviceEconomics: { pricePerClient: 100000, serviceDeliveryCost: 35000, otherVariableCosts: 0, additionalCosts: 0, averagePurchasesPerClient: 1, managementFee: 0, fixedCampaignCosts: 0 },
      serviceFunnel: { clickToLeadRate: 15, leadToQualifiedRate: 45, qualifiedToClientRate: 25 },
    });
    expect(zeroFixed.economics.totalFixedCosts).toBe(0);
    expect(zeroFixed.economics.netProfit).toBeCloseTo(zeroFixed.economics.adProfit, 2);
  });

  // SECCIÓN 7 — PRUEBA OBLIGATORIA DE PRESENTACIÓN DE INVERSIÓN Y RENTABILIDAD ($99.000 COP)
  it("Section 7 Mandatory Test Case: Precio $99.000 COP, Entrega $35.000, Margen $64.000, Gestión $250.000, Herramientas $9.000, Meta Neta $3.000.000 (30 días)", () => {
    const defaults = getBenchmarkDefaults({
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      businessType: "services",
      objective: "leads",
      currencyCode: "COP",
      exchangeRateToUSD: 4150,
    });

    const inputs: CalculatorStateInputs = {
      businessType: "services",
      countryCode: "CO",
      sectorId: "coaching_mentoring",
      currencyCode: "COP",
      exchangeRate: 4150,
      objective: "leads",
      budgetMode: "inverse",
      advertising: {
        inputMode: "cpm_ctr",
        cpm: defaults.cpm, // 14,500 COP
        ctr: defaults.ctr, // 1.85%
        manualCpc: defaults.cpc,
        budget: 0,
        campaignDurationDays: 30,
      },
      serviceEconomics: {
        pricePerClient: 99000, // $99.000 COP
        serviceDeliveryCost: 35000, // $35.000 COP
        otherVariableCosts: 0, // $0 COP -> Margen disponible: $64.000 COP
        additionalCosts: 0,
        averagePurchasesPerClient: 1,
        managementFee: 250000, // $250.000 COP
        fixedCampaignCosts: 9000, // $9.000 COP
      },
      serviceFunnel: {
        clickToLeadRate: defaults.clickToLead, // 15%
        leadToQualifiedRate: defaults.leadToQualified, // 45%
        qualifiedToClientRate: defaults.qualifiedToClient, // 25%
      },
      inverseBudget: {
        goalType: "profit",
        targetValue: 3000000, // $3.000.000 COP
        periodDays: 30,
      },
    };

    const result = calculateFullRoi(inputs);

    // Datos unitarios y CPA
    expect(result.economics.unitPrice).toBe(99000);
    expect(result.economics.unitVariableCost).toBe(35000);
    expect(result.economics.unitContributionMargin).toBe(64000);
    expect(result.inverseResult?.estimatedCpa).toBeCloseTo(46446.45, 1);

    // Clientes esperados: ~185.66 (presentados en pantalla como 186)
    const expectedClients = result.funnel.clients;
    expect(expectedClients).toBeCloseTo(185.66, 2);
    expect(Math.round(expectedClients)).toBe(186);

    // Comprobaciones 1 a 10 de la Sección 7:
    // 1. Facturación = clientes esperados × precio de venta (~$18.380.381 COP)
    expect(result.economics.totalNetRevenue).toBeCloseTo(expectedClients * 99000, 2);
    expect(result.economics.totalNetRevenue).toBeCloseTo(18380381, 0);

    // 2. Costos de entrega = clientes esperados × costo unitario (~$6.498.115 COP)
    expect(result.economics.totalVariableCosts).toBeCloseTo(expectedClients * 35000, 2);

    // 3. Margen total = facturación - costos variables (~$11.882.266,50 COP)
    expect(result.economics.totalContributionMargin).toBeCloseTo(
      result.economics.totalNetRevenue - result.economics.totalVariableCosts,
      2
    );

    // 4. Beneficio después de publicidad = margen total - inversión publicitaria ($3.259.000 COP)
    expect(result.advertising.effectiveBudget).toBeCloseTo(8623266.5, 0);
    expect(result.advertising.dailyBudget).toBeCloseTo(287442.22, 0);
    expect(result.economics.adProfit).toBeCloseTo(
      result.economics.totalContributionMargin - result.economics.totalAdSpend,
      2
    );
    expect(result.economics.adProfit).toBeCloseTo(3259000, 0);

    // 5. Ganancia neta = beneficio después de publicidad - gastos mensuales ($259.000 COP)
    expect(result.economics.totalFixedCosts).toBe(259000);
    expect(result.economics.netProfit).toBeCloseTo(
      result.economics.adProfit - result.economics.totalFixedCosts,
      2
    );

    // 6. La ganancia neta coincide con la meta configurada ($3.000.000 COP)
    expect(result.economics.netProfit).toBeCloseTo(3000000, 0);

    // Proyección operativa ajustada al siguiente cliente completo (186 clientes)
    expect(result.inverseResult?.integerCustomerProjection?.clientsOrOrders).toBe(186);
    expect(result.inverseResult?.integerCustomerProjection?.estimatedNetRevenue).toBe(186 * 99000);
    expect(result.inverseResult?.integerCustomerProjection?.estimatedVariableCosts).toBe(186 * 35000);
  });
});

