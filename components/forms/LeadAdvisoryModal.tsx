"use client";

import React, { useState } from "react";
import { FullCalculationResult } from "@/types/calculator";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { X, Send, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface LeadAdvisoryModalProps {
  simulationResult?: FullCalculationResult;
  onClose: () => void;
}

export default function LeadAdvisoryModal({
  simulationResult,
  onClose,
}: LeadAdvisoryModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [consentData, setConsentData] = useState(false);
  const [consentSimulation, setConsentSimulation] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const configuredWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setErrorMessage("Por favor completa los campos obligatorios: Nombre, WhatsApp y Correo.");
      return;
    }

    if (!consentData) {
      setErrorMessage("Debes aceptar la política de tratamiento de datos personales para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        company: company.trim() || null,
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        country: simulationResult?.inputs.countryCode || "General",
        business_type: simulationResult?.inputs.businessType || "services",
        sector: simulationResult?.inputs.sectorId || null,
        budget: simulationResult?.advertising.effectiveBudget || null,
        currency: simulationResult?.inputs.currencyCode || "USD",
        objective: simulationResult?.inputs.objective || "leads",
        message: message.trim() || null,
        consent: consentData,
        simulation_summary: consentSimulation && simulationResult
          ? {
              adSpend: simulationResult.advertising.effectiveBudget,
              netProfit: simulationResult.economics.netProfit,
              roas: simulationResult.profitability.roas,
              totalRoi: simulationResult.profitability.totalRoiPercentage,
              calculatedAt: simulationResult.calculatedAt,
            }
          : null,
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("lead_requests").insert([payload]);
        if (error) {
          console.error("Supabase error:", error);
        }
      } else {
        // Fallback local storage for offline / demonstration testing
        const stored = JSON.parse(localStorage.getItem("traffiker_leads") || "[]");
        stored.push({ ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() });
        localStorage.setItem("traffiker_leads", JSON.stringify(stored));
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Hubo un error al registrar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp click handler
  const handleWhatsAppDirect = () => {
    if (!configuredWhatsApp) {
      alert("El número de WhatsApp corporativo de Traffiker Digital está pendiente de configuración en las variables de entorno (NEXT_PUBLIC_WHATSAPP_NUMBER).");
      return;
    }

    const cleanNumber = configuredWhatsApp.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hola Traffiker Digital, mi nombre es ${name || "un anunciante"} y quiero solicitar una asesoría para gestionar mis campañas en Meta Ads.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-traffiker-gray hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-traffiker-dark border border-traffiker-orange/40 text-traffiker-orange rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">¡Solicitud Recibida!</h3>
            <p className="text-sm text-traffiker-gray leading-relaxed">
              Un especialista en Meta Ads de <strong>Traffiker Digital</strong> revisará tu modelo de negocio y se comunicará contigo vía WhatsApp o correo.
            </p>

            {configuredWhatsApp ? (
              <button
                onClick={handleWhatsAppDirect}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-traffiker-orange hover:bg-traffiker-orange-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Escribir ahora por WhatsApp
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-traffiker-dark text-xs text-traffiker-gray border border-traffiker-dark-border mt-3">
                <AlertCircle className="w-4 h-4 text-traffiker-orange inline mr-1" />
                Configuración: Número de WhatsApp corporativo pendiente por asignar en variables de entorno.
              </div>
            )}

            <button
              onClick={onClose}
              className="text-xs text-traffiker-gray hover:text-white underline mt-2 block mx-auto transition-colors"
            >
              Cerrar y volver a la calculadora
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-traffiker-orange">
                TRAFFIKER DIGITAL
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                ¿Quieres que gestionemos tus campañas?
              </h3>
              <p className="text-xs text-traffiker-gray mt-1 leading-relaxed">
                En Traffiker Digital te ayudamos a planificar, configurar, gestionar y optimizar campañas publicitarias para conseguir clientes y aumentar tus ventas.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-traffiker-dark border border-traffiker-orange/50 text-white text-xs">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-traffiker-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Empresa / Proyecto
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nombre de tu negocio"
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-traffiker-orange transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  WhatsApp con código de país *
                </label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-traffiker-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-traffiker-orange transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Comentarios o detalles de tu campaña
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos sobre tu oferta o tus metas comerciales..."
                className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-traffiker-orange transition-colors"
              />
            </div>

            {/* Consents */}
            <div className="space-y-2 pt-2 border-t border-traffiker-dark-border text-[11px] text-traffiker-gray">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentData}
                  onChange={(e) => setConsentData(e.target.checked)}
                  className="mt-0.5 rounded border-traffiker-dark-border text-traffiker-orange focus:ring-traffiker-orange"
                />
                <span>
                  Autorizo el tratamiento de mis datos de contacto por Traffiker Digital según la{" "}
                  <Link href="/privacy" target="_blank" className="text-traffiker-orange underline">
                    política de privacidad
                  </Link>
                  . *
                </span>
              </label>

              {simulationResult && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSimulation}
                    onChange={(e) => setConsentSimulation(e.target.checked)}
                    className="mt-0.5 rounded border-traffiker-dark-border text-traffiker-orange focus:ring-traffiker-orange"
                  />
                  <span>
                    Adjuntar los datos de mi simulación actual para que el equipo prepare una propuesta adaptada a mis números.
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-traffiker-orange hover:bg-traffiker-orange-hover disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-traffiker-orange/20 transition-all flex items-center justify-center gap-2 text-sm mt-3"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Enviando solicitud..." : "Enviar Solicitud a Traffiker Digital"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
