"use client";

import React, { useState } from "react";
import { BusinessType, CampaignObjective } from "@/types/business";
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_CURRENCIES,
} from "@/lib/currency/countries";
import { SECTORS } from "@/lib/benchmarks/data";
import {
  Briefcase,
  ShoppingBag,
  CheckCircle2,
  Globe,
  DollarSign,
  Info,
  MessageCircle,
  Target,
  Users,
  TrendingUp,
  Layers,
  FileText,
  PhoneCall,
  CreditCard,
} from "lucide-react";

interface StepBusinessProps {
  businessType: BusinessType;
  countryCode: string;
  sectorId: string;
  productOrServiceName?: string;
  currencyCode: string;
  exchangeRate: number;
  objective: CampaignObjective;
  onChange: (type: BusinessType) => void;
  onCountryChange: (code: string) => void;
  onSectorChange: (sectorId: string) => void;
  onProductOrServiceNameChange?: (name: string) => void;
  onCurrencyChange: (currency: string, defaultRate: number) => void;
  onExchangeRateChange: (rate: number) => void;
  onObjectiveSelect: (obj: CampaignObjective) => void;
  onNext: () => void;
}

export default function StepBusiness({
  businessType,
  countryCode,
  sectorId,
  productOrServiceName = "",
  currencyCode,
  exchangeRate,
  objective,
  onChange,
  onCountryChange,
  onSectorChange,
  onProductOrServiceNameChange,
  onCurrencyChange,
  onExchangeRateChange,
  onObjectiveSelect,
  onNext,
}: StepBusinessProps) {
  const [selectedChannelKey, setSelectedChannelKey] = useState<string>(
    businessType === "services" ? "whatsapp" : "store_checkout"
  );

  const filteredSectors = SECTORS.filter((s) => s.businessType === businessType);

  const handleBusinessTypeSelect = (type: BusinessType) => {
    onChange(type);
    const defaultSector = SECTORS.find((s) => s.businessType === type);
    if (defaultSector) {
      onSectorChange(defaultSector.id);
    }
    if (type === "services") {
      setSelectedChannelKey("whatsapp");
      onObjectiveSelect("whatsapp");
    } else {
      setSelectedChannelKey("store_checkout");
      onObjectiveSelect("ecommerce_sales");
    }
  };

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

  // Channels tailored specifically by business model (never mixing service vs ecommerce funnels)
  const serviceChannels: {
    key: string;
    objective: CampaignObjective;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "whatsapp",
      objective: "whatsapp",
      title: "WhatsApp",
      desc: "Conversaciones directas en WhatsApp para responder dudas y cerrar clientes.",
      icon: <MessageCircle className="w-4 h-4 text-[#FF5A1F]" />,
    },
    {
      key: "instagram_dm",
      objective: "instagram_direct",
      title: "Instagram DM",
      desc: "Mensajes directos en Instagram para iniciar la conversación comercial.",
      icon: <MessageCircle className="w-4 h-4 text-[#FF5A1F]" />,
    },
    {
      key: "forms",
      objective: "forms",
      title: "Formularios instantáneos",
      desc: "Captación de datos (nombre, teléfono, correo) sin salir de Facebook o Instagram.",
      icon: <FileText className="w-4 h-4 text-[#FF5A1F]" />,
    },
    {
      key: "landing_page",
      objective: "leads",
      title: "Landing Pages (Páginas de captura)",
      desc: "Página web dedicada a presentar tu oferta y filtrar prospectos calificados.",
      icon: <Target className="w-4 h-4 text-[#FF5A1F]" />,
    },
    {
      key: "calls_advisory",
      objective: "conversions",
      title: "Llamadas o asesorías agendadas",
      desc: "Agendamiento directo para sesiones estratégicas, consultas o diagnósticos.",
      icon: <PhoneCall className="w-4 h-4 text-[#FF5A1F]" />,
    },
  ];

  const ecommerceChannels: {
    key: string;
    objective: CampaignObjective;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "store_checkout",
      objective: "ecommerce_sales",
      title: "Compras en tienda y Checkout",
      desc: "Clientes que agregan productos al carrito y pagan directamente en tu sitio web.",
      icon: <CreditCard className="w-4 h-4 text-[#FF5A1F]" />,
    },
    {
      key: "visit_conversion",
      objective: "conversions",
      title: "Conversión de visitas a compras",
      desc: "Campañas de catálogo y remarketing enfocadas en convertir visitantes en pedidos.",
      icon: <ShoppingBag className="w-4 h-4 text-[#FF5A1F]" />,
    },
    {
      key: "whatsapp_orders",
      objective: "whatsapp",
      title: "Pedidos asistidos por WhatsApp",
      desc: "Catálogo con cierre de pedidos y pago contra entrega o transferencia por chat.",
      icon: <MessageCircle className="w-4 h-4 text-[#FF5A1F]" />,
    },
  ];

  const activeChannels =
    businessType === "services" ? serviceChannels : ecommerceChannels;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-3 py-1 rounded-full mb-2">
          Paso 1 de 7 • Tu Negocio
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Cuéntanos sobre tu negocio
        </h2>
        <p className="text-sm text-[#CBD2DC] mt-2 leading-relaxed">
          Selecciona qué vendes, en qué país operas y por cuál canal recibirás a tus clientes para adaptar el embudo de Meta Ads a tu realidad.
        </p>
      </div>

      {/* 1. SELECCIÓN DEL MODELO DE NEGOCIO */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          1. ¿Qué tipo de modelo de negocio tienes?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Services Card */}
          <button
            type="button"
            onClick={() => handleBusinessTypeSelect("services")}
            className={`relative p-5 sm:p-6 rounded-2xl border text-left transition-all group ${
              businessType === "services"
                ? "bg-[#191C21] border-[#FF5A1F] ring-1 ring-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/10"
                : "bg-[#191C21] border-[#292E36] hover:border-[#CBD2DC]/50"
            }`}
          >
            {businessType === "services" && (
              <div className="absolute top-4 right-4 text-[#FF5A1F]">
                <CheckCircle2 className="w-6 h-6 fill-[#FF5A1F] text-[#0D0F12]" />
              </div>
            )}
            <div className="w-11 h-11 rounded-xl bg-[#0D0F12] border border-[#292E36] text-[#FF5A1F] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
              Servicios y Productos Digitales
            </h3>
            <p className="text-xs text-[#CBD2DC] leading-relaxed mb-3">
              Consultoría, agencias, clínicas, bienes raíces, educación, cursos online, software y servicios profesionales.
            </p>
            <div className="text-[11px] font-mono text-[#CBD2DC] bg-[#0D0F12] p-2.5 rounded-xl border border-[#292E36]">
              <span className="text-[#FF5A1F] font-bold block mb-0.5">
                Embudo de Servicios:
              </span>
              Anuncios → Clics → Contactos → Calificados → Clientes
            </div>
          </button>

          {/* Ecommerce Card */}
          <button
            type="button"
            onClick={() => handleBusinessTypeSelect("ecommerce")}
            className={`relative p-5 sm:p-6 rounded-2xl border text-left transition-all group ${
              businessType === "ecommerce"
                ? "bg-[#191C21] border-[#FF5A1F] ring-1 ring-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/10"
                : "bg-[#191C21] border-[#292E36] hover:border-[#CBD2DC]/50"
            }`}
          >
            {businessType === "ecommerce" && (
              <div className="absolute top-4 right-4 text-[#FF5A1F]">
                <CheckCircle2 className="w-6 h-6 fill-[#FF5A1F] text-[#0D0F12]" />
              </div>
            )}
            <div className="w-11 h-11 rounded-xl bg-[#0D0F12] border border-[#292E36] text-[#FF5A1F] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
              Productos Físicos y Ecommerce
            </h3>
            <p className="text-xs text-[#CBD2DC] leading-relaxed mb-3">
              Tiendas online, moda, calzado, cosméticos, tecnología, hogar, suplementos y comercio con despacho de mercancía.
            </p>
            <div className="text-[11px] font-mono text-[#CBD2DC] bg-[#0D0F12] p-2.5 rounded-xl border border-[#292E36]">
              <span className="text-[#FF5A1F] font-bold block mb-0.5">
                Embudo de Ecommerce:
              </span>
              Anuncios → Visitas a tienda → Checkout → Ventas netas
            </div>
          </button>
        </div>
      </div>

      {/* 2. PAÍS, INDUSTRIA Y MONEDA */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Country Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#FF5A1F]" />
              2. País o mercado donde anuncias
            </label>
            <select
              value={countryCode}
              onChange={handleCountrySelect}
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.currencyCode})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Puedes seleccionar tu país local o mercados internacionales donde mostrarás tus anuncios.
            </p>
          </div>

          {/* Sector Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#FF5A1F]" />
              3. Sector o industria
            </label>
            <select
              value={sectorId}
              onChange={(e) => onSectorChange(e.target.value)}
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
            >
              {filteredSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Nos permite ajustar las referencias de costos publicitarios y conversión a tu sector.
            </p>
          </div>
        </div>

        {/* Specific Product/Service Type & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-[#292E36] pt-5">
          {/* Tipo de producto o servicio */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              4. ¿Qué producto o servicio vendes?
            </label>
            <input
              type="text"
              value={productOrServiceName}
              onChange={(e) =>
                onProductOrServiceNameChange &&
                onProductOrServiceNameChange(e.target.value)
              }
              placeholder={
                businessType === "services"
                  ? "Ej: Diseño sonrisa, Asesoría..."
                  : "Ej: Calzado, Skincare..."
              }
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Opcional: ayuda a personalizar tu informe.
            </p>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#FF5A1F]" />
              5. Moneda de operación
            </label>
            <select
              value={currencyCode}
              onChange={handleCurrencySelect}
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} — {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Moneda en la que cobras y analizarás tus costos.
            </p>
          </div>

          {/* Exchange Rate */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tasa ref (1 USD = {currencyCode})</span>
              <span className="text-[10px] text-[#FF5A1F] font-semibold">Editable</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(parseFloat(e.target.value) || 1)}
              className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            <p className="text-[11px] text-[#CBD2DC] mt-1.5">
              Para estandarizar referencias internacionales.
            </p>
          </div>
        </div>
      </div>

      {/* 3. OBJETIVO PUBLICITARIO Y CANAL DE RECEPCIÓN DE CLIENTES */}
      <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            6. ¿Por qué canal recibirás a tus clientes con tus anuncios?
          </label>
          <p className="text-xs text-[#CBD2DC] mt-1">
            {businessType === "services"
              ? "Selecciona a dónde llevarás a las personas interesadas en contratar tu servicio:"
              : "Selecciona cómo realizarán la compra los visitantes de tu tienda:"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeChannels.map((ch) => {
            const isSelected =
              selectedChannelKey === ch.key ||
              (selectedChannelKey === "" && objective === ch.objective);
            return (
              <button
                key={ch.key}
                type="button"
                onClick={() => {
                  setSelectedChannelKey(ch.key);
                  onObjectiveSelect(ch.objective);
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? "bg-[#0D0F12] border-[#FF5A1F] ring-1 ring-[#FF5A1F] text-white"
                    : "bg-[#0D0F12]/60 border-[#292E36] text-[#CBD2DC] hover:text-white hover:border-[#CBD2DC]/40"
                }`}
              >
                <span className="p-2 rounded-lg bg-[#191C21] border border-[#292E36] shrink-0 mt-0.5">
                  {ch.icon}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {ch.title}
                  </h4>
                  <p className="text-[11px] text-[#CBD2DC] leading-relaxed mt-1">
                    {ch.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all hover:scale-[1.02] text-center"
        >
          Continuar a Cuánto Ganas por Venta →
        </button>
      </div>
    </div>
  );
}
