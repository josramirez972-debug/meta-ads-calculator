"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_BENCHMARKS } from "@/lib/benchmarks/data";
import { BenchmarkRecord } from "@/types/benchmarks";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ProvisionalUser,
  getProvisionalUsers,
  createProvisionalUser,
  toggleProvisionalUserStatus,
  deleteProvisionalUser,
  generatePortableInviteToken,
  getActiveSession,
} from "@/lib/auth/provisional-auth";
import {
  ShieldCheck,
  Lock,
  Users,
  Sliders,
  Sparkles,
  Search,
  CheckCircle2,
  Eye,
  LogOut,
  KeyRound,
  UserPlus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Share2,
} from "lucide-react";

interface LeadRecord {
  id: string;
  name: string;
  company?: string;
  email: string;
  whatsapp: string;
  country: string;
  business_type: string;
  sector?: string;
  budget?: number;
  currency: string;
  objective: string;
  message?: string;
  consent: boolean;
  simulation_summary?: {
    adSpend: number;
    netProfit: number;
    roas: number;
    totalRoi: number;
    calculatedAt: string;
  };
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [activeTab, setActiveTab] = useState<
    "access" | "leads" | "benchmarks" | "scenarios"
  >("access");

  // Provisional Users State
  const [provisionalUsers, setProvisionalUsers] = useState<ProvisionalUser[]>([]);
  const [newClientName, setNewClientName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newValidDays, setNewValidDays] = useState<number>(15);
  const [newNotes, setNewNotes] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Leads
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Benchmarks
  const [benchmarks, setBenchmarks] = useState<BenchmarkRecord[]>(INITIAL_BENCHMARKS);
  const [scenarioSettings, setScenarioSettings] = useState({
    pessimisticCpc: 1.3,
    pessimisticConv: 0.7,
    optimisticCpc: 0.8,
    optimisticConv: 1.25,
  });

  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    setProvisionalUsers(getProvisionalUsers());
    // Auto-unlock if active session is already admin
    const currentSession = getActiveSession();
    if (currentSession && currentSession.role === "admin") {
      setIsAuthenticated(true);
      fetchLeads();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validKey = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || "TraCol#2026J@";
    if (accessCode === validKey) {
      setIsAuthenticated(true);
      fetchLeads();
    } else {
      alert("Clave de acceso incorrecta para el panel administrativo de Traffiker Digital.");
    }
  };

