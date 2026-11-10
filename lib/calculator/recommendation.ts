import {
  BusinessType,
  AdvertisingMetricsInputs,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  EcommerceEconomicsInputs,
  EconomicsCalculations,
  InvestmentScenario,
  InvestmentRecommendationPackage,
} from "@/types/calculator";

/**
 * Calculates dynamic investment recommendations (Conservative, Recommended, Accelerated).
 * Grounded in the unit economics, conversion probability, and margin safety limits.
 * Never produces arbitrary fixed amounts like $30k, $50k or $80k.
 */
export function calculateInvestmentRecommendations(params: {
  businessType: BusinessType;
  economics: EconomicsCalculations;
  advertising: AdvertisingMetricsInputs;
  serviceFunnel?: ServiceFunnelInputs;
  ecommerceFunnel?: EcommerceFunnelInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
  desiredProfitPerSale?: number;
  currencyCode?: string;
  exchangeRateToUSD?: number;
}): InvestmentRecommendationPackage {
  const {
    businessType,
    economics,
    advertising,
    serviceFunnel,
    ecommerceFunnel,
    ecommerceEconomics,
    desiredProfitPerSale = 0,
    currencyCode = "COP",
    exchangeRateToUSD = 4150,
  } = params;

  const unitMargin = economics.unitContributionMargin;
  const unitPrice = economics.unitPrice;
  const totalFixed = economics.totalFixedCosts;
  const durationDays = Math.max(1, advertising.campaignDurationDays || 30);

  // 1. Calculate Estimated CPC respecting inputMode
  let cpc = 0;
  if (advertising.inputMode === "cpc_direct") {
    cpc = Math.max(0, advertising.manualCpc || 0);
  } else if (advertising.cpm > 0 && advertising.ctr > 0) {
    cpc = (advertising.cpm / 1000) / (advertising.ctr / 100);
  } else if (advertising.manualCpc > 0) {
    cpc = advertising.manualCpc;
  }
  if (cpc <= 0) {
    // Fallback baseline ~$0.35 USD
    cpc = currencyCode === "USD" ? 0.35 : 0.35 * exchangeRateToUSD;
  }

  // 2. Click to Customer Conversion Probability
  let clickToCustomerRate = 0;
  if (businessType === "services") {
    const c2l =
      (serviceFunnel?.clickToLeadRate !== undefined
        ? serviceFunnel.clickToLeadRate
        : 12.0) / 100;
    const l2q =
      (serviceFunnel?.leadToQualifiedRate !== undefined
        ? serviceFunnel.leadToQualifiedRate
        : 40.0) / 100;
    const q2c =
      (serviceFunnel?.qualifiedToClientRate !== undefined
        ? serviceFunnel.qualifiedToClientRate
        : 20.0) / 100;
    clickToCustomerRate = c2l * l2q * q2c;
  } else {
    const c2p =
      (ecommerceFunnel?.clickToPurchaseRate !== undefined
        ? ecommerceFunnel.clickToPurchaseRate
        : 2.2) / 100;
    const cancel = (ecommerceEconomics?.cancellationRatePercentage || 0) / 100;
    const returns = (ecommerceEconomics?.returnRatePercentage || 0) / 100;
    clickToCustomerRate = c2p * (1 - cancel) * (1 - returns);
  }

  // 3. Estimated Cost Per Acquisition (CPA)
  const funnelCpa =
    clickToCustomerRate > 0 ? cpc / clickToCustomerRate : 0;

  // Maximum allowable CPA
  const maxViableCpa = Math.max(0, unitMargin);

  // Minimum daily spend imposed by Meta ($1 USD minimum)
  const minDailyMetaSpend = currencyCode === "USD" ? 1.0 : Math.max(1.0, 1.0 * exchangeRateToUSD);

  let isFeasible = true;
  let warning: string | undefined;

  if (unitMargin <= 0) {
    isFeasible = false;
    warning =
      "Tu margen de contribución unitario es cero o negativo. Estás gastando más en entregar tu producto o servicio de lo que cobras; ninguna inversión publicitaria será rentable sin aumentar tu precio o reducir costos variables.";
  } else if (clickToCustomerRate <= 0) {
    isFeasible = false;
    warning =
      "Las tasas de conversión del embudo están en 0%. No es posible proyectar adquisición sin tasa de conversión.";
  } else if (funnelCpa >= unitMargin) {
    isFeasible = false;
    warning = `El costo por adquisición estimado (${funnelCpa.toFixed(
      0
    )} ${currencyCode}) iguala o supera tu dinero disponible por venta (${unitMargin.toFixed(
      0
    )} ${currencyCode}). Bajo estos supuestos la campaña operaría a pérdida; revisa tu conversión, el CPC o tu margen antes de invertir.`;
  }

  // Desired profit constraint if supplied
  if (desiredProfitPerSale > 0 && desiredProfitPerSale > unitMargin) {
    warning = `El beneficio deseado por venta (${desiredProfitPerSale.toFixed(
      0
    )} ${currencyCode}) supera tu margen disponible (${unitMargin.toFixed(
      0
    )} ${currencyCode}). Es matemáticamente inviable con los costos actuales.`;
  }

  // Target volumes based on duration and statistical requirements:
  // Conservative: ~0.15 sales/day -> ~4-5 sales over 30 days
  const conservativeTargetSales = Math.max(2, Math.round(durationDays * 0.15));
  // Recommended: ~0.5 sales/day -> ~15 sales over 30 days
  const recommendedTargetSales = Math.max(5, Math.round(durationDays * 0.5));
  // Accelerated: ~1.2 sales/day -> ~36 sales over 30 days
  const acceleratedTargetSales = Math.max(12, Math.round(durationDays * 1.2));

  const buildScenario = (
    tier: "conservative" | "recommended" | "accelerated",
    targetSales: number,
    title: string,
    description: string,
    riskLevel: "low" | "balanced" | "moderate",
    reasoning: string,
    conditions?: string
  ): InvestmentScenario => {
    if (unitMargin <= 0 || clickToCustomerRate <= 0) {
      return {
        tier,
        title,
        description,
        dailyBudget: 0,
        totalBudget: 0,
        durationDays,
        estimatedClicks: 0,
        estimatedClientsOrOrders: 0,
        estimatedRevenue: 0,
        estimatedNetProfit: -totalFixed,
        estimatedCpa: 0,
        roas: 0,
        riskLevel,
        reasoning:
          "No se recomienda inversión publicitaria rentable mientras el margen por venta sea cero/negativo o la conversión sea 0%.",
        requirementsOrConditions: conditions,
      };
    }

    const rawBudget = targetSales * (funnelCpa > 0 ? funnelCpa : cpc * 50);
    const minPeriodBudget = minDailyMetaSpend * durationDays;
    const totalBudget = Math.max(minPeriodBudget, rawBudget);
    const dailyBudget = totalBudget / durationDays;

    const estimatedClicks = cpc > 0 ? totalBudget / cpc : 0;
    const estimatedClientsOrOrders = estimatedClicks * clickToCustomerRate;
    const estimatedRevenue = estimatedClientsOrOrders * unitPrice;
    const estimatedNetProfit =
      estimatedClientsOrOrders * unitMargin - totalBudget - totalFixed;
    const roas = totalBudget > 0 ? estimatedRevenue / totalBudget : 0;
    const scenarioCpa =
      estimatedClientsOrOrders > 0
        ? totalBudget / estimatedClientsOrOrders
        : funnelCpa;

    return {
      tier,
      title,
      description,
      dailyBudget,
      totalBudget,
      durationDays,
      estimatedClicks,
      estimatedClientsOrOrders,
      estimatedRevenue,
      estimatedNetProfit,
      estimatedCpa: scenarioCpa,
      roas,
      riskLevel,
      reasoning,
      requirementsOrConditions: conditions,
    };
  };

  const conservative = buildScenario(
    "conservative",
    conservativeTargetSales,
    "Inversión Conservadora",
    "Para comenzar con una inversión controlada y validar cómo responde el mercado.",
    "low",
    "Presupuesto prudente diseñado para validar el interés inicial de tu audiencia y acumular datos de clics con riesgo financiero mínimo.",
    "Adecuado para negocios que inician pauta por primera vez o prueban una oferta nueva."
  );

  const recommended = buildScenario(
    "recommended",
    recommendedTargetSales,
    "Inversión Recomendada",
    "Una inversión equilibrada para conseguir datos suficientes y evaluar el rendimiento de la campaña.",
    "balanced",
    "Genera el volumen de datos necesario para alimentar el algoritmo de optimización de Meta Ads, maximizando el retorno sin comprometer tu flujo de caja.",
    "Opción estándar recomendada para evaluar el ROAS real de tus anuncios."
  );

  const accelerated = buildScenario(
    "accelerated",
    acceleratedTargetSales,
    "Inversión Acelerada",
    "Para probar un mayor volumen de publicidad y acelerar la recopilación de datos, si tu negocio puede asumir esa inversión.",
    "moderate",
    "Acelera la tracción comercial y captura mayor cuota de mercado, saliendo rápidamente de la fase de aprendizaje de Meta.",
    "Requiere capacidad operativa para responder prospectos o despachar pedidos a mayor velocidad, además de respaldo de capital de trabajo."
  );

  return {
    conservative,
    recommended,
    accelerated,
    maxViableCpa: Math.round(maxViableCpa * 100) / 100,
    unitMargin: Math.round(unitMargin * 100) / 100,
    clickToCustomerRate: Number((clickToCustomerRate * 100).toFixed(2)),
    isFeasible,
    warning,
    currencyCode,
  };
}
