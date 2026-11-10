"use client";

import React, { useState } from "react";
import {
  BusinessType,
  ServiceEconomicsInputs,
  EcommerceEconomicsInputs,
} from "@/types/calculator";
import { formatCurrency } from "@/lib/currency/countries";
import {
  Calculator,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Sliders,
  Info,
  Repeat,
} from "lucide-react";

interface StepEconomicsProps {
  businessType: BusinessType;
  currencyCode: string;
  serviceInputs: ServiceEconomicsInputs;
  ecommerceInputs: EcommerceEconomicsInputs;
  onServiceChange: (inputs: ServiceEconomicsInputs) => void;
  onEcommerceChange: (inputs: EcommerceEconomicsInputs) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepEconomics({
  businessType,
  currencyCode,
  serviceInputs,
  ecommerceInputs,
  onServiceChange,
  onEcommerceChange,
  onNext,
  onBack,
}: StepEconomicsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Unit Margin Calculations Preview (First purchase / single sale)
  let rawSalePrice = 0;
  let deliveryCost = 0;
  let otherSaleCosts = 0;
  let unitPrice = 0;
  let unitVarCost = 0;
  let unitMargin = 0;
  let marginPct = 0;
  let avgPurchases = 1;

  if (businessType === "services") {
    rawSalePrice = Math.max(0, serviceInputs.pricePerClient || 0);
    deliveryCost = Math.max(0, serviceInputs.serviceDeliveryCost || 0);
    const advCost = Math.max(0, serviceInputs.advancedUnitCost || 0);
    otherSaleCosts = Math.max(0, serviceInputs.otherVariableCosts || 0) + advCost;
    avgPurchases = Math.max(1, serviceInputs.averagePurchasesPerClient || 1);

    unitPrice = rawSalePrice;
    unitVarCost = deliveryCost + otherSaleCosts;
    unitMargin = unitPrice - unitVarCost;
    marginPct = unitPrice > 0 ? (unitMargin / unitPrice) * 100 : 0;
  } else {
    rawSalePrice = Math.max(0, ecommerceInputs.averageProductPrice || 0);
    const discountPct =
      Math.min(100, Math.max(0, ecommerceInputs.discountPercentage || 0)) / 100;
    unitPrice = rawSalePrice * (1 - discountPct);

    deliveryCost = Math.max(0, ecommerceInputs.cogs || 0);
    const gatewayFee =
      unitPrice *
      (Math.min(100, Math.max(0, ecommerceInputs.gatewayFeePercentage || 0)) / 100);
    const advCost = Math.max(0, ecommerceInputs.advancedUnitCost || 0);

    otherSaleCosts =
      Math.max(0, ecommerceInputs.otherVariableCosts || 0) +
      Math.max(0, ecommerceInputs.packagingCost || 0) +
      Math.max(0, ecommerceInputs.shippingCostStore || 0) +
      gatewayFee +
      advCost;

    avgPurchases = Math.max(1, ecommerceInputs.averagePurchasesPerClient || 1);
    unitVarCost = deliveryCost + otherSaleCosts;
    unitMargin = unitPrice - unitVarCost;
    marginPct = unitPrice > 0 ? (unitMargin / unitPrice) * 100 : 0;
  }

  const ltvEstimatedRevenue = unitPrice * avgPurchases;
  const ltvEstimatedMargin = unitMargin * avgPurchases;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-3 py-1 rounded-full mb-2">
          Paso 2 de 7 • Cuánto Ganas por Venta
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Cuánto ganas por cada venta?
        </h2>
        <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
          Cuéntanos cuánto cobras y cuánto te cuesta entregar tu producto o servicio. Calcularemos automáticamente cuánto dinero te queda por cada venta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 3 Principal Fields + Collapsible Advanced Section (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-5">
            {/* CAMPO 1: ¿Cuánto cobras por tu producto o servicio? */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-white">
                  1. ¿Cuánto cobras por tu producto o servicio? ({currencyCode})
                </label>
                <span className="text-[10px] font-bold uppercase text-[#FF5A1F] bg-[#FF5A1F]/10 px-2 py-0.5 rounded border border-[#FF5A1F]/30">
                  Obligatorio
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={
                  businessType === "services"
                    ? serviceInputs.pricePerClient === 0
                      ? ""
                      : serviceInputs.pricePerClient
                    : ecommerceInputs.averageProductPrice === 0
                    ? ""
                    : ecommerceInputs.averageProductPrice
                }
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                  if (businessType === "services") {
                    onServiceChange({
                      ...serviceInputs,
                      pricePerClient: val,
                    });
                  } else {
                    onEcommerceChange({
                      ...ecommerceInputs,
                      averageProductPrice: val,
                    });
                  }
                }}
                placeholder="Ej: 100000"
                className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
              <p className="text-[11px] text-[#CBD2DC] mt-1.5">
                Precio que paga el cliente al comprar tu producto o contratar tu servicio.
              </p>
            </div>

            {/* CAMPO 2: ¿Cuánto te cuesta entregar el producto o servicio? */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-white">
                  2. ¿Cuánto te cuesta entregar el producto o servicio? ({currencyCode})
                </label>
                <span className="text-[10px] font-semibold uppercase text-[#CBD2DC] bg-[#0D0F12] px-2 py-0.5 rounded border border-[#292E36]">
                  Permite 0
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={
                  businessType === "services"
                    ? serviceInputs.serviceDeliveryCost
                    : ecommerceInputs.cogs
                }
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                  if (businessType === "services") {
                    onServiceChange({
                      ...serviceInputs,
                      serviceDeliveryCost: val,
                    });
                  } else {
                    onEcommerceChange({
                      ...ecommerceInputs,
                      cogs: val,
                    });
                  }
                }}
                placeholder="0"
                className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
              <p className="text-[11px] text-[#CBD2DC] mt-1.5">
                Materiales, fabricación, mano de obra, recursos o gastos necesarios para entregar lo que vendes.
              </p>
            </div>

