"use client";

import React, { useState } from "react";
import { FullCalculationResult } from "@/types/calculator";
import { formatCurrency } from "@/lib/currency/countries";
import { generateTextSummary, generateCsvExport } from "@/lib/reports/export";
import {
  TrendingUp,
  Download,
  Copy,
  Printer,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Check,
  Layers,
  Info,
  Lightbulb,
  ArrowDown,
  Wallet,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import LeadAdvisoryModal from "../forms/LeadAdvisoryModal";

interface DashboardProps {
  result: FullCalculationResult;
  onRecalculate: () => void;
}

export default function Dashboard({ result, onRecalculate }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [showIntegerProjection, setShowIntegerProjection] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    inputs,
    advertising,
    funnel,
    economics,
    profitability,
    breakEven,
    scenarios,
    inverseResult,
    warnings,
    recommendations,
    adjustmentSuggestions = [],
  } = result;

  const isServices = inputs.businessType === "services";
  const curr = inputs.currencyCode;
  const durationDays = inputs.advertising.campaignDurationDays || 30;

  // Clipboard copy handler
  const handleCopySummary = async () => {
    try {
      const summary = generateTextSummary(result);
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("No se pudo copiar al portapapeles directamente.");
    }
  };

  // CSV download handler
  const handleDownloadCsv = () => {
    const csvContent = generateCsvExport(result);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `proyeccion-meta-ads-traffiker-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Presentation helper for people/order counts (Section 7: round only for display)
  const formatCount = (n: number): string => {
    if (!Number.isFinite(n) || n <= 0) return "0";
    return Math.round(n).toLocaleString("es-CO");
  };

  // Chart data for scenario comparison using strict visual identity
  const scenarioChartData = [
    {
      name: "Pesimista",
      Inversión: Math.round(scenarios.pessimistic.adSpend),
      Facturación: Math.round(scenarios.pessimistic.revenue),
      Beneficio: Math.round(scenarios.pessimistic.netProfit),
    },
    {
      name: "Realista",
      Inversión: Math.round(scenarios.realistic.adSpend),
      Facturación: Math.round(scenarios.realistic.revenue),
      Beneficio: Math.round(scenarios.realistic.netProfit),
    },
    {
      name: "Optimista",
      Inversión: Math.round(scenarios.optimistic.adSpend),
      Facturación: Math.round(scenarios.optimistic.revenue),
      Beneficio: Math.round(scenarios.optimistic.netProfit),
    },
  ];

  const contactsOrCarts = isServices
    ? funnel.rawLeads
    : funnel.initialPurchases;
  const clientsOrSales = isServices ? funnel.clients : funnel.netOrders;
  const effectiveCpa = isServices ? funnel.cpa : funnel.effectiveCpa;
  const cpaExceedsMargin =
    effectiveCpa > economics.unitContributionMargin && effectiveCpa > 0;

  // Percentages of total revenue for visual waterfall bar
  const revBase = Math.max(1, economics.totalNetRevenue);
  const deliveryPct = Math.min(
    100,
    Math.max(0, (economics.totalVariableCosts / revBase) * 100)
  );
  const adsPct = Math.min(
    100,
    Math.max(0, (economics.totalAdSpend / revBase) * 100)
  );
  const fixedPct = Math.min(
    100,
    Math.max(0, (economics.totalFixedCosts / revBase) * 100)
  );
  const netProfitPct = Math.min(
    100,
    Math.max(0, (Math.max(0, economics.netProfit) / revBase) * 100)
  );

  // Unit delivery & other variable costs for Level 1 breakdown
  const unitDeliveryCost = isServices
    ? inputs.serviceEconomics?.serviceDeliveryCost || 0
    : inputs.ecommerceEconomics?.cogs || 0;
  const unitOtherVariableCost = Math.max(
    0,
    economics.unitVariableCost - unitDeliveryCost
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Quick Actions */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-[#FF5A1F]/15 text-[#FF5A1F] px-2.5 py-1 rounded-md border border-[#FF5A1F]/30">
              PASO 7 DE 7 • RESULTADOS Y RENTABILIDAD
            </span>
            <span className="text-xs text-[#CBD2DC]">
              {new Date(result.calculatedAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tu Proyección de Inversión y Rentabilidad
          </h2>
          <p className="text-sm text-[#CBD2DC] mt-1">
            Modelo: {isServices ? "Servicios y Atención Comercial" : "Ecommerce / Tienda Online"} | País:{" "}
            {inputs.countryCode} | Moneda: {curr} | Duración: {durationDays} días
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={onRecalculate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 border border-[#FF5A1F]/40 text-[#FF5A1F] text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ajustar Métricas (Paso 6)
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D0F12] hover:bg-[#292E36] border border-[#292E36] text-[#CBD2DC] hover:text-white text-xs font-semibold transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#FF5A1F]" />
            )}
            {copied ? "Copiado!" : "Copiar Resumen"}
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D0F12] hover:bg-[#292E36] border border-[#292E36] text-[#CBD2DC] hover:text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5A1F]" />
            CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e04e18] text-white text-xs font-bold shadow-lg shadow-[#FF5A1F]/20 transition-all hover:scale-105"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* CRITICAL ALERT IF CPA EXCEEDS AVAILABLE UNIT MARGIN (Section 6) */}
      {cpaExceedsMargin && (
        <div className="bg-[#191C21] border-2 border-[#FF5A1F] rounded-2xl p-5 flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-[#FF5A1F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Alerta de Rentabilidad por Cliente (CPA superior al margen)
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD2DC] leading-relaxed">
              Con los costos y las conversiones actuales, adquirir un cliente cuesta más de lo que te deja esa venta. Necesitas mejorar el margen o la conversión antes de considerar esta inversión rentable.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: PROYECCIÓN PARA ALCANZAR TU OBJETIVO COMERCIAL (Inverse Budget Message) */}
      {inputs.budgetMode === "inverse" && inverseResult && (
        <div
          className={`bg-[#191C21] border-2 rounded-2xl p-6 sm:p-8 space-y-5 ${
            inverseResult.isFeasible
              ? "border-[#FF5A1F]/70"
              : "border-[#FF5A1F]"
          }`}
        >
          <div className="flex items-start gap-3">
            {inverseResult.isFeasible ? (
              <TrendingUp className="w-6 h-6 text-[#FF5A1F] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[#FF5A1F] shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] block">
                {inverseResult.isFeasible
                  ? "PROYECCIÓN PARA ALCANZAR TU OBJETIVO COMERCIAL"
                  : "META COMERCIAL NO VIABLE BAJO LOS SUPUESTOS ACTUALES"}
              </span>

              {inverseResult.isFeasible ? (
                <>
                  <p className="text-sm sm:text-base text-white leading-relaxed font-medium">
                    {inputs.inverseBudget?.goalType === "profit" && (
                      <>
                        Para conseguir una ganancia neta de{" "}
                        <strong className="text-[#FF5A1F] font-black">
                          {formatCurrency(inputs.inverseBudget.targetValue, curr, 0)}
                        </strong>{" "}
                        durante <strong className="text-white">{durationDays} días</strong>, la calculadora estima que necesitas conseguir aproximadamente{" "}
                        <strong className="text-[#FF5A1F] font-black">
                          {formatCount(inverseResult.estimatedClientsOrOrders)}{" "}
                          {isServices ? "clientes" : "ventas"}
                        </strong>
                        .
                      </>
                    )}
                    {inputs.inverseBudget?.goalType === "revenue" && (
                      <>
                        Para alcanzar una facturación de{" "}
                        <strong className="text-[#FF5A1F] font-black">
                          {formatCurrency(inputs.inverseBudget.targetValue, curr, 0)}
                        </strong>{" "}
                        durante <strong className="text-white">{durationDays} días</strong>, la calculadora estima que necesitas conseguir aproximadamente{" "}
                        <strong className="text-[#FF5A1F] font-black">
                          {formatCount(inverseResult.estimatedClientsOrOrders)}{" "}
                          {isServices ? "clientes" : "ventas"}
                        </strong>
                        .
                      </>
                    )}
                    {(inputs.inverseBudget?.goalType === "clients" ||
                      inputs.inverseBudget?.goalType === "orders") && (
                      <>
                        Para alcanzar tu meta de{" "}
                        <strong className="text-[#FF5A1F] font-black">
                          {formatCount(inverseResult.estimatedClientsOrOrders)}{" "}
                          {isServices ? "clientes" : "ventas"}
                        </strong>{" "}
                        durante <strong className="text-white">{durationDays} días</strong>, esta es la proyección financiera completa de tu campaña.
                      </>
                    )}
                  </p>

                  {/* 5 Clear Summary Bullets from Section 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                    <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5">
                      <span className="text-[11px] text-[#CBD2DC] block font-semibold">
                        {isServices ? "Clientes necesarios:" : "Ventas necesarias:"}
                      </span>
                      <span className="text-lg font-black text-white block mt-0.5">
                        {formatCount(inverseResult.estimatedClientsOrOrders)}
                      </span>
                      <span className="text-[10px] text-[#CBD2DC] block">
                        ({inverseResult.estimatedClientsOrOrders.toFixed(2)} esperados)
                      </span>
                    </div>

                    <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5">
                      <span className="text-[11px] text-[#CBD2DC] block font-semibold">
                        Facturación proyectada:
                      </span>
                      <span className="text-lg font-black text-white block mt-0.5">
                        {formatCurrency(economics.totalNetRevenue, curr, 0)}
                      </span>
                      <span className="text-[10px] text-[#CBD2DC] block">
                        Ingresos por ventas
                      </span>
                    </div>

                    <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5">
                      <span className="text-[11px] text-[#CBD2DC] block font-semibold">
                        Inversión total en Meta Ads:
                      </span>
                      <span className="text-lg font-black text-[#FF5A1F] block mt-0.5">
                        {formatCurrency(advertising.effectiveBudget, curr, 0)}
                      </span>
                      <span className="text-[10px] text-[#CBD2DC] block">
                        Pago directo a anuncios
                      </span>
                    </div>

                    <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5">
                      <span className="text-[11px] text-[#CBD2DC] block font-semibold">
                        Inversión diaria recomendada:
                      </span>
                      <span className="text-lg font-black text-white block mt-0.5">
                        {formatCurrency(advertising.dailyBudget, curr, 0)}
                      </span>
                      <span className="text-[10px] text-[#CBD2DC] block">
                        Promedio por día ({durationDays} días)
                      </span>
                    </div>

                    <div className="bg-[#0D0F12] border-2 border-[#FF5A1F] rounded-xl p-3.5">
                      <span className="text-[11px] text-[#FF5A1F] block font-bold">
                        Ganancia neta proyectada:
                      </span>
                      <span className="text-lg font-black text-[#FF5A1F] block mt-0.5">
                        {formatCurrency(economics.netProfit, curr, 0)}
                      </span>
                      <span className="text-[10px] text-[#CBD2DC] block">
                        Dinero libre final
                      </span>
                    </div>
                  </div>

                  {/* Mandatory Explanation (Section 1) */}
                  <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-[#CBD2DC] leading-relaxed">
                      <strong className="text-white">Importante:</strong> Tu inversión publicitaria es el dinero que pagarás directamente a Facebook e Instagram para conseguir clientes. Las ventas generadas permiten recuperar esa inversión, cubrir los costos de entrega y alcanzar la ganancia que deseas.
                    </p>
                  </div>

                  {/* Optional Integer Customer Operational Projection (Section 7) */}
                  {inverseResult.integerCustomerProjection && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowIntegerProjection(!showIntegerProjection)}
                        className="text-xs text-[#FF5A1F] hover:underline font-bold flex items-center gap-1.5"
                      >
                        <span>
                          {showIntegerProjection
                            ? "Ocultar proyección ajustada al siguiente cliente completo"
                            : `Ver proyección operativa ajustada a ${inverseResult.integerCustomerProjection.clientsOrOrders} ${
                                isServices ? "clientes completos" : "ventas completas"
                              }`}
                        </span>
                      </button>

                      {showIntegerProjection && (
                        <div className="mt-3 p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] space-y-2 text-xs">
                          <span className="font-bold text-white block">
                            Proyección operativa redondeando al siguiente{" "}
                            {isServices ? "cliente completo" : "pedido completo"} (
                            {inverseResult.integerCustomerProjection.clientsOrOrders}{" "}
                            {isServices ? "clientes" : "ventas"}):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div>
                              <span className="text-[#CBD2DC] block">Facturación (186):</span>
                              <span className="font-bold text-white">
                                {formatCurrency(
                                  inverseResult.integerCustomerProjection.estimatedNetRevenue,
                                  curr,
                                  0
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#CBD2DC] block">Costos de entrega:</span>
                              <span className="font-bold text-white">
                                -{formatCurrency(
                                  inverseResult.integerCustomerProjection.estimatedVariableCosts,
                                  curr,
                                  0
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#CBD2DC] block">Presupuesto Meta Ads:</span>
                              <span className="font-bold text-[#FF5A1F]">
                                -{formatCurrency(
                                  inverseResult.integerCustomerProjection.requiredAdSpend,
                                  curr,
                                  0
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#CBD2DC] block">Ganancia neta resultante:</span>
                              <span className="font-black text-[#FF5A1F]">
                                {formatCurrency(
                                  inverseResult.integerCustomerProjection.estimatedNetProfit,
                                  curr,
                                  0
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs sm:text-sm text-[#CBD2DC] leading-relaxed">
                  {inverseResult.feasibilityWarning}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ¿QUÉ PASA CON TU DINERO? (Waterfall / Financial Journey) */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#292E36] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5 mb-1">
              <Wallet className="w-4 h-4" />
              ¿QUÉ PASA CON TU DINERO?
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Así se distribuye el dinero de tu campaña
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD2DC] mt-1">
              Recorrido financiero completo desde los ingresos que recibes por tus ventas hasta la ganancia neta que queda en tu negocio:
            </p>
          </div>
          <span
            className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto ${
              profitability.profitabilityStatus === "highly_profitable" ||
              profitability.profitabilityStatus === "profitable"
                ? "bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/40"
                : "bg-[#0D0F12] text-[#CBD2DC] border border-[#292E36]"
            }`}
          >
            {profitability.profitabilityBadgeText}
          </span>
        </div>

        {/* Visual Stacked Distribution Bar of Sales Revenue */}
        {economics.totalNetRevenue > 0 && (
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Distribución de cada 100% de tus Ingresos por Ventas ({formatCurrency(economics.totalNetRevenue, curr, 0)})
              </span>
              <span className="text-[#CBD2DC]">
                La facturación cubre los costos, recupera los anuncios y genera tu ganancia
              </span>
            </div>

            <div className="w-full h-5 bg-[#191C21] rounded-xl overflow-hidden flex border border-[#292E36]">
              {/* Costos de entrega */}
              {deliveryPct > 0 && (
                <div
                  style={{ width: `${deliveryPct}%` }}
                  className="bg-[#292E36] h-full transition-all"
                  title={`Costos de entrega: ${deliveryPct.toFixed(1)}%`}
                />
              )}
              {/* Inversión publicitaria */}
              {adsPct > 0 && (
                <div
                  style={{ width: `${adsPct}%` }}
                  className="bg-[#CBD2DC]/50 h-full transition-all border-l border-[#0D0F12]"
                  title={`Inversión publicitaria: ${adsPct.toFixed(1)}%`}
                />
              )}
              {/* Gastos mensuales */}
              {fixedPct > 0 && (
                <div
                  style={{ width: `${fixedPct}%` }}
                  className="bg-[#CBD2DC]/25 h-full transition-all border-l border-[#0D0F12]"
                  title={`Gastos mensuales: ${fixedPct.toFixed(1)}%`}
                />
              )}
              {/* Ganancia neta */}
              {netProfitPct > 0 && (
                <div
                  style={{ width: `${netProfitPct}%` }}
                  className="bg-[#FF5A1F] h-full transition-all border-l border-[#0D0F12]"
                  title={`Ganancia neta proyectada: ${netProfitPct.toFixed(1)}%`}
                />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#292E36] border border-[#CBD2DC]/30 shrink-0" />
                <span className="text-[#CBD2DC]">
                  Costos de entrega ({deliveryPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#CBD2DC]/50 shrink-0" />
                <span className="text-[#CBD2DC]">
                  Inversión Meta Ads ({adsPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#CBD2DC]/25 shrink-0" />
                <span className="text-[#CBD2DC]">
                  Gastos mensuales ({fixedPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#FF5A1F] shrink-0" />
                <span className="text-white font-bold">
                  Ganancia neta ({netProfitPct.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step-by-step Financial Waterfall (Cascada Financiera) */}
        <div className="space-y-3">
          {/* 1. INGRESOS POR VENTAS */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#191C21] text-white border border-[#292E36]">
                  1. ENTRADA DE DINERO
                </span>
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  INGRESOS POR VENTAS
                </h4>
              </div>
              <p className="text-xs text-[#CBD2DC]">
                Dinero total que se espera recibir de los clientes ({formatCount(clientsOrSales)}{" "}
                {isServices ? "clientes" : "ventas"} × {formatCurrency(economics.unitPrice, curr, 0)}).
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black text-white">
                {formatCurrency(economics.totalNetRevenue, curr, 0)}
              </span>
              <span className="block text-[10px] text-[#CBD2DC] uppercase font-semibold">
                100% Facturación proyectada
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="w-4 h-4 text-[#CBD2DC]/60" />
          </div>

          {/* 2. COSTOS DE ENTREGA */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#191C21] text-[#CBD2DC] border border-[#292E36]">
                  2. COSTO OPERATIVO DE VENTAS
                </span>
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  COSTOS DE ENTREGA
                </h4>
              </div>
              <p className="text-xs text-[#CBD2DC]">
                Dinero necesario para producir, entregar o prestar los productos y servicios vendidos.
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black text-[#CBD2DC]">
                -{formatCurrency(economics.totalVariableCosts, curr, 0)}
              </span>
              <span className="block text-[10px] text-[#CBD2DC]/70">
                Quedan {formatCurrency(economics.totalContributionMargin, curr, 0)} de margen disponible
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="w-4 h-4 text-[#CBD2DC]/60" />
          </div>

          {/* 3. INVERSIÓN PUBLICITARIA */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30">
                  3. PRESUPUESTO DE CAMPAÑA
                </span>
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  INVERSIÓN PUBLICITARIA
                </h4>
              </div>
              <p className="text-xs text-[#CBD2DC]">
                Dinero que se pagará directamente a Meta Ads (se recupera con los ingresos de las ventas).
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black text-white">
                -{formatCurrency(economics.totalAdSpend, curr, 0)}
              </span>
              <span className="block text-[10px] text-[#CBD2DC]/70">
                Quedan {formatCurrency(economics.adProfit, curr, 0)} después de publicidad
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="w-4 h-4 text-[#CBD2DC]/60" />
          </div>

          {/* 4. GASTOS MENSUALES */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#191C21] text-[#CBD2DC] border border-[#292E36]">
                  4. GASTOS FIJOS DEL PERIODO
                </span>
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  GASTOS MENSUALES
                </h4>
              </div>
              <p className="text-xs text-[#CBD2DC]">
                Honorarios de gestión ({formatCurrency(economics.managementFeeTotal || 0, curr, 0)}), herramientas ({formatCurrency(economics.toolsTotal || 0, curr, 0)}) y otros gastos mensuales configurados ({formatCurrency(economics.otherMonthlyTotal || 0, curr, 0)}).
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black text-[#CBD2DC]">
                -{formatCurrency(economics.totalFixedCosts, curr, 0)}
              </span>
              <span className="block text-[10px] text-[#CBD2DC]/70">
                Total gastos fijos mensuales
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-1">
            <ArrowDown className="w-5 h-5 text-[#FF5A1F]" />
          </div>

          {/* 5. RESULTADO FINAL: GANANCIA NETA PROYECTADA */}
          <div className="bg-[#0D0F12] border-2 border-[#FF5A1F] rounded-2xl p-6 sm:p-7 shadow-xl shadow-[#FF5A1F]/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF5A1F] text-white">
                RESULTADO FINAL
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                GANANCIA NETA PROYECTADA:{" "}
                <span className="text-[#FF5A1F]">
                  {formatCurrency(economics.netProfit, curr, 0)}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD2DC] leading-relaxed">
                Este es el dinero que estimamos que te quedará después de cubrir los costos de tus ventas, la publicidad y los gastos mensuales incluidos en la simulación.
              </p>
            </div>
            <div className="text-left md:text-right shrink-0 bg-[#191C21] border border-[#FF5A1F]/40 rounded-2xl px-6 py-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A1F] block">
                Dinero libre para ti
              </span>
              <span className="text-2xl sm:text-4xl font-black text-[#FF5A1F] block mt-0.5">
                {formatCurrency(economics.netProfit, curr, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: INDICADORES PRINCIPALES Y PROYECCIÓN PUBLICITARIA */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#292E36] pb-4">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] block">
            Indicadores Principales
          </span>
          <h3 className="text-xl font-black text-white">
            Resumen Ejecutivo de tu Inversión y Resultados
          </h3>
          <p className="text-xs sm:text-sm text-[#CBD2DC] mt-1 leading-relaxed">
            En pocas palabras: vas a invertir{" "}
            <strong className="text-white">
              {formatCurrency(advertising.effectiveBudget, curr, 0)}
            </strong>{" "}
            en Meta Ads, esperas generar{" "}
            <strong className="text-white">
              {formatCurrency(economics.totalNetRevenue, curr, 0)}
            </strong>{" "}
            en ventas, pagarás{" "}
            <strong className="text-white">
              {formatCurrency(
                economics.totalVariableCosts + economics.totalFixedCosts,
                curr,
                0
              )}
            </strong>{" "}
            en costos de entrega y gastos mensuales, y tu ganancia neta proyectada será de{" "}
            <strong className="text-[#FF5A1F]">
              {formatCurrency(economics.netProfit, curr, 0)}
            </strong>
            .
          </p>
        </div>

        {/* 5 Primary Indicators with Clear Non-Ambiguous Labels (Section 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Presupuesto total para Meta Ads */}
          <div className="bg-[#0D0F12] border border-[#FF5A1F]/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-[#FF5A1F] font-bold uppercase tracking-wide block">
                1. Presupuesto total para Meta Ads
              </span>
              <span className="text-xl font-black text-white block mt-1.5">
                {formatCurrency(advertising.effectiveBudget, curr, 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] mt-2.5 leading-relaxed">
              Dinero que pagarás directamente a Facebook e Instagram durante el período seleccionado. No incluye honorarios de agencia ni otros gastos del negocio.
            </p>
          </div>

          {/* 2. Presupuesto diario recomendado para Meta Ads */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-[#CBD2DC] font-bold uppercase tracking-wide block">
                2. Presupuesto diario recomendado para Meta Ads
              </span>
              <span className="text-xl font-black text-[#FF5A1F] block mt-1.5">
                {formatCurrency(advertising.dailyBudget, curr, 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] mt-2.5 leading-relaxed">
              Cantidad promedio que necesitas invertir diariamente durante los {durationDays} días configurados.
            </p>
          </div>

          {/* 3. Clientes o ventas necesarios */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-[#CBD2DC] font-bold uppercase tracking-wide block">
                3. {isServices ? "Clientes necesarios" : "Ventas necesarias"}
              </span>
              <span className="text-xl font-black text-white block mt-1.5">
                {formatCount(clientsOrSales)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] mt-2.5 leading-relaxed">
              Cantidad estimada de {isServices ? "clientes" : "ventas"} ({clientsOrSales.toFixed(2)} esperados en el cálculo exacto).
            </p>
          </div>

          {/* 4. Facturación proyectada */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-[#CBD2DC] font-bold uppercase tracking-wide block">
                4. Facturación proyectada
              </span>
              <span className="text-xl font-black text-white block mt-1.5">
                {formatCurrency(economics.totalNetRevenue, curr, 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] mt-2.5 leading-relaxed">
              Dinero total que estimamos recibir por las ventas generadas.
            </p>
          </div>

          {/* 5. Ganancia neta proyectada */}
          <div className="bg-[#0D0F12] border-2 border-[#FF5A1F] rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-[#FF5A1F]/10">
            <div>
              <span className="text-[11px] text-[#FF5A1F] font-bold uppercase tracking-wide block">
                5. Ganancia neta proyectada
              </span>
              <span
                className={`text-xl font-black block mt-1.5 ${
                  economics.netProfit >= 0 ? "text-[#FF5A1F]" : "text-white opacity-85"
                }`}
              >
                {formatCurrency(economics.netProfit, curr, 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] mt-2.5 leading-relaxed">
              Dinero que estimamos que conservarás después de pagar todos los costos incluidos.
            </p>
          </div>
        </div>

        {/* Complementary Traffic & Funnel Volume Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#292E36]">
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#CBD2DC] font-semibold block">
                Impresiones proyectadas
              </span>
              <span className="text-[10px] text-[#CBD2DC]/70">
                Veces que se mostrarán tus anuncios
              </span>
            </div>
            <span className="text-lg font-black text-white">
              {formatCount(advertising.impressions)}
            </span>
          </div>

          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#CBD2DC] font-semibold block">
                Clics estimados
              </span>
              <span className="text-[10px] text-[#CBD2DC]/70">
                Personas interesadas que hacen clic
              </span>
            </div>
            <span className="text-lg font-black text-white">
              {formatCount(advertising.clicks)}
            </span>
          </div>

          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#CBD2DC] font-semibold block">
                {isServices ? "Contactos (Leads)" : "Compras iniciadas"}
              </span>
              <span className="text-[10px] text-[#CBD2DC]/70">
                {isServices ? "Conversaciones o registros" : "Órdenes antes de filtro"}
              </span>
            </div>
            <span className="text-lg font-black text-white">
              {formatCount(contactsOrCarts)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: DESGLOSE DE RENTABILIDAD EN 3 NIVELES */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#292E36] pb-4">
          <div className="flex items-center gap-2 text-[#FF5A1F] text-xs font-black uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Desglose de Rentabilidad
          </div>
          <h3 className="text-xl font-black text-white">
            Los 3 Niveles de Rentabilidad de tu Simulación
          </h3>
          <p className="text-xs sm:text-sm text-[#CBD2DC] mt-1">
            Conoce exactamente cómo se construye tu ganancia paso a paso sin duplicar ningún costo:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* NIVEL 1. MARGEN DISPONIBLE POR VENTA */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-[#191C21] text-[#CBD2DC] px-2.5 py-1 rounded-lg border border-[#292E36]">
                NIVEL 1
              </span>
              <h4 className="text-base font-black text-white uppercase">
                NIVEL 1. MARGEN DISPONIBLE POR VENTA
              </h4>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Es el dinero que queda de cada venta después de cubrir lo que cuesta entregar el producto o servicio. Todavía no se ha descontado la publicidad.
              </p>

              <div className="p-3.5 rounded-xl bg-[#191C21] border border-[#292E36] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">
                    {isServices ? "Precio del servicio:" : "Precio del producto:"}
                  </span>
                  <span className="text-white font-bold">
                    {formatCurrency(economics.unitPrice, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Costo de entrega:</span>
                  <span className="text-white font-bold">
                    -{formatCurrency(unitDeliveryCost, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Otros gastos por venta:</span>
                  <span className="text-white font-bold">
                    -{formatCurrency(unitOtherVariableCost, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#292E36]">
                  <span className="text-[#FF5A1F] font-bold">Margen disponible:</span>
                  <span className="text-base font-black text-white">
                    {formatCurrency(economics.unitContributionMargin, curr, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#CBD2DC] border-t border-[#292E36] pt-3 flex justify-between items-center">
              <span>Margen total en {formatCount(clientsOrSales)} ventas:</span>
              <strong className="text-[#FF5A1F] text-sm">
                {formatCurrency(economics.totalContributionMargin, curr, 0)}
              </strong>
            </div>
          </div>

          {/* NIVEL 2. BENEFICIO DESPUÉS DE PUBLICIDAD */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-[#191C21] text-[#FF5A1F] px-2.5 py-1 rounded-lg border border-[#FF5A1F]/30">
                NIVEL 2
              </span>
              <h4 className="text-base font-black text-white uppercase">
                NIVEL 2. BENEFICIO DESPUÉS DE PUBLICIDAD
              </h4>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Es el dinero que queda después de cubrir los costos de entrega y pagar la publicidad.
              </p>

              <div className="p-3.5 rounded-xl bg-[#191C21] border border-[#292E36] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Margen total de contribución:</span>
                  <span className="text-white font-bold">
                    {formatCurrency(economics.totalContributionMargin, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Inversión publicitaria:</span>
                  <span className="text-white font-bold">
                    -{formatCurrency(economics.totalAdSpend, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#292E36]">
                  <span className="text-[#FF5A1F] font-bold">
                    Beneficio después de publicidad:
                  </span>
                  <span className="text-base font-black text-white">
                    {formatCurrency(economics.adProfit, curr, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#CBD2DC] border-t border-[#292E36] pt-3 flex justify-between items-center">
              <span>ROI Publicitario:</span>
              <strong className="text-white text-sm">
                {profitability.adRoiPercentage.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* NIVEL 3. GANANCIA NETA DEL NEGOCIO */}
          <div className="bg-[#0D0F12] border-2 border-[#FF5A1F] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl shadow-[#FF5A1F]/10">
            <div className="space-y-3">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-[#FF5A1F] text-white px-2.5 py-1 rounded-lg">
                NIVEL 3 • RESULTADO FINAL
              </span>
              <h4 className="text-base font-black text-white uppercase">
                NIVEL 3. GANANCIA NETA DEL NEGOCIO
              </h4>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Es el dinero que finalmente te queda después de cubrir todos los gastos considerados en la simulación.
              </p>

              <div className="p-3.5 rounded-xl bg-[#191C21] border border-[#FF5A1F]/40 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Margen total de contribución:</span>
                  <span className="text-white font-bold">
                    {formatCurrency(economics.totalContributionMargin, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Inversión publicitaria:</span>
                  <span className="text-white font-bold">
                    -{formatCurrency(economics.totalAdSpend, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Gestión publicitaria:</span>
                  <span className="text-white font-bold">
                    -{formatCurrency(economics.managementFeeTotal || 0, curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#CBD2DC]">Herramientas y otros gastos:</span>
                  <span className="text-white font-bold">
                    -{formatCurrency((economics.toolsTotal || 0) + (economics.otherMonthlyTotal || 0), curr, 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#292E36]">
                  <span className="text-[#FF5A1F] font-black">Ganancia neta:</span>
                  <span className="text-lg font-black text-[#FF5A1F]">
                    {formatCurrency(economics.netProfit, curr, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#CBD2DC] border-t border-[#292E36] pt-3 flex justify-between items-center">
              <span>ROI Total del Negocio:</span>
              <strong className="text-[#FF5A1F] text-sm">
                {profitability.totalRoiPercentage.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Separate LTV Note if averagePurchasesPerClient > 1 */}
        {(economics.averagePurchasesPerClient || 1) > 1 && (
          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white block">
                Proyección adicional por Recompra / Valor de Vida del Cliente (LTV):
              </span>
              <span>
                Con un promedio de {economics.averagePurchasesPerClient} compras por cliente, las compras recurrentes futuras sumarían{" "}
                <strong className="text-white">
                  {formatCurrency(economics.recurringMargin || 0, curr, 0)}
                </strong>{" "}
                adicionales de margen, elevando el beneficio a largo plazo a{" "}
                <strong className="text-[#FF5A1F]">
                  {formatCurrency(economics.netProfitWithLtv || 0, curr, 0)}
                </strong>
                .
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: MOSTRAR EL RETORNO DE LA INVERSIÓN (¿Qué obtienes por cada peso que inviertes?) */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#292E36] pb-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5 mb-1">
            <DollarSign className="w-4 h-4" />
            Retorno de la Inversión
          </span>
          <h3 className="text-xl font-black text-white">
            ¿Qué obtienes por cada peso que inviertes?
          </h3>
          <p className="text-xs sm:text-sm text-[#CBD2DC] mt-1">
            Diferencia claramente tus ventas atribuidas (ROAS) de tu rentabilidad real (ROI) y tu costo por adquirir cada cliente (CPA):
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. ROAS */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-xs text-[#CBD2DC] font-bold uppercase block">
                ROAS
              </span>
              <span className="text-2xl font-black text-white block mt-1">
                {profitability.roas.toFixed(2)}x
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] leading-relaxed">
              Por cada peso que inviertes en anuncios, cuánto dinero generas en ventas atribuidas ({profitability.roas.toFixed(2)} veces lo invertido).
            </p>
          </div>

          {/* 2. ROI publicitario */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-xs text-[#CBD2DC] font-bold uppercase block">
                ROI publicitario
              </span>
              <span className="text-2xl font-black text-white block mt-1">
                {profitability.adRoiPercentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] leading-relaxed">
              Rentabilidad considerando el margen de las ventas y el gasto en anuncios.
            </p>
          </div>

          {/* 3. ROI total */}
          <div className="bg-[#0D0F12] border border-[#FF5A1F]/40 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-xs text-[#FF5A1F] font-bold uppercase block">
                ROI total
              </span>
              <span className="text-2xl font-black text-[#FF5A1F] block mt-1">
                {profitability.totalRoiPercentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] leading-relaxed">
              Rentabilidad después de incluir los gastos mensuales considerados.
            </p>
          </div>

          {/* 4. CPA estimado */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-xs text-[#CBD2DC] font-bold uppercase block">
                CPA estimado
              </span>
              <span className="text-xl font-black text-white block mt-1">
                {formatCurrency(effectiveCpa, curr)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] leading-relaxed">
              Costo publicitario estimado para conseguir un {isServices ? "cliente" : "pedido neto"}.
            </p>
          </div>

          {/* 5. Margen disponible por venta */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-xs text-[#CBD2DC] font-bold uppercase block">
                Margen disponible por venta
              </span>
              <span className="text-xl font-black text-white block mt-1">
                {formatCurrency(economics.unitContributionMargin, curr, 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] leading-relaxed">
              Límite máximo de CPA para no perder dinero en cada venta (ganancia libre por cliente:{" "}
              <strong className="text-white">
                {formatCurrency(
                  economics.unitContributionMargin - effectiveCpa,
                  curr,
                  0
                )}
              </strong>
              ).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4B: EMBUDO DE CONVERSIÓN PASO A PASO */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#FF5A1F]" />
          Recorrido de tus Clientes (Embudo Comercial)
        </h3>

        {isServices ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                1. Impresiones
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(advertising.impressions)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPM: {formatCurrency(advertising.effectiveCpm, curr)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                2. Clics
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(advertising.clicks)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPC: {formatCurrency(advertising.effectiveCpc, curr)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                3. Contactos
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(funnel.rawLeads)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPL: {formatCurrency(funnel.cpl, curr)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                4. Calificados
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(funnel.qualifiedLeads)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPQL: {formatCurrency(funnel.cpql, curr)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#FF5A1F]/40">
              <span className="text-[11px] text-[#FF5A1F] uppercase font-bold block mb-1">
                5. Clientes
              </span>
              <span className="text-xl font-black text-[#FF5A1F]">
                {formatCount(funnel.clients)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPA: {formatCurrency(funnel.cpa, curr)}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                1. Impresiones
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(advertising.impressions)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPM: {formatCurrency(advertising.effectiveCpm, curr)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                2. Visitas Tienda
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(advertising.clicks)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPC: {formatCurrency(advertising.effectiveCpc, curr)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                3. Compras Creadas
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(funnel.initialPurchases)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                Conv: {inputs.ecommerceFunnel?.clickToPurchaseRate || 0}%
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36]">
              <span className="text-[11px] text-[#CBD2DC] uppercase font-bold block mb-1">
                4. Cancel / Devolución
              </span>
              <span className="text-xl font-black text-white">
                {formatCount(funnel.cancelledOrders + funnel.returnedOrders)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                Cancel: {formatCount(funnel.cancelledOrders)} | Dev:{" "}
                {formatCount(funnel.returnedOrders)}
              </span>
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#FF5A1F]/40">
              <span className="text-[11px] text-[#FF5A1F] uppercase font-bold block mb-1">
                5. Ventas Netas
              </span>
              <span className="text-xl font-black text-[#FF5A1F]">
                {formatCount(funnel.netOrders)}
              </span>
              <span className="text-[10px] text-[#CBD2DC] block mt-1">
                CPA Neto: {formatCurrency(funnel.effectiveCpa, curr)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5B: ESCENARIOS (Pesimista, Realista, Optimista) */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#FF5A1F]" />
              Escenarios de Sensibilidad (Pesimista, Realista y Optimista)
            </h3>
            <p className="text-xs text-[#CBD2DC] mt-1">
              Simulación matemática de sensibilidad aplicando variaciones sobre tus supuestos actuales (no representan benchmarks oficiales de mercado).
            </p>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full pt-4 min-h-[288px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scenarioChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#292E36" />
                <XAxis
                  dataKey="name"
                  stroke="#CBD2DC"
                  tick={{ fill: "#CBD2DC", fontSize: 12 }}
                />
                <YAxis
                  stroke="#CBD2DC"
                  tick={{ fill: "#CBD2DC", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#191C21",
                    borderColor: "#292E36",
                    borderRadius: "0.75rem",
                    color: "#FFFFFF",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px", color: "#CBD2DC" }} />
                <Bar dataKey="Inversión" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Facturación" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Beneficio" fill="#CBD2DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#CBD2DC] text-xs">
              Cargando gráfico comparativo...
            </div>
          )}
        </div>

        {/* Detailed Scenario Table with Explicit Assumptions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#292E36] text-[#CBD2DC] font-bold uppercase">
                <th className="py-3 px-3">Escenario y Supuestos</th>
                <th className="py-3 px-3">CPC</th>
                <th className="py-3 px-3">
                  {isServices ? "Clientes" : "Ventas Netas"}
                </th>
                <th className="py-3 px-3">CPA</th>
                <th className="py-3 px-3">Facturación</th>
                <th className="py-3 px-3">ROAS</th>
                <th className="py-3 px-3">ROI Total</th>
                <th className="py-3 px-3 text-right">Ganancia Neta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E36]">
              {/* Pessimistic */}
              <tr className="hover:bg-[#0D0F12]/50">
                <td className="py-3 px-3 font-bold text-[#CBD2DC]">
                  Pesimista
                  <span className="block text-[10px] font-normal text-[#CBD2DC]/70">
                    Supuesto: Costo publicitario +30% y tasas de conversión -30%
                  </span>
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.pessimistic.cpc, curr)}
                </td>
                <td className="py-3 px-3">
                  {formatCount(scenarios.pessimistic.clientsOrNetOrders)}
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.pessimistic.cpa, curr)}
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.pessimistic.revenue, curr, 0)}
                </td>
                <td className="py-3 px-3">
                  {scenarios.pessimistic.roas.toFixed(2)}x
                </td>
                <td className="py-3 px-3">
                  {scenarios.pessimistic.totalRoi.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right font-black text-white">
                  {formatCurrency(scenarios.pessimistic.netProfit, curr, 0)}
                </td>
              </tr>

              {/* Realistic */}
              <tr className="bg-[#0D0F12]/60 font-semibold">
                <td className="py-3 px-3 font-bold text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF5A1F]"></span>
                    Realista (Base)
                  </div>
                  <span className="block text-[10px] font-normal text-[#CBD2DC]">
                    Supuesto: 100% de las métricas configuradas en el Paso 6
                  </span>
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.realistic.cpc, curr)}
                </td>
                <td className="py-3 px-3">
                  {formatCount(scenarios.realistic.clientsOrNetOrders)}
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.realistic.cpa, curr)}
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.realistic.revenue, curr, 0)}
                </td>
                <td className="py-3 px-3">
                  {scenarios.realistic.roas.toFixed(2)}x
                </td>
                <td className="py-3 px-3">
                  {scenarios.realistic.totalRoi.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right font-black text-[#FF5A1F]">
                  {formatCurrency(scenarios.realistic.netProfit, curr, 0)}
                </td>
              </tr>

              {/* Optimistic */}
              <tr className="hover:bg-[#0D0F12]/50">
                <td className="py-3 px-3 font-bold text-white">
                  Optimista
                  <span className="block text-[10px] font-normal text-[#CBD2DC]/70">
                    Supuesto: Costo publicitario -20% y tasas de conversión +25%
                  </span>
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.optimistic.cpc, curr)}
                </td>
                <td className="py-3 px-3">
                  {formatCount(scenarios.optimistic.clientsOrNetOrders)}
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.optimistic.cpa, curr)}
                </td>
                <td className="py-3 px-3">
                  {formatCurrency(scenarios.optimistic.revenue, curr, 0)}
                </td>
                <td className="py-3 px-3">
                  {scenarios.optimistic.roas.toFixed(2)}x
                </td>
                <td className="py-3 px-3">
                  {scenarios.optimistic.totalRoi.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right font-black text-white">
                  {formatCurrency(scenarios.optimistic.netProfit, curr, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: ALERTAS INTELIGENTES Y SUGERENCIAS DE AJUSTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alertas y Diagnóstico */}
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF5A1F]" />
            Diagnóstico Inteligente de Viabilidad
          </h3>

          <div className="space-y-2.5 text-xs">
            {warnings.map((w, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#FF5A1F]/40 text-[#CBD2DC] flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF5A1F] mt-0.5" />
                <span className="leading-relaxed">{w}</span>
              </div>
            ))}

            {recommendations.map((r, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] text-white flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FF5A1F] mt-0.5" />
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ajustes sugeridos y Origen de Métricas */}
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#FF5A1F]" />
              Acciones y Ajustes Recomendados
            </h3>

            {adjustmentSuggestions.length > 0 ? (
              <div className="space-y-2 text-xs">
                <p className="text-[#CBD2DC]">
                  Para mejorar la rentabilidad o hacer viable tu meta, te sugerimos evaluar estos ajustes:
                </p>
                <ul className="space-y-2">
                  {adjustmentSuggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] text-white flex items-start gap-2"
                    >
                      <span className="text-[#FF5A1F] font-black">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] space-y-2">
                <p className="text-white font-semibold">
                  Tu estructura de costos y conversión proyecta resultados positivos.
                </p>
                <p>
                  Enfócate en mantener la calidad creativa de tus anuncios y en responder rápidamente a cada contacto para sostener tus tasas de cierre.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#CBD2DC] border-t border-[#292E36] pt-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0 mt-0.5" />
            <span>
              Origen de métricas:{" "}
              {inputs.metricsExperience === "advanced"
                ? "Datos personalizados de campañas anteriores."
                : "Estimaciones orientativas según mercado y objetivo."}
            </span>
          </div>
        </div>
      </div>

      {/* MANDATORY PROJECTION DISCLAIMER NOTE (Section 6) */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
        <p className="text-xs text-[#CBD2DC] leading-relaxed">
          <strong className="text-white">Nota sobre las proyecciones:</strong> Estos resultados son estimaciones basadas en los datos de tu negocio y las métricas de conversión configuradas. La inversión no garantiza una cantidad determinada de ventas o clientes. Los resultados reales pueden variar según la campaña, el público, la oferta, la competencia y la capacidad comercial del negocio.
        </p>
      </div>

      {/* Traffiker Digital CTA Banner */}
      <div className="bg-[#191C21] border border-[#FF5A1F]/40 rounded-3xl p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 no-print">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block mb-2">
            GESTIÓN PROFESIONAL DE CAMPAÑAS
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight">
            ¿Quieres que Traffiker Digital gestione y escale tus anuncios?
          </h3>
          <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
            Te ayudamos a planificar, configurar, gestionar y optimizar campañas publicitarias en Meta Ads para conseguir clientes calificados y aumentar tus ventas reales.
          </p>
        </div>

        <button
          onClick={() => setIsAdvisoryModalOpen(true)}
          className="shrink-0 bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-[#FF5A1F]/20 transition-all hover:scale-105 flex items-center gap-2 text-base"
        >
          <PhoneCall className="w-5 h-5" />
          Solicitar Asesoría Gratuita
        </button>
      </div>

      {/* Advisory Modal */}
      {isAdvisoryModalOpen && (
        <LeadAdvisoryModal
          simulationResult={result}
          onClose={() => setIsAdvisoryModalOpen(false)}
        />
      )}
    </div>
  );
}
