import { createContext, useContext, useEffect, useReducer, useCallback, useRef, useState } from "react";
import { initialSeedV3 } from "../data.js";
import { supabase } from "../supabaseClient";

function reducer(state, action) {
  switch (action.type) {
    case "SET_INITIAL_DATA": return { ...state, ...action.payload };

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

function deriveSideEffects(state, dispatch) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);

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
  const [state, dispatch] = useReducer(reducer, initialSeedV3());
  const [isLoading, setIsLoading] = useState(true);
  const firstRun = useRef(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const tables = [
          "owners", "vendors", "properties", "units", "tenants",
          "leases", "invoices", "payments", "expenses",
          "maintenance", "messages", "announcements",
          "documents", "notifications", "audit_log"
        ];

        const results = {};
        await Promise.all(tables.map(async (table) => {
          const { data, error } = await supabase.from(table).select("*");
          if (error) console.error(`Error fetching ${table}:`, error);
          results[table] = data || [];
        }));

        // Map table names to state keys (e.g., audit_log -> auditLog)
        const stateMap = {
          owners: "owners",
          vendors: "vendors",
          properties: "properties",
          units: "units",
          tenants: "tenants",
          leases: "leases",
          invoices: "invoices",
          payments: "payments",
          expenses: "expenses",
          maintenance: "maintenance",
          messages: "messages",
          announcements: "announcements",
          documents: "documents",
          notifications: "notifications",
          audit_log: "auditLog"
        };

        const finalData = {};
        Object.entries(stateMap).forEach(([table, key]) => {
          finalData[key] = results[table] || [];
        });

        dispatch({ type: "SET_INITIAL_DATA", payload: finalData });
      } catch (err) {
        console.error("Critical error loading initial data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    deriveSideEffects(state, dispatch);
    if (firstRun.current) firstRun.current = false;
  }, [state]);

  const nextId = useCallback((prefix, list) => {
    const nums = (list || []).map(x => parseInt(String(x.id).split("-").pop(), 10)).filter(Number.isFinite);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `${prefix}-${String(n).padStart(4, "0")}`;
  }, []);

  const audit = useCallback((entry) => {
    // We use a helper function to handle async audit logging
    const logAudit = async (e) => {
      const { error } = await supabase.from("audit_log").insert({
        id: `A-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        at: new Date().toISOString(),
        actor: e.actor || "admin",
        action: e.action,
        entity_type: e.entityType,
        entity_id: e.entityId || "",
        detail: e.detail || ""
      });
      if (error) console.error("Audit log error:", error);
    };
    logAudit(entry);
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

  // --- ASYNC ACTIONS LAYER ---

  const actions = {
    // Properties
    addProperty: async (payload) => {
      const { data, error } = await supabase.from("properties").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Property was not created successfully");
      dispatch({ type: "ADD_PROPERTY", payload: data });
      return data;
    },
    updateProperty: async (payload) => {
      const { data, error } = await supabase.from("properties").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Property update failed");
      dispatch({ type: "UPDATE_PROPERTY", payload: data });
    },
    deleteProperty: async (id) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_PROPERTY", payload: id });
    },

    // Units
    addUnit: async (payload) => {
      const { data, error } = await supabase.from("units").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Unit was not created successfully");
      dispatch({ type: "ADD_UNIT", payload: data });
    },
    updateUnit: async (payload) => {
      const { data, error } = await supabase.from("units").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Unit update failed");
      dispatch({ type: "UPDATE_UNIT", payload: data });
    },
    deleteUnit: async (id) => {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_UNIT", payload: id });
    },

    // Tenants
    addTenant: async (payload) => {
      const { data, error } = await supabase.from("tenants").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Tenant was not created successfully");
      dispatch({ type: "ADD_TENANT", payload: data });
    },
    updateTenant: async (payload) => {
      const { data, error } = await supabase.from("tenants").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Tenant update failed");
      dispatch({ type: "UPDATE_TENANT", payload: data });
    },
    deleteTenant: async (id) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_TENANT", payload: id });
    },

    // Leases
    addLease: async (payload) => {
      const { data, error } = await supabase.from("leases").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Lease was not created successfully");
      dispatch({ type: "ADD_LEASE", payload: data });
    },
    updateLease: async (payload) => {
      const { data, error } = await supabase.from("leases").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Lease update failed");
      dispatch({ type: "UPDATE_LEASE", payload: data });
    },
    deleteLease: async (id) => {
      const { error } = await supabase.from("leases").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_LEASE", payload: id });
    },

    // Invoices
    addInvoice: async (payload) => {
      const { data, error } = await supabase.from("invoices").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Invoice was not created successfully");
      dispatch({ type: "ADD_INVOICE", payload: data });
    },
    updateInvoice: async (payload) => {
      const { data, error } = await supabase.from("invoices").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Invoice update failed");
      dispatch({ type: "UPDATE_INVOICE", payload: data });
    },
    deleteInvoice: async (id) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_INVOICE", payload: id });
    },
    markInvoicePaid: async (payload) => {
      const { data, error } = await supabase.from("invoices").update({ status: "Paid", paid: new Date().toISOString().slice(0,10) }).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Failed to mark invoice as paid");

      // Also handle payment record
      if (payload.method) {
        await supabase.from("payments").insert({
          id: `PAY-${Date.now()}`,
          invoiceId: payload.id,
          amount: iAmount(state, payload.id),
          method: payload.method,
          paidAt: new Date().toISOString().slice(0,10),
          note: payload.note || "",
          receiptNo: `RCT-${Math.floor(Math.random()*9000+1000)}`
        });
      }

      dispatch({ type: "MARK_INVOICE_PAID", payload });
    },

    // Expenses
    addExpense: async (payload) => {
      const { data, error } = await supabase.from("expenses").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Expense was not created successfully");
      dispatch({ type: "ADD_EXPENSE", payload: data });
    },
    updateExpense: async (payload) => {
      const { data, error } = await supabase.from("expenses").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Expense update failed");
      dispatch({ type: "UPDATE_EXPENSE", payload: data });
    },
    deleteExpense: async (id) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_EXPENSE", payload: id });
    },

    // Maintenance
    addMaint: async (payload) => {
      const { data, error } = await supabase.from("maintenance").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Maintenance ticket was not created successfully");
      dispatch({ type: "ADD_MAINT", payload: data });
    },
    updateMaint: async (payload) => {
      const { data, error } = await supabase.from("maintenance").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Maintenance update failed");
      dispatch({ type: "UPDATE_MAINT", payload: data });
    },
    deleteMaint: async (id) => {
      const { error } = await supabase.from("maintenance").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_MAINT", payload: id });
    },
    moveMaint: async (payload) => {
      const { data, error } = await supabase.from("maintenance").update({ status: payload.status, updated: new Date().toISOString().slice(0,10) }).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Failed to move maintenance ticket");
      dispatch({ type: "MOVE_MAINT", payload });
    },

    // Messages
    addMessage: async (payload) => {
      const { data, error } = await supabase.from("messages").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Message was not sent successfully");
      dispatch({ type: "ADD_MESSAGE", payload: data });
    },
    sendReply: async (payload) => {
      const { error } = await supabase.from("messages").update({
        thread: JSON.stringify([...state.messages.find(m => m.id === payload.id).thread, payload.reply]),
        preview: payload.reply.text,
        unread: false
      }).eq("id", payload.id);
      if (error) throw error;
      dispatch({ type: "SEND_REPLY", payload });
    },
    markMessageRead: async (id) => {
      const { error } = await supabase.from("messages").update({ unread: false }).eq("id", id);
      if (error) throw error;
      dispatch({ type: "MARK_READ", payload: id });
    },
    deleteMessage: async (id) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_MESSAGE", payload: id });
    },

    // Announcements
    addAnnouncement: async (payload) => {
      const { data, error } = await supabase.from("announcements").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Announcement was not created successfully");
      dispatch({ type: "ADD_ANNOUNCEMENT", payload: data });
    },
    deleteAnnouncement: async (id) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_ANNOUNCEMENT", payload: id });
    },

    // Owners
    addOwner: async (payload) => {
      const { data, error } = await supabase.from("owners").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Owner was not created successfully");
      dispatch({ type: "ADD_OWNER", payload: data });
    },
    updateOwner: async (payload) => {
      const { data, error } = await supabase.from("owners").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Owner update failed");
      dispatch({ type: "UPDATE_OWNER", payload: data });
    },
    deleteOwner: async (id) => {
      const { error } = await supabase.from("owners").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_OWNER", payload: id });
    },

    // Vendors
    addVendor: async (payload) => {
      const { data, error } = await supabase.from("vendors").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Vendor was not created successfully");
      dispatch({ type: "ADD_VENDOR", payload: data });
    },
    updateVendor: async (payload) => {
      const { data, error } = await supabase.from("vendors").update(payload).eq("id", payload.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Vendor update failed");
      dispatch({ type: "UPDATE_VENDOR", payload: data });
    },
    deleteVendor: async (id) => {
      const { error } = await supabase.from("vendors").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_VENDOR", payload: id });
    },

    // Documents
    addDocument: async (payload) => {
      const { data, error } = await supabase.from("documents").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Document was not created successfully");
      dispatch({ type: "ADD_DOCUMENT", payload: data });
    },
    deleteDocument: async (id) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "DELETE_DOCUMENT", payload: id });
    },

    // Notifications
    addNotification: async (payload) => {
      const { data, error } = await supabase.from("notifications").insert(payload).select().single();
      if (error) throw error;
      if (!data) throw new Error("Notification was not created successfully");
      dispatch({ type: "ADD_NOTIFICATION", payload: data });
    },
    markNotifRead: async (id) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
      dispatch({ type: "MARK_NOTIF_READ", payload: id });
    },
    markAllNotifRead: async () => {
      const { error } = await supabase.from("notifications").update({ read: true }).neq("read", true);
      if (error) throw error;
      dispatch({ type: "MARK_ALL_NOTIF_READ" });
    },
    clearNotifications: async () => {
      const { error } = await supabase.from("notifications").delete().neq("read", true);
      if (error) throw error;
      dispatch({ type: "CLEAR_NOTIFICATIONS" });
    },

    // Audit
    addAudit: async (entry) => {
      const { error } = await supabase.from("audit_log").insert({
        id: `A-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        at: new Date().toISOString(),
        actor: entry.actor || "admin",
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId || "",
        detail: entry.detail || ""
      });
      if (error) throw error;
      dispatch({ type: "ADD_AUDIT", payload: {
        id: `A-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        at: new Date().toISOString(),
        actor: entry.actor || "admin",
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || "",
        detail: entry.detail || ""
      }});
    }
  };

  const value = { state, dispatch, dispatchAudit, audit, nextId, actions, isLoading };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

export function useStats() {
  const { state } = useStore();
  const totalUnits   = state.units.length;
  const occupiedUnits= state.units.filter(u => u.status === "Occupied" || (!u.status && !u.vacant)).length;
  const occupancy    = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const vacantUnits  = state.units.filter(u => u.status === "Vacant" || (!u.status && u.vacant));
  const monthly      = state.units.reduce((s, u) => s + ((u.status === "Occupied" || (!u.status && !u.vacant)) ? (u.rent || 0) : 0), 0);
  return { totalUnits, occupiedUnits, occupancy, vacantUnits, monthly };
}
