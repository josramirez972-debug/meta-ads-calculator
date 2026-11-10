import { FullCalculationResult } from "@/types/calculator";
import { formatCurrency } from "@/lib/currency/countries";

/**
 * Generates formatted text summary for sharing via clipboard or notes.
 */
export function generateTextSummary(result: FullCalculationResult): string {
  const { inputs, advertising, funnel, economics, profitability, breakEven, scenarios } = result;
  const isServices = inputs.businessType === "services";
  const curr = inputs.currencyCode;

  const header = `=========================================
PROYECCIÓN META ADS - TRAFFIKER DIGITAL
Fecha: ${new Date(result.calculatedAt).toLocaleDateString("es-ES")}
Modelo: ${isServices ? "Servicios y Productos Digitales" : "Productos Físicos y Ecommerce"}
Moneda: ${curr} (Tasa: ${inputs.exchangeRate})
=========================================

1. INVERSIÓN Y ALCANCE PUBLICITARIO
- Presupuesto publicitario: ${formatCurrency(advertising.effectiveBudget, curr, 0)}
- Impresiones estimadas: ${advertising.impressions.toLocaleString()}
- Clics estimados: ${advertising.clicks.toLocaleString()}
- CTR: ${advertising.effectiveCtr.toFixed(2)}%
- CPC promedio: ${formatCurrency(advertising.effectiveCpc, curr)}

2. EMBUDO DE CONVERSIÓN
${
  isServices
    ? `- Leads generados: ${funnel.rawLeads.toLocaleString()} (CPL: ${formatCurrency(funnel.cpl, curr)})
- Leads calificados: ${funnel.qualifiedLeads.toLocaleString()} (CPQL: ${formatCurrency(funnel.cpql, curr)})
- Clientes cerrados: ${funnel.clients.toLocaleString()} (CPA: ${formatCurrency(funnel.cpa, curr)})`
    : `- Compras iniciales: ${funnel.initialPurchases.toLocaleString()}
- Pedidos cancelados: ${funnel.cancelledOrders.toLocaleString()}
- Pedidos devueltos: ${funnel.returnedOrders.toLocaleString()}
- Pedidos netos entregados: ${funnel.netOrders.toLocaleString()} (CPA Neto: ${formatCurrency(funnel.effectiveCpa, curr)})`
}

3. ASÍ SE DISTRIBUYE EL DINERO DE TU CAMPAÑA
- Ingresos por ventas: ${formatCurrency(economics.totalNetRevenue, curr, 0)}
- Costos de entrega: -${formatCurrency(economics.totalVariableCosts, curr, 0)}
- Nivel 1 (Margen disponible total): ${formatCurrency(economics.totalContributionMargin, curr, 0)} (${formatCurrency(economics.unitContributionMargin, curr, 0)} por venta)
- Inversión publicitaria en Meta Ads: -${formatCurrency(economics.totalAdSpend, curr, 0)}
- Nivel 2 (Beneficio después de publicidad): ${formatCurrency(economics.adProfit, curr, 0)}
- Gastos mensuales (Gestión y herramientas): -${formatCurrency(economics.totalFixedCosts, curr, 0)}
- Nivel 3 (GANANCIA NETA PROYECTADA): ${formatCurrency(economics.netProfit, curr, 0)}
- ROAS: ${profitability.roas.toFixed(2)}x
- ROI Publicitario: ${profitability.adRoiPercentage.toFixed(1)}%
- ROI Total: ${profitability.totalRoiPercentage.toFixed(1)}%
- Estado financiero: ${profitability.profitabilityBadgeText}

4. LÍMITES DE EQUILIBRIO (BREAK-EVEN)
- CPA Máximo de equilibrio: ${formatCurrency(breakEven.maxBreakevenCpa, curr)}
- CPL Máximo de equilibrio: ${formatCurrency(breakEven.maxBreakevenCpl, curr)}
- CPC Máximo rentable: ${formatCurrency(breakEven.maxBreakevenCpc, curr)}

5. ESCENARIOS COMPARATIVOS
- Pesimista: Beneficio ${formatCurrency(scenarios.pessimistic.netProfit, curr, 0)} | ROI ${scenarios.pessimistic.totalRoi.toFixed(1)}%
- Realista:  Beneficio ${formatCurrency(scenarios.realistic.netProfit, curr, 0)} | ROI ${scenarios.realistic.totalRoi.toFixed(1)}%
- Optimista: Beneficio ${formatCurrency(scenarios.optimistic.netProfit, curr, 0)} | ROI ${scenarios.optimistic.totalRoi.toFixed(1)}%

*Nota: Esta proyección se basa en modelos matemáticos y supuestos configurados.
Gestiona tus campañas con expertos en Traffiker Digital: www.traffikerdigital.com`;

  return header;
}

/**
 * Generates CSV string for spreadsheet export.
 */
export function generateCsvExport(result: FullCalculationResult): string {
  const { advertising, funnel, economics, profitability, breakEven, scenarios, inputs } = result;
  const isServices = inputs.businessType === "services";
  const curr = inputs.currencyCode;

  const rows = [
    ["Concepto", "Valor", "Unidad / Moneda"],
    ["Modelo de Negocio", isServices ? "Servicios y Digital" : "Ecommerce y Físico", ""],
    ["Moneda Base", curr, ""],
    ["Presupuesto Publicitario", advertising.effectiveBudget, curr],
    ["Impresiones Estimadas", advertising.impressions, "vistas"],
    ["Clics Estimados", advertising.clicks, "clics"],
    ["CPC Promedio", advertising.effectiveCpc.toFixed(2), curr],
    ["CTR Estimado", advertising.effectiveCtr.toFixed(2), "%"],
    isServices
      ? ["Leads Estimados", funnel.rawLeads, "leads"]
      : ["Compras Iniciales", funnel.initialPurchases, "pedidos"],
    isServices
      ? ["Clientes Estimados", funnel.clients, "clientes"]
      : ["Pedidos Netos", funnel.netOrders, "pedidos"],
    isServices
      ? ["CPA (Costo por Cliente)", funnel.cpa.toFixed(2), curr]
      : ["CPA Neto (Costo por Pedido)", funnel.effectiveCpa.toFixed(2), curr],
    ["Ingresos Netos Proyectados", economics.totalNetRevenue.toFixed(2), curr],
    ["Costos Variables Totales", economics.totalVariableCosts.toFixed(2), curr],
    ["Margen de Contribución Total", economics.totalContributionMargin.toFixed(2), curr],
    ["Costos Fijos y Honorarios", economics.totalFixedCosts.toFixed(2), curr],
    ["Beneficio Neto Proyectado", economics.netProfit.toFixed(2), curr],
    ["ROAS", profitability.roas.toFixed(2), "x"],
    ["ROI Publicitario", profitability.adRoiPercentage.toFixed(2), "%"],
    ["ROI Total", profitability.totalRoiPercentage.toFixed(2), "%"],
    ["CPA Máximo de Equilibrio", breakEven.maxBreakevenCpa.toFixed(2), curr],
    ["CPL Máximo de Equilibrio", breakEven.maxBreakevenCpl.toFixed(2), curr],
    ["CPC Máximo Rentable", breakEven.maxBreakevenCpc.toFixed(2), curr],
    ["Beneficio Escenario Pesimista", scenarios.pessimistic.netProfit.toFixed(2), curr],
    ["Beneficio Escenario Realista", scenarios.realistic.netProfit.toFixed(2), curr],
    ["Beneficio Escenario Optimista", scenarios.optimistic.netProfit.toFixed(2), curr],
  ];

  return rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
}