  const fetchLeads = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("lead_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setLeads(data as LeadRecord[]);
        return;
      }
    }
    try {
      const stored = JSON.parse(localStorage.getItem("traffiker_leads") || "[]");
      setLeads(stored);
    } catch {
      setLeads([]);
    }
  };

  // Generate random provisional password
  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pass = "TD-";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  // Create new provisional user
  const handleCreateProvisionalUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    createProvisionalUser({
      clientName: newClientName || "Cliente Invitado",
      username: newUsername,
      password: newPassword,
      validDays: newValidDays === 0 ? null : newValidDays,
      notes: newNotes,
    });

    setProvisionalUsers(getProvisionalUsers());
    setNewClientName("");
    setNewUsername("");
    setNewPassword("");
    setNewNotes("");
    setSavedNotice("Acceso provisional creado exitosamente. Ya puedes copiar la invitación para tu cliente.");
    setTimeout(() => setSavedNotice(""), 4000);
  };

  const handleToggleUser = (id: string) => {
    setProvisionalUsers(toggleProvisionalUserStatus(id));
  };

  const handleDeleteUser = (id: string) => {
    setProvisionalUsers(deleteProvisionalUser(id));
  };

  // Copy full WhatsApp / Email invitation message with Magic Invite Link
  const handleCopyInviteMessage = async (user: ProvisionalUser) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://calculadoraads.pages.dev";
    const token = generatePortableInviteToken(user);
    const magicLink = `${origin}/?invite=${encodeURIComponent(token)}`;
    const expText = user.expiresAt
      ? `Válido hasta: ${new Date(user.expiresAt).toLocaleDateString("es-ES")}`
      : "Acceso activo";

    const message = `Hola ${user.clientName} 👋
Te compartimos tu acceso provisional exclusivo a *META ADS ROI CALCULATOR* de *Traffiker Digital*:

🔗 *Enlace de Ingreso Directo:*
${magicLink}

🔑 *Credenciales de Acceso:*
• *Usuario:* ${user.username}
• *Contraseña:* ${user.password}
• *Código de Invitación:* ${token}
(${expText})`;

    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(user.id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      alert("No se pudo copiar al portapapeles.");
    }
  };

  const handleCopyDirectLink = async (user: ProvisionalUser) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://calculadoraads.pages.dev";
    const token = generatePortableInviteToken(user);
    const magicLink = `${origin}/?invite=${encodeURIComponent(token)}`;
    try {
      await navigator.clipboard.writeText(magicLink);
      setCopiedId(`${user.id}-link`);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      alert("No se pudo copiar el enlace.");
    }
  };

  const toggleBenchmarkStatus = (id: string) => {
    setBenchmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    setSavedNotice("Estado de benchmark actualizado correctamente.");
    setTimeout(() => setSavedNotice(""), 3000);
  };

  const updateBenchmarkValue = (id: string, newVal: number) => {
    setBenchmarks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, value: newVal, updatedAt: new Date().toISOString() }
          : b
      )
    );
  };

  const handleSaveScenarios = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice("Parámetros de escenarios guardados.");
    setTimeout(() => setSavedNotice(""), 3000);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.whatsapp.includes(searchTerm) ||
      (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16">
        <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-3xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-traffiker-dark border border-traffiker-orange/30 text-traffiker-orange flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-traffiker-orange">
              TRAFFIKER DIGITAL
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              Panel Administrativo
            </h1>
            <p className="text-xs text-traffiker-gray mt-2">
              Introduce la clave maestra de administrador para gestionar accesos provisionales de clientes, leads y benchmarks.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Clave de acceso privada de Administrador
              </label>
              <input
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Introduce tu clave..."
                className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-traffiker-orange transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-traffiker-orange hover:bg-traffiker-orange-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-traffiker-orange/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Admin Header */}
      <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-traffiker-orange/15 text-traffiker-orange px-2.5 py-0.5 rounded border border-traffiker-orange/30">
              PANEL PRIVADO
            </span>
            <span className="text-xs text-traffiker-orange flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Administrador Autenticado
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Gestión de Accesos Provisionales, Leads y Benchmarks
          </h2>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="flex items-center gap-2 text-xs text-traffiker-gray hover:text-white px-3 py-2 rounded-xl bg-traffiker-dark hover:bg-traffiker-dark-hover border border-traffiker-dark-border transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" /> Bloquear Panel
        </button>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-traffiker-dark-card border border-traffiker-orange/40 text-white text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-traffiker-orange" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-traffiker-dark-border gap-2">
        <button
          onClick={() => setActiveTab("access")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "access"
              ? "border-traffiker-orange text-traffiker-orange"
              : "border-transparent text-traffiker-gray hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Accesos Provisionales ({provisionalUsers.length})
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "leads"
              ? "border-traffiker-orange text-traffiker-orange"
              : "border-transparent text-traffiker-gray hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Solicitudes Recibidas ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab("benchmarks")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "benchmarks"
              ? "border-traffiker-orange text-traffiker-orange"
              : "border-transparent text-traffiker-gray hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Catálogo de Benchmarks ({benchmarks.length})
        </button>

        <button
          onClick={() => setActiveTab("scenarios")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "scenarios"
              ? "border-traffiker-orange text-traffiker-orange"
              : "border-transparent text-traffiker-gray hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Parámetros de Escenarios
        </button>
      </div>

      {/* TAB 0: PROVISIONAL ACCESS MANAGEMENT */}
      {activeTab === "access" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Provisional User Form */}
          <div className="lg:col-span-5 bg-[#191C21] border border-[#292E36] rounded-2xl p-6 space-y-5 self-start">
            <div className="border-b border-[#292E36] pb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5A1F] block">
                Generador de Credenciales
              </span>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <UserPlus className="w-5 h-5 text-[#FF5A1F]" />
                Crear Login Provisional para Cliente
              </h3>
              <p className="text-xs text-[#CBD2DC] mt-1 leading-relaxed">
                Crea un usuario temporal y envía la invitación por WhatsApp o enlace directo para que tu cliente pruebe la calculadora desde cualquier dispositivo.
              </p>
            </div>

            <form onSubmit={handleCreateProvisionalUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Nombre del Cliente o Empresa
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ej: Clínica Dental Sonrisas"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Usuario o Correo de Acceso
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej: sonrisas@cliente.com o clinica1"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Contraseña Provisional
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generar clave automática
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ej: TD-84920"
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Tiempo de Vigencia del Acceso
                </label>
                <select
                  value={newValidDays}
                  onChange={(e) => setNewValidDays(Number(e.target.value))}
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value={3}>3 días (Prueba rápida)</option>
                  <option value={7}>7 días (1 semana)</option>
                  <option value={15}>15 días (Recomendado)</option>
                  <option value={30}>30 días (1 mes)</option>
                  <option value={0}>Ilimitado (Sin fecha de expiración)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Nota interna (Opcional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej: Prospecto reunión martes..."
                  className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FF5A1F] hover:bg-[#e04e18] text-white font-black py-3 rounded-xl shadow-lg shadow-[#FF5A1F]/25 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>CREAR ACCESO PROVISIONAL</span>
              </button>
            </form>
          </div>

          {/* Active Provisional Users List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#191C21] border border-[#292E36] rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#292E36] pb-3">
                <div>
                  <h3 className="text-base font-black text-white">
                    Cuentas y Accesos Provisionales Activos
                  </h3>
                  <p className="text-xs text-[#CBD2DC]">
                    Usa el botón <strong className="text-white">&quot;Copiar Invitación&quot;</strong> para enviar al cliente su enlace mágico y credenciales por WhatsApp.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {provisionalUsers.map((u) => {
                  const isSystem = u.id.startsWith("sys-");
                  const isExpired =
                    u.expiresAt && new Date(u.expiresAt).getTime() < Date.now();

                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-2xl bg-[#0D0F12] border transition-all space-y-3 ${
                        !u.isActive || isExpired
                          ? "border-[#292E36] opacity-60"
                          : u.role === "admin"
                          ? "border-[#FF5A1F]/50"
                          : "border-[#292E36]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-sm">
                              {u.clientName}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                u.role === "admin"
                                  ? "bg-[#FF5A1F]/15 text-[#FF5A1F] border-[#FF5A1F]/30"
                                  : "bg-[#191C21] text-[#CBD2DC] border-[#292E36]"
                              }`}
                            >
                              {u.role === "admin" ? "Administrador" : "Cliente Provisional"}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                                Expirado
                              </span>
                            )}
                          </div>
                          {u.notes && (
                            <p className="text-[11px] text-[#CBD2DC] mt-0.5">
                              {u.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyInviteMessage(u)}
                            className="px-3 py-1.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04e18] text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            {copiedId === u.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Copiar Invitación</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyDirectLink(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#191C21] hover:bg-[#292E36] text-[#CBD2DC] hover:text-white border border-[#292E36] text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Copiar enlace de acceso directo"
                          >
                            {copiedId === `${u.id}-link` ? (
                              <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#FF5A1F]" />
                            )}
                            <span>Link</span>
                          </button>

                          {!isSystem && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleUser(u.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-[#191C21] hover:bg-[#292E36] text-xs font-bold text-[#CBD2DC] border border-[#292E36]"
                              >
                                {u.isActive ? "Pausar" : "Activar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-xl bg-[#191C21] hover:bg-[#292E36] text-[#CBD2DC] hover:text-white border border-[#292E36]"
                                title="Eliminar acceso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Credentials Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#292E36] text-xs">
                        <div className="bg-[#191C21] px-3 py-1.5 rounded-lg border border-[#292E36]">
                          <span className="text-[10px] text-[#CBD2DC] block">
                            Usuario:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {u.username}
                          </span>
                        </div>
                        <div className="bg-[#191C21] px-3 py-1.5 rounded-lg border border-[#292E36]">
                          <span className="text-[10px] text-[#CBD2DC] block">
                            Contraseña:
                          </span>
                          <span className="font-mono font-bold text-[#FF5A1F]">
                            {u.password}
                          </span>
                        </div>
                        <div className="bg-[#191C21] px-3 py-1.5 rounded-lg border border-[#292E36]">
                          <span className="text-[10px] text-[#CBD2DC] block">
                            Vigencia:
                          </span>
                          <span className="font-semibold text-white">
                            {u.expiresAt
                              ? `Hasta ${new Date(u.expiresAt).toLocaleDateString("es-ES")}`
                              : "Ilimitado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Leads */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, correo..."
                className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-traffiker-orange"
              />
            </div>
            <span className="text-xs text-slate-500">
              Mostrando {filteredLeads.length} de {leads.length} prospectos
            </span>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-12 text-center text-slate-400 text-sm">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No hay solicitudes registradas aún o ninguna coincide con la búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-traffiker-dark-border text-slate-400 uppercase font-bold">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Prospecto</th>
                    <th className="py-3 px-4">WhatsApp / Correo</th>
                    <th className="py-3 px-4">Modelo / Mercado</th>
                    <th className="py-3 px-4">Presupuesto</th>
                    <th className="py-3 px-4">Simulación</th>
                    <th className="py-3 px-4 text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-traffiker-dark-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-traffiker-dark/50">
                      <td className="py-3 px-4 text-traffiker-gray whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{lead.name}</div>
                        {lead.company && (
                          <div className="text-[11px] text-traffiker-gray font-normal">
                            {lead.company}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-traffiker-orange font-semibold">
                          {lead.whatsapp}
                        </div>
                        <div className="text-traffiker-gray">{lead.email}</div>
                      </td>
                      <td className="py-3 px-4 text-traffiker-gray">
                        <span className="capitalize text-white">
                          {lead.business_type}
                        </span>{" "}
                        ({lead.country})
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {lead.budget
                          ? `${lead.budget.toLocaleString()} ${lead.currency}`
                          : "N/D"}
                      </td>
                      <td className="py-3 px-4">
                        {lead.simulation_summary ? (
                          <span className="bg-traffiker-dark border border-traffiker-orange/40 text-traffiker-orange px-2 py-0.5 rounded text-[10px] font-bold">
                            Autorizada ({lead.simulation_summary.roas.toFixed(1)}x ROAS)
                          </span>
                        ) : (
                          <span className="text-traffiker-gray text-[10px]">
                            Sin adjunto
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-2.5 py-1 rounded-lg bg-traffiker-dark hover:bg-traffiker-dark-hover border border-traffiker-dark-border text-traffiker-gray hover:text-white flex items-center gap-1 text-[11px] ml-auto transition-colors"
                        >
                          <Eye className="w-3 h-3 text-traffiker-orange" /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-traffiker-dark-border pb-3">
              <h3 className="font-bold text-white text-base">Ficha del Prospecto</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Nombre:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedLead.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Empresa:</span>
                  <span className="font-bold text-white">
                    {selectedLead.company || "No indicada"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${selectedLead.whatsapp.replace(
                      /[^0-9]/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    {selectedLead.whatsapp} ↗
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Correo:</span>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-bold text-blue-400 hover:underline"
                  >
                    {selectedLead.email}
                  </a>
                </div>
              </div>

              {selectedLead.message && (
                <div className="p-3 rounded-xl bg-traffiker-dark border border-traffiker-dark-border">
                  <span className="text-slate-500 block mb-1">
                    Mensaje del cliente:
                  </span>
                  <p className="text-slate-300 italic">{selectedLead.message}</p>
                </div>
              )}

              {selectedLead.simulation_summary && (
                <div className="p-3 rounded-xl bg-traffiker-orange/10 border border-traffiker-orange/30">
                  <span className="text-traffiker-orange font-bold block mb-1">
                    Datos de la Simulación Adjunta
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      Inversión: $
                      {selectedLead.simulation_summary.adSpend?.toLocaleString()}
                    </div>
                    <div>
                      Beneficio: $
                      {selectedLead.simulation_summary.netProfit?.toLocaleString()}
                    </div>
                    <div>
                      ROAS: {selectedLead.simulation_summary.roas?.toFixed(2)}x
                    </div>
                    <div>
                      ROI Total:{" "}
                      {selectedLead.simulation_summary.totalRoi?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLead(null)}
              className="w-full py-2.5 rounded-xl bg-traffiker-dark hover:bg-traffiker-dark-hover text-white text-xs font-bold border border-traffiker-dark-border"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Benchmarks */}
      {activeTab === "benchmarks" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Administra los valores de referencia utilizados en la calculadora. Los cambios se guardan localmente para calibrar las recomendaciones.
          </p>

          <div className="overflow-x-auto bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-traffiker-dark-border text-slate-400 uppercase font-bold">
                  <th className="py-3 px-4">País</th>
                  <th className="py-3 px-4">Sector / Modelo</th>
                  <th className="py-3 px-4">Métrica</th>
                  <th className="py-3 px-4">Valor Base</th>
                  <th className="py-3 px-4">Fuente / Fecha</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-traffiker-dark-border">
                {benchmarks.map((bm) => (
                  <tr key={bm.id} className="hover:bg-traffiker-dark/50">
                    <td className="py-3 px-4 font-bold text-white">
                      {bm.countryCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-300">
                        {bm.sectorId}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        {bm.businessType}
                      </div>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-traffiker-orange font-bold">
                      {bm.metric}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="any"
                        value={bm.value}
                        onChange={(e) =>
                          updateBenchmarkValue(
                            bm.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 bg-traffiker-dark border border-traffiker-dark-border rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-traffiker-orange"
                      />{" "}
                      <span className="text-slate-400">{bm.currency}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{bm.sourceName}</div>
                      <div className="text-[10px] text-slate-500">
                        {bm.sourceDate}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleBenchmarkStatus(bm.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          bm.isActive
                            ? "bg-traffiker-orange/15 text-traffiker-orange border border-traffiker-orange/40"
                            : "bg-traffiker-dark text-traffiker-gray border border-traffiker-dark-border"
                        }`}
                      >
                        {bm.isActive ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Scenario Parameters */}
      {activeTab === "scenarios" && (
        <form
          onSubmit={handleSaveScenarios}
          className="bg-traffiker-dark-card border border-traffiker-dark-border rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl"
        >
          <div>
            <h3 className="text-base font-bold text-white">
              Multiplicadores de Simulación de Escenarios
            </h3>
            <p className="text-xs text-traffiker-gray mt-1">
              Define los factores de variación aplicados a los supuestos de la calculadora.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-traffiker-gray"></span>
              Escenario Pesimista
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-traffiker-gray mb-1">
                  Factor CPC (1.30 = +30%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={scenarioSettings.pessimisticCpc}
                  onChange={(e) =>
                    setScenarioSettings({
                      ...scenarioSettings,
                      pessimisticCpc: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-traffiker-gray mb-1">
                  Factor Conversión (0.70 = -30%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={scenarioSettings.pessimisticConv}
                  onChange={(e) =>
                    setScenarioSettings({
                      ...scenarioSettings,
                      pessimisticConv: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-traffiker-dark-border pt-4">
            <h4 className="text-xs font-bold text-traffiker-orange uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-traffiker-orange"></span>
              Escenario Optimista
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-traffiker-gray mb-1">
                  Factor CPC (0.80 = -20%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={scenarioSettings.optimisticCpc}
                  onChange={(e) =>
                    setScenarioSettings({
                      ...scenarioSettings,
                      optimisticCpc: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-traffiker-gray mb-1">
                  Factor Conversión (1.25 = +25%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={scenarioSettings.optimisticConv}
                  onChange={(e) =>
                    setScenarioSettings({
                      ...scenarioSettings,
                      optimisticConv: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-traffiker-dark border border-traffiker-dark-border rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-traffiker-orange hover:bg-traffiker-orange-hover text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all text-xs"
          >
            Guardar Multiplicadores
          </button>
        </form>
      )}
    </div>
  );
}