            {/* CAMPO 3: ¿Tienes otros gastos por cada venta? */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-white">
                  3. ¿Tienes otros gastos por cada venta? ({currencyCode})
                </label>
                <span className="text-[10px] font-semibold uppercase text-[#CBD2DC] bg-[#0D0F12] px-2 py-0.5 rounded border border-[#292E36]">
                  Opcional
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={
                  businessType === "services"
                    ? serviceInputs.otherVariableCosts
                    : ecommerceInputs.otherVariableCosts
                }
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                  if (businessType === "services") {
                    onServiceChange({
                      ...serviceInputs,
                      otherVariableCosts: val,
                    });
                  } else {
                    onEcommerceChange({
                      ...ecommerceInputs,
                      otherVariableCosts: val,
                    });
                  }
                }}
                placeholder="0"
                className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
              <p className="text-[11px] text-[#CBD2DC] mt-1.5">
                Comisiones comerciales, empaques, envíos subsidiados, tarifas de pasarelas de pago u otros gastos que dependen de cada venta.
              </p>
            </div>
          </div>

          {/* COLLAPSIBLE SECTION: Configuración avanzada de rentabilidad */}
          <div className="bg-[#191C21] border border-[#292E36] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#0D0F12]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0D0F12] border border-[#292E36] flex items-center justify-center text-[#FF5A1F]">
                  <Sliders className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Configuración avanzada de rentabilidad (Opcional)
                  </h4>
                  <p className="text-[11px] text-[#CBD2DC] mt-0.5">
                    Recompra, LTV estimado, frecuencia de compra y desglose detallado de costos unitarios
                  </p>
                </div>
              </div>
              {advancedOpen ? (
                <ChevronUp className="w-5 h-5 text-[#FF5A1F] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#CBD2DC] shrink-0" />
              )}
            </button>

            {advancedOpen && (
              <div className="p-5 sm:p-6 border-t border-[#292E36] space-y-5 bg-[#0D0F12]/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Compras promedio por cliente / Frecuencia de recompra */}
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      Compras promedio por cliente (Recompra)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={avgPurchases}
                      onChange={(e) => {
                        const val = Math.max(1, parseFloat(e.target.value) || 1);
                        if (businessType === "services") {
                          onServiceChange({
                            ...serviceInputs,
                            averagePurchasesPerClient: val,
                          });
                        } else {
                          onEcommerceChange({
                            ...ecommerceInputs,
                            averagePurchasesPerClient: val,
                          });
                        }
                      }}
                      className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F]"
                    />
                    <p className="text-[10px] text-[#CBD2DC] mt-1">
                      1 = una sola compra. Si un cliente compra varias veces al año, indícalo para estimar su LTV.
                    </p>
                  </div>

                  {/* Otros costos unitarios avanzados */}
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                      Otros costos unitarios avanzados ({currencyCode})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={
                        businessType === "services"
                          ? serviceInputs.advancedUnitCost || 0
                          : ecommerceInputs.advancedUnitCost || 0
                      }
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        if (businessType === "services") {
                          onServiceChange({
                            ...serviceInputs,
                            advancedUnitCost: val,
                          });
                        } else {
                          onEcommerceChange({
                            ...ecommerceInputs,
                            advancedUnitCost: val,
                          });
                        }
                      }}
                      className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF5A1F]"
                    />
                    <p className="text-[10px] text-[#CBD2DC] mt-1">
                      Insumos extraordinarios, garantías o costos variables adicionales por unidad.
                    </p>
                  </div>
                </div>

                {/* Ecommerce specific breakdown if businessType === "ecommerce" */}
                {businessType === "ecommerce" && (
                  <div className="space-y-4 pt-3 border-t border-[#292E36]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A1F] block">
                      Desglose logístico y operativo de Ecommerce
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-white mb-1">
                          Empaque unitario ({currencyCode})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={ecommerceInputs.packagingCost}
                          onChange={(e) =>
                            onEcommerceChange({
                              ...ecommerceInputs,
                              packagingCost: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-white mb-1">
                          Envío asumido ({currencyCode})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={ecommerceInputs.shippingCostStore}
                          onChange={(e) =>
                            onEcommerceChange({
                              ...ecommerceInputs,
                              shippingCostStore: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-white mb-1">
                          Comisión pasarela (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={ecommerceInputs.gatewayFeePercentage}
                          onChange={(e) =>
                            onEcommerceChange({
                              ...ecommerceInputs,
                              gatewayFeePercentage: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-white mb-1">
                          % Cancelaciones previas a envío
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={ecommerceInputs.cancellationRatePercentage}
                          onChange={(e) =>
                            onEcommerceChange({
                              ...ecommerceInputs,
                              cancellationRatePercentage: Math.max(
                                0,
                                parseFloat(e.target.value) || 0
                              ),
                            })
                          }
                          className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-white mb-1">
                          % Devoluciones post-entrega
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={ecommerceInputs.returnRatePercentage}
                          onChange={(e) =>
                            onEcommerceChange({
                              ...ecommerceInputs,
                              returnRatePercentage: Math.max(
                                0,
                                parseFloat(e.target.value) || 0
                              ),
                            })
                          }
                          className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* LTV Estimated Preview Box (Separated from 1st Purchase Margin) */}
                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Valor de vida del cliente (LTV estimado en {avgPurchases} compra{avgPurchases !== 1 ? "s" : ""}):</span>
                    <span className="text-[#FF5A1F]">
                      {formatCurrency(ltvEstimatedRevenue, currencyCode)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#CBD2DC]">
                    <span>Margen acumulado por cliente (LTV):</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(ltvEstimatedMargin, currencyCode)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CBD2DC]/80 pt-1 border-t border-[#292E36]">
                    Nota: El cálculo principal de equilibrio publicitario se realiza de forma prudente sobre la primera compra ({formatCurrency(unitMargin, currencyCode)}) y el LTV se reporta por separado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Resultado automático: dinero disponible por venta (5 cols) */}
        <div className="lg:col-span-5 bg-[#191C21] border border-[#292E36] rounded-2xl p-6 flex flex-col justify-between space-y-5 sticky top-24">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#FF5A1F] font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-[#FF5A1F]" />
              Resultado automático por venta
            </div>

            {/* Breakdown rows */}
            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36] space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#CBD2DC]">
                <span>Precio de venta:</span>
                <span className="font-bold text-white text-sm">
                  {formatCurrency(unitPrice, currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#CBD2DC]">
                <span>Costo de entrega:</span>
                <span className="font-semibold text-white">
                  - {formatCurrency(deliveryCost, currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#CBD2DC]">
                <span>Otros gastos por venta:</span>
                <span className="font-semibold text-white">
                  - {formatCurrency(otherSaleCosts, currencyCode)}
                </span>
              </div>
            </div>

            {/* Highlighted Available Money per Sale Card */}
            <div className="bg-[#0D0F12] p-5 rounded-xl border-2 border-[#FF5A1F]/50 space-y-2">
              <span className="text-xs text-[#CBD2DC] block font-bold">
                Dinero disponible por venta antes de publicidad:
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    unitMargin > 0 ? "text-[#FF5A1F]" : "text-white opacity-80"
                  }`}
                >
                  {formatCurrency(unitMargin, currencyCode)}
                </span>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30">
                  Margen: {marginPct.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Plain-language explanation */}
            {unitPrice > 0 && unitMargin > 0 && (
              <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] text-xs text-white leading-relaxed">
                &ldquo;De cada{" "}
                <strong className="text-[#FF5A1F]">
                  {formatCurrency(unitPrice, currencyCode)}
                </strong>{" "}
                que cobras, tienes{" "}
                <strong className="text-[#FF5A1F]">
                  {formatCurrency(unitMargin, currencyCode)}
                </strong>{" "}
                disponibles para pagar publicidad y cubrir los gastos generales de tu negocio.&rdquo;
              </div>
            )}

            {/* 4 Margin States (Positivo, Bajo, Cero, Negativo) */}
            <div className="text-xs">
              {unitMargin < 0 ? (
                <div className="p-4 rounded-xl bg-[#FF5A1F]/15 border-2 border-[#FF5A1F] text-white flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-[#FF5A1F] mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-black text-[#FF5A1F] uppercase text-[11px] block">
                      Alerta de margen negativo
                    </span>
                    <p className="leading-relaxed">
                      Estás gastando más en entregar tu producto o servicio de lo que cobras. Antes de invertir en publicidad, revisa tu precio o tus costos.
                    </p>
                  </div>
                </div>
              ) : unitMargin === 0 ? (
                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#FF5A1F]/50 text-[#CBD2DC] flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-[#FF5A1F] mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">
                      Margen igual a cero
                    </span>
                    <p className="leading-relaxed">
                      No queda dinero disponible por venta para adquirir clientes ni pagar anuncios. Revisa tu precio o tus costos de entrega.
                    </p>
                  </div>
                </div>
              ) : marginPct < 30 ? (
                <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] text-[#CBD2DC] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF5A1F] mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">
                      Margen ajustado ({marginPct.toFixed(1)}%)
                    </span>
                    <span>
                      Te queda menos del 30% por venta. Te sugerimos revisar tus costos y el precio para contar con mayor margen al invertir en anuncios.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#FF5A1F]/30 text-white flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 text-[#FF5A1F] mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">
                      Diagnóstico favorable ({marginPct.toFixed(0)}%)
                    </span>
                    <span className="text-[#CBD2DC]">
                      Cuentas con un buen margen disponible por venta para invertir en la adquisición de clientes.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-[#CBD2DC] border-t border-[#292E36] pt-3 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0 mt-0.5" />
            <span>
              Este resultado representa el dinero disponible antes de publicidad y gastos generales. No debe confundirse con tu beneficio neto final.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto text-[#CBD2DC] hover:text-white text-sm font-semibold px-4 py-2 transition-colors text-center"
        >
          ← Volver a Tu Negocio
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all hover:scale-[1.02] text-center"
        >
          Continuar a Tus Gastos Mensuales →
        </button>
      </div>
    </div>
  );
}
