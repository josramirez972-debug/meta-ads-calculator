import {
  BusinessType,
  InverseBudgetInputs,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  EcommerceEconomicsInputs,
  AdvertisingMetricsInputs,
  EconomicsCalculations,
  InverseBudgetResult,
} from "@/types/calculator";

/**
 * Calculates inverse budget required to achieve a commercial target:
 * Clients, Orders, Revenue, or Net Profit.
 * Fully incorporates fixed costs, conversion bottlenecks, and feasibility checks.
 */
export function calculateInverseBudget(params: {
  businessType: BusinessType;
  inverseInputs: InverseBudgetInputs;
  economics: EconomicsCalculations;
  advertising: AdvertisingMetricsInputs;
  serviceFunnel?: ServiceFunnelInputs;
  ecommerceFunnel?: EcommerceFunnelInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
}): InverseBudgetResult {
  const {
    businessType,
    inverseInputs,
    economics,
    advertising,
    serviceFunnel,
    ecommerceFunnel,
    ecommerceEconomics,
  } = params;

  const targetValue = Math.max(0, inverseInputs.targetValue || 0);
  const goalType = inverseInputs.goalType;
  const desiredProfit = Math.max(0, inverseInputs.desiredProfitPerSale || 0);
  const unitPrice = economics.unitPrice;
  const unitVariableCost = economics.unitVariableCost;
  const unitMargin = economics.unitContributionMargin;
  const totalFixed = economics.totalFixedCosts;
  const duration = Math.max(1, advertising.campaignDurationDays || 1);

  // Derive estimated CPC respecting inputMode (single source of truth with advertising.ts)
  let estimatedCpc = 0;
  if (advertising.inputMode === "cpc_direct") {
    estimatedCpc = Math.max(0, advertising.manualCpc || 0);
  } else if (advertising.cpm > 0 && advertising.ctr > 0) {
    estimatedCpc = (advertising.cpm / 1000) / (advertising.ctr / 100);
  } else if (advertising.manualCpc > 0) {
    estimatedCpc = advertising.manualCpc;
  }
  if (estimatedCpc <= 0) {
    estimatedCpc = 0.5; // Supuesto seguro por defecto si no hay datos
  }

  // Click to customer probability
  let clickToCustomerRate = 0;
  if (businessType === "services") {
    const c2l = Math.max(0, serviceFunnel?.clickToLeadRate || 0) / 100;
    const l2q = Math.max(0, serviceFunnel?.leadToQualifiedRate || 0) / 100;
    const q2c = Math.max(0, serviceFunnel?.qualifiedToClientRate || 0) / 100;
    clickToCustomerRate = c2l * l2q * q2c;
  } else {
    const c2p = Math.max(0, ecommerceFunnel?.clickToPurchaseRate || 0) / 100;
    const cancel = Math.min(100, Math.max(0, ecommerceEconomics?.cancellationRatePercentage || 0)) / 100;
    const returns = Math.min(100, Math.max(0, ecommerceEconomics?.returnRatePercentage || 0)) / 100;
    clickToCustomerRate = c2p * (1 - cancel) * (1 - returns);
  }

  // Cost Per Acquisition based on current funnel (exact decimal)
  const estimatedCpa =
    clickToCustomerRate > 0 ? estimatedCpc / clickToCustomerRate : 0;

  let targetCustomers = 0;
  let isFeasible = true;
  let feasibilityWarning: string | undefined;

  if (unitMargin <= 0) {
    isFeasible = false;
    feasibilityWarning =
      "El margen disponible por venta es cero o negativo. Estás gastando más en entregar tu producto o servicio de lo que cobras, por lo que ninguna inversión publicitaria será rentable sin ajustar tu precio o tus costos.";
  } else if (desiredProfit > 0 && desiredProfit > unitMargin) {
    isFeasible = false;
    feasibilityWarning = `El beneficio deseado por venta (${desiredProfit.toFixed(
      0
    )}) supera tu margen disponible antes de publicidad (${unitMargin.toFixed(
      0
    )}). Con los costos actuales no es viable alcanzar esta meta.`;
  }

  if (clickToCustomerRate <= 0) {
    isFeasible = false;
    feasibilityWarning =
      "Las tasas de conversión del embudo están en 0%. No es posible estimar adquisición de clientes sin tasa de conversión.";
  }

  if (isFeasible) {
    switch (goalType) {
      case "clients":
      case "orders":
        targetCustomers = targetValue;
        if (estimatedCpa >= unitMargin) {
          feasibilityWarning = `Advertencia de rentabilidad: Aunque puedes alcanzar ${targetValue} ${
            goalType === "clients" ? "clientes" : "ventas"
          }, el costo estimado por adquisición (CPA: ${estimatedCpa.toFixed(
            0
          )}) iguala o supera tu dinero disponible por venta (${unitMargin.toFixed(
            0
          )}), por lo que la campaña tendría pérdidas.`;
        }
        break;

      case "revenue":
        if (unitPrice > 0) {
          targetCustomers = targetValue / unitPrice;
          if (estimatedCpa >= unitMargin) {
            feasibilityWarning = `Advertencia de rentabilidad: Puedes alcanzar esa facturación, pero el costo por adquisición estimado (${estimatedCpa.toFixed(
              0
            )}) iguala o supera tu margen disponible por venta (${unitMargin.toFixed(
              0
            )}), generando pérdida neta.`;
          }
        } else {
          isFeasible = false;
          feasibilityWarning =
            "El precio de venta unitario es cero, por lo que no es posible alcanzar la meta de facturación.";
        }
        break;

      case "profit": {
        // Exact analytical resolution without premature rounding:
        // Clientes necesarios = (meta de beneficio neto + gastos fijos) / (margen unitario - CPA estimado)
        const effectiveMarginPerSale =
          desiredProfit > 0
            ? unitMargin - estimatedCpa
            : unitMargin - estimatedCpa;
        if (effectiveMarginPerSale <= 0) {
          isFeasible = false;
          feasibilityWarning =
            "Con los costos y las conversiones actuales, adquirir un cliente cuesta más de lo que te deja esa venta. Necesitas mejorar el margen o la conversión antes de considerar esta inversión rentable.";
          targetCustomers = 0;
        } else {
          const requiredNumerator = targetValue + totalFixed;
          targetCustomers = requiredNumerator / effectiveMarginPerSale;
        }
        break;
      }
    }
  }

  // If unfeasible, do not return a fictitious recommended budget
  const requiredAdSpend = isFeasible ? targetCustomers * estimatedCpa : 0;
  const dailyAdSpend = isFeasible ? requiredAdSpend / duration : 0;
  const requiredClicks =
    isFeasible && clickToCustomerRate > 0
      ? targetCustomers / clickToCustomerRate
      : 0;

  const ctr = advertising.ctr > 0 ? advertising.ctr / 100 : 0.01;
  const requiredImpressions = isFeasible && ctr > 0 ? requiredClicks / ctr : 0;

  const estimatedNetRevenue = isFeasible ? targetCustomers * unitPrice : 0;
  const estimatedVariableCosts = isFeasible ? targetCustomers * unitVariableCost : 0;
  const estimatedContributionMargin = isFeasible ? targetCustomers * unitMargin : 0;
  const estimatedAdProfit = isFeasible ? estimatedContributionMargin - requiredAdSpend : 0;
  const estimatedNetProfit = isFeasible
    ? estimatedAdProfit - totalFixed
    : 0;

  const cleanFloat = (n: number): number =>
    Number.isFinite(n) ? Math.round(n * 1e8) / 1e8 : 0;

  // Optional operational projection rounded up to the next whole customer (Section 7)
  const intClients = isFeasible ? Math.ceil(targetCustomers) : 0;
  const intAdSpend = isFeasible ? intClients * estimatedCpa : 0;
  const intDailySpend = isFeasible ? intAdSpend / duration : 0;
  const intRevenue = isFeasible ? intClients * unitPrice : 0;
  const intVarCosts = isFeasible ? intClients * unitVariableCost : 0;
  const intContribMargin = isFeasible ? intClients * unitMargin : 0;
  const intAdProfit = isFeasible ? intContribMargin - intAdSpend : 0;
  const intNetProfit = isFeasible ? intAdProfit - totalFixed : 0;

  return {
    requiredAdSpend: cleanFloat(requiredAdSpend),
    dailyAdSpend: cleanFloat(dailyAdSpend),
    requiredClicks: cleanFloat(requiredClicks),
    requiredImpressions: cleanFloat(requiredImpressions),
    estimatedClientsOrOrders: cleanFloat(targetCustomers),
    estimatedNetRevenue: cleanFloat(estimatedNetRevenue),
    estimatedVariableCosts: cleanFloat(estimatedVariableCosts),
    estimatedContributionMargin: cleanFloat(estimatedContributionMargin),
    estimatedAdProfit: cleanFloat(estimatedAdProfit),
    estimatedNetProfit: cleanFloat(estimatedNetProfit),
    estimatedCpa: cleanFloat(estimatedCpa),
    integerCustomerProjection: isFeasible
      ? {
          clientsOrOrders: intClients,
          requiredAdSpend: cleanFloat(intAdSpend),
          dailyAdSpend: cleanFloat(intDailySpend),
          estimatedNetRevenue: cleanFloat(intRevenue),
          estimatedVariableCosts: cleanFloat(intVarCosts),
          estimatedContributionMargin: cleanFloat(intContribMargin),
          estimatedAdProfit: cleanFloat(intAdProfit),
          estimatedNetProfit: cleanFloat(intNetProfit),
        }
      : undefined,
    isFeasible,
    feasibilityWarning,
  };
}
