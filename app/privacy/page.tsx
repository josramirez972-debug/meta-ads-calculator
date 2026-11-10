import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <div className="border-b border-traffiker-dark-border pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-traffiker-orange hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a la Calculadora
        </Link>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Transparencia, Metodología y Política de Privacidad
        </h1>
        <p className="text-sm text-traffiker-gray mt-2">
          En <strong>Traffiker Digital</strong> creemos en la transparencia absoluta tanto en la ingeniería financiera publicitaria como en la protección de tus datos comerciales.
        </p>
      </div>

      {/* Methodology Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-traffiker-orange" />
          1. Metodología del Motor Matemático
        </h2>
        <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-6 text-sm text-traffiker-gray leading-relaxed space-y-3">
          <p>
            La calculadora opera como un motor determinístico y financiero basado en microeconomía unitaria y modelos de conversión de Meta Ads (Facebook e Instagram):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-traffiker-gray">
            <li>
              <strong className="text-white">Distinción ROAS vs ROI:</strong> El ROAS mide únicamente la relación entre ingresos brutos y gasto en medios (<em>Ingresos / Gasto</em>). El ROI mide el rendimiento del capital invertido tras deducir costos de mercancía, prestación del servicio y honorarios fijos.
            </li>
            <li>
              <strong className="text-white">Tratamiento de Cancelaciones y Devoluciones en Ecommerce:</strong> Se calculan de forma secuencial y no superpuesta para evitar dobles deducciones sobre pedidos no expedidos o devueltos.
            </li>
            <li>
              <strong className="text-white">Punto de Equilibrio (Break-Even):</strong> Determina el CPA máximo permitido equivalente al margen de contribución unitario, garantizando que el usuario conozca su límite antes de entrar en pérdidas.
            </li>
            <li>
              <strong className="text-white">Benchmarks Orientativos:</strong> Las métricas iniciales sugeridas son referencias de mercado agregadas identificadas claramente por fecha y país. No constituyen una promesa ni estadística oficial de Meta Platforms, Inc.
            </li>
          </ul>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-traffiker-orange" />
          2. Tratamiento de Datos Personales y Cookies
        </h2>
        <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-6 text-sm text-traffiker-gray leading-relaxed space-y-4">
          <p>
            El uso de la calculadora es <strong className="text-white">público y 100% anónimo</strong>. No requerimos registro previo, ni datos de tarjeta de crédito, ni descarga forzosa para ver proyecciones y gráficos.
          </p>
          <div>
            <h3 className="font-bold text-white mb-1">Captación de Prospectos Comercial</h3>
            <p className="text-traffiker-gray">
              Cuando el usuario decide voluntariamente solicitar una asesoría o propuesta de gestión de campañas con Traffiker Digital, los datos suministrados (Nombre, WhatsApp, Correo, Empresa) son almacenados de forma segura con cifrado en reposo y exclusivamente utilizados para contactar al titular.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Consentimiento de Simulación</h3>
            <p className="text-traffiker-gray">
              Solo se guardan las variables de la simulación publicitaria si el usuario marca explícitamente la casilla de consentimiento para que el equipo prepare un diagnóstico adaptado.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-traffiker-orange" />
          3. Contacto y Ejercicio de Derechos (Habeas Data)
        </h2>
        <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-6 text-sm text-traffiker-gray leading-relaxed">
          <p>
            Cualquier titular de datos puede solicitar la rectificación, actualización o eliminación de su información registrada contactándonos a través del canal oficial de Traffiker Digital.
          </p>
        </div>
      </section>
    </div>
  );
}
