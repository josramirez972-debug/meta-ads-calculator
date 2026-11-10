"use client";

import React from "react";
import { BusinessType } from "@/types/business";
import { SUPPORTED_COUNTRIES, SUPPORTED_CURRENCIES } from "@/lib/currency/countries";
import { SECTORS } from "@/lib/benchmarks/data";
import { Globe, DollarSign, Info } from "lucide-react";

interface StepMarketProps {
  businessType: BusinessType;
  countryCode: string;
  sectorId: string;
  currencyCode: string;
  exchangeRate: number;
  onCountryChange: (code: string) => void;
  onSectorChange: (sectorId: string) => void;
  onCurrencyChange: (currency: string, defaultRate: number) => void;
  onExchangeRateChange: (rate: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepMarket({
  businessType,
  countryCode,
  sectorId,
  currencyCode,
  exchangeRate,
  onCountryChange,
  onSectorChange,
  onCurrencyChange,
  onExchangeRateChange,
  onNext,
  onBack,
}: StepMarketProps) {
  const filteredSectors = SECTORS.filter((s) => s.businessType === businessType);

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    onCountryChange(code);
    const country = SUPPORTED_COUNTRIES.find((c) => c.code === code);
    if (country) {
      onCurrencyChange(country.currencyCode, country.defaultExchangeRateToUSD);
    }
  };

  const handleCurrencySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const curr = SUPPORTED_CURRENCIES[code];
    if (curr) {
      onCurrencyChange(code, curr.exchangeRateToUSD);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">
          Paso 2: ¿En qué mercado y moneda vas a operar?
        </h2>
        <p className="text-sm text-traffiker-gray mt-2 leading-relaxed">
          Los costos publicitarios y el comportamiento de compra varían notablemente según el país.
        </p>
      </div>

      <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Country Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-traffiker-orange" />
              País donde se mostrarán tus anuncios
            </label>
            <select
              value={countryCode}
              onChange={handleCountrySelect}
              className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-traffiker-orange transition-colors"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.currencyCode})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-traffiker-gray mt-1.5">
              Determina los costos de referencia por cada mil impresiones (CPM) en Facebook e Instagram.
            </p>
          </div>

          {/* Sector Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Sector o categoría de tu negocio
            </label>
            <select
              value={sectorId}
              onChange={(e) => onSectorChange(e.target.value)}
              className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-traffiker-orange transition-colors"
            >
              {filteredSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-traffiker-gray mt-1.5">
              Nos ayuda a sugerirte tasas de conversión promedio para tu nicho.
            </p>
          </div>
        </div>

        <div className="border-t border-traffiker-dark-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-traffiker-orange" />
              Moneda de tus cálculos
            </label>
            <select
              value={currencyCode}
              onChange={handleCurrencySelect}
              className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-traffiker-orange transition-colors"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} — {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-traffiker-gray mt-1.5">
              Todos los precios, costos y beneficios se mostrarán en esta moneda.
            </p>
          </div>

          {/* Exchange Rate (Editable) */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tasa de cambio (1 USD = X {currencyCode})</span>
              <span className="text-[11px] text-traffiker-orange font-normal">Editable</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(parseFloat(e.target.value) || 1)}
              className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-traffiker-orange transition-colors"
            />
            <div className="flex items-start gap-1.5 text-[11px] text-traffiker-gray mt-1.5">
              <Info className="w-3.5 h-3.5 text-traffiker-orange shrink-0 mt-0.5" />
              <span>
                Supuesto de conversión referencial para estandarizar tus cálculos.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto text-[#CBD2DC] hover:text-white text-sm font-semibold px-4 py-2 transition-colors text-center"
        >
          ← Volver
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-[#FF5A1F]/20 transition-all hover:scale-105 text-center"
        >
          Continuar a Ganancia por Venta →
        </button>
      </div>
    </div>
  );
}
