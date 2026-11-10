import {
  CalculatorStateInputs,
  FullCalculationResult,
} from "@/types/calculator";
import { ScenarioParameters } from "@/types/benchmarks";
import { calculateAdvertisingMetrics } from "./advertising";
import { calculateFunnelMetrics } from "./funnel";
import { calculateEconomics } from "./economics";
import { calculateProfitability } from "./profitability";
import { calculateBreakEven } from "./breakeven";
import { calculateInverseBudget } from "./inverse-budget";
import { calculateScenarios, DEFAULT_SCENARIO_PARAMETERS } from "./scenarios";
import { calculateInvestmentRecommendations } from "./recommendation";

export * from "./advertising";
export * from "./funnel";
export * from "./economics";
export * from "./profitability";
export * from "./breakeven";
export * from "./inverse-budget";
export * from "./scenarios";
export * from "./validation";
export * from "./recommendation";

/**
 * Main orchestration function for the META ADS ROI CALCULATOR.
 * Executes the entire calculation pipeline safely, deterministically,
 * and generates actionable financial and performance recommendations.
 */
export function calculateFullRoi(
  inputs: CalculatorStateInputs,
  scenarioParams: ScenarioParameters = DEFAULT_SCENARIO_PARAMETERS
): FullCalculationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const adjustmentSuggestions: string[] = [];

  let effectiveAdSpend = inputs.advertising.budget;
  let inverseResult = undefined;

  // If in inverse budget mode, first determine the required ad spend
  if (inputs.budgetMode === "inverse" && inputs.inverseBudget) {
    // Generate preliminary economics with 0 ad spend to get unit economics
    const tempEconomics = calculateEconomics({
      businessType: inputs.businessType,
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
      serviceEconomics: inputs.serviceEconomics,
      ecommerceEconomics: inputs.ecommerceEconomics,
    });

    inverseResult = calculateInverseBudget({
      businessType: inputs.businessType,
      inverseInputs: inputs.inverseBudget,
      economics: tempEconomics,
      advertising: inputs.advertising,
      serviceFunnel: inputs.serviceFunnel,
      ecommerceFunnel: inputs.ecommerceFunnel,
      ecommerceEconomics: inputs.ecommerceEconomics,
    });

    if (inverseResult.isFeasible && inverseResult.requiredAdSpend > 0) {
      effectiveAdSpend = inverseResult.requiredAdSpend;
      if (inverseResult.feasibilityWarning) {
        warnings.push(inverseResult.feasibilityWarning);
      }
    } else {
      effectiveAdSpend = 0;
      if (inverseResult.feasibilityWarning) {
        warnings.push(inverseResult.feasibilityWarning);
      }
    }
  }

  // 1. Calculate Advertising Metrics
  const advertisingInputsWithSpend = {
    ...inputs.advertising,
    budget: effectiveAdSpend,
  };
  const advertising = calculateAdvertisingMetrics(advertisingInputsWithSpend);

  // 2. Calculate Funnel
  const funnel = calculateFunnelMetrics({
    businessType: inputs.businessType,
    clicks: advertising.clicks,
    adSpend: effectiveAdSpend,
    serviceFunnel: inputs.serviceFunnel,
    ecommerceFunnel: inputs.ecommerceFunnel,
    ecommerceEconomics: inputs.ecommerceEconomics,
  });

  // 3. Calculate Economics
  const economics = calculateEconomics({
    businessType: inputs.businessType,
    adSpend: effectiveAdSpend,
    funnel,
    serviceEconomics: inputs.serviceEconomics,
    ecommerceEconomics: inputs.ecommerceEconomics,
  });

  // 4. Calculate Profitability
  const profitability = calculateProfitability(economics);

  // 5. Calculate Break-even
  const breakEven = calculateBreakEven({
    businessType: inputs.businessType,
    economics,
    desiredProfitPerSale: inputs.inverseBudget?.desiredProfitPerSale,
    serviceFunnel: inputs.serviceFunnel,
    ecommerceFunnel: inputs.ecommerceFunnel,
    ecommerceEconomics: inputs.ecommerceEconomics,
  });

  // 6. Calculate Scenarios
  const scenarios = calculateScenarios({
    businessType: inputs.businessType,
    adSpend: effectiveAdSpend,
    advertising: advertisingInputsWithSpend,
    serviceEconomics: inputs.serviceEconomics,
    ecommerceEconomics: inputs.ecommerceEconomics,
    serviceFunnel: inputs.serviceFunnel,
    ecommerceFunnel: inputs.ecommerceFunnel,
    customParameters: scenarioParams,
  });

  // 7. Generate Rigorous Financial & Advertising Analysis & Intelligent Alerts (Section 11)
  if (economics.unitContributionMargin < 0) {
    warnings.push(
      "Margen negativo: Estás gastando más en entregar tu producto o servicio de lo que cobras. Antes de invertir en publicidad, revisa tu precio o tus costos."
    );
    adjustmentSuggestions.push(
      "Aumentar el precio de venta de tu producto o servicio.",
      "Reducir los costos directos de entrega o los gastos variables por venta."
    );
  } else if (economics.unitContributionMargin === 0) {
    warnings.push(
      "Margen insuficiente: No queda dinero disponible por venta para cubrir publicidad ni gastos generales."
    );
    adjustmentSuggestions.push(
      "Aumentar el precio de venta para generar margen disponible por cliente.",
      "Disminuir costos de entrega o comisiones por venta."
    );
  } else if (economics.unitContributionMarginPercentage < 25) {
    warnings.push(
      `Margen ajustado (${economics.unitContributionMarginPercentage.toFixed(
        1
      )}%): Queda poco margen por cada venta para absorber el costo publicitario.`
    );
    adjustmentSuggestions.push(
      "Revisar el precio o crear paquetes de mayor valor para ampliar tu margen por venta."
    );
  }

  const currentCpa =
    inputs.businessType === "services" ? funnel.cpa : funnel.effectiveCpa;

  if (currentCpa > breakEven.maxBreakevenCpa && currentCpa > 0) {
    warnings.push(
      "Con los costos y las conversiones actuales, adquirir un cliente cuesta más de lo que te deja esa venta. Necesitas mejorar el margen o la conversión antes de considerar esta inversión rentable."
    );
    adjustmentSuggestions.push(
      "Mejorar la conversión de clic a contacto o compra.",
      inputs.businessType === "services"
        ? "Mejorar la calificación de contactos y el porcentaje de cierre comercial."
        : "Optimizar la tasa de conversión en el checkout de tu tienda.",
      "Revisar el costo publicitario (mejorar anuncios para subir CTR y bajar CPC).",
      "Aumentar el precio o reducir costos de entrega para elevar tu CPA máximo permitido."
    );
  }

  if (effectiveAdSpend > 0 && advertising.clicks === 0) {
    warnings.push(
      "Presupuesto insuficiente: El presupuesto asignado no alcanza para generar clics con los costos publicitarios actuales."
    );
    adjustmentSuggestions.push(
      "Incrementar el presupuesto publicitario o revisar el CPC/CPM configurado."
    );
  }

  const acquiredCustomers =
    inputs.businessType === "services" ? funnel.clients : funnel.netOrders;
  if (advertising.clicks > 0 && acquiredCustomers < 1) {
    warnings.push(
      "Conversión o presupuesto insuficiente para lograr al menos 1 venta completa en el período proyectado."
    );
    adjustmentSuggestions.push(
      "Aumentar el presupuesto de campaña o mejorar las tasas de conversión del embudo."
    );
  }

  if (inputs.businessType === "services" && inputs.serviceFunnel) {
    const totalConv =
      (inputs.serviceFunnel.clickToLeadRate / 100) *
      (inputs.serviceFunnel.leadToQualifiedRate / 100) *
      (inputs.serviceFunnel.qualifiedToClientRate / 100) *
      100;
    if (totalConv > 0 && totalConv < 0.3) {
      warnings.push(
        `Conversión demasiado baja (${totalConv.toFixed(
          2
        )}% de clic a cliente): Se necesitan demasiados clics para lograr una venta.`
      );
      adjustmentSuggestions.push(
        "Mejorar el mensaje y formulario para aumentar la conversión de clic a contacto.",
        "Mejorar el seguimiento y cierre comercial con los prospectos calificados."
      );
    }
  } else if (inputs.businessType === "ecommerce" && inputs.ecommerceFunnel) {
    if (
      inputs.ecommerceFunnel.clickToPurchaseRate > 0 &&
      inputs.ecommerceFunnel.clickToPurchaseRate < 0.8
    ) {
      warnings.push(
        `Conversión de tienda baja (${inputs.ecommerceFunnel.clickToPurchaseRate}%): Menos del 0.8% de las visitas compran.`
      );
      adjustmentSuggestions.push(
        "Mejorar la oferta, velocidad y confianza en la página de producto y checkout."
      );
    }
  }

  if (profitability.roas > 1 && economics.netProfit < 0) {
    warnings.push(
      `Atención con el ROAS (${profitability.roas.toFixed(
        2
      )}x): Aunque generas ventas brutas superiores al gasto en anuncios, el beneficio neto del negocio es negativo después de descontar los costos del producto/servicio y tus gastos mensuales.`
    );
    if (economics.totalFixedCosts > 0) {
      adjustmentSuggestions.push(
        "Reducir gastos generales mensuales o escalar el volumen de ventas rentables para diluir los gastos fijos."
      );
    }
  }

  if (inputs.isIllustrativeAssumption) {
    recommendations.push(
      "Datos estimados orientativos: Esta simulación utiliza supuestos ilustrativos de mercado. Cuando tengas datos reales de tus campañas en Meta Ads, introdúcelos en el Paso 6 para mayor precisión."
    );
  }

  if (advertising.effectiveCtr < 0.8 && advertising.effectiveCtr > 0) {
    recommendations.push(
      "El CTR estimado es inferior al 0.8%. Te sugerimos probar nuevos anuncios visuales y textos persuasivos con Traffiker Digital para reducir tu costo por clic."
    );
  }

  if (inputs.businessType === "ecommerce" && inputs.ecommerceEconomics) {
    const returnAndCancel =
      (inputs.ecommerceEconomics.cancellationRatePercentage || 0) +
      (inputs.ecommerceEconomics.returnRatePercentage || 0);
    if (returnAndCancel > 25) {
      warnings.push(
        `La tasa acumulada de cancelaciones y devoluciones (${returnAndCancel}%) es elevada. Reducir la tasa de devolución post-entrega aumentará directamente el beneficio neto.`
      );
    }
  }

  if (economics.netProfit > 0) {
    recommendations.push(
      `Proyección viable: Con un beneficio neto estimado de $${economics.netProfit.toLocaleString(
        "es-CO",
        { maximumFractionDigits: 0 }
      )}, el modelo es escalable optimizando la tasa de conversión.`
    );
  } else if (inverseResult && !inverseResult.isFeasible) {
    adjustmentSuggestions.push(
      "Aumentar el precio o reducir costos de entrega para subir tu margen disponible por venta.",
      "Mejorar la conversión de clic a contacto, la calificación de prospectos y el cierre comercial.",
      "Revisar el costo publicitario (CPC/CPM) o reducir gastos generales mensuales."
    );
  }

  // Deduplicate adjustment suggestions
  const uniqueSuggestions = Array.from(new Set(adjustmentSuggestions));

  // Calculate Investment Recommendations Package
  const investmentRecommendations = calculateInvestmentRecommendations({
    businessType: inputs.businessType,
    economics,
    advertising: inputs.advertising,
    serviceFunnel: inputs.serviceFunnel,
    ecommerceFunnel: inputs.ecommerceFunnel,
    ecommerceEconomics: inputs.ecommerceEconomics,
    desiredProfitPerSale: inputs.inverseBudget?.desiredProfitPerSale || 0,
    currencyCode: inputs.currencyCode,
    exchangeRateToUSD: inputs.exchangeRate,
  });

  return {
    inputs,
    advertising,
    funnel,
    economics,
    profitability,
    breakEven,
    scenarios,
    inverseResult,
    investmentRecommendations,
    warnings,
    recommendations,
    adjustmentSuggestions: uniqueSuggestions,
    calculatedAt: new Date().toISOString(),
  };
}
