import { z } from "zod";

export const serviceEconomicsSchema = z.object({
  pricePerClient: z.number().min(0, "El precio no puede ser negativo"),
  serviceDeliveryCost: z.number().min(0, "El costo de prestación no puede ser negativo"),
  otherVariableCosts: z.number().min(0, "Otros costos no pueden ser negativos"),
  additionalCosts: z.number().min(0, "Costos adicionales no pueden ser negativos"),
  averagePurchasesPerClient: z.number().min(1, "Debe ser al menos 1 compra"),
  managementFee: z.number().min(0, "Los honorarios no pueden ser negativos"),
  fixedCampaignCosts: z.number().min(0, "Los costos fijos no pueden ser negativos"),
});

export const ecommerceEconomicsSchema = z.object({
  averageProductPrice: z.number().min(0, "El precio no puede ser negativo"),
  cogs: z.number().min(0, "El costo de mercancía no puede ser negativo"),
  packagingCost: z.number().min(0, "El costo de empaque no puede ser negativo"),
  shippingCostStore: z.number().min(0, "El costo de envío no puede ser negativo"),
  gatewayFeePercentage: z.number().min(0).max(100, "La comisión debe estar entre 0% y 100%"),
  otherVariableCosts: z.number().min(0, "Otros costos no pueden ser negativos"),
  discountPercentage: z.number().min(0).max(100, "El descuento debe estar entre 0% y 100%"),
  cancellationRatePercentage: z.number().min(0).max(100, "Las cancelaciones deben estar entre 0% y 100%"),
  returnRatePercentage: z.number().min(0).max(100, "Las devoluciones deben estar entre 0% y 100%"),
  managementFee: z.number().min(0, "Los honorarios no pueden ser negativos"),
  fixedCampaignCosts: z.number().min(0, "Los costos fijos no pueden ser negativos"),
});

export const advertisingMetricsSchema = z.object({
  inputMode: z.enum(["cpm_ctr", "cpc_direct"]),
  cpm: z.number().min(0, "El CPM no puede ser negativo"),
  ctr: z.number().min(0).max(100, "El CTR debe estar entre 0% y 100%"),
  manualCpc: z.number().min(0, "El CPC no puede ser negativo"),
  budget: z.number().min(0, "El presupuesto no puede ser negativo"),
  campaignDurationDays: z.number().min(1, "La duración mínima es 1 día"),
});

export const serviceFunnelSchema = z.object({
  clickToLeadRate: z.number().min(0).max(100, "La tasa de lead debe estar entre 0% y 100%"),
  leadToQualifiedRate: z.number().min(0).max(100, "La tasa de calificación debe estar entre 0% y 100%"),
  qualifiedToClientRate: z.number().min(0).max(100, "La tasa de cierre debe estar entre 0% y 100%"),
});

export const ecommerceFunnelSchema = z.object({
  clickToPurchaseRate: z.number().min(0).max(100, "La conversión a compra debe estar entre 0% y 100%"),
});

export const inverseBudgetSchema = z.object({
  goalType: z.enum(["clients", "orders", "revenue", "profit"]),
  targetValue: z.number().min(1, "La meta debe ser mayor a cero"),
  desiredProfitPerSale: z.number().min(0).optional(),
});
