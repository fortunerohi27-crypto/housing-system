import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useStore } from "./context/StoreContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Properties from "./pages/Properties.jsx";
import Tenants from "./pages/Tenants.jsx";
import Leases from "./pages/Leases.jsx";
import Rent from "./pages/Rent.jsx";
import Expenses from "./pages/Expenses.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Messages from "./pages/Messages.jsx";
import Owners from "./pages/Owners.jsx";
import Vendors from "./pages/Vendors.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import TenantRegister from "./pages/TenantRegister.jsx";
import TenantPortal from "./pages/TenantPortal.jsx";
import TenantSidebar from "./components/TenantSidebar.jsx";

function RequireData({ children }) {
  const { isLoading } = useStore();
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-500 animate-pulse">Loading database…</div>
      </div>
    );
  }
  return children;
}

function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-500 animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "tenant") return <Navigate to="/tenant" replace />;
  return children;
}

function RequireTenant({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "tenant") return <Navigate to="/" replace />;
  return children;
}

function TenantLayout({ children }) {
  return <div className="min-h-screen flex bg-stone-50 dark:bg-stone-950"><TenantSidebar /><div className="flex-1 min-w-0">{children}</div></div>;
}

function GuestOnly({ children }) {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-500 animate-pulse">Loading…</div>
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/tenant/register" element={<GuestOnly><TenantRegister /></GuestOnly>} />

      <Route path="/" element={<RequireAdmin><RequireData><ProtectedLayout><Dashboard /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/properties" element={<RequireAdmin><RequireData><ProtectedLayout><Properties /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/tenants" element={<RequireAdmin><RequireData><ProtectedLayout><Tenants /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/leases" element={<RequireAdmin><RequireData><ProtectedLayout><Leases /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/rent" element={<RequireAdmin><RequireData><ProtectedLayout><Rent /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/expenses" element={<RequireAdmin><RequireData><ProtectedLayout><Expenses /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/maintenance" element={<RequireAdmin><RequireData><ProtectedLayout><Maintenance /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/messages" element={<RequireAdmin><RequireData><ProtectedLayout><Messages /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/owners" element={<RequireAdmin><RequireData><ProtectedLayout><Owners /></ProtectedLayout></RequireData></RequireAdmin>} />
      <Route path="/vendors" element={<RequireAdmin><RequireData><ProtectedLayout><Vendors /></ProtectedLayout></RequireData></RequireAdmin>} />

      <Route path="/tenant" element={<RequireTenant><RequireData><TenantLayout><TenantPortal /></TenantLayout></RequireData></RequireTenant>} />
      <Route path="/tenant/payments" element={<RequireTenant><RequireData><TenantLayout><TenantPortal /></TenantLayout></RequireData></RequireTenant>} />
      <Route path="/tenant/maintenance" element={<RequireTenant><RequireData><TenantLayout><TenantPortal /></TenantLayout></RequireData></RequireTenant>} />
      <Route path="/tenant/messages" element={<RequireTenant><RequireData><TenantLayout><TenantPortal /></TenantLayout></RequireData></RequireTenant>} />
      <Route path="/tenant/lease" element={<RequireTenant><RequireData><TenantLayout><TenantPortal /></TenantLayout></RequireData></RequireTenant>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
