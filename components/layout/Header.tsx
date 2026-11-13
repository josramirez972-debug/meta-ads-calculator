"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  PhoneCall,
  Menu,
  X,
  Calculator,
  ChevronRight,
  LogOut,
  Lock,
  UserCheck,
} from "lucide-react";
import LeadAdvisoryModal from "../forms/LeadAdvisoryModal";
import {
  ActiveSession,
  clearSession,
  getActiveSession,
} from "@/lib/auth/provisional-auth";

export default function Header() {
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    setSession(getActiveSession());
    const handleAuthChange = () => {
      setSession(getActiveSession());
    };
    window.addEventListener("traffiker-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("traffiker-auth-change", handleAuthChange);
    };
  }, []);

  // Close off-canvas on window resize to desktop or Escape key
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scroll when off-canvas is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    clearSession();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0D0F12]/95 backdrop-blur-md border-b border-[#292E36] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF5A1F]/20 group-hover:scale-105 transition-transform shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-black tracking-wider text-[9px] sm:text-xs uppercase bg-[#FF5A1F]/15 text-[#FF5A1F] px-1.5 sm:px-2 py-0.5 rounded border border-[#FF5A1F]/30">
                      TRAFFIKER DIGITAL
                    </span>
                  </div>
                  <h1 className="text-xs sm:text-lg font-black tracking-tight text-white group-hover:text-[#FF5A1F] transition-colors leading-tight truncate mt-0.5">
                    META ADS <span className="text-[#FF5A1F]">ROI</span> CALCULATOR
                  </h1>
                </div>
              </Link>
            </div>

            {session ? (
              <>
                {/* Desktop Navigation (Authenticated) */}
                <nav className="hidden md:flex items-center gap-5">
                  <Link
                    href="/"
                    className="text-sm font-medium text-[#CBD2DC] hover:text-white transition-colors"
                  >
                    Calculadora
                  </Link>
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-[#CBD2DC] hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF5A1F]" />
                    Panel y Accesos
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-sm font-medium text-[#CBD2DC] hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#FF5A1F]" />
                    Metodología
                  </Link>

                  {/* Active User Badge & Logout */}
                  <div className="flex items-center gap-2 pl-2 border-l border-[#292E36]">
                    <div className="px-2.5 py-1.5 rounded-xl bg-[#191C21] border border-[#292E36] flex items-center gap-1.5 text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span className="text-white font-bold max-w-[130px] truncate">
                        {session.clientName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Cerrar sesión"
                      className="p-2 rounded-xl bg-[#191C21] hover:bg-[#292E36] text-[#CBD2DC] hover:text-white border border-[#292E36] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAdvisoryOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#e04e18] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Solicitar Asesoría
                  </button>
                </nav>

                {/* Mobile Hamburger Button */}
                <div className="flex md:hidden items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAdvisoryOpen(true)}
                    className="p-2.5 rounded-xl bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 active:scale-95 transition-transform"
                    aria-label="Solicitar asesoría"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2.5 rounded-xl bg-[#191C21] text-white hover:bg-[#292E36] border border-[#292E36] active:scale-95 transition-all"
                    aria-label="Abrir menú de navegación"
                    aria-expanded={mobileMenuOpen}
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              /* Unauthenticated Status Pill */
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#CBD2DC] bg-[#191C21] border border-[#292E36] px-3 py-1.5 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Acceso Privado</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* OFF-CANVAS DRAWER FOR MOBILE */}
      {session && (
        <div
          className={`fixed inset-0 z-50 md:hidden no-print transition-visibility duration-300 ${
            mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          {/* Subtle Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Sliding Off-Canvas Side Panel */}
          <aside
            className={`fixed top-0 right-0 bottom-0 w-[82vw] max-w-[320px] h-dvh bg-[#191C21] border-l border-[#292E36] p-5 flex flex-col justify-between shadow-2xl z-10 transform transition-transform duration-300 ease-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="space-y-6 overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#292E36] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5A1F] to-orange-600 flex items-center justify-center shadow-md shadow-[#FF5A1F]/20 shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#FF5A1F] tracking-wider block">
                      TRAFFIKER DIGITAL
                    </span>
                    <span className="text-xs font-black text-white block">
                      META ADS CALCULATOR
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-[#0D0F12] text-[#CBD2DC] hover:text-white border border-[#292E36] active:scale-95 transition-all"
                  aria-label="Cerrar menú"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Active Session Card */}
              <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#292E36] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#FF5A1F] block">
                    Sesión Activa ({session.role === "admin" ? "Admin" : "Invitado"})
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {session.clientName}
                  </span>
                  <span className="text-[11px] text-[#CBD2DC] truncate block">
                    {session.username}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-[#191C21] hover:bg-[#292E36] text-xs font-bold text-[#CBD2DC] hover:text-white border border-[#292E36] flex items-center gap-1 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  Salir
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#CBD2DC]/60 px-1 block">
                  Navegación
                </span>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#0D0F12] border border-[#292E36] text-white font-bold text-sm hover:border-[#FF5A1F]/50 active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
                      <Calculator className="w-4 h-4" />
                    </span>
                    <span>Calculadora ROI</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CBD2DC] group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#0D0F12] border border-[#292E36] text-[#CBD2DC] hover:text-white font-bold text-sm hover:border-[#FF5A1F]/50 active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#191C21] border border-[#292E36] flex items-center justify-center text-[#FF5A1F]">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <span>Panel y Accesos Provisionales</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CBD2DC] group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#0D0F12] border border-[#292E36] text-[#CBD2DC] hover:text-white font-bold text-sm hover:border-[#FF5A1F]/50 active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#191C21] border border-[#292E36] flex items-center justify-center text-[#FF5A1F]">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <span>Metodología y Privacidad</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CBD2DC] group-hover:text-white transition-colors" />
                </Link>
              </nav>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAdvisoryOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#FF5A1F] hover:bg-[#e04e18] text-white text-xs sm:text-sm font-extrabold px-4 py-3.5 rounded-xl shadow-lg shadow-[#FF5A1F]/25 active:scale-[0.98] transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Solicitar Asesoría Gratuita</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-[#292E36] space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-[#CBD2DC]">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                <span className="font-medium text-white">Motor Financiero Activo</span>
              </div>
              <p className="text-[10px] text-[#CBD2DC]/60 leading-relaxed">
                © 2026 Traffiker Digital. Proyecciones orientativas para Meta Ads.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Advisory Modal */}
      {isAdvisoryOpen && (
        <LeadAdvisoryModal onClose={() => setIsAdvisoryOpen(false)} />
      )}
    </>
  );
}
