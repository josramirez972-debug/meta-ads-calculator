import { BusinessType, CampaignObjective } from "./business";

export type { BusinessType, CampaignObjective };

export type BudgetMode = "direct" | "inverse" | "recommended";

export type InverseGoalType = "revenue" | "profit" | "clients" | "orders";

export interface CustomMonthlyExpenseItem {
  id: string;
  label: string;
  amount: number;
}

export interface ServiceEconomicsInputs {
  pricePerClient: number; // Precio de contratación (1ra compra)
  serviceDeliveryCost: number; // Costo directo de prestación del servicio
  otherVariableCosts: number; // Otros costos variables por venta
  additionalCosts: number; // Otros gastos mensuales o adicionales
  averagePurchasesPerClient: number; // Compras promedio por cliente (LTV factor)
  managementFee: number; // Honorarios de agencia / gestión mensual
  fixedCampaignCosts: number; // Herramientas y plataformas mensuales
  otherMonthlyExpenses?: number; // Otros gastos mensuales generales
  customMonthlyExpenses?: CustomMonthlyExpenseItem[]; // Renglones adicionales de gastos mensuales
  advancedUnitCost?: number; // Otros costos unitarios avanzados
}

export interface EcommerceEconomicsInputs {
  averageProductPrice: number; // Precio promedio de venta
  cogs: number; // Costo de mercancía vendida / entrega (unitario)
  packagingCost: number; // Costo de empaque
  shippingCostStore: number; // Envío asumido por la tienda (unitario)
  gatewayFeePercentage: number; // Comisión de pasarela (%)
  otherVariableCosts: number; // Otros gastos por cada venta (unitario)
  discountPercentage: number; // Descuento promedio aplicado (%)
  cancellationRatePercentage: number; // % cancelaciones previas al despacho
  returnRatePercentage: number; // % devoluciones post-entrega
  managementFee: number; // Honorarios de agencia / gestión mensual
  fixedCampaignCosts: number; // Herramientas y plataformas mensuales
  otherMonthlyExpenses?: number; // Otros gastos mensuales generales
  customMonthlyExpenses?: CustomMonthlyExpenseItem[]; // Renglones adicionales de gastos mensuales
  averagePurchasesPerClient?: number; // Compras promedio por cliente (recompra)
  advancedUnitCost?: number; // Otros costos unitarios avanzados
}

export interface AdvertisingMetricsInputs {
  inputMode: "cpm_ctr" | "cpc_direct";
  cpm: number; // Costo por mil impresiones
  ctr: number; // Click-through rate (%)
  manualCpc: number; // CPC directo si se usa ese modo
  budget: number; // Presupuesto publicitario total asignado
  campaignDurationDays: number; // Duración en días
}

export interface ServiceFunnelInputs {
  clickToLeadRate: number; // % clics que se convierten en leads
  leadToQualifiedRate: number; // % leads que califican
  qualifiedToClientRate: number; // % leads calificados que cierran
}

export interface EcommerceFunnelInputs {
  clickToPurchaseRate: number; // % visitas/clics que inician compra
}

export interface InverseBudgetInputs {
  goalType: InverseGoalType;
  targetValue: number; // Ej: 20 clientes, o $50,000 en facturación, etc.
  desiredProfitPerSale?: number; // Beneficio neto deseado por cliente/venta
  periodDays?: number; // Período en días para alcanzar la meta (ej. 30 días)
}

export type InvestmentScenarioTier = "conservative" | "recommended" | "accelerated";

export interface InvestmentScenario {
  tier: InvestmentScenarioTier;
  title: string;
  description: string;
  dailyBudget: number;
  totalBudget: number;
  durationDays: number;
  estimatedClicks: number;
  estimatedClientsOrOrders: number;
  estimatedRevenue: number;
  estimatedNetProfit: number;
  estimatedCpa: number;
  roas: number;
  riskLevel: "low" | "balanced" | "moderate";
  reasoning: string;
  requirementsOrConditions?: string;
}

export interface InvestmentRecommendationPackage {
  conservative: InvestmentScenario;
  recommended: InvestmentScenario;
  accelerated: InvestmentScenario;
  maxViableCpa: number;
  unitMargin: number;
  clickToCustomerRate: number;
  isFeasible: boolean;
  warning?: string;
  currencyCode: string;
}

export interface CalculatorStateInputs {
  businessType: BusinessType;
  countryCode: string;
  sectorId: string;
  currencyCode: string;
  exchangeRate: number; // Tasa respecto a USD o moneda base
  objective: CampaignObjective;
  budgetMode: BudgetMode;
  advertising: AdvertisingMetricsInputs;
  serviceEconomics?: ServiceEconomicsInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
  serviceFunnel?: ServiceFunnelInputs;
  ecommerceFunnel?: EcommerceFunnelInputs;
  inverseBudget?: InverseBudgetInputs;
  metricsExperience?: "beginner" | "advanced";
  metricOrigins?: Record<string, "estimated" | "real" | "edited">;
  benchmarkSourceNotice?: string;
  isIllustrativeAssumption?: boolean;
  investmentRecommendations?: InvestmentRecommendationPackage;
}

