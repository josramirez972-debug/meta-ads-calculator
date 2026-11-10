"use client";

import React from "react";
import {
  BusinessType,
  ServiceEconomicsInputs,
  EcommerceEconomicsInputs,
  CustomMonthlyExpenseItem,
} from "@/types/calculator";
import { formatCurrency } from "@/lib/currency/countries";
import {
  Receipt,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  Wrench,
  Layers,
} from "lucide-react";

interface StepMonthlyExpensesProps {
  businessType: BusinessType;
  currencyCode: string;
  serviceInputs: ServiceEconomicsInputs;
  ecommerceInputs: EcommerceEconomicsInputs;
  onServiceChange: (inputs: ServiceEconomicsInputs) => void;
  onEcommerceChange: (inputs: EcommerceEconomicsInputs) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepMonthlyExpenses({
  businessType,
  currencyCode,
  serviceInputs,
  ecommerceInputs,
  onServiceChange,
  onEcommerceChange,
  onNext,
  onBack,
}: StepMonthlyExpensesProps) {
  const isServices = businessType === "services";

  const managementFee = isServices
    ? Math.max(0, serviceInputs.managementFee || 0)
    : Math.max(0, ecommerceInputs.managementFee || 0);

  const toolsCost = isServices
    ? Math.max(0, serviceInputs.fixedCampaignCosts || 0)
    : Math.max(0, ecommerceInputs.fixedCampaignCosts || 0);

  const otherMonthly = isServices
    ? Math.max(0, serviceInputs.otherMonthlyExpenses || 0)
    : Math.max(0, ecommerceInputs.otherMonthlyExpenses || 0);

  const customItems: CustomMonthlyExpenseItem[] = isServices
    ? serviceInputs.customMonthlyExpenses || []
    : ecommerceInputs.customMonthlyExpenses || [];

  const customTotal = customItems.reduce(
    (sum, item) => sum + Math.max(0, item.amount || 0),
    0
  );

  const totalMonthlyExpenses =
    managementFee + toolsCost + otherMonthly + customTotal;

  const updateField = (
    field: "managementFee" | "fixedCampaignCosts" | "otherMonthlyExpenses",
    val: number
  ) => {
    if (isServices) {
      onServiceChange({
        ...serviceInputs,
        [field]: val,
      });
    } else {
      onEcommerceChange({
        ...ecommerceInputs,
        [field]: val,
      });
    }
  };

  const handleAddCustomExpense = () => {
    const newItem: CustomMonthlyExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "",
      amount: 0,
    };
    const nextList = [...customItems, newItem];
    if (isServices) {
      onServiceChange({
        ...serviceInputs,
        customMonthlyExpenses: nextList,
      });
    } else {
      onEcommerceChange({
        ...ecommerceInputs,
        customMonthlyExpenses: nextList,
      });
    }
  };

  const handleUpdateCustomExpense = (
    id: string,
    patch: Partial<CustomMonthlyExpenseItem>
  ) => {
    const nextList = customItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    if (isServices) {
      onServiceChange({
        ...serviceInputs,
        customMonthlyExpenses: nextList,
      });
    } else {
      onEcommerceChange({
        ...ecommerceInputs,
        customMonthlyExpenses: nextList,
      });
    }
  };

