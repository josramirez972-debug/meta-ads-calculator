"use client";

import React, { useState, useEffect } from "react";
import {
  ActiveSession,
  authenticateUser,
  getActiveSession,
  saveSession,
  verifyPortableInviteToken,
} from "@/lib/auth/provisional-auth";
import {
  Lock,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  KeyRound,
} from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  useEffect(() => {
    // 1. Check if URL has an ?invite=... portable token
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteToken = params.get("invite");
      if (inviteToken) {
        const verified = verifyPortableInviteToken(inviteToken);
        if (verified.valid && verified.session) {
          saveSession(verified.session);
          setSession(verified.session);
          // Clean URL query param without reloading
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
          setIsChecking(false);
          return;
        } else if (verified.error) {
          setErrorMsg(verified.error);
        }
      }
    }

    // 2. Check existing active session in localStorage
    const current = getActiveSession();
    setSession(current);
    setIsChecking(false);

    // Listen to auth changes (e.g., logout from Header or Admin)
    const handleAuthChange = () => {
      setSession(getActiveSession());
    };
    window.addEventListener("traffiker-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("traffiker-auth-change", handleAuthChange);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (inviteMode) {
      const cleanToken = inviteCodeInput.trim();
      // If user pasted a full URL, extract ?invite=
      let extractedToken = cleanToken;
      if (cleanToken.includes("invite=")) {
        try {
          const urlObj = new URL(cleanToken);
          extractedToken = urlObj.searchParams.get("invite") || cleanToken;
        } catch {
          const parts = cleanToken.split("invite=");
          extractedToken = parts[1]?.split("&")[0] || cleanToken;
        }
      }
      const res = verifyPortableInviteToken(extractedToken);
      if (res.valid && res.session) {
        saveSession(res.session);
        setSession(res.session);
      } else {
        setErrorMsg(res.error || "Código de invitación inválido o expirado.");
      }
      return;
    }

    const res = authenticateUser(username, password);
    if (res.success && res.session) {
      setSession(res.session);
    } else {
      setErrorMsg(res.error || "Credenciales inválidas.");
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#191C21] border border-[#FF5A1F]/40 flex items-center justify-center text-[#FF5A1F] animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#CBD2DC]">
            Verificando sesión de acceso...
          </span>
        </div>
      </div>
    );
  }

  // If NOT authenticated, render the full Private MVP Login Gate
  if (!session) {
    return (
      <div className="min-h-[78vh] flex items-center justify-center py-8 px-3">
        <div className="w-full max-w-md bg-[#191C21] border border-[#292E36] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF5A1F]/25 mx-auto">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-[#FF5A1F]/15 text-[#FF5A1F] px-3 py-1 rounded-full border border-[#FF5A1F]/30">
                <Lock className="w-3 h-3" />
                ACCESO PRIVADO • MVP EN PRUEBAS
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight pt-1">
                META ADS <span className="text-[#FF5A1F]">ROI</span> CALCULATOR
              </h2>
              <p className="text-xs text-[#CBD2DC] leading-relaxed">
                Herramienta exclusiva de planificación financiera de{" "}
                <strong className="text-white">Traffiker Digital</strong>. Ingresa con tus credenciales o tu acceso provisional de cliente.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#FF5A1F] text-xs text-white flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {!inviteMode ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Usuario o Correo Electrónico
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: admin o nombre de tu empresa"
                    className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Contraseña / Clave de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Introduce tu clave..."
                      className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl pl-4 pr-11 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD2DC] hover:text-white p-1"
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Código o Enlace de Invitación
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteMode(false);
                      setErrorMsg("");
                    }}
                    className="text-[11px] text-[#FF5A1F] hover:underline"
                  >
                    ← Volver a usuario y clave
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="Pega aquí el código o enlace provisional que te envió Traffiker Digital..."
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl p-3.5 text-white text-xs font-mono focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-black py-3.5 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>INGRESAR A LA CALCULADORA</span>
            </button>

            {!inviteMode && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setInviteMode(true);
                    setErrorMsg("");
                  }}
                  className="text-xs text-[#CBD2DC] hover:text-[#FF5A1F] transition-colors inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>¿Tienes un código o enlace de invitación?</span>
                </button>
              </div>
            )}
          </form>

          {/* Footer info */}
          <div className="pt-4 border-t border-[#292E36] text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#CBD2DC]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>¿Necesitas un acceso provisional para tu negocio?</span>
            </div>
            <p className="text-[11px] text-[#CBD2DC]/70">
              Solicita tus credenciales temporales directamente al equipo de{" "}
              <strong className="text-white">Traffiker Digital</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