export interface AdvertisingCalculations {
  effectiveBudget: number;
  dailyBudget: number;
  impressions: number;
  clicks: number;
  effectiveCpc: number;
  effectiveCpm: number;
  effectiveCtr: number;
}

export interface FunnelCalculations {
  // Services
  rawLeads: number;
  qualifiedLeads: number;
  clients: number;
  cpl: number; // Costo por lead
  cpql: number; // Costo por lead calificado
  cpa: number; // Costo por cliente

  // Ecommerce
  initialPurchases: number;
  cancelledOrders: number;
  returnedOrders: number;
  netOrders: number;
  grossRevenue: number;
  netRevenue: number;
  effectiveCpa: number; // Costo por pedido neto
}

export interface EconomicsCalculations {
  unitPrice: number;
  unitVariableCost: number;
  unitContributionMargin: number;
  unitContributionMarginPercentage: number;
  totalNetRevenue: number;
  totalVariableCosts: number;
  totalContributionMargin: number;
  totalFixedCosts: number; // Honorarios + herramientas + otros gastos mensuales
  totalAdSpend: number;
  netProfit: number; // Beneficio de contribución - AdSpend - FixedCosts
  adProfit: number; // Beneficio de contribución - AdSpend
  // Breakdown of fixed monthly expenses (Never deducted in unit margin)
  managementFeeTotal?: number;
  toolsTotal?: number;
  otherMonthlyTotal?: number;
  // Separate LTV / Repeat purchase metrics (First purchase vs LTV)
  averagePurchasesPerClient?: number;
  ltvUnitRevenue?: number;
  ltvUnitMargin?: number;
  recurringRevenue?: number;
  recurringMargin?: number;
  netProfitWithLtv?: number;
}

export interface ProfitabilityCalculations {
  roas: number; // Ingresos / Gasto publicitario
  adRoiPercentage: number; // (Beneficio contribución - AdSpend) / AdSpend * 100
  totalRoiPercentage: number; // Beneficio neto / (AdSpend + FixedCosts) * 100
  profitabilityStatus: "loss" | "breakeven" | "profitable" | "highly_profitable";
  profitabilityBadgeText: string;
}

export interface BreakEvenCalculations {
  maxBreakevenCpa: number; // Margen por cliente
  maxBreakevenCpl: number; // Margen * tasas conversión
  maxBreakevenCpc: number; // Margen * prob clic a cliente
  targetProfitCpa: number; // Con margen deseado
  minOrdersForBreakeven: number;
  minRevenueForBreakeven: number;
  safetyMarginPercentage: number; // Margen de seguridad respecto a proyecciones actuales
}

export interface IntegerCustomerProjection {
  clientsOrOrders: number;
  requiredAdSpend: number;
  dailyAdSpend: number;
  estimatedNetRevenue: number;
  estimatedVariableCosts: number;
  estimatedContributionMargin: number;
  estimatedAdProfit: number;
  estimatedNetProfit: number;
}

export interface InverseBudgetResult {
  requiredAdSpend: number;
  dailyAdSpend: number;
  requiredClicks: number;
  requiredImpressions: number;
  estimatedClientsOrOrders: number;
  estimatedNetRevenue: number;
  estimatedVariableCosts?: number;
  estimatedContributionMargin: number;
  estimatedAdProfit?: number;
  estimatedNetProfit: number;
  estimatedCpa?: number;
  integerCustomerProjection?: IntegerCustomerProjection;
  isFeasible: boolean;
  feasibilityWarning?: string;
}

export interface ScenarioResult {
  name: "Pessimistic" | "Realistic" | "Optimistic";
  label: string;
  adSpend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  leadsOrPurchases: number;
  clientsOrNetOrders: number;
  revenue: number;
  cpa: number;
  roas: number;
  adRoi: number;
  totalRoi: number;
  netProfit: number;
  status: "loss" | "breakeven" | "profitable" | "highly_profitable";
}

export interface FullCalculationResult {
  inputs: CalculatorStateInputs;
  advertising: AdvertisingCalculations;
  funnel: FunnelCalculations;
  economics: EconomicsCalculations;
  profitability: ProfitabilityCalculations;
  breakEven: BreakEvenCalculations;
  scenarios: {
    pessimistic: ScenarioResult;
    realistic: ScenarioResult;
    optimistic: ScenarioResult;
  };
  inverseResult?: InverseBudgetResult;
  investmentRecommendations?: InvestmentRecommendationPackage;
  warnings: string[];
  recommendations: string[];
  adjustmentSuggestions?: string[];
  calculatedAt: string;
}
