"use client";

import React, { useState } from "react";
import { CampaignObjective, BusinessType } from "@/types/business";
import { InverseBudgetInputs, InverseGoalType } from "@/types/calculator";
import { formatCurrency } from "@/lib/currency/countries";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  Info,
  CheckCircle2,
} from "lucide-react";

interface StepObjectiveProps {
  businessType: BusinessType;
  currencyCode: string;
  unitPrice: number;
  unitMargin: number;
  unitVariableCost: number;
  totalFixedCosts?: number;
  objective: CampaignObjective;
  inverseInputs: InverseBudgetInputs;
  campaignDurationDays: number;
  onObjectiveSelect: (obj: CampaignObjective) => void;
  onInverseChange: (inv: InverseBudgetInputs) => void;
  onDurationChange: (days: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_DAYS = [7, 15, 30, 60];

export default function StepObjective({
  businessType,
  currencyCode,
  unitPrice,
  unitMargin,
  totalFixedCosts = 0,
  inverseInputs,
  campaignDurationDays,
  onInverseChange,
  onDurationChange,
  onNext,
  onBack,
}: StepObjectiveProps) {
  const goalType = inverseInputs.goalType;
  const targetValue = inverseInputs.targetValue || 0;
  const [customDurationMode, setCustomDurationMode] = useState<boolean>(
    !PRESET_DAYS.includes(campaignDurationDays)
  );

  // 4 Options from Section 6
  const goals: {
    id: InverseGoalType;
    optionBadge: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    inputLabel: string;
    placeholder: string;
    unitSuffix: string;
    helperText: string;
  }[] = [
    {
      id: "profit",
      optionBadge: "OPCIÓN A",
      title: "Quiero ganar dinero",
      description:
        "Quiero conseguir una ganancia neta después de pagar todos los costos del negocio y la publicidad.",
      icon: <DollarSign className="w-5 h-5 text-[#FF5A1F]" />,
      inputLabel:
        campaignDurationDays === 30
          ? `¿Cuánto quieres ganar al mes? (${currencyCode})`
          : `¿Cuánto quieres ganar en ${campaignDurationDays} días? (${currencyCode})`,
      placeholder: currencyCode === "COP" ? "Ej: 3000000" : "Ej: 1500",
      unitSuffix: currencyCode,
      helperText:
        "Esta es la ganancia neta libre que deseas que te quede después de cubrir costos de entrega, gastos mensuales y anuncios.",
    },
    {
      id: "revenue",
      optionBadge: "OPCIÓN B",
      title: "Quiero vender más",
      description:
        "Quiero generar una cantidad determinada de ingresos por mis productos o servicios.",
      icon: <TrendingUp className="w-5 h-5 text-[#FF5A1F]" />,
      inputLabel: `¿Cuánto quieres facturar? (${currencyCode})`,
      placeholder: currencyCode === "COP" ? "Ej: 10000000" : "Ej: 5000",
      unitSuffix: currencyCode,
      helperText:
        "Importante: La facturación es el total de ingresos cobrados por tus ventas, no tu ganancia neta.",
    },
    {
      id: "clients",
      optionBadge: "OPCIÓN C",
      title: "Quiero conseguir clientes",
      description:
        "Quiero conseguir una cantidad determinada de clientes nuevos.",
      icon: <Users className="w-5 h-5 text-[#FF5A1F]" />,
      inputLabel: "¿Cuántos clientes quieres conseguir?",
      placeholder: "Ej: 50",
      unitSuffix: "clientes",
      helperText:
        "Indica la cantidad total de clientes nuevos que deseas adquirir durante la campaña.",
    },
    {
      id: "orders",
      optionBadge: "OPCIÓN D",
      title: "Quiero generar más ventas",
      description:
        "Quiero conseguir más compras o pedidos para mi tienda.",
      icon: <ShoppingBag className="w-5 h-5 text-[#FF5A1F]" />,
      inputLabel: "¿Cuántas ventas quieres generar?",
      placeholder: "Ej: 100",
      unitSuffix: "ventas",
      helperText:
        "Indica la cantidad total de compras o pedidos entregados que deseas generar.",
    },
  ];

  const currentGoalMeta = goals.find((g) => g.id === goalType) || goals[0];

  // Quick contextual preview based on selected goal (without confusing revenue with profit)
  const renderContextualExplanation = () => {
    if (targetValue <= 0 || unitPrice <= 0) return null;

    if (goalType === "revenue") {
      const salesNeeded = targetValue / unitPrice;
      const availableBeforeAds = salesNeeded * unitMargin;
      return (
        <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#FF5A1F]" />
            <span>Diferencia entre Facturación y Ganancia:</span>
          </div>
          <p className="leading-relaxed">
            Para facturar{" "}
            <strong className="text-white">
              {formatCurrency(targetValue, currencyCode)}
            </strong>{" "}
            necesitas aproximadamente{" "}
            <strong className="text-[#FF5A1F]">
              {Math.ceil(salesNeeded)} ventas
            </strong>
            . Esas ventas dejarán{" "}
            <strong className="text-white">
              {formatCurrency(availableBeforeAds, currencyCode)}
            </strong>{" "}
            de margen disponible antes de descontar la publicidad y tus gastos mensuales ({formatCurrency(totalFixedCosts, currencyCode)}).
          </p>
        </div>
      );
    }

    if (goalType === "profit") {
      return (
        <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#FF5A1F]" />
            <span>Meta de Beneficio Neto Real:</span>
          </div>
          <p className="leading-relaxed">
            Calcularemos cuántos clientes y cuánta inversión publicitaria necesitas para que, tras cubrir tus costos por venta, la pauta en Meta Ads y tus gastos mensuales ({formatCurrency(totalFixedCosts, currencyCode)}), te queden{" "}
            <strong className="text-[#FF5A1F]">
              {formatCurrency(targetValue, currencyCode)}
            </strong>{" "}
            libres.
          </p>
        </div>
      );
    }

    const estRevenue = targetValue * unitPrice;
    const estMargin = targetValue * unitMargin;
    return (
      <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] space-y-1.5">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#FF5A1F]" />
          <span>Equivalencia comercial de tu meta:</span>
        </div>
        <p className="leading-relaxed">
          Conseguir{" "}
          <strong className="text-[#FF5A1F]">
            {targetValue} {goalType === "clients" ? "clientes" : "ventas"}
          </strong>{" "}
          representa{" "}
          <strong className="text-white">
            {formatCurrency(estRevenue, currencyCode)}
          </strong>{" "}
          en facturación y{" "}
          <strong className="text-white">
            {formatCurrency(estMargin, currencyCode)}
          </strong>{" "}
          de dinero disponible antes de pagar la publicidad y gastos mensuales.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-3 py-1 rounded-full mb-2">
          Paso 4 de 7 • Tu Objetivo Comercial
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Qué quieres conseguir con tu publicidad?
        </h2>
        <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
          Selecciona el resultado que quieres alcanzar. Nosotros calcularemos cuánto necesitas vender e invertir.
        </p>
      </div>

      {/* 4 OPTIONS CARDS */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((g) => {
            const isSelected = goalType === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() =>
                  onInverseChange({
                    ...inverseInputs,
                    goalType: g.id,
                    desiredProfitPerSale: 0, // Never block basic simulation
                  })
                }
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0D0F12] border-[#FF5A1F] ring-1 ring-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/15"
                    : "bg-[#0D0F12]/60 border-[#292E36] hover:border-[#CBD2DC]/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-[#191C21] border border-[#292E36]">
                        {g.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 px-2 py-0.5 rounded border border-[#FF5A1F]/30">
                        {g.optionBadge}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#FF5A1F]" />
                    )}
                  </div>
                  <h4 className="text-base font-black text-white mb-1">
                    {g.title}
                  </h4>
                  <p className="text-xs text-[#CBD2DC] leading-relaxed">
                    {g.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Target Value Input + Period Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#292E36]">
          {/* Dynamic Question Field */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-white mb-2">
              {currentGoalMeta.inputLabel}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={targetValue === 0 ? "" : targetValue}
                onChange={(e) =>
                  onInverseChange({
                    ...inverseInputs,
                    targetValue:
                      e.target.value === ""
                        ? 0
                        : Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                placeholder={currentGoalMeta.placeholder}
                className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
              <span className="absolute right-4 top-3.5 text-xs text-[#CBD2DC] font-semibold">
                {currentGoalMeta.unitSuffix}
              </span>
            </div>
            <p className="text-[11px] text-[#CBD2DC] mt-1.5 leading-relaxed">
              {currentGoalMeta.helperText}
            </p>
          </div>

          {/* Período de la meta (7, 15, 30, 60, Personalizado) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF5A1F]" />
              Período para alcanzar esta meta
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_DAYS.map((days) => {
                const isSelected =
                  !customDurationMode && campaignDurationDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setCustomDurationMode(false);
                      onDurationChange(days);
                    }}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-[#FF5A1F] text-white border-[#FF5A1F]"
                        : "bg-[#0D0F12] text-[#CBD2DC] border-[#292E36] hover:text-white"
                    }`}
                  >
                    {days} días
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCustomDurationMode(true)}
                className={`py-3 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                  customDurationMode
                    ? "bg-[#FF5A1F] text-white border-[#FF5A1F]"
                    : "bg-[#0D0F12] text-[#CBD2DC] border-[#292E36] hover:text-white"
                }`}
              >
                Otro
              </button>
            </div>

            {customDurationMode && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={campaignDurationDays}
                  onChange={(e) =>
                    onDurationChange(
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  }
                  className="w-28 bg-[#0D0F12] border border-[#FF5A1F] rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none"
                />
                <span className="text-xs text-[#CBD2DC]">
                  días personalizados de campaña
                </span>
              </div>
            )}

            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              El valor predeterminado es 30 días (1 mes comercial).
            </p>
          </div>
        </div>

        {/* Contextual Non-Confusing Explanation */}
        {renderContextualExplanation()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto text-[#CBD2DC] hover:text-white text-sm font-semibold px-4 py-2 transition-colors text-center"
        >
          ← Volver a Tus Gastos Mensuales
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all hover:scale-[1.02] text-center"
        >
          Continuar a Tu Presupuesto Publicitario →
        </button>
      </div>
    </div>
  );
}
