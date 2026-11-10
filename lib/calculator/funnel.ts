import {
  BusinessType,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  EcommerceEconomicsInputs,
  FunnelCalculations,
} from "@/types/calculator";

const cleanFloat = (n: number): number =>
  Number.isFinite(n) ? Math.round(n * 1e8) / 1e8 : 0;

/**
 * Calculates conversion funnel metrics for Services or Ecommerce.
 * Guaranteed no NaN, no negative values, no premature integer rounding,
 * and non-overlapping cancellation/return handling.
 */
export function calculateFunnelMetrics(params: {
  businessType: BusinessType;
  clicks: number;
  adSpend: number;
  serviceFunnel?: ServiceFunnelInputs;
  ecommerceFunnel?: EcommerceFunnelInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
}): FunnelCalculations {
  const {
    businessType,
    clicks,
    adSpend,
    serviceFunnel,
    ecommerceFunnel,
    ecommerceEconomics,
  } = params;

  const safeClicks = Math.max(0, clicks || 0);
  const safeSpend = Math.max(0, adSpend || 0);

  if (businessType === "services") {
    const clickToLead = Math.max(0, serviceFunnel?.clickToLeadRate || 0) / 100;
    const leadToQual = Math.max(0, serviceFunnel?.leadToQualifiedRate || 0) / 100;
    const qualToClient = Math.max(0, serviceFunnel?.qualifiedToClientRate || 0) / 100;

    // Maintain exact decimals during internal calculations (no premature rounding)
    const rawLeads = safeClicks * clickToLead;
    const qualifiedLeads = rawLeads * leadToQual;
    const clients = qualifiedLeads * qualToClient;

    const cpl = rawLeads > 0 ? safeSpend / rawLeads : 0;
    const cpql = qualifiedLeads > 0 ? safeSpend / qualifiedLeads : 0;
    const cpa = clients > 0 ? safeSpend / clients : 0;

    return {
      rawLeads: cleanFloat(rawLeads),
      qualifiedLeads: cleanFloat(qualifiedLeads),
      clients: cleanFloat(clients),
      cpl: cleanFloat(cpl),
      cpql: cleanFloat(cpql),
      cpa: cleanFloat(cpa),

      // Zero for ecommerce metrics
      initialPurchases: 0,
      cancelledOrders: 0,
      returnedOrders: 0,
      netOrders: 0,
      grossRevenue: 0,
      netRevenue: 0,
      effectiveCpa: 0,
    };
  } else {
    // Ecommerce
    const clickToPurchase = Math.max(0, ecommerceFunnel?.clickToPurchaseRate || 0) / 100;
    const cancelPct = Math.min(100, Math.max(0, ecommerceEconomics?.cancellationRatePercentage || 0)) / 100;
    const returnPct = Math.min(100, Math.max(0, ecommerceEconomics?.returnRatePercentage || 0)) / 100;
    const avgPrice = Math.max(0, ecommerceEconomics?.averageProductPrice || 0);
    const discountPct = Math.min(100, Math.max(0, ecommerceEconomics?.discountPercentage || 0)) / 100;

    const initialPurchases = cleanFloat(safeClicks * clickToPurchase);

    // Sequential non-overlapping model (preserving decimals):
    // 1. Initial purchase created
    // 2. Pre-dispatch cancellations happen
    const confirmedOrders = cleanFloat(initialPurchases * (1 - cancelPct));
    const cancelledOrders = cleanFloat(Math.max(0, initialPurchases - confirmedOrders));

    // 3. Post-delivery returns happen on fulfilled/confirmed orders
    const netOrders = cleanFloat(confirmedOrders * (1 - returnPct));
    const returnedOrders = cleanFloat(Math.max(0, confirmedOrders - netOrders));

    const effectiveUnitPrice = avgPrice * (1 - discountPct);
    const grossRevenue = cleanFloat(initialPurchases * effectiveUnitPrice);
    const netRevenue = cleanFloat(netOrders * effectiveUnitPrice);

    const effectiveCpa = netOrders > 0 ? cleanFloat(safeSpend / netOrders) : 0;

    return {
      rawLeads: 0,
      qualifiedLeads: 0,
      clients: 0,
      cpl: 0,
      cpql: 0,
      cpa: 0,

      initialPurchases,
      cancelledOrders,
      returnedOrders,
      netOrders,
      grossRevenue,
      netRevenue,
      effectiveCpa,
    };
  }
}
