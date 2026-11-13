export interface ProvisionalUser {
  id: string;
  clientName: string;
  username: string;
  password: string;
  role: "admin" | "client";
  createdAt: string;
  expiresAt?: string; // ISO date string or undefined for never
  isActive: boolean;
  notes?: string;
}

export interface ActiveSession {
  userId: string;
  clientName: string;
  username: string;
  role: "admin" | "client";
  loginAt: string;
  expiresAt?: string;
}

const USERS_STORAGE_KEY = "traffiker_provisional_users_v1";
const SESSION_STORAGE_KEY = "traffiker_active_session_v1";
const TOKEN_SALT = "TD_META_2026";

/**
 * Built-in default accounts so the owner and initial testers can always log in
 * on any device even without creating custom entries.
 */
export const DEFAULT_SYSTEM_USERS: ProvisionalUser[] = [
  {
    id: "sys-admin-1",
    clientName: "Administrador Traffiker Digital",
    username: "admin@traffikerdigital.com",
    password: process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || "TraCol#2026J@",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
    isActive: true,
    notes: "Cuenta maestra de administración (también acepta usuario 'admin').",
  },
  {
    id: "sys-client-demo",
    clientName: "Cliente Invitado (Provisional)",
    username: "cliente@traffikerdigital.com",
    password: "demo2026",
    role: "client",
    createdAt: "2026-01-01T00:00:00.000Z",
    isActive: true,
    notes: "Acceso provisional predeterminado para pruebas y clientes (también acepta usuario 'invitado').",
  },
];

/**
 * Loads custom provisional users from localStorage and merges with system defaults.
 */
export function getProvisionalUsers(): ProvisionalUser[] {
  if (typeof window === "undefined") return DEFAULT_SYSTEM_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const customUsers: ProvisionalUser[] = raw ? JSON.parse(raw) : [];
    return [...DEFAULT_SYSTEM_USERS, ...customUsers];
  } catch {
    return DEFAULT_SYSTEM_USERS;
  }
}

/**
 * Saves a new custom provisional client user.
 */
export function createProvisionalUser(params: {
  clientName: string;
  username: string;
  password: string;
  validDays?: number | null; // null or 0 = unlimited
  notes?: string;
}): ProvisionalUser {
  const now = new Date();
  let expiresAt: string | undefined = undefined;
  if (params.validDays && params.validDays > 0) {
    const exp = new Date(now.getTime() + params.validDays * 24 * 60 * 60 * 1000);
    expiresAt = exp.toISOString();
  }

  const newUser: ProvisionalUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clientName: params.clientName.trim() || "Cliente Invitado",
    username: params.username.trim().toLowerCase(),
    password: params.password.trim(),
    role: "client",
    createdAt: now.toISOString(),
    expiresAt,
    isActive: true,
    notes: params.notes?.trim(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      const customUsers: ProvisionalUser[] = raw ? JSON.parse(raw) : [];
      customUsers.unshift(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(customUsers));
    } catch {
      // Ignore storage error
    }
  }

  return newUser;
}

/**
 * Toggles or deletes a custom provisional user.
 */
export function toggleProvisionalUserStatus(id: string): ProvisionalUser[] {
  if (typeof window === "undefined") return DEFAULT_SYSTEM_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const customUsers: ProvisionalUser[] = raw ? JSON.parse(raw) : [];
    const updated = customUsers.map((u) =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    );
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return getProvisionalUsers();
}

export function deleteProvisionalUser(id: string): ProvisionalUser[] {
  if (typeof window === "undefined") return DEFAULT_SYSTEM_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const customUsers: ProvisionalUser[] = raw ? JSON.parse(raw) : [];
    const updated = customUsers.filter((u) => u.id !== id);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return getProvisionalUsers();
}

/**
 * Generates a portable base64url invite token that encodes a provisional access
 * so it can be shared via URL with a client on another device without requiring
 * a shared backend database.
 */
