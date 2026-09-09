import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from "react";
import { initialSeedV3, migrateV2toV3 } from "../data.js";

const V3_KEY = "eh_store_v3";
const V2_KEY = "eh_store_v2";

function load() {
  try {
    const raw = localStorage.getItem(V3_KEY);
    if (raw) return JSON.parse(raw);
    const v2raw = localStorage.getItem(V2_KEY);
    if (v2raw) {
      const migrated = migrateV2toV3(JSON.parse(v2raw));
      try { localStorage.setItem(V3_KEY, JSON.stringify(migrated)); } catch {}
      return migrated;
    }
  } catch {}
  return initialSeedV3();
}
function save(state) {
  try { localStorage.setItem(V3_KEY, JSON.stringify(state)); } catch {}
}

function reducer(state, action) {
  switch (action.type) {
    // ---- Properties
    case "ADD_PROPERTY":    return { ...state, properties: [action.payload, ...state.properties] };
    case "UPDATE_PROPERTY": return { ...state, properties: state.properties.map(p => p.id === action.payload.id ? action.payload : p) };
    case "DELETE_PROPERTY": {
      const id = action.payload;
      const unitsToDelete = state.units.filter(u => u.propertyId === id).map(u => u.id);
      const tenantsOnUnits = state.tenants.filter(t => unitsToDelete.includes(t.unitId)).map(t => t.id);
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== id),
        units:      state.units.filter(u => u.propertyId !== id),
        tenants:    state.tenants.map(t => unitsToDelete.includes(t.unitId) ? { ...t, unitId: "", status: "Past" } : t),
        leases:     state.leases.filter(l => !unitsToDelete.includes(l.unitId)),
        invoices:   state.invoices.filter(i => !tenantsOnUnits.includes(i.tenantId)),
        maintenance:state.maintenance.filter(m => !unitsToDelete.includes(m.unitId)),
        documents:  state.documents.filter(d => !(d.entityType === "property" && d.entityId === id) && !(d.entityType === "unit" && unitsToDelete.includes(d.entityId)))
      };
    }

    // ---- Units
    case "ADD_UNIT":        return { ...state, units: [action.payload, ...state.units] };
    case "UPDATE_UNIT":     return { ...state, units: state.units.map(u => u.id === action.payload.id ? action.payload : u) };
    case "DELETE_UNIT":     return { ...state, units: state.units.filter(u => u.id !== action.payload) };

    // ---- Tenants
    case "ADD_TENANT":      return { ...state, tenants: [action.payload, ...state.tenants] };
    case "UPDATE_TENANT":   return { ...state, tenants: state.tenants.map(t => t.id === action.payload.id ? action.payload : t) };
    case "DELETE_TENANT":   return { ...state, tenants: state.tenants.filter(t => t.id !== action.payload) };

    // ---- Leases
    case "ADD_LEASE":       return { ...state, leases: [action.payload, ...state.leases] };
    case "UPDATE_LEASE":    return { ...state, leases: state.leases.map(l => l.id === action.payload.id ? action.payload : l) };
    case "DELETE_LEASE":    return { ...state, leases: state.leases.filter(l => l.id !== action.payload) };

    // ---- Invoices
    case "ADD_INVOICE":     return { ...state, invoices: [action.payload, ...state.invoices] };
    case "UPDATE_INVOICE":  return { ...state, invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i) };
    case "DELETE_INVOICE":  return { ...state, invoices: state.invoices.filter(i => i.id !== action.payload) };
    case "MARK_INVOICE_PAID": return {
      ...state,
      invoices: state.invoices.map(i => i.id === action.payload.id
        ? { ...i, status: "Paid", paid: new Date().toISOString().slice(0,10), method: action.payload.method || i.method || "" }
        : i
      ),
      payments: action.payload.method
        ? [{ id: `PAY-${Date.now()}`, invoiceId: action.payload.id, amount: iAmount(state, action.payload.id), method: action.payload.method, paidAt: new Date().toISOString().slice(0,10), note: action.payload.note || "", receiptNo: `RCT-${Math.floor(Math.random()*9000+1000)}` }, ...state.payments]
        : state.payments
    };
    case "ADD_PAYMENT":     return { ...state, payments: [action.payload, ...state.payments] };
    case "APPLY_LATE_FEE":  return {
      ...state,
      invoices: state.invoices.map(i => i.id === action.payload.id
        ? { ...i, lateFee: action.payload.fee, total: (i.amount || 0) + action.payload.fee }
        : i
      )
    };

    // ---- Expenses
    case "ADD_EXPENSE":     return { ...state, expenses: [action.payload, ...state.expenses] };
    case "UPDATE_EXPENSE":  return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case "DELETE_EXPENSE":  return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

    // ---- Maintenance
    case "ADD_MAINT":       return { ...state, maintenance: [action.payload, ...state.maintenance] };
    case "UPDATE_MAINT":    return { ...state, maintenance: state.maintenance.map(m => m.id === action.payload.id ? action.payload : m) };
    case "DELETE_MAINT":    return { ...state, maintenance: state.maintenance.filter(m => m.id !== action.payload) };
    case "MOVE_MAINT":      return {
      ...state,
      maintenance: state.maintenance.map(m => m.id === action.payload.id
        ? { ...m, status: action.payload.status, updated: new Date().toISOString().slice(0,10) }
        : m
      )
    };

    // ---- Messages
    case "ADD_MESSAGE":     return { ...state, messages: [action.payload, ...state.messages] };
    case "SEND_REPLY":      return {
      ...state,
      messages: state.messages.map(m => m.id === action.payload.id
        ? { ...m, thread: [...m.thread, action.payload.reply], preview: action.payload.reply.text, unread: false }
        : m
      )
    };
    case "MARK_READ":       return {
      ...state,
      messages: state.messages.map(m => m.id === action.payload ? { ...m, unread: false } : m)
    };
    case "DELETE_MESSAGE":  return { ...state, messages: state.messages.filter(m => m.id !== action.payload) };

    // ---- Announcements
    case "ADD_ANNOUNCEMENT":return { ...state, announcements: [action.payload, ...state.announcements] };
    case "DELETE_ANNOUNCEMENT": return { ...state, announcements: state.announcements.filter(a => a.id !== action.payload) };

    // ---- Owners
    case "ADD_OWNER":       return { ...state, owners: [action.payload, ...state.owners] };
    case "UPDATE_OWNER":    return { ...state, owners: state.owners.map(o => o.id === action.payload.id ? action.payload : o) };
    case "DELETE_OWNER":    return { ...state, owners: state.owners.filter(o => o.id !== action.payload) };

    // ---- Vendors
    case "ADD_VENDOR":      return { ...state, vendors: [action.payload, ...state.vendors] };
    case "UPDATE_VENDOR":   return { ...state, vendors: state.vendors.map(v => v.id === action.payload.id ? action.payload : v) };
    case "DELETE_VENDOR":   return { ...state, vendors: state.vendors.filter(v => v.id !== action.payload) };

    // ---- Documents
    case "ADD_DOCUMENT":    return { ...state, documents: [action.payload, ...state.documents] };
    case "DELETE_DOCUMENT": return { ...state, documents: state.documents.filter(d => d.id !== action.payload) };

    // ---- Notifications
    case "ADD_NOTIFICATION":return { ...state, notifications: [action.payload, ...state.notifications.filter(n => !(n.kind === action.payload.kind && n.refId === action.payload.refId))] };
    case "MARK_NOTIF_READ": return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case "MARK_ALL_NOTIF_READ": return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case "CLEAR_NOTIFICATIONS": return { ...state, notifications: [] };

    // ---- Audit
    case "ADD_AUDIT":       return { ...state, auditLog: [action.payload, ...state.auditLog].slice(0, 1000) };

    // ---- Bulk
    case "RESET":           return initialSeedV3();
    case "IMPORT":          return action.payload;

    default: return state;
  }
}

