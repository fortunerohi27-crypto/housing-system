import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthCtx = createContext(null);

const USERS_KEY = "eh_users_v1";
const SESSION_KEY = "eh_session_v1";
const STORE_KEY = "eh_store_v3";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function findTenantByEmail(email) {
  try {
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return (store.tenants || []).find((tenant) =>
      String(tenant.email || "").trim().toLowerCase() === String(email || "").trim().toLowerCase()
    );
  } catch {
    return null;
  }
}

// Simple (non-cryptographic) hash for demo purposes only
function hash(pw) {
  let h = 0;
  const s = String(pw) + "eh_salt_2026";
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return "h" + Math.abs(h).toString(36);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session?.email) {
      const users = loadUsers();
      const found = users.find((u) => u.email === session.email);
      if (found) {
        setUser({ id: found.id, name: found.name, email: found.email, role: found.role || "admin", tenantId: found.tenantId || "" });
      }
    }
    setReady(true);
  }, []);

  const register = useCallback(({ name, email, password }) => {
    const users = loadUsers();
    const normalized = String(email).trim().toLowerCase();
    if (!name?.trim()) return { ok: false, error: "Full name is required." };
    if (!normalized || !normalized.includes("@")) return { ok: false, error: "Enter a valid email address." };
    if (!password || password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = {
      id: "ADM-" + Date.now().toString(36).toUpperCase(),
      name: name.trim(),
      email: normalized,
      passwordHash: hash(password),
      role: "admin",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    const session = { email: newUser.email, name: newUser.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: "admin", tenantId: "" });
    return { ok: true };
  }, []);

  const registerTenant = useCallback(({ name, email, password }) => {
    const users = loadUsers();
    const normalized = String(email).trim().toLowerCase();
    const tenant = findTenantByEmail(normalized);
    if (!name?.trim()) return { ok: false, error: "Full name is required." };
    if (!normalized || !normalized.includes("@")) return { ok: false, error: "Enter a valid email address." };
    if (!password || password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (!tenant) return { ok: false, error: "We could not find a tenant profile for that email. Ask your property manager to add you first." };
    if (users.some((u) => u.email === normalized)) return { ok: false, error: "An account with this email already exists. Please sign in." };

    const newUser = {
      id: "TEN-" + Date.now().toString(36).toUpperCase(), name: name.trim(), email: normalized,
      passwordHash: hash(password), role: "tenant", tenantId: tenant.id, createdAt: new Date().toISOString()
    };
    users.push(newUser); saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: newUser.email, name: newUser.name }));
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: "tenant", tenantId: tenant.id });
    return { ok: true, role: "tenant" };
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = loadUsers();
    const normalized = String(email).trim().toLowerCase();
    const found = users.find((u) => u.email === normalized);
    if (!found) return { ok: false, error: "No account found with that email." };
    if (found.passwordHash !== hash(password)) return { ok: false, error: "Incorrect password." };
    const session = { email: found.email, name: found.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    const role = found.role || "admin";
    setUser({ id: found.id, name: found.name, email: found.email, role, tenantId: found.tenantId || "" });
    return { ok: true, role };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = { user, ready, register, registerTenant, login, logout, isAuthenticated: !!user };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