export function generatePortableInviteToken(user: ProvisionalUser): string {
  const payload = {
    n: user.clientName,
    u: user.username,
    p: user.password,
    e: user.expiresAt || "",
    s: TOKEN_SALT,
  };
  if (typeof window === "undefined") return "";
  try {
    const json = JSON.stringify(payload);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

/**
 * Decodes and validates a portable invite token from a URL parameter (?invite=...)
 */
export function verifyPortableInviteToken(token: string): {
  valid: boolean;
  session?: ActiveSession;
  user?: ProvisionalUser;
  error?: string;
} {
  try {
    const json = decodeURIComponent(atob(token));
    const payload = JSON.parse(json);
    if (!payload || payload.s !== TOKEN_SALT || !payload.u || !payload.p) {
      return { valid: false, error: "El enlace de invitación no es válido." };
    }

    if (payload.e) {
      const expDate = new Date(payload.e);
      if (expDate.getTime() < Date.now()) {
        return {
          valid: false,
          error: "Este acceso provisional ha expirado. Solicita uno nuevo a Traffiker Digital.",
        };
      }
    }

    const user: ProvisionalUser = {
      id: `invite-${payload.u}`,
      clientName: payload.n || "Cliente Invitado",
      username: payload.u,
      password: payload.p,
      role: "client",
      createdAt: new Date().toISOString(),
      expiresAt: payload.e || undefined,
      isActive: true,
    };

    // Save in device's custom users if not already present so the user can also log in manually with username/password
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        const customUsers: ProvisionalUser[] = raw ? JSON.parse(raw) : [];
        const exists = customUsers.some(
          (u) => u.username.toLowerCase() === user.username.toLowerCase()
        );
        if (!exists) {
          customUsers.unshift(user);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(customUsers));
        }
      } catch {
        // Ignore
      }
    }

    const session: ActiveSession = {
      userId: user.id,
      clientName: user.clientName,
      username: user.username,
      role: "client",
      loginAt: new Date().toISOString(),
      expiresAt: user.expiresAt,
    };

    return { valid: true, session, user };
  } catch {
    return { valid: false, error: "Formato de invitación inválido." };
  }
}

/**
 * Validates username & password against system defaults and custom provisional users.
 */
export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): {
  success: boolean;
  session?: ActiveSession;
  error?: string;
} {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanUser || !cleanPass) {
    return {
      success: false,
      error: "Por favor introduce tu usuario y contraseña provisional.",
    };
  }

  const allUsers = getProvisionalUsers();

  const matched = allUsers.find((u) => {
    const uname = u.username.toLowerCase();
    // Allow shorthand 'admin' for admin@traffikerdigital.com and 'invitado'/'cliente' for cliente@traffikerdigital.com
    const isShorthandAdmin =
      u.id === "sys-admin-1" && (cleanUser === "admin" || cleanUser === uname);
    const isShorthandClient =
      u.id === "sys-client-demo" &&
      (cleanUser === "invitado" || cleanUser === "cliente" || cleanUser === uname);

    return (
      (uname === cleanUser || isShorthandAdmin || isShorthandClient) &&
      u.password === cleanPass
    );
  });

  if (!matched) {
    return {
      success: false,
      error: "Usuario o contraseña incorrectos. Verifica tus credenciales de acceso.",
    };
  }

  if (!matched.isActive) {
    return {
      success: false,
      error: "Esta cuenta provisional ha sido desactivada por el administrador.",
    };
  }

  if (matched.expiresAt) {
    const expTime = new Date(matched.expiresAt).getTime();
    if (expTime < Date.now()) {
      return {
        success: false,
        error: "Tu acceso provisional ha expirado. Solicita una renovación a Traffiker Digital.",
      };
    }
  }

  const session: ActiveSession = {
    userId: matched.id,
    clientName: matched.clientName,
    username: matched.username,
    role: matched.role,
    loginAt: new Date().toISOString(),
    expiresAt: matched.expiresAt,
  };

  saveSession(session);
  return { success: true, session };
}

export function saveSession(session: ActiveSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("traffiker-auth-change"));
  } catch {
    // Ignore
  }
}

export function getActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: ActiveSession = JSON.parse(raw);
    if (session.expiresAt) {
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        clearSession();
        return null;
      }
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event("traffiker-auth-change"));
  } catch {
    // Ignore
  }
}
