"use client";

import React, { useState, useEffect } from "react";
import {
  BusinessType,
  CampaignObjective,
  AdvertisingMetricsInputs,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
} from "@/types/calculator";
import { MetricOriginType } from "@/types/benchmarks";
import { getBenchmarkDefaults } from "@/lib/benchmarks/data";
import { formatCurrency, SUPPORTED_COUNTRIES } from "@/lib/currency/countries";
import {
  Sliders,
  Sparkles,
  History,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
} from "lucide-react";

interface StepMetricsProps {
  businessType: BusinessType;
  countryCode: string;
  sectorId: string;
  objective: CampaignObjective;
  currencyCode: string;
  exchangeRate: number;
  advertising: AdvertisingMetricsInputs;
  serviceFunnel: ServiceFunnelInputs;
  ecommerceFunnel: EcommerceFunnelInputs;
  metricsExperience: "beginner" | "advanced";
  metricOrigins: Record<string, MetricOriginType>;
  onMetricsExperienceChange: (exp: "beginner" | "advanced") => void;
  onMetricOriginsChange: (origins: Record<string, MetricOriginType>) => void;
  onAdvertisingChange: (adv: AdvertisingMetricsInputs) => void;
  onServiceFunnelChange: (funnel: ServiceFunnelInputs) => void;
  onEcommerceFunnelChange: (funnel: EcommerceFunnelInputs) => void;
  onSourceNoticeChange?: (notice: string, isIllustrative: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepMetrics({
  businessType,
  countryCode,
  sectorId,
  objective,
  currencyCode,
  exchangeRate,
  advertising,
  serviceFunnel,
  ecommerceFunnel,
  metricsExperience,
  metricOrigins,
  onMetricsExperienceChange,
  onMetricOriginsChange,
  onAdvertisingChange,
  onServiceFunnelChange,
  onEcommerceFunnelChange,
  onSourceNoticeChange,
  onNext,
  onBack,
}: StepMetricsProps) {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<string | null>(null);

  // Obtain benchmark / illustrative values for the selected context
  const benchmarkPackage = getBenchmarkDefaults({
    countryCode,
    sectorId,
    businessType,
    objective,
    currencyCode,
    exchangeRateToUSD: exchangeRate,
  });

  const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);

  // Notify parent of source notice
  useEffect(() => {
    if (onSourceNoticeChange) {
      onSourceNoticeChange(
        benchmarkPackage.sourceNotice,
        benchmarkPackage.isIllustrative
      );
    }
  }, [benchmarkPackage.sourceNotice, benchmarkPackage.isIllustrative, onSourceNoticeChange]);

  // Handler to set beginner mode (Option A)
  const handleSelectBeginner = () => {
    onMetricsExperienceChange("beginner");

    // Populate auto-benchmarks
    onAdvertisingChange({
      ...advertising,
      cpm: benchmarkPackage.cpm,
      ctr: benchmarkPackage.ctr,
      manualCpc: benchmarkPackage.cpc,
      inputMode: "cpm_ctr",
    });

    if (businessType === "services") {
      onServiceFunnelChange({
        clickToLeadRate: benchmarkPackage.clickToLead,
        leadToQualifiedRate: benchmarkPackage.leadToQualified,
        qualifiedToClientRate: benchmarkPackage.qualifiedToClient,
      });
    } else {
      onEcommerceFunnelChange({
        clickToPurchaseRate: benchmarkPackage.clickToPurchase,
      });
    }

    // Set all origins to estimated
    const updatedOrigins: Record<string, MetricOriginType> = {
      cpm: "estimated",
      ctr: "estimated",
      cpc: "estimated",
      clickToLead: "estimated",
      leadToQualified: "estimated",
      qualifiedToClient: "estimated",
      clickToPurchase: "estimated",
    };
    onMetricOriginsChange(updatedOrigins);
  };

  // Handler to set advanced mode (Option B)
  const handleSelectAdvanced = () => {
    onMetricsExperienceChange("advanced");
  };

  // Helper to update individual metric and mark origin
  const handleMetricEdit = (
    key: string,
    action: () => void,
    defaultVal: number,
    newVal: number
  ) => {
    action();
    const currentOrigin = metricOrigins[key] || "estimated";

    let nextOrigin: MetricOriginType = "edited";
    if (metricsExperience === "advanced") {
      nextOrigin = "real";
    } else {
      nextOrigin = newVal === defaultVal ? "estimated" : "edited";
    }

    onMetricOriginsChange({
      ...metricOrigins,
      [key]: nextOrigin,
    });
  };

  // Calculate live preview CPC when in cpm_ctr mode
  const derivedCpc =
    advertising.ctr > 0 && advertising.cpm > 0
      ? advertising.cpm / (1000 * (advertising.ctr / 100))
      : 0;

  // Badge renderer
  const renderOriginBadge = (key: string) => {
    const origin = metricOrigins[key] || "estimated";
    if (origin === "real") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 uppercase tracking-wider">
          <CheckCircle className="w-2.5 h-2.5" />
          Real
        </span>
      );
    }
    if (origin === "edited") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20 uppercase tracking-wider">
          <Sliders className="w-2.5 h-2.5 text-[#FF5A1F]" />
          Editado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#292E36] text-[#CBD2DC] border border-[#292E36] uppercase tracking-wider">
        <Sparkles className="w-2.5 h-2.5 text-[#FF5A1F]" />
        Estimado
      </span>
    );
  };

  // Glossary Terms Data
  const glossaryTerms = [
    {
      term: "CPM — Costo por mil visualizaciones",
      desc: "Cuánto pagas aproximadamente a Meta para que tu anuncio aparezca 1.000 veces en las pantallas de Facebook e Instagram.",
    },
    {
      term: "CTR — Porcentaje de clics",
      desc: "De todas las personas que ven tu anuncio, qué porcentaje hace clic en él para visitar tu perfil, enlace o página web.",
    },
    {
      term: "CPC — Costo por clic",
      desc: "Cuánto pagas en promedio cada vez que un usuario hace clic en tu anuncio publicitario.",
    },
    {
      term: "CPL — Costo por contacto",
      desc: "Cuánto dinero inviertes en promedio en publicidad para conseguir que un interesado te escriba o te deje sus datos.",
    },
    {
      term: "CPA — Costo por cliente adquirido",
      desc: "Cuánto dinero en publicidad te cuesta conseguir una venta o un cliente final que paga por tus servicios.",
    },
    {
      term: "ROAS — Retorno de la inversión publicitaria",
      desc: "Cuánto dinero en ventas brutas genera cada peso o dólar invertido en anuncios. Ejemplo: ROAS 4.0 significa $4 en ventas por cada $1 invertido.",
    },
    {
      term: "ROI — Retorno de la inversión",
      desc: "Mide la rentabilidad neta final después de descontar el costo del producto/servicio, gastos y costos de los anuncios.",
    },
    {
      term: "Tasa de conversión",
      desc: "Porcentaje de personas que realizan la acción comercial que buscas (por ejemplo, escribirte a WhatsApp o comprar en la web).",
    },
    {
      term: "Tasa de cierre",
      desc: "Porcentaje de prospectos calificados que finalmente toman la decisión y pagan por tu servicio o producto.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-3 py-1 rounded-full mb-2">
          Paso 6 de 7 • Estimación de Resultados
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Cómo estimamos los resultados de tu campaña?
        </h2>
        <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
          Utilizaremos referencias de publicidad y tasas de conversión para calcular cuántas personas podrían interesarse en tu negocio y cuántas podrían convertirse en clientes.
        </p>
      </div>

      {/* INITIAL QUESTION: Experience Selector */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF5A1F]" />
          ¿Has realizado campañas publicitarias anteriormente?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Beginner (Default) */}
          <button
            type="button"
            onClick={handleSelectBeginner}
            className={`p-5 rounded-2xl text-left border transition-all relative ${
              metricsExperience === "beginner"
                ? "bg-[#0D0F12] border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/15 ring-1 ring-[#FF5A1F]"
                : "bg-[#0D0F12]/60 border-[#292E36] hover:border-[#CBD2DC]/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-white">
                  No, será mi primera campaña
                </h4>
              </div>
              {metricsExperience === "beginner" && (
                <span className="w-3 h-3 rounded-full bg-[#FF5A1F] ring-4 ring-[#FF5A1F]/20" />
              )}
            </div>
            <p className="text-xs text-[#CBD2DC] mt-2.5 leading-relaxed">
              No te preocupes si no conoces los costos de publicidad. Utilizaremos estimaciones orientativas según tu país, tipo de negocio y objetivo publicitario.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A1F]">
              <span>Sugerido para nuevos anunciantes</span>
            </div>
          </button>

          {/* Option B: Advanced / Previous Data */}
          <button
            type="button"
            onClick={handleSelectAdvanced}
            className={`p-5 rounded-2xl text-left border transition-all relative ${
              metricsExperience === "advanced"
                ? "bg-[#0D0F12] border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/15 ring-1 ring-[#FF5A1F]"
                : "bg-[#0D0F12]/60 border-[#292E36] hover:border-[#CBD2DC]/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#292E36] border border-[#292E36] flex items-center justify-center text-white">
                  <History className="w-4 h-4 text-[#FF5A1F]" />
                </span>
                <h4 className="text-sm font-bold text-white">
                  Sí, ya tengo resultados de campañas anteriores
                </h4>
              </div>
              {metricsExperience === "advanced" && (
                <span className="w-3 h-3 rounded-full bg-[#FF5A1F] ring-4 ring-[#FF5A1F]/20" />
              )}
            </div>
            <p className="text-xs text-[#CBD2DC] mt-2.5 leading-relaxed">
              Introduce los resultados de tus campañas anteriores para obtener una proyección más ajustada a tu negocio.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#CBD2DC]">
              <span>Permite ingresar métricas reales o estimar faltantes</span>
            </div>
          </button>
        </div>

        {/* Dynamic Context Bar */}
        <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span>{country?.flag || "🌎"}</span>
              <span>{country?.name || countryCode}</span>
            </span>
            <span className="text-[#292E36]">•</span>
            <span className="text-white">
              {businessType === "services" ? "Servicios / Digital" : "Ecommerce / Productos"}
            </span>
            <span className="text-[#292E36]">•</span>
            <span className="text-[#FF5A1F] font-semibold uppercase text-[11px]">
              Objetivo: {objective}
            </span>
          </div>

          <div className="text-[11px] text-[#CBD2DC] italic">
            {benchmarkPackage.isIllustrative ? (
              <span className="text-[#FF5A1F]">● Supuesto orientativo</span>
            ) : (
              <span className="text-white font-medium">● Referencia de mercado</span>
            )}
          </div>
        </div>
      </div>

      {/* TWO MAIN CONFIGURATION BOXES: AD COSTS & FUNNEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Costos de publicidad */}
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Costos de publicidad
              </h3>
              <p className="text-[11px] text-[#CBD2DC] mt-0.5">
                Valores para calcular visualizaciones y clics
              </p>
            </div>

            {/* Toggle calculation mode */}
            <div className="flex text-[11px] bg-[#0D0F12] p-1 rounded-xl border border-[#292E36]">
              <button
                type="button"
                onClick={() =>
                  onAdvertisingChange({ ...advertising, inputMode: "cpm_ctr" })
                }
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  advertising.inputMode === "cpm_ctr"
                    ? "bg-[#FF5A1F] text-white font-bold"
                    : "text-[#CBD2DC] hover:text-white"
                }`}
              >
                CPM + CTR
              </button>
              <button
                type="button"
                onClick={() =>
                  onAdvertisingChange({ ...advertising, inputMode: "cpc_direct" })
                }
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  advertising.inputMode === "cpc_direct"
                    ? "bg-[#FF5A1F] text-white font-bold"
                    : "text-[#CBD2DC] hover:text-white"
                }`}
              >
                CPC Manual
              </button>
            </div>
          </div>

          {advertising.inputMode === "cpm_ctr" ? (
            <div className="space-y-4">
              {/* CPM Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    Costo por 1.000 visualizaciones (CPM en {currencyCode})
                  </label>
                  {renderOriginBadge("cpm")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={advertising.cpm === 0 ? "" : advertising.cpm}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "cpm",
                      () => onAdvertisingChange({ ...advertising, cpm: val }),
                      benchmarkPackage.cpm,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Es lo que pagas aproximadamente para que tu anuncio aparezca 1.000 veces.
                </p>
              </div>

              {/* CTR Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    Porcentaje de personas que hacen clic (CTR %)
                  </label>
                  {renderOriginBadge("ctr")}
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={advertising.ctr === 0 ? "" : advertising.ctr}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "ctr",
                      () => onAdvertisingChange({ ...advertising, ctr: val }),
                      benchmarkPackage.ctr,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Indica qué porcentaje de personas que ven tu anuncio hacen clic.
                </p>
              </div>

              {/* Live Derived CPC Card */}
              <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Costo estimado por clic (CPC calculado):
                  </span>
                  <span className="text-[11px] text-[#CBD2DC]">
                    Fórmula: CPM ÷ (1.000 × CTR en decimal)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#FF5A1F]">
                    {formatCurrency(derivedCpc, currencyCode)}
                  </span>
                  <span className="block text-[10px] text-[#CBD2DC]">por clic</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Manual CPC Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    Costo promedio por clic (CPC en {currencyCode})
                  </label>
                  {renderOriginBadge("cpc")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={advertising.manualCpc === 0 ? "" : advertising.manualCpc}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "cpc",
                      () => onAdvertisingChange({ ...advertising, manualCpc: val }),
                      benchmarkPackage.cpc,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Es el costo promedio que pagas cada vez que alguien hace clic en tu anuncio. Los clics se calculan dividiendo tu presupuesto entre este CPC.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC]">
                <span className="font-semibold text-white">Cálculo directo:</span> Al introducir el CPC manualmente, prevalece en el cálculo de clics sin duplicar resultados con CPM/CTR.
              </div>
            </div>
          )}
        </div>

        {/* Box 2: ¿Qué pasa después de que hacen clic? (Funnel) */}
        <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 space-y-4">
          <div className="border-b border-[#292E36] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ¿Qué pasa después de que hacen clic?
            </h3>
            <p className="text-[11px] text-[#CBD2DC] mt-0.5">
              {businessType === "services"
                ? "Embudo de prospección, calificación y cierre de clientes"
                : "Embudo de conversión a compra en tienda virtual"}
            </p>
          </div>

          {businessType === "services" ? (
            <div className="space-y-4">
              {/* Click to Lead Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    1. Porcentaje de personas que te contactan (%)
                  </label>
                  {renderOriginBadge("clickToLead")}
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={
                    serviceFunnel.clickToLeadRate === 0
                      ? ""
                      : serviceFunnel.clickToLeadRate
                  }
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "clickToLead",
                      () =>
                        onServiceFunnelChange({
                          ...serviceFunnel,
                          clickToLeadRate: val,
                        }),
                      benchmarkPackage.clickToLead,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Porcentaje de personas que hacen clic y escriben por WhatsApp, Instagram o completan un formulario.
                </p>
              </div>

              {/* Lead to Qualified Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    2. Porcentaje de contactos que califican (%)
                  </label>
                  {renderOriginBadge("leadToQualified")}
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={
                    serviceFunnel.leadToQualifiedRate === 0
                      ? ""
                      : serviceFunnel.leadToQualifiedRate
                  }
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "leadToQualified",
                      () =>
                        onServiceFunnelChange({
                          ...serviceFunnel,
                          leadToQualifiedRate: val,
                        }),
                      benchmarkPackage.leadToQualified,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Porcentaje de contactos que realmente tienen interés, presupuesto y perfil adecuado.
                </p>
              </div>

              {/* Qualified to Client (Closing Rate) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    3. Porcentaje de prospectos que compran / contratan (%)
                  </label>
                  {renderOriginBadge("qualifiedToClient")}
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={
                    serviceFunnel.qualifiedToClientRate === 0
                      ? ""
                      : serviceFunnel.qualifiedToClientRate
                  }
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "qualifiedToClient",
                      () =>
                        onServiceFunnelChange({
                          ...serviceFunnel,
                          qualifiedToClientRate: val,
                        }),
                      benchmarkPackage.qualifiedToClient,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Porcentaje de prospectos calificados que terminan cerrando el servicio.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Click to Purchase Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">
                    Porcentaje de visitantes que compran en la tienda (%)
                  </label>
                  {renderOriginBadge("clickToPurchase")}
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={
                    ecommerceFunnel.clickToPurchaseRate === 0
                      ? ""
                      : ecommerceFunnel.clickToPurchaseRate
                  }
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                    handleMetricEdit(
                      "clickToPurchase",
                      () =>
                        onEcommerceFunnelChange({
                          ...ecommerceFunnel,
                          clickToPurchaseRate: val,
                        }),
                      benchmarkPackage.clickToPurchase,
                      val
                    );
                  }}
                  placeholder="0"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
                <p className="text-[11px] text-[#CBD2DC] mt-1">
                  Porcentaje de visitantes de tu tienda web que completan una orden de compra.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] space-y-1.5">
                <span className="text-xs font-semibold text-white block">
                  Ajuste de pedidos netos:
                </span>
                <p className="text-[11px] text-[#CBD2DC]">
                  Las cancelaciones previas al envío y devoluciones se calculan según lo configurado en el Paso 3 (Economía), protegiendo tus márgenes netos de forma no duplicada.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 6: GLOSSARY OF METRICS (Accessible in-place accordion/cards) */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setGlossaryOpen(!glossaryOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#0D0F12]/40 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">
                ¿Qué significan estas métricas? (Glosario interactivo)
              </h4>
              <p className="text-xs text-[#CBD2DC] mt-0.5">
                Consulta qué significa cada sigla publicitaria sin salir del formulario
              </p>
            </div>
          </div>
          <div className="text-white">
            {glossaryOpen ? (
              <ChevronUp className="w-5 h-5 text-[#FF5A1F]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#CBD2DC]" />
            )}
          </div>
        </button>

        {glossaryOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-[#292E36] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {glossaryTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] hover:border-[#FF5A1F]/40 transition-all space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
                  <h5 className="text-xs font-bold text-white">{item.term}</h5>
                </div>
                <p className="text-[11px] text-[#CBD2DC] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 7: TRANSPARENCY & DISCLAIMER NOTICE */}
      <div className="p-4 rounded-2xl bg-[#0D0F12] border border-[#292E36] text-xs text-[#CBD2DC] flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Nota de transparencia de estimaciones:
          </p>
          <p className="leading-relaxed">
            {benchmarkPackage.sourceNotice}
          </p>
          <p className="leading-relaxed text-[11px] text-[#CBD2DC]/80">
            Los resultados son proyecciones orientativas. El rendimiento real puede variar según la competencia, el público, los anuncios, la oferta y la optimización de las campañas. No se garantizan ventas, clientes ni resultados específicos.
          </p>
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto text-[#CBD2DC] hover:text-white text-sm font-semibold px-4 py-2 transition-colors text-center"
        >
          ← Volver al presupuesto
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-9 py-3.5 rounded-xl shadow-xl shadow-[#FF5A1F]/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          CALCULAR RESULTADOS Y RENTABILIDAD →
        </button>
      </div>
    </div>
  );
}
