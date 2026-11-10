import React from "react";
import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-traffiker-dark-border bg-traffiker-dark-card text-traffiker-gray py-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-white tracking-tight">TRAFFIKER DIGITAL</span>
              <span className="text-xs bg-traffiker-dark text-traffiker-orange px-2 py-0.5 rounded font-mono font-bold border border-traffiker-orange/30">
                ROI LABS
              </span>
            </div>
            <p className="text-sm text-traffiker-gray leading-relaxed">
              Herramienta profesional de ingeniería publicitaria y finanzas de rendimiento para anunciantes de Facebook e Instagram en Latinoamérica y el mundo.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-traffiker-orange" /> Transparencia y Datos
            </h4>
            <p className="text-sm text-traffiker-gray leading-relaxed">
              Cálculo 100% público y gratuito sin registro forzoso. Los resultados son proyecciones matemáticas sujetas al rendimiento real de la oferta, el mercado y las conversiones.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-traffiker-orange" /> Gestión de Campañas
            </h4>
            <p className="text-sm text-traffiker-gray mb-3">
              ¿Buscas optimizar tu CPA y escalar tu facturación? Nuestro equipo gestiona y audita tu inversión.
            </p>
            <Link
              href="/privacy"
              className="text-xs text-traffiker-orange hover:underline inline-block mr-4"
            >
              Políticas de Privacidad
            </Link>
            <Link
              href="/admin"
              className="text-xs text-traffiker-gray hover:text-white inline-block transition-colors"
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-traffiker-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-traffiker-gray/70 gap-2">
          <p>© {new Date().getFullYear()} Traffiker Digital. Todos los derechos reservados.</p>
          <p>Meta Ads es una marca registrada de Meta Platforms, Inc. Traffiker Digital opera de manera independiente.</p>
        </div>
      </div>
    </footer>
  );
}
