-- Supabase Schema for EstateHub
-- Run this in the Supabase SQL Editor

-- 1. Owners
CREATE TABLE owners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  ownership_pct NUMERIC DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendors
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trade TEXT DEFAULT 'General',
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Properties
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT,
  monthly_revenue NUMERIC DEFAULT 0,
  owner_id TEXT REFERENCES owners(id) ON DELETE SET NULL,
  ownership_pct NUMERIC DEFAULT 100,
  amenities TEXT[],
  photo_data_urls TEXT[],
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Units
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  sqft INTEGER DEFAULT 0,
  rent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Vacant',
  vacant BOOLEAN DEFAULT TRUE,
  photo_data_urls TEXT[],
  floor_plan_data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tenants
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  rent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  score INTEGER DEFAULT 85,
  joined DATE DEFAULT CURRENT_DATE,
  emergency_contact JSONB, -- { name, phone, rel }
  employment JSONB,         -- { employer, income, position }
  notes TEXT,
  co_tenant_ids TEXT[],
  pets JSONB,               -- array of { name, type, fee }
  documents JSONB,           -- array of { name, mime, dataUrl }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leases
CREATE TABLE leases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  start DATE NOT NULL,
  end DATE NOT NULL,
  rent NUMERIC DEFAULT 0,
  deposit NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Invoices
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  amount NUMERIC DEFAULT 0,
  due DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  paid DATE,
  method TEXT,
  late_fee NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payments
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC DEFAULT 0,
  method TEXT,
  paid_at DATE,
  note TEXT,
  receipt_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT,
  description TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Maintenance
CREATE TABLE maintenance (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL,
  vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  created DATE,
  updated DATE,
  is_preventive BOOLEAN DEFAULT FALSE,
  due_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview TEXT,
  time TEXT,
  unread BOOLEAN DEFAULT TRUE,
  thread JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Announcements
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date DATE,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Documents
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mime TEXT,
  data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  ref_type TEXT,
  ref_id TEXT,
  created_at DATE,
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Log
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ DEFAULT NOW(),
  actor TEXT DEFAULT 'admin',
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  detail TEXT
);
