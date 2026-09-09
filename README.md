# EstateHub — Property Rental Management System

**EstateHub** is a full-featured, client-side property rental management platform for landlords, property managers, and residents. It covers the complete rental lifecycle — from listing buildings and units, through tenant onboarding and digital leases, to rent collection, maintenance tickets, messaging, owners, and vendors.

The application runs entirely in the browser. There is no backend server. All portfolio data, user accounts, and sessions are persisted in `localStorage`.

| | |
|---|---|
| **Product name** | EstateHub |
| **npm package** | `property-rental-system` |
| **Version** | 1.0.0 |
| **Type** | Single-page React application (Vite) |
| **Persistence** | Browser `localStorage` (schema `eh_store_v3`) |
| **Auth** | Local accounts with hashed passwords (admin + tenant roles) |

---

## Table of contents

1. [What it does](#1-what-it-does)
2. [Who it is for](#2-who-it-is-for)
3. [Feature catalogue](#3-feature-catalogue)
4. [Tech stack](#4-tech-stack)
5. [Getting started](#5-getting-started)
6. [Application architecture](#6-application-architecture)
7. [Authentication and roles](#7-authentication-and-roles)
8. [Data model](#8-data-model)
9. [Admin modules](#9-admin-modules)
10. [Resident portal](#10-resident-portal)
11. [Design system and UX](#11-design-system-and-ux)
12. [Project structure](#12-project-structure)
13. [Local storage keys](#13-local-storage-keys)
14. [Typical workflows](#14-typical-workflows)
15. [Business rules and automations](#15-business-rules-and-automations)
16. [ID conventions](#16-id-conventions)
17. [Limitations and security notes](#17-limitations-and-security-notes)
18. [Scripts](#18-scripts)
19. [Roadmap ideas](#19-roadmap-ideas)

---

## 1. What it does

EstateHub replaces the spreadsheet-and-inbox workflow that many small landlords still use. A property manager can:

- Register an **admin workspace** and sign in.
- Catalogue **properties** (buildings / complexes) with photos, amenities, ownership, and archive status.
- Break each property into **units** with bedrooms, square footage, rent, occupancy status, photos, and a floor plan.
- **Onboard tenants** with a rich profile (emergency contact, employment, pets, co-tenants, documents, internal notes, tenant score).
- Issue **residential lease agreements** and download a branded PDF.
- Create **rent invoices**, mark them paid, apply a 5% late fee, and run an overdue sweep.
- Log **operating expenses** by category and see a spending pie chart.
- Track **maintenance tickets** on a drag-and-drop Kanban board (Open → In Progress → Resolved).
- Message tenants in a threaded inbox.
- Maintain a directory of **owners** (stakeholders) and **vendors** (tradespeople).
- Give residents their own **tenant portal** to pay rent, request maintenance, message the office, and review their lease.

A first-run **getting-started checklist** on the dashboard walks a new admin through: add a property → add units → onboard a tenant → create a lease → issue an invoice.

---

## 2. Who it is for

| Role | Access | Typical use |
|---|---|---|
| **Property manager / landlord (admin)** | Full admin console | Run the portfolio: properties, tenants, money, maintenance, communications |
| **Resident (tenant)** | Resident portal only | Pay rent, file tickets, chat with the office, view lease |
| **Owner / stakeholder** | Not a login role | Recorded as a contact and linked to properties with an ownership % |
| **Vendor / contractor** | Not a login role | Recorded as a trade contact; can be referenced from maintenance tickets |

Tenant accounts cannot be created freely. A manager must first add a tenant **profile** (with that person’s email). The resident then activates access at `/tenant/register` using the same email.

---

## 3. Feature catalogue

### Portfolio

- Property types: Apartment, Loft, Villa, Townhouse, Studio, Other
- Amenities picker: Wi-Fi, Parking, Pool, Gym, Security, Generator, Water, Elevator, Furnished
- Photo gallery (local, max 2 MB per image, stored as data URLs)
- Owner assignment + ownership percentage
- Archive / unarchive properties (hidden from the default list)
- Per-property occupancy bar (occupied units / total units)
- Cascading delete: removing a property also removes its units, related leases, invoices, maintenance, and documents

### Units

- Label, bedrooms, sqft, monthly rent
- Status: Vacant · Occupied · Under Maintenance · Notice Given
- Photos + floor-plan image
- Assigning a tenant automatically marks the unit Occupied; deleting a tenant or unit marks it Vacant
- Deleting a unit unassigns its tenant (status → Past) and removes related leases

### Tenants

- Tabbed profile editor: Profile, Emergency, Employment, Pets, Co-tenants, Notes, Documents
- Tenant score (0–100)
- Status: Active · Pending · Overdue · Past
- Pets with type and monthly pet fee
- Co-tenant linking (other tenant records sharing a lease)
- Document upload/download (local, 2 MB cap)
- Search by name or email; filter by status

### Leases

- Tenant + unit, start/end dates, rent, deposit, status (Active · Expiring · Renewal · Ended)
- KPI cards: Active, Expiring Soon, Pending Renewal
- **PDF export** via jsPDF — a letter-size “Residential Lease Agreement” with landlord, tenant, premises, term, financials, six standard clauses, and signature lines
- Notifications when a lease is within 30 days (and a more urgent one within 7 days) of expiry

### Rent & invoicing

- Invoice statuses: Paid · Pending · Overdue
- Auto-fill amount from the tenant’s rent when the tenant is selected
- KPIs: billed, collected, outstanding (respects current filters)
- **Mark paid** records a payment with method `"Admin recorded"` and a receipt number
- **Late-fee automation**: 5% of invoice amount, after a 5-day grace period
- **Run sweep**: flags Pending invoices past due + grace as Overdue
- Overdue invoices raise in-app notifications

### Expenses

- Categories: Maintenance, Utilities, Insurance, Admin, Marketing, Taxes, Other
- Date, description, amount
- Donut chart of spend by category
- Search + category filter

### Maintenance

- Three-column Kanban: Open, In Progress, Resolved
- Drag-and-drop between columns
- Priority: High / Medium / Low
- Auto-selects the occupying tenant when a unit is chosen
- Preventive-maintenance fields exist in the schema (`isPreventive`, `scheduleCron`, `dueAt`) and raise notifications when due
- Residents can also file tickets from the tenant portal

### Messages

- Split inbox (conversation list + thread)
- Compose a new conversation against a tenant
- Manager replies as `who: "manager"`
- Unread badges; mark-read on open
- Delete conversation with confirmation
- Residents can start a thread from their portal

### Owners

- Name, email, phone, default ownership %, notes
- Card grid showing how many properties are linked to each owner

### Vendors

- Trades: Plumbing, Electrical, HVAC, Carpentry, Painting, Cleaning, Landscaping, Pest control, Security, General, Other
- Ticket count per vendor (`maintenance.vendorId`)

### Resident portal

- Home overview: property, unit, rent, lease end, open tickets, next payment
- Payments: invoice history + “Pay rent securely” (marks the invoice paid with method `"Tenant portal"`)
- Maintenance: list + new-request modal
- Messages: chat with property management
- My lease: term, rent, deposit, status
- Graceful empty state if the tenant profile is missing

### Cross-cutting

- Dark / light theme (class-based, persisted)
- Display currency: USD, EUR, GBP, NGN, CAD, AUD, INR — amounts are stored in USD and converted with demo FX rates
- Mobile drawer navigation for both admin and tenant shells
- Audit log (last 1,000 actions) written on most mutations
- Getting-started wizard on an empty dashboard
- Attention bar: overdue invoices, pending invoices, open maintenance, expiring leases
- Charts: revenue vs expenses area chart, occupancy bar chart, property-mix pie
- Clear-portfolio action (wipes store, keeps the admin account)

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| UI | **React 18** | Component model for a large multi-page SPA |
| Bundler | **Vite 8** + `@vitejs/plugin-react` | Fast HMR, simple config |
| Routing | **React Router DOM 7** | Nested layouts, role-gated routes, `Navigate` guards |
| Styling | **Tailwind CSS 3** + PostCSS + Autoprefixer | Utility-first, dark mode via `class` |
| Icons | **Lucide React** | Consistent line-icon set |
| Charts | **Recharts** | Area, bar, and pie charts on the dashboard and expenses page |
| PDF | **jsPDF** | Client-side lease PDF generation |
| Dates | **date-fns** (declared) | Date utilities |
| Motion | **framer-motion** (declared) | Animation library available to the UI |
| Font | **Inter** (Google Fonts) | Product typeface |
| State | React Context + `useReducer` | No Redux; a single store with action types |
| Persistence | `localStorage` | Zero-ops demo / prototype |

There is **no database, no API, and no authentication server**. That is intentional for this version.

---

## 5. Getting started

### Requirements

- Node.js 18 or newer (Node 20/22 recommended)
- npm 9+

### Install and run

```bash
# from the project root (the folder that contains package.json)
npm install
npm run dev