  const handleRemoveCustomExpense = (id: string) => {
    const nextList = customItems.filter((item) => item.id !== id);
    if (isServices) {
      onServiceChange({
        ...serviceInputs,
        customMonthlyExpenses: nextList,
      });
    } else {
      onEcommerceChange({
        ...ecommerceInputs,
        customMonthlyExpenses: nextList,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-3 py-1 rounded-full mb-2">
          Paso 3 de 7 • Tus Gastos Mensuales
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Cuánto gastas al mes para mantener tu negocio?
        </h2>
        <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
          Estos son gastos que debes cubrir independientemente de cuántas ventas consigas. Si no tienes alguno, puedes dejarlo en cero.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 3 Monthly Fields + Dynamic Extra Rows (7 cols) */}
        <div className="lg:col-span-7 bg-[#191C21] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Field 1: ¿Cuánto pagas por administrar tus anuncios? */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF5A1F]" />
                1. ¿Cuánto pagas por administrar tus anuncios? ({currencyCode})
              </label>
              <span className="text-[10px] font-semibold uppercase text-[#CBD2DC] bg-[#0D0F12] px-2 py-0.5 rounded border border-[#292E36]">
                Permite 0
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              value={managementFee}
              onChange={(e) =>
                updateField(
                  "managementFee",
                  e.target.value === ""
                    ? 0
                    : Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              placeholder="0"
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Ejemplo: honorarios mensuales de agencia o profesional de marketing (no incluye el dinero que se paga a Meta por los anuncios).
            </p>
          </div>

          {/* Field 2: ¿Cuánto gastas en herramientas y plataformas? */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#FF5A1F]" />
                2. ¿Cuánto gastas en herramientas y plataformas? ({currencyCode})
              </label>
              <span className="text-[10px] font-semibold uppercase text-[#CBD2DC] bg-[#0D0F12] px-2 py-0.5 rounded border border-[#292E36]">
                Permite 0
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              value={toolsCost}
              onChange={(e) =>
                updateField(
                  "fixedCampaignCosts",
                  e.target.value === ""
                    ? 0
                    : Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              placeholder="0"
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Ejemplo: software, CRM, hosting, tienda online, plataformas y suscripciones mensuales.
            </p>
          </div>

          {/* Field 3: ¿Tienes otros gastos mensuales? */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#FF5A1F]" />
                3. ¿Tienes otros gastos mensuales? ({currencyCode})
              </label>
              <span className="text-[10px] font-semibold uppercase text-[#CBD2DC] bg-[#0D0F12] px-2 py-0.5 rounded border border-[#292E36]">
                Opcional
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              value={otherMonthly}
              onChange={(e) =>
                updateField(
                  "otherMonthlyExpenses",
                  e.target.value === ""
                    ? 0
                    : Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              placeholder="0"
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Otros gastos generales del mes que quieras considerar dentro de tu proyección.
            </p>
          </div>

          {/* Dynamic Custom Monthly Expense Items */}
          {customItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#292E36]">
              <span className="text-xs font-bold text-white block">
                Gastos mensuales adicionales detallados:
              </span>
              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#0D0F12] p-3 rounded-xl border border-[#292E36]"
                >
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleUpdateCustomExpense(item.id, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Nombre del gasto (ej. Internet, Asistente)"
                      className="w-full bg-[#191C21] border border-[#292E36] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.amount === 0 ? "" : item.amount}
                      onChange={(e) =>
                        handleUpdateCustomExpense(item.id, {
                          amount: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      placeholder={`Monto (${currencyCode})`}
                      className="w-full bg-[#191C21] border border-[#292E36] rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomExpense(item.id)}
                      className="p-2 rounded-lg text-[#CBD2DC] hover:text-[#FF5A1F] hover:bg-[#191C21] transition-colors"
                      aria-label="Eliminar gasto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Button to add more monthly expenses */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleAddCustomExpense}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5A1F] hover:text-white bg-[#0D0F12] hover:bg-[#292E36] border border-[#292E36] px-4 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar otro gasto mensual</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Total Monthly Expenses Summary Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#191C21] border border-[#292E36] rounded-2xl p-6 flex flex-col justify-between space-y-5 sticky top-24">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#FF5A1F] font-bold text-xs uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-[#FF5A1F]" />
              Resumen de gastos mensuales
            </div>

            <div className="bg-[#0D0F12] p-4 rounded-xl border border-[#292E36] space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#CBD2DC]">
                <span>Administración de anuncios:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(managementFee, currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#CBD2DC]">
                <span>Herramientas y plataformas:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(toolsCost, currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#CBD2DC]">
                <span>Otros gastos mensuales:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(otherMonthly + customTotal, currencyCode)}
                </span>
              </div>
            </div>

            <div className="bg-[#0D0F12] p-5 rounded-xl border-2 border-[#FF5A1F]/40 space-y-1.5">
              <span className="text-xs text-[#CBD2DC] block font-bold">
                Total de gastos mensuales:
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {formatCurrency(totalMonthlyExpenses, currencyCode)}
              </div>
              <span className="text-[11px] text-[#CBD2DC] block">
                Se descontarán al final para calcular el beneficio neto real de tu negocio.
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#CBD2DC] border-t border-[#292E36] pt-3 space-y-1.5">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Sin doble contabilización:</strong> Estos gastos fijos no reducen tu dinero disponible por cada venta ni se mezclan con el presupuesto pagado a Meta Ads.
              </span>
            </div>
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
          ← Volver a Cuánto Ganas por Venta
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all hover:scale-[1.02] text-center"
        >
          Continuar a Tu Objetivo Comercial →
        </button>
      </div>
    </div>
  );
}