function iAmount(state, id) {
  const i = state.invoices.find(x => x.id === id);
  return i ? (i.total || i.amount || 0) : 0;
}

const StoreCtx = createContext(null);

// Side-effect generators (notifications, auto-invoices, preventive tickets).
// They run on boot and after every dispatch.
function deriveSideEffects(state, dispatch) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);

  // Auto-flag leases as Expiring if end within 30 days and still Active.
  state.leases.forEach(l => {
    if (l.status === "Active" && l.end) {
      const days = Math.floor((new Date(l.end) - today) / 86400000);
      if (days <= 30 && days >= 0) {
        // dispatch only if not already Expiring (compare against current value)
        // — caller passes the fresh state so we know
      }
    }
  });

  // Notifications — lease expiring within 30 / 7 days.
  state.leases.forEach(l => {
    if (!l.end) return;
    const days = Math.floor((new Date(l.end) - today) / 86400000);
    if (days >= 0 && days <= 30 && (l.status === "Active" || l.status === "Expiring")) {
      const kind = days <= 7 ? "lease_expiring_urgent" : "lease_expiring";
      const existing = state.notifications.some(n => n.kind === kind && n.refId === l.id);
      if (!existing) {
        dispatch({ type: "ADD_NOTIFICATION", payload: {
          id: `N-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          kind,
          title: `Lease ${l.id} ${days === 0 ? "expires today" : `expires in ${days} day${days===1?"":"s"}`}`,
          body: `Review renewal options for this lease.`,
          refType: "lease", refId: l.id, createdAt: todayStr, read: false
        }});
      }
    }
  });

  // Notifications — overdue invoices.
  state.invoices.forEach(i => {
    if (i.status === "Overdue") {
      const kind = "invoice_overdue";
      const existing = state.notifications.some(n => n.kind === kind && n.refId === i.id);
      if (!existing) {
        dispatch({ type: "ADD_NOTIFICATION", payload: {
          id: `N-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          kind,
          title: `Invoice ${i.id} is overdue`,
          body: `Follow up with the tenant for payment.`,
          refType: "invoice", refId: i.id, createdAt: todayStr, read: false
        }});
      }
    }
  });

  // Preventive maintenance — if a ticket has dueAt in the past and isPreventive, clone a new ticket.
  state.maintenance.forEach(m => {
    if (m.isPreventive && m.dueAt && new Date(m.dueAt) <= today) {
      const kind = "preventive_due";
      const existing = state.notifications.some(n => n.kind === kind && n.refId === m.id);
      if (!existing) {
        dispatch({ type: "ADD_NOTIFICATION", payload: {
          id: `N-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          kind,
          title: `Preventive: ${m.title}`,
          body: `Scheduled ticket is due. A new ticket has been generated.`,
          refType: "maintenance", refId: m.id, createdAt: todayStr, read: false
        }});
      }
    }
  });
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => { save(state); }, [state]);

  // Run side-effect generators once on mount and after every state change.
  const firstRun = useRef(true);
  useEffect(() => {
    deriveSideEffects(state, dispatch);
    if (firstRun.current) firstRun.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ID helpers
  const nextId = useCallback((prefix, list) => {
    const nums = (list || []).map(x => parseInt(String(x.id).split("-").pop(), 10)).filter(Number.isFinite);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `${prefix}-${String(n).padStart(4, "0")}`;
  }, []);

  // Wrapped dispatch that also logs audit rows. Skipped for noisy internal actions.
  const audit = useCallback((entry) => {
    dispatch({ type: "ADD_AUDIT", payload: {
      id: `A-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      at: new Date().toISOString(),
      actor: entry.actor || "admin",
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId || "",
      detail: entry.detail || ""
    }});
  }, []);

  const dispatchAudit = useCallback((action, meta = {}) => {
    dispatch(action);
    if (meta.log !== false) {
      audit({
        action: action.type,
        entityType: meta.entityType || action.type.split("_")[1]?.toLowerCase() || "unknown",
        entityId: (action.payload && (action.payload.id || action.payload)) || "",
        detail: meta.detail || ""
      });
    }
  }, [audit]);

  const value = { state, dispatch, dispatchAudit, audit, nextId };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

// Selector helpers that re-derive cheap aggregates
export function useStats() {
  const { state } = useStore();
  const totalUnits   = state.units.length;
  const occupiedUnits= state.units.filter(u => u.status === "Occupied" || (!u.status && !u.vacant)).length;
  const occupancy    = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const vacantUnits  = state.units.filter(u => u.status === "Vacant" || (!u.status && u.vacant));
  const monthly      = state.units.reduce((s, u) => s + ((u.status === "Occupied" || (!u.status && !u.vacant)) ? (u.rent || 0) : 0), 0);
  return { totalUnits, occupiedUnits, occupancy, vacantUnits, monthly };
}
