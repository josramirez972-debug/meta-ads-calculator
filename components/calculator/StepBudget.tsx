"use client";

import React from "react";
import {
  BudgetMode,
  AdvertisingMetricsInputs,
  InverseBudgetInputs,
  BusinessType,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  EcommerceEconomicsInputs,
  EconomicsCalculations,
} from "@/types/calculator";
import { calculateInverseBudget } from "@/lib/calculator/inverse-budget";
import { calculateInvestmentRecommendations } from "@/lib/calculator/recommendation";
import { formatCurrency } from "@/lib/currency/countries";
import {
  Coins,
  Target,
  Sparkles,
  Calendar,
  Info,
  Check,
  AlertTriangle,
  Award,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface StepBudgetProps {
  businessType: BusinessType;
  currencyCode: string;
  exchangeRate: number;
  budgetMode: BudgetMode;
  advertising: AdvertisingMetricsInputs;
  inverseInputs: InverseBudgetInputs;
  serviceFunnel: ServiceFunnelInputs;
  ecommerceFunnel: EcommerceFunnelInputs;
  ecommerceEconomics?: EcommerceEconomicsInputs;
  unitPrice: number;
  unitMargin: number;
  totalFixedCosts: number;
  onBudgetModeChange: (mode: BudgetMode) => void;
  onAdvertisingChange: (adv: AdvertisingMetricsInputs) => void;
  onInverseChange: (inv: InverseBudgetInputs) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepBudget({
  businessType,
  currencyCode,
  exchangeRate,
  budgetMode,
  advertising,
  inverseInputs,
  serviceFunnel,
  ecommerceFunnel,
  ecommerceEconomics,
  unitPrice,
  unitMargin,
  totalFixedCosts,
  onBudgetModeChange,
  onAdvertisingChange,
  onNext,
  onBack,
}: StepBudgetProps) {
  const duration = Math.max(1, advertising.campaignDurationDays || 30);
  const totalBudget = Math.max(0, advertising.budget || 0);
  const dailySpend = totalBudget / duration;
  const weeklySpend = dailySpend * 7;
  const monthlySpend = dailySpend * 30;

  // Preliminary unit economics for inverse and recommendation engines
  const mockEconomics: EconomicsCalculations = {
    unitPrice,
    unitVariableCost: Math.max(0, unitPrice - unitMargin),
    unitContributionMargin: unitMargin,
    unitContributionMarginPercentage:
      unitPrice > 0 ? (unitMargin / unitPrice) * 100 : 0,
    totalNetRevenue: 0,
    totalVariableCosts: 0,
    totalContributionMargin: 0,
    totalFixedCosts,
    totalAdSpend: totalBudget,
    netProfit: 0,
    adProfit: 0,
  };

  // Run inverse budget calculation live
  const inverseCalculation = calculateInverseBudget({
    businessType,
    inverseInputs,
    economics: mockEconomics,
    advertising,
    serviceFunnel,
    ecommerceFunnel,
    ecommerceEconomics,
  });

  // Run dynamic investment recommendations live
  const recommendationPackage = calculateInvestmentRecommendations({
    businessType,
    economics: mockEconomics,
    advertising,
    serviceFunnel,
    ecommerceFunnel,
    ecommerceEconomics,
    desiredProfitPerSale: inverseInputs.desiredProfitPerSale || 0,
    currencyCode,
    exchangeRateToUSD: exchangeRate,
  });

  // Handler for "UTILIZAR ESTA INVERSIÓN"
  const handleApplyRecommendation = (recBudget: number, recDays: number) => {
    onAdvertisingChange({
      ...advertising,
      budget: Math.round(recBudget),
      campaignDurationDays: recDays,
    });
    onBudgetModeChange("direct");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-3 py-1 rounded-full mb-2">
          Paso 5 de 7 • Tu Presupuesto Publicitario
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Cuánto quieres invertir en publicidad?
        </h2>
        <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
          Puedes indicar cuánto dinero tienes disponible, calcular cuánto necesitas para alcanzar tu objetivo o recibir una recomendación de inversión.
        </p>
      </div>

      {/* 3 MODALITIES SELECTOR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#0D0F12] p-1.5 rounded-2xl border border-[#292E36]">
        {/* Modality A */}
        <button
          type="button"
          onClick={() => onBudgetModeChange("direct")}
          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            budgetMode === "direct"
              ? "bg-[#191C21] text-white shadow-md border border-[#FF5A1F] ring-1 ring-[#FF5A1F]/30"
              : "text-[#CBD2DC] hover:text-white"
          }`}
        >
          <Coins className="w-4 h-4 text-[#FF5A1F]" />
          <span>Tengo un presupuesto definido</span>
        </button>

        {/* Modality B */}
        <button
          type="button"
          onClick={() => onBudgetModeChange("inverse")}
          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            budgetMode === "inverse"
              ? "bg-[#191C21] text-white shadow-md border border-[#FF5A1F] ring-1 ring-[#FF5A1F]/30"
              : "text-[#CBD2DC] hover:text-white"
          }`}
        >
          <Target className="w-4 h-4 text-[#FF5A1F]" />
          <span>Quiero alcanzar mi objetivo</span>
        </button>

        {/* Modality C */}
        <button
          type="button"
          onClick={() => onBudgetModeChange("recommended")}
          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${
            budgetMode === "recommended"
              ? "bg-[#191C21] text-white shadow-md border border-[#FF5A1F] ring-1 ring-[#FF5A1F]"
              : "text-[#CBD2DC] hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
          <span>Recomiéndame cuánto invertir</span>
        </button>
      </div>

      {/* MODALIDAD A: TENGO UN PRESUPUESTO DEFINIDO */}
      {budgetMode === "direct" && (
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#292E36] pb-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#FF5A1F]" />
              Modalidad A: Tengo un presupuesto definido
            </h3>
            <p className="text-xs text-[#CBD2DC] mt-1">
              El presupuesto representa exclusivamente el dinero destinado a Meta Ads. No incluye honorarios de gestión ni gastos generales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Field 1: Presupuesto total para publicidad */}
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                Presupuesto total para publicidad ({currencyCode})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={advertising.budget === 0 ? "" : advertising.budget}
                onChange={(e) =>
                  onAdvertisingChange({
                    ...advertising,
                    budget:
                      e.target.value === ""
                        ? 0
                        : Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                placeholder="0"
                className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
              <p className="text-[11px] text-[#CBD2DC] mt-1.5 leading-relaxed">
                Importe total para toda la campaña (no se interpreta automáticamente como diario ni mensual).
              </p>
            </div>

            {/* Field 2: Duración de la campaña */}
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                Duración de la campaña (días)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={advertising.campaignDurationDays || 30}
                onChange={(e) =>
                  onAdvertisingChange({
                    ...advertising,
                    campaignDurationDays: Math.max(
                      1,
                      parseInt(e.target.value, 10) || 1
                    ),
                  })
                }
                className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
              <p className="text-[11px] text-[#CBD2DC] mt-1.5 leading-relaxed">
                Cantidad de días durante los cuales estarán activos tus anuncios.
              </p>
            </div>
          </div>

          {/* Summary Cards: Total, Daily, Weekly, Monthly */}
          <div className="bg-[#0D0F12] p-5 rounded-2xl border border-[#FF5A1F]/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#CBD2DC] font-bold block">
                  Inversión diaria promedio (Presupuesto ÷ Días):
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#FF5A1F]">
                  {formatCurrency(dailySpend, currencyCode)} / día
                </span>
              </div>
              <span className="text-xs font-mono text-[#CBD2DC] bg-[#191C21] px-3 py-1.5 rounded-lg border border-[#292E36]">
                {formatCurrency(totalBudget, currencyCode, 0)} ÷ {duration} días
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#292E36]">
              <div className="p-3 rounded-xl bg-[#191C21] border border-[#292E36]">
                <span className="text-[10px] text-[#CBD2DC] uppercase block font-semibold">
                  Presupuesto total
                </span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(totalBudget, currencyCode, 0)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#191C21] border border-[#292E36]">
                <span className="text-[10px] text-[#CBD2DC] uppercase block font-semibold">
                  Inversión diaria
                </span>
                <span className="text-sm font-bold text-[#FF5A1F]">
                  {formatCurrency(dailySpend, currencyCode)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#191C21] border border-[#292E36]">
                <span className="text-[10px] text-[#CBD2DC] uppercase block font-semibold">
                  Equivalente semanal
                </span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(weeklySpend, currencyCode, 0)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#191C21] border border-[#292E36]">
                <span className="text-[10px] text-[#CBD2DC] uppercase block font-semibold">
                  Equivalente 30 días
                </span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(monthlySpend, currencyCode, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALIDAD B: QUIERO ALCANZAR MI OBJETIVO */}
      {budgetMode === "inverse" && (
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#292E36] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF5A1F]" />
                Modalidad B: Quiero alcanzar mi objetivo
              </h3>
              <p className="text-xs text-[#CBD2DC] mt-1">
                Calculamos cuánto necesitas invertir para lograr el objetivo seleccionado en el Paso 4.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                inverseCalculation.isFeasible
                  ? "bg-[#FF5A1F]/15 text-[#FF5A1F] border-[#FF5A1F]/40"
                  : "bg-[#0D0F12] text-[#CBD2DC] border-[#292E36]"
              }`}
            >
              {inverseCalculation.isFeasible ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Objetivo Viable
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  Objetivo No Viable
                </>
              )}
            </span>
          </div>

          {/* Goal Summary Banner */}
          <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#FF5A1F] uppercase block">
                Tu objetivo del Paso 4:
              </span>
              <span className="text-lg font-black text-white">
                {inverseInputs.goalType === "profit" &&
                  `Ganar ${formatCurrency(inverseInputs.targetValue || 0, currencyCode, 0)} netos`}
                {inverseInputs.goalType === "revenue" &&
                  `Facturar ${formatCurrency(inverseInputs.targetValue || 0, currencyCode, 0)}`}
                {inverseInputs.goalType === "clients" &&
                  `Conseguir ${inverseInputs.targetValue || 0} clientes nuevos`}
                {inverseInputs.goalType === "orders" &&
                  `Generar ${inverseInputs.targetValue || 0} ventas`}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-[#CBD2DC] block">
                Duración configurada:
              </span>
              <span className="text-sm font-bold text-white">{duration} días</span>
            </div>
          </div>

          {/* If NOT feasible, explain clearly why and suggest adjustments */}
          {!inverseCalculation.isFeasible ? (
            <div className="p-5 rounded-2xl bg-[#0D0F12] border-2 border-[#FF5A1F] space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#FF5A1F] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">
                    No es posible alcanzar esta meta con los supuestos actuales
                  </h4>
                  <p className="text-xs text-[#CBD2DC] leading-relaxed">
                    {inverseCalculation.feasibilityWarning}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#292E36] pt-3 space-y-2 text-xs">
                <span className="font-bold text-white block">
                  Ajustes sugeridos para hacer viable tu objetivo:
                </span>
                <ul className="list-disc list-inside text-[#CBD2DC] space-y-1">
                  <li>Aumentar el precio de tu producto o servicio en el Paso 2.</li>
                  <li>Reducir los costos de entrega u otros gastos por venta.</li>
                  <li>
                    Mejorar las tasas de conversión, calificación de contactos o cierre comercial en el Paso 6.
                  </li>
                  <li>
                    Reducir el costo por clic (CPC) o revisar los gastos generales mensuales en el Paso 3.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Warning if feasible in volume/revenue but CPA >= Margin */}
              {inverseCalculation.feasibilityWarning && (
                <div className="p-4 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/40 text-xs text-[#CBD2DC] flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <span>{inverseCalculation.feasibilityWarning}</span>
                </div>
              )}

              {/* PROYECCIÓN PARA ALCANZAR TU OBJETIVO COMERCIAL (Section 1) */}
              <div className="bg-[#0D0F12] border border-[#FF5A1F]/40 rounded-2xl p-5 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] block">
                  PROYECCIÓN PARA ALCANZAR TU OBJETIVO COMERCIAL
                </span>
                <p className="text-sm text-white leading-relaxed">
                  {inverseInputs.goalType === "profit" && (
                    <>
                      Para conseguir una ganancia neta de{" "}
                      <strong className="text-[#FF5A1F]">
                        {formatCurrency(inverseInputs.targetValue || 0, currencyCode, 0)}
                      </strong>{" "}
                      durante <strong className="text-white">{duration} días</strong>, la calculadora estima que necesitas conseguir aproximadamente{" "}
                      <strong className="text-[#FF5A1F]">
                        {Math.round(inverseCalculation.estimatedClientsOrOrders)}{" "}
                        {businessType === "services" ? "clientes" : "ventas"}
                      </strong>
                      .
                    </>
                  )}
                  {inverseInputs.goalType === "revenue" && (
                    <>
                      Para conseguir una facturación de{" "}
                      <strong className="text-[#FF5A1F]">
                        {formatCurrency(inverseInputs.targetValue || 0, currencyCode, 0)}
                      </strong>{" "}
                      durante <strong className="text-white">{duration} días</strong>, la calculadora estima que necesitas conseguir aproximadamente{" "}
                      <strong className="text-[#FF5A1F]">
                        {Math.round(inverseCalculation.estimatedClientsOrOrders)}{" "}
                        {businessType === "services" ? "clientes" : "ventas"}
                      </strong>
                      .
                    </>
                  )}
                  {(inverseInputs.goalType === "clients" ||
                    inverseInputs.goalType === "orders") && (
                    <>
                      Para conseguir{" "}
                      <strong className="text-[#FF5A1F]">
                        {Math.round(inverseCalculation.estimatedClientsOrOrders)}{" "}
                        {businessType === "services" ? "clientes" : "ventas"}
                      </strong>{" "}
                      durante <strong className="text-white">{duration} días</strong>, esta es la proyección financiera completa de tu campaña.
                    </>
                  )}
                </p>
                <p className="text-xs text-[#CBD2DC] leading-relaxed border-t border-[#292E36] pt-2.5">
                  Tu inversión publicitaria es el dinero que pagarás directamente a Facebook e Instagram para conseguir clientes. Las ventas generadas permiten recuperar esa inversión, cubrir los costos de entrega y alcanzar la ganancia que deseas.
                </p>
              </div>

              {/* 5 Key Inverse Output Metrics (Section 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Presupuesto total para Meta Ads */}
                <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#FF5A1F]/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#FF5A1F] block font-bold uppercase tracking-wide">
                      Presupuesto total para Meta Ads
                    </span>
                    <span className="text-lg font-black text-white block mt-1">
                      {formatCurrency(inverseCalculation.requiredAdSpend, currencyCode, 0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CBD2DC] mt-2 leading-relaxed">
                    Dinero que pagarás directamente a Facebook e Instagram durante el período seleccionado. No incluye honorarios de agencia ni otros gastos del negocio.
                  </p>
                </div>

                {/* 2. Presupuesto diario recomendado para Meta Ads */}
                <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#CBD2DC] block font-bold uppercase tracking-wide">
                      Presupuesto diario recomendado para Meta Ads
                    </span>
                    <span className="text-lg font-black text-[#FF5A1F] block mt-1">
                      {formatCurrency(inverseCalculation.dailyAdSpend, currencyCode)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CBD2DC] mt-2 leading-relaxed">
                    Cantidad promedio que necesitas invertir diariamente durante los {duration} días configurados.
                  </p>
                </div>

                {/* 3. Clientes o ventas necesarios */}
                <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#CBD2DC] block font-bold uppercase tracking-wide">
                      {businessType === "services"
                        ? "Clientes necesarios"
                        : "Ventas necesarias"}
                    </span>
                    <span className="text-lg font-black text-white block mt-1">
                      {Math.round(inverseCalculation.estimatedClientsOrOrders)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CBD2DC] mt-2 leading-relaxed">
                    Estimación estadística: {inverseCalculation.estimatedClientsOrOrders.toFixed(2)}{" "}
                    {businessType === "services" ? "clientes esperados" : "ventas esperadas"}.
                  </p>
                </div>

                {/* 4. Facturación proyectada */}
                <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#CBD2DC] block font-bold uppercase tracking-wide">
                      Facturación proyectada
                    </span>
                    <span className="text-lg font-black text-white block mt-1">
                      {formatCurrency(inverseCalculation.estimatedNetRevenue, currencyCode, 0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CBD2DC] mt-2 leading-relaxed">
                    Dinero total que estimamos recibir por las ventas generadas.
                  </p>
                </div>

                {/* 5. Ganancia neta proyectada */}
                <div className="bg-[#0D0F12] p-4 rounded-xl border-2 border-[#FF5A1F] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#FF5A1F] block font-bold uppercase tracking-wide">
                      Ganancia neta proyectada
                    </span>
                    <span
                      className={`text-lg font-black block mt-1 ${
                        inverseCalculation.estimatedNetProfit >= 0
                          ? "text-[#FF5A1F]"
                          : "text-white opacity-80"
                      }`}
                    >
                      {formatCurrency(inverseCalculation.estimatedNetProfit, currencyCode, 0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CBD2DC] mt-2 leading-relaxed">
                    Dinero que estimamos que conservarás después de pagar todos los costos incluidos.
                  </p>
                </div>
              </div>

              {/* Resumen del recorrido del dinero en el Paso 5 */}
              <div className="bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 space-y-2 text-xs">
                <span className="font-bold text-white block">
                  Resumen del recorrido de tu dinero:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#191C21] border border-[#292E36]">
                    <span className="text-[10px] text-[#CBD2DC] block">Ingresos por ventas</span>
                    <span className="font-bold text-white">
                      {formatCurrency(inverseCalculation.estimatedNetRevenue, currencyCode, 0)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#191C21] border border-[#292E36]">
                    <span className="text-[10px] text-[#CBD2DC] block">Costos de entrega</span>
                    <span className="font-bold text-[#CBD2DC]">
                      -{formatCurrency(inverseCalculation.estimatedVariableCosts || 0, currencyCode, 0)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#191C21] border border-[#292E36]">
                    <span className="text-[10px] text-[#CBD2DC] block">Inversión Meta Ads</span>
                    <span className="font-bold text-[#CBD2DC]">
                      -{formatCurrency(inverseCalculation.requiredAdSpend, currencyCode, 0)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#191C21] border border-[#292E36]">
                    <span className="text-[10px] text-[#CBD2DC] block">Gastos mensuales</span>
                    <span className="font-bold text-[#CBD2DC]">
                      -{formatCurrency(totalFixedCosts, currencyCode, 0)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#191C21] border border-[#FF5A1F]/50 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#FF5A1F] font-bold block">Ganancia neta final</span>
                    <span className="font-black text-[#FF5A1F]">
                      {formatCurrency(inverseCalculation.estimatedNetProfit, currencyCode, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action to adopt this calculated budget */}
              <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#CBD2DC]">
                  <strong className="text-white">CPA estimado actual:</strong>{" "}
                  {formatCurrency(inverseCalculation.estimatedCpa || 0, currencyCode)}{" "}
                  por {businessType === "services" ? "cliente" : "venta"} |{" "}
                  <strong className="text-white">Margen por venta:</strong>{" "}
                  {formatCurrency(unitMargin, currencyCode)}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyRecommendation(
                      inverseCalculation.requiredAdSpend,
                      duration
                    )
                  }
                  className="bg-[#FF5A1F] hover:bg-[#e04e18] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
                >
                  UTILIZAR ESTA INVERSIÓN
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODALIDAD C: RECOMIÉNDAME CUÁNTO INVERTIR */}
      {budgetMode === "recommended" && (
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#292E36] pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F] text-xs font-bold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Recomendador Inteligente de Inversión
            </div>
            <h3 className="text-xl font-black text-white">
              ¿No sabes cuánto invertir?
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD2DC] mt-1.5 max-w-2xl leading-relaxed">
              Analizaremos tu negocio, rentabilidad y mercado para recomendarte un presupuesto inicial.
            </p>
          </div>

          {/* Alert if not feasible or negative margin */}
          {recommendationPackage.warning && (
            <div className="p-4 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/40 text-xs text-[#CBD2DC] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">
                  Diagnóstico de viabilidad para recomendar inversión:
                </span>
                <span>{recommendationPackage.warning}</span>
              </div>
            </div>
          )}

          {/* 3 SCENARIOS GRID (Conservador, Recomendado, Acelerado) */}
          {unitMargin > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* 1. Conservador */}
              <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#CBD2DC]/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#CBD2DC] uppercase tracking-wider bg-[#191C21] px-2.5 py-1 rounded-lg border border-[#292E36]">
                      Escenario 1
                    </span>
                    <span className="text-[10px] font-bold text-[#CBD2DC] uppercase">
                      Riesgo Bajo
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      Conservador
                    </h4>
                    <p className="text-xs text-[#CBD2DC] mt-1 leading-relaxed">
                      {recommendationPackage.conservative.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#191C21] border border-[#292E36] space-y-1">
                    <span className="text-[10px] text-[#CBD2DC] uppercase font-semibold block">
                      Inversión diaria:
                    </span>
                    <div className="text-xl font-black text-white">
                      {formatCurrency(
                        recommendationPackage.conservative.dailyBudget,
                        currencyCode
                      )}{" "}
                      / día
                    </div>
                    <span className="text-[11px] text-[#CBD2DC] block">
                      Inversión total ({duration} días):{" "}
                      <strong className="text-white">
                        {formatCurrency(
                          recommendationPackage.conservative.totalBudget,
                          currencyCode,
                          0
                        )}
                      </strong>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#CBD2DC]">
                    <div className="flex justify-between">
                      <span>
                        {businessType === "services"
                          ? "Clientes proyectados:"
                          : "Ventas proyectadas:"}
                      </span>
                      <span className="font-bold text-white">
                        {Math.round(
                          recommendationPackage.conservative
                            .estimatedClientsOrOrders
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beneficio estimado:</span>
                      <span className="font-bold text-white">
                        {formatCurrency(
                          recommendationPackage.conservative.estimatedNetProfit,
                          currencyCode,
                          0
                        )}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#CBD2DC] bg-[#191C21] p-2.5 rounded-lg border border-[#292E36] leading-relaxed mt-2">
                      <strong className="text-white">Justificación: </strong>
                      {recommendationPackage.conservative.reasoning}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyRecommendation(
                      recommendationPackage.conservative.totalBudget,
                      duration
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-[#191C21] hover:bg-[#292E36] text-white text-xs font-bold border border-[#292E36] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>UTILIZAR ESTA INVERSIÓN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. Recomendado (Protagonismo Visual) */}
              <div className="bg-[#0D0F12] border-2 border-[#FF5A1F] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl shadow-[#FF5A1F]/15 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5A1F] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Award className="w-3 h-3" />
                  Escenario Recomendado
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-wider bg-[#FF5A1F]/10 px-2.5 py-1 rounded-lg border border-[#FF5A1F]/30">
                      Escenario 2
                    </span>
                    <span className="text-[10px] font-bold text-[#FF5A1F] uppercase">
                      Equilibrio Óptimo
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      Recomendado
                    </h4>
                    <p className="text-xs text-[#CBD2DC] mt-1 leading-relaxed">
                      {recommendationPackage.recommended.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#191C21] border border-[#FF5A1F]/40 space-y-1">
                    <span className="text-[10px] text-[#FF5A1F] uppercase font-bold block">
                      Inversión diaria:
                    </span>
                    <div className="text-2xl font-black text-[#FF5A1F]">
                      {formatCurrency(
                        recommendationPackage.recommended.dailyBudget,
                        currencyCode
                      )}{" "}
                      / día
                    </div>
                    <span className="text-[11px] text-[#CBD2DC] block">
                      Inversión total ({duration} días):{" "}
                      <strong className="text-white">
                        {formatCurrency(
                          recommendationPackage.recommended.totalBudget,
                          currencyCode,
                          0
                        )}
                      </strong>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#CBD2DC]">
                    <div className="flex justify-between">
                      <span>
                        {businessType === "services"
                          ? "Clientes proyectados:"
                          : "Ventas proyectadas:"}
                      </span>
                      <span className="font-bold text-white">
                        {Math.round(
                          recommendationPackage.recommended
                            .estimatedClientsOrOrders
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beneficio estimado:</span>
                      <span className="font-bold text-white">
                        {formatCurrency(
                          recommendationPackage.recommended.estimatedNetProfit,
                          currencyCode,
                          0
                        )}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#CBD2DC] bg-[#191C21] p-2.5 rounded-lg border border-[#292E36] leading-relaxed mt-2">
                      <strong className="text-white">Justificación: </strong>
                      {recommendationPackage.recommended.reasoning}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyRecommendation(
                      recommendationPackage.recommended.totalBudget,
                      duration
                    )
                  }
                  className="w-full py-3 px-4 rounded-xl bg-[#FF5A1F] hover:bg-[#e04e18] text-white text-xs font-black shadow-lg shadow-[#FF5A1F]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>UTILIZAR ESTA INVERSIÓN</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>

              {/* 3. Acelerado */}
              <div className="bg-[#0D0F12] border border-[#292E36] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#CBD2DC]/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#CBD2DC] uppercase tracking-wider bg-[#191C21] px-2.5 py-1 rounded-lg border border-[#292E36]">
                      Escenario 3
                    </span>
                    <span className="text-[10px] font-bold text-[#CBD2DC] uppercase">
                      Crecimiento Rápido
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      Acelerado
                    </h4>
                    <p className="text-xs text-[#CBD2DC] mt-1 leading-relaxed">
                      {recommendationPackage.accelerated.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#191C21] border border-[#292E36] space-y-1">
                    <span className="text-[10px] text-[#CBD2DC] uppercase font-semibold block">
                      Inversión diaria:
                    </span>
                    <div className="text-xl font-black text-white">
                      {formatCurrency(
                        recommendationPackage.accelerated.dailyBudget,
                        currencyCode
                      )}{" "}
                      / día
                    </div>
                    <span className="text-[11px] text-[#CBD2DC] block">
                      Inversión total ({duration} días):{" "}
                      <strong className="text-white">
                        {formatCurrency(
                          recommendationPackage.accelerated.totalBudget,
                          currencyCode,
                          0
                        )}
                      </strong>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#CBD2DC]">
                    <div className="flex justify-between">
                      <span>
                        {businessType === "services"
                          ? "Clientes proyectados:"
                          : "Ventas proyectadas:"}
                      </span>
                      <span className="font-bold text-white">
                        {Math.round(
                          recommendationPackage.accelerated
                            .estimatedClientsOrOrders
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beneficio estimado:</span>
                      <span className="font-bold text-white">
                        {formatCurrency(
                          recommendationPackage.accelerated.estimatedNetProfit,
                          currencyCode,
                          0
                        )}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#CBD2DC] bg-[#191C21] p-2.5 rounded-lg border border-[#292E36] leading-relaxed mt-2">
                      <strong className="text-white">Justificación: </strong>
                      {recommendationPackage.accelerated.reasoning}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyRecommendation(
                      recommendationPackage.accelerated.totalBudget,
                      duration
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-[#191C21] hover:bg-[#292E36] text-white text-xs font-bold border border-[#292E36] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>UTILIZAR ESTA INVERSIÓN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] text-[11px] text-[#CBD2DC] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
            <span>
              Estas recomendaciones se calculan dinámicamente con el margen de tu negocio y las métricas estimadas de tu mercado. Son proyecciones orientativas y no garantizan resultados.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto text-[#CBD2DC] hover:text-white text-sm font-semibold px-4 py-2 transition-colors text-center"
        >
          ← Volver a Tu Objetivo Comercial
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-[#FF5A1F]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          Continuar a Estimación de Resultados →
        </button>
      </div>
    </div>
  );
}
