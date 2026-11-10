"use client";

import React, { useState } from "react";
import {
  BusinessType,
  CampaignObjective,
  BudgetMode,
  CalculatorStateInputs,
  FullCalculationResult,
  ServiceEconomicsInputs,
  EcommerceEconomicsInputs,
  AdvertisingMetricsInputs,
  ServiceFunnelInputs,
  EcommerceFunnelInputs,
  InverseBudgetInputs,
} from "@/types/calculator";
import { calculateFullRoi, calculateEconomics } from "@/lib/calculator";
import StepBusiness from "./StepBusiness";
import StepEconomics from "./StepEconomics";
import StepMonthlyExpenses from "./StepMonthlyExpenses";
import StepObjective from "./StepObjective";
import StepBudget from "./StepBudget";
import StepMetrics from "./StepMetrics";
import Dashboard from "../results/Dashboard";
import {
  Briefcase,
  DollarSign,
  Receipt,
  Target,
  Coins,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function CalculatorWizard() {
  // Step index: 0 is Landing/Welcome, 1 to 6 are form steps, 7 is Dashboard
  const [currentStep, setCurrentStep] = useState<number>(0);

  // State
  const [businessType, setBusinessType] = useState<BusinessType>("services");
  const [countryCode, setCountryCode] = useState<string>("CO");
  const [sectorId, setSectorId] = useState<string>("coaching_mentoring");
  const [productOrServiceName, setProductOrServiceName] = useState<string>("");
  const [currencyCode, setCurrencyCode] = useState<string>("COP");
  const [exchangeRate, setExchangeRate] = useState<number>(4150);
  const [objective, setObjective] = useState<CampaignObjective>("leads");
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("inverse");

  // Advertising defaults
  const [advertising, setAdvertising] = useState<AdvertisingMetricsInputs>({
    inputMode: "cpm_ctr",
    cpm: 14500, // COP
    ctr: 1.85,
    manualCpc: 780,
    budget: 2000000,
    campaignDurationDays: 30,
  });

  // Services Economics defaults (aligned with Section 7 mandatory test case)
  const [serviceEconomics, setServiceEconomics] =
    useState<ServiceEconomicsInputs>({
      pricePerClient: 99000, // $99.000 COP
      serviceDeliveryCost: 35000, // $35.000 COP
      otherVariableCosts: 0, // $0 COP -> Margen disponible: $64.000 COP
      additionalCosts: 0,
      averagePurchasesPerClient: 1,
      managementFee: 250000, // Gestión mensual: $250.000 COP
      fixedCampaignCosts: 9000, // Herramientas: $9.000 COP
      otherMonthlyExpenses: 0,
      customMonthlyExpenses: [],
      advancedUnitCost: 0,
    });

  // Ecommerce Economics defaults
  const [ecommerceEconomics, setEcommerceEconomics] =
    useState<EcommerceEconomicsInputs>({
      averageProductPrice: 150000,
      cogs: 55000,
      packagingCost: 5000,
      shippingCostStore: 12000,
      gatewayFeePercentage: 3.5,
      otherVariableCosts: 0,
      discountPercentage: 0,
      cancellationRatePercentage: 5,
      returnRatePercentage: 4,
      managementFee: 250000,
      fixedCampaignCosts: 9000,
      otherMonthlyExpenses: 0,
      customMonthlyExpenses: [],
      averagePurchasesPerClient: 1,
      advancedUnitCost: 0,
    });

  // Funnel rates
  const [serviceFunnel, setServiceFunnel] = useState<ServiceFunnelInputs>({
    clickToLeadRate: 15.0,
    leadToQualifiedRate: 45.0,
    qualifiedToClientRate: 25.0,
  });

  const [ecommerceFunnel, setEcommerceFunnel] = useState<EcommerceFunnelInputs>({
    clickToPurchaseRate: 2.2,
  });

  // Inverse budget defaults (aligned with Section 14: Meta beneficio neto $3.000.000 COP)
  const [inverseInputs, setInverseInputs] = useState<InverseBudgetInputs>({
    goalType: "profit",
    targetValue: 3000000,
    desiredProfitPerSale: 0,
    periodDays: 30,
  });

  // Derived unit & fixed economics from Steps 2 and 3
  const unitEconomics = React.useMemo(() => {
    return calculateEconomics({
      businessType,
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
      serviceEconomics,
      ecommerceEconomics,
    });
  }, [businessType, serviceEconomics, ecommerceEconomics]);

  // Metric origins & experience level
  const [metricsExperience, setMetricsExperience] = useState<
    "beginner" | "advanced"
  >("beginner");
  const [metricOrigins, setMetricOrigins] = useState<
    Record<string, "estimated" | "real" | "edited">
  >({
    cpm: "estimated",
    ctr: "estimated",
    cpc: "estimated",
    clickToLead: "estimated",
    leadToQualified: "estimated",
    qualifiedToClient: "estimated",
    clickToPurchase: "estimated",
  });
  const [benchmarkSourceNotice, setBenchmarkSourceNotice] =
    useState<string>("");
  const [isIllustrativeAssumption, setIsIllustrativeAssumption] =
    useState<boolean>(true);

  // Calculation Result
  const [result, setResult] = useState<FullCalculationResult | null>(null);

  // Synchronize Country Currency changes
  const handleCurrencyChange = (currency: string, defaultRate: number) => {
    setCurrencyCode(currency);
    setExchangeRate(defaultRate);

    if (currency === "USD") {
      setAdvertising((prev) => ({
        ...prev,
        cpm: 6.5,
        manualCpc: 0.45,
        budget: 1000,
      }));
      setServiceEconomics((prev) => ({
        ...prev,
        pricePerClient: 100,
        serviceDeliveryCost: 35,
        otherVariableCosts: 0,
        managementFee: 250,
        fixedCampaignCosts: 20,
      }));
      setEcommerceEconomics((prev) => ({
        ...prev,
        averageProductPrice: 75,
        cogs: 25,
        packagingCost: 3,
        shippingCostStore: 5,
        managementFee: 250,
        fixedCampaignCosts: 20,
      }));
      setInverseInputs((prev) => ({
        ...prev,
        targetValue: 1500,
      }));
    } else if (currency === "COP") {
      setAdvertising((prev) => ({
        ...prev,
        cpm: 14500,
        manualCpc: 780,
        budget: 2000000,
      }));
      setServiceEconomics((prev) => ({
        ...prev,
        pricePerClient: 99000,
        serviceDeliveryCost: 35000,
        otherVariableCosts: 0,
        managementFee: 250000,
        fixedCampaignCosts: 9000,
      }));
      setInverseInputs((prev) => ({
        ...prev,
        targetValue: 3000000,
      }));
    }
  };

  // Run Calculation and transition to Step 7
  const runCalculation = () => {
    const currentState: CalculatorStateInputs = {
      businessType,
      countryCode,
      sectorId,
      currencyCode,
      exchangeRate,
      objective,
      budgetMode,
      advertising,
      serviceEconomics:
        businessType === "services" ? serviceEconomics : undefined,
      ecommerceEconomics:
        businessType === "ecommerce" ? ecommerceEconomics : undefined,
      serviceFunnel: businessType === "services" ? serviceFunnel : undefined,
      ecommerceFunnel:
        businessType === "ecommerce" ? ecommerceFunnel : undefined,
      inverseBudget: budgetMode === "inverse" ? inverseInputs : undefined,
      metricsExperience,
      metricOrigins,
      benchmarkSourceNotice,
      isIllustrativeAssumption,
    };

    const calculated = calculateFullRoi(currentState);
    setResult(calculated);
    setCurrentStep(7);
  };

  // New 7-Step Structure (Section 2)
  const stepsList = [
    { num: 1, label: "Tu negocio", icon: <Briefcase className="w-3.5 h-3.5" /> },
    {
      num: 2,
      label: "Cuánto ganas por venta",
      icon: <DollarSign className="w-3.5 h-3.5" />,
    },
    {
      num: 3,
      label: "Tus gastos mensuales",
      icon: <Receipt className="w-3.5 h-3.5" />,
    },
    {
      num: 4,
      label: "Tu objetivo comercial",
      icon: <Target className="w-3.5 h-3.5" />,
    },
    {
      num: 5,
      label: "Tu presupuesto publicitario",
      icon: <Coins className="w-3.5 h-3.5" />,
    },
    {
      num: 6,
      label: "Estimación de resultados",
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      num: 7,
      label: "Resultados y rentabilidad",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Step Stepper Navigation (Visual Progress Indicator) */}
      {currentStep > 0 && currentStep <= 7 && (
        <div className="no-print space-y-2">
          {/* Mobile Step Header with Progress Line */}
          <div className="sm:hidden bg-[#191C21] border border-[#292E36] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#FF5A1F] uppercase tracking-wider text-[11px]">
                Paso {currentStep} de 7
              </span>
              <span className="font-bold text-white">
                {stepsList.find((s) => s.num === currentStep)?.label}
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-[#0D0F12] h-1.5 rounded-full overflow-hidden border border-[#292E36]">
              <div
                className="bg-gradient-to-r from-[#FF5A1F] to-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 max-w-5xl mx-auto overflow-x-auto py-1 px-0.5 no-scrollbar">
            {stepsList.map((step) => {
              const isCurrent = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isPast || (step.num === 7 && result)) {
                      setCurrentStep(step.num);
                    }
                  }}
                  disabled={!isPast && !isCurrent && !(step.num === 7 && result)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? "bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/20 ring-1 ring-[#FF5A1F]"
                      : isPast
                      ? "bg-[#191C21] text-white hover:bg-[#292E36] border border-[#292E36]"
                      : "bg-[#191C21]/40 text-[#CBD2DC]/40 border border-[#292E36]/30 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      isPast
                        ? "bg-[#0D0F12] text-[#FF5A1F] border border-[#FF5A1F]/40"
                        : isCurrent
                        ? "bg-white text-[#FF5A1F]"
                        : "bg-[#0D0F12] text-[#CBD2DC] border border-[#292E36]"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : step.num}
                  </span>
                  <span className="text-[11px] sm:text-xs">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 0: Initial Screen */}
      {currentStep === 0 && (
        <div className="text-center py-12 sm:py-20 max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#191C21] border border-[#FF5A1F]/40 text-[#FF5A1F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            Planificación y Rentabilidad en Meta Ads
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            ¿Cuánto deberías invertir en{" "}
            <span className="text-[#FF5A1F]">Meta Ads</span>?
          </h1>

          <p className="text-base sm:text-xl text-[#CBD2DC] max-w-2xl mx-auto leading-relaxed">
            Conoce tus márgenes por venta, descubre cuántos clientes necesitas y calcula cuánto dinero puede quedarte libre después de pagar publicidad y los gastos de tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-black text-lg px-10 py-5 rounded-2xl shadow-xl shadow-[#FF5A1F]/25 transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              COMENZAR CÁLCULO
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-[#292E36] text-left">
            <div className="p-4 rounded-xl bg-[#191C21] border border-[#292E36]">
              <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF5A1F]" />
                Sin Conocimientos Técnicos
              </div>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Tú introduces los datos que conoces de tu negocio; nosotros realizamos los cálculos financieros y de marketing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#191C21] border border-[#292E36]">
              <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#FF5A1F]" />
                Servicios y Ecommerce
              </div>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Embudos independientes para negocios de servicios (WhatsApp, formularios, asesorías) y tiendas online.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#191C21] border border-[#292E36]">
              <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#FF5A1F]" />
                3 Niveles de Rentabilidad
              </div>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Distingue con claridad tu dinero disponible por venta, el beneficio después de anuncios y tu ganancia neta final.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PASO 1: TU NEGOCIO */}
      {currentStep === 1 && (
        <StepBusiness
          businessType={businessType}
          countryCode={countryCode}
          sectorId={sectorId}
          productOrServiceName={productOrServiceName}
          currencyCode={currencyCode}
          exchangeRate={exchangeRate}
          objective={objective}
          onChange={setBusinessType}
          onCountryChange={setCountryCode}
          onSectorChange={setSectorId}
          onProductOrServiceNameChange={setProductOrServiceName}
          onCurrencyChange={handleCurrencyChange}
          onExchangeRateChange={setExchangeRate}
          onObjectiveSelect={setObjective}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {/* PASO 2: CUÁNTO GANAS POR VENTA */}
      {currentStep === 2 && (
        <StepEconomics
          businessType={businessType}
          currencyCode={currencyCode}
          serviceInputs={serviceEconomics}
          ecommerceInputs={ecommerceEconomics}
          onServiceChange={setServiceEconomics}
          onEcommerceChange={setEcommerceEconomics}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* PASO 3: TUS GASTOS MENSUALES */}
      {currentStep === 3 && (
        <StepMonthlyExpenses
          businessType={businessType}
          currencyCode={currencyCode}
          serviceInputs={serviceEconomics}
          ecommerceInputs={ecommerceEconomics}
          onServiceChange={setServiceEconomics}
          onEcommerceChange={setEcommerceEconomics}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* PASO 4: TU OBJETIVO COMERCIAL */}
      {currentStep === 4 && (
        <StepObjective
          businessType={businessType}
          currencyCode={currencyCode}
          unitPrice={unitEconomics.unitPrice}
          unitMargin={unitEconomics.unitContributionMargin}
          unitVariableCost={unitEconomics.unitVariableCost}
          totalFixedCosts={unitEconomics.totalFixedCosts}
          objective={objective}
          inverseInputs={inverseInputs}
          campaignDurationDays={advertising.campaignDurationDays || 30}
          onObjectiveSelect={setObjective}
          onInverseChange={setInverseInputs}
          onDurationChange={(days) =>
            setAdvertising((prev) => ({ ...prev, campaignDurationDays: days }))
          }
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
        />
      )}

      {/* PASO 5: TU PRESUPUESTO PUBLICITARIO */}
      {currentStep === 5 && (
        <StepBudget
          businessType={businessType}
          currencyCode={currencyCode}
          exchangeRate={exchangeRate}
          budgetMode={budgetMode}
          advertising={advertising}
          inverseInputs={inverseInputs}
          serviceFunnel={serviceFunnel}
          ecommerceFunnel={ecommerceFunnel}
          ecommerceEconomics={ecommerceEconomics}
          unitPrice={unitEconomics.unitPrice}
          unitMargin={unitEconomics.unitContributionMargin}
          totalFixedCosts={unitEconomics.totalFixedCosts}
          onBudgetModeChange={setBudgetMode}
          onAdvertisingChange={setAdvertising}
          onInverseChange={setInverseInputs}
          onNext={() => setCurrentStep(6)}
          onBack={() => setCurrentStep(4)}
        />
      )}

      {/* PASO 6: ESTIMACIÓN DE RESULTADOS */}
      {currentStep === 6 && (
        <StepMetrics
          businessType={businessType}
          countryCode={countryCode}
          sectorId={sectorId}
          objective={objective}
          currencyCode={currencyCode}
          exchangeRate={exchangeRate}
          advertising={advertising}
          serviceFunnel={serviceFunnel}
          ecommerceFunnel={ecommerceFunnel}
          metricsExperience={metricsExperience}
          metricOrigins={metricOrigins}
          onMetricsExperienceChange={setMetricsExperience}
          onMetricOriginsChange={setMetricOrigins}
          onAdvertisingChange={setAdvertising}
          onServiceFunnelChange={setServiceFunnel}
          onEcommerceFunnelChange={setEcommerceFunnel}
          onSourceNoticeChange={(notice, isIllustrative) => {
            setBenchmarkSourceNotice(notice);
            setIsIllustrativeAssumption(isIllustrative);
          }}
          onNext={runCalculation}
          onBack={() => setCurrentStep(5)}
        />
      )}

      {/* PASO 7: RESULTADOS Y RENTABILIDAD */}
      {currentStep === 7 && result && (
        <Dashboard result={result} onRecalculate={() => setCurrentStep(6)} />
      )}
    </div>
  );
}
