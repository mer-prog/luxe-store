# LUXE — Luxury Fashion E-Commerce Platform

> **What:** A production-grade full-stack e-commerce app with Stripe payments, webhook-driven fulfillment, admin dashboard, and multilingual support
> **For:** Engineers looking to demonstrate real-world web development skills through a portfolio project
> **Built with:** Next.js 15 / React 19 / TypeScript 5.7 / Stripe / PostgreSQL / Prisma / next-intl

**Live demo:** [https://luxe-store-ruby.vercel.app](https://luxe-store-ruby.vercel.app)
**Source code:** [https://github.com/mer-prog/luxe-store](https://github.com/mer-prog/luxe-store)

---

## Skills Demonstrated

| Skill | Implementation |
|:------|:---------------|
| **Full-Stack E-Commerce** | End-to-end build: product catalog, cart, checkout, order management, and admin dashboard |
| **Payment Integration** | Stripe Checkout Session creation, webhook signature verification, session expiration and payment failure handling |
| **Authentication & Authorization** | NextAuth.js v5 with JWT sessions, middleware-level route protection, and RBAC (ADMIN / CUSTOMER) |
| **Database Design** | 9-model, 3-enum Prisma schema with optimistic stock locking and transactional writes |
| **Internationalization (i18n)** | JP/EN language switching via next-intl with cookie-based locale and locale-linked currency formatting (¥ / $) |
| **Security Hardening** | bcrypt password hashing, HSTS / X-Frame-Options / CSP headers, Zod input validation across all boundaries |
| **Modern Frontend** | React 19 Server Components and Server Actions, shadcn/ui component system, Recharts-powered dashboard |

---

## Tech Stack

| Category | Technology | Purpose |
|:---------|:-----------|:--------|
| Framework | Next.js 15 (App Router) | Server Components, Server Actions, Middleware |
| UI | React 19, Tailwind CSS 3.4, shadcn/ui | Component system built on Radix Primitives |
| Language | TypeScript 5.7 (strict) | End-to-end type safety |
| Database | PostgreSQL (Neon serverless) | Pooled connections via `@neondatabase/serverless` |
| ORM | Prisma 6.2 | Schema-first, type-safe database access |
| Auth | NextAuth.js v5 (beta) | JWT sessions, Credentials provider, RBAC |
| Payments | Stripe Checkout + Webhooks | PCI-compliant payment processing |
| Email | Resend | Transactional order confirmation emails |
| Validation | Zod | Runtime schema validation on forms and API inputs |
| Charts | Recharts | Monthly revenue bar chart on admin dashboard |
| i18n | next-intl 4.8 | JP/EN switching, cookie-based locale, locale-aware currency formatting |
| Icons | Lucide React | Consistent icon system |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Client)                       │
│  React 19 UI ── Server Components + Client Components        │
│  LanguageToggle (JP|EN) ── Cookie (NEXT_LOCALE) persistence  │
└──────────────┬───────────────────────────────────────────────┘
               │ Request
┌──────────────▼───────────────────────────────────────────────┐
│                   Next.js 15 ── App Router                    │
│                                                               │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Middleware   │  │ Server         │  │ API Routes       │  │
│  │  Auth + RBAC  │  │ Components     │  │ /api/checkout    │  │
│  │  Route Guard  │  │ + Server       │  │ /api/webhooks/   │  │
│  │              │  │   Actions      │  │   stripe         │  │
│  └──────────────┘  └───────┬────────┘  └────────┬─────────┘  │
│                            │                     │            │
│  ┌─────────────────────────▼─────────────────────▼─────────┐  │
│  │              Prisma ORM (type-safe queries)              │  │
│  └─────────────────────────┬────────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────┘
                             │ SQL
┌────────────────────────────▼──────────────────────────────────┐
│               PostgreSQL (Neon Serverless)                     │
│   9 models, 3 enums ── User, Product, Cart, Order, Review...  │
└───────────────────────────────────────────────────────────────┘

               External Services
┌──────────────────────┐  ┌──────────────────────┐
│  Stripe              │  │  Resend              │
│  Checkout Sessions   │  │  Order confirmation   │
│  Webhook events      │  │  Best-effort delivery │
└──────────────────────┘  └──────────────────────┘
```

---

## Payment Flow Architecture

```
Cart ──▶ POST /api/checkout ──▶ Create Stripe Checkout Session
                │
                ├── Validate stock availability
                ├── Optimistic stock lock (decrement in $transaction)
                ├── Create Order record (status: PENDING)
                ├── Build Stripe line_items (tax 10% as separate line)
                └── Session expiry: 30 minutes
                                    │
                                    ▼
                        Customer pays on Stripe
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
         Payment success                      Session expired
 checkout.session.completed             checkout.session.expired
                │                                       │
                ▼                                       ▼
┌────────────────────────────────┐  ┌───────────────────────────┐
│ • Verify Stripe signature       │  │ • Restore stock (increment) │
│ • Idempotency check             │  │ • Order status:             │
│ • Order → CONFIRMED             │  │   CANCELLED / EXPIRED       │
│ • Payment → PAID                │  └───────────────────────────┘
│ • Save shipping address         │
│ • Clear cart                    │          Payment failed
│ • Send confirmation (Resend)    │  payment_intent.payment_failed
└────────────────────────────────┘                  │
                │                                   ▼
                ▼                        ┌─────────────────────┐
     Redirect to                         │ Payment → FAILED     │
     /checkout/success                   └─────────────────────┘

Edge cases:
  • Email failure → logged only, never blocks order completion
  • Concurrent checkout → optimistic stock locking prevents overselling
  • Duplicate webhooks → idempotency check (skip if paymentStatus === "PAID")
```

**Currency display:** The language toggle (JP / EN) switches price formatting (JP: ¥8,950 tax-included / EN: $89.50 + Tax). The actual payment amount sent to Stripe (integer cents) is never modified. Only the presentation layer adapts.

---

## Key Features

### Storefront
- **Product Catalog** — Category filtering, price sorting (low-to-high / high-to-low), full-text search (`Prisma insensitive contains`)
- **Product Detail** — Image gallery, size selector, real-time stock validation (remaining count display), customer reviews (1-5 star rating + text comments)
- **Shopping Cart** — Add, update quantity, and remove items; real-time cart badge count in header
- **Stripe Checkout** — Redirect to Stripe Hosted Checkout with shipping address collection (US / CA / GB); 30-minute session expiry
- **Order History** — Order status badges (Pending / Confirmed / Processing / Shipped / Delivered / Cancelled) and payment status badges

### Internationalization (i18n)
- **Language Toggle** — `JP | EN` text links in the header (between search icon and cart icon)
- **Cookie-Based Locale** — `NEXT_LOCALE` cookie (1-year expiry), no URL prefix
- **No-Reload Switching** — `useTransition` + `router.refresh()` for instant language updates
- **Currency Linking** — JP: `Intl.NumberFormat("ja-JP", { currency: "JPY" })` → ¥8,950 / EN: `Intl.NumberFormat("en-US", { currency: "USD" })` → $89.50
- **Translation Coverage** — Header, footer, home page, product catalog and detail, reviews, cart, checkout, auth forms, order history, and the entire admin dashboard (~200 keys)
- **Server / Client Component Support** — Server Components use `getTranslations()`, Client Components use `useTranslations()`

### Authentication & Authorization
- **JWT Sessions** — 24-hour stateless sessions via NextAuth.js v5
- **Middleware Route Protection** — `/admin/*`, `/orders`, `/checkout`, `/cart` guarded at the edge
- **Role-Based Access Control** — Only ADMIN role can access the dashboard; CUSTOMER is redirected to `/`
- **Password Hashing** — bcrypt with 12 salt rounds

### Admin Dashboard
- **KPI Cards** — Total revenue, total orders, average order value, new customers (current month)
- **Monthly Revenue Chart** — 6-month bar chart (Recharts) with locale-aware currency symbols
- **Product Management** — Full CRUD with Zod-validated forms in dialog modals
- **Order Management** — Update order status through the lifecycle (Pending → Confirmed → Processing → Shipped → Delivered) via select dropdown
- **Customer Overview** — Customer list with name, email, join date, and order count

---

## Database Design

### Prisma Schema (9 models, 3 enums)

```
User ──1:0..1──▶ Cart ──1:N──▶ CartItem ◀──N:1── Product
  │                                                   │
  ├──1:N──▶ Order ──1:N──▶ OrderItem ◀──N:1──────────┘
  │            │                                  │
  │            └──1:0..1──▶ ShippingAddress        │
  │                                                │
  └──1:N──▶ Review ◀──N:1─────────────────────────┘
                                                   │
                                          Category ─┘
```

**Enums:**
- `Role` — CUSTOMER, ADMIN
- `OrderStatus` — PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- `PaymentStatus` — PENDING, PAID, FAILED, REFUNDED, EXPIRED

**Pricing strategy:**
- All prices stored as integer cents (e.g., $28.90 = 2890)
- Eliminates floating-point arithmetic errors
- Directly aligned with Stripe's cent-based API

**Indexes:**
- `Order` — indexed on userId, status, and createdAt
- `OrderItem` — indexed on orderId and productId

**Seed data:** 2 users (Admin + Customer), 5 categories, 20 products, 10 reviews, 5 orders (one per status)

---

## Security Design

| Threat | Countermeasure |
|:-------|:---------------|
| Password compromise | bcrypt hashing with 12 salt rounds |
| Session hijacking | Stateless JWT with 24-hour expiration |
| Unauthorized access | NextAuth middleware route protection with RBAC enforcement |
| Webhook forgery | Stripe signature verification (`webhooks.constructEvent`) |
| SQL injection | Prisma parameterized queries |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Man-in-the-middle | `Strict-Transport-Security` with 2-year max-age, preload enabled |
| Information leakage | `Referrer-Policy: strict-origin-when-cross-origin` |
| Device API abuse | `Permissions-Policy: camera=(), microphone=(), geolocation=()` |
| Malicious input | Zod schema validation on all forms and API inputs |
| Overselling | Optimistic stock locking (`$transaction` with `stock >= quantity` guard) |

---

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── admin/                        # Admin dashboard (ADMIN role only)
│   │   ├── customers/page.tsx        #   Customer list
│   │   ├── orders/page.tsx           #   Order management
│   │   ├── products/page.tsx         #   Product management
│   │   ├── layout.tsx                #   Admin layout + RBAC check
│   │   └── page.tsx                  #   Dashboard (KPIs + chart)
│   ├── api/
│   │   ├── auth/[...nextauth]/       #   NextAuth endpoints
│   │   ├── checkout/route.ts         #   Stripe session creation + stock lock
│   │   └── webhooks/stripe/route.ts  #   Webhook handler (196 lines)
│   ├── cart/page.tsx                  # Cart page
│   ├── checkout/
│   │   ├── cancel/page.tsx           #   Payment cancelled
│   │   ├── success/page.tsx          #   Payment confirmed (order details)
│   │   └── page.tsx                  #   Checkout
│   ├── login/page.tsx                # Login
│   ├── orders/page.tsx               # Order history
│   ├── products/
│   │   ├── [id]/page.tsx             #   Product detail + reviews
│   │   └── page.tsx                  #   Catalog (filters + sorting)
│   ├── register/page.tsx             # Registration
│   └── layout.tsx                    # Root layout + NextIntlClientProvider
│
├── components/
│   ├── admin/                        # Admin components (7 files)
│   ├── auth/                         # Login and register forms
│   ├── cart/                         # Cart items, summary
│   ├── checkout/                     # Checkout form
│   ├── layout/                       # Header, footer, language toggle, admin sidebar
│   ├── orders/                       # Order list, status badges
│   ├── products/                     # Cards, grid, filters, gallery
│   ├── reviews/                      # Review form and list
│   └── ui/                           # shadcn/ui primitives (14 components)
│
├── i18n/
│   ├── config.ts                     # Locale definitions (ja, en), cookie name
│   └── request.ts                    # next-intl request config (cookie reader)
│
├── messages/
│   ├── ja.json                       # Japanese translations (228 lines, ~200 keys)
│   └── en.json                       # English translations (228 lines, ~200 keys)
│
├── lib/
│   ├── actions/                      # Server Actions
│   │   ├── auth.ts                   #   Registration (Zod + bcrypt), login
│   │   ├── cart.ts                   #   Cart CRUD (add, update, remove, count)
│   │   ├── locale.ts                 #   Language switch (set cookie)
│   │   ├── orders.ts                 #   Order status update (admin only)
│   │   ├── products.ts              #   Product CRUD (admin only, Zod validation)
│   │   └── reviews.ts               #   Review creation (Zod validation)
│   ├── auth.config.ts                # NextAuth route config + RBAC callbacks
│   ├── auth.ts                       # NextAuth instance (JWT + Credentials)
│   ├── constants.ts                  # Status labels, colors, sizes, tax rate (10%)
│   ├── order-number.ts               # Order number generator (LUXE-YYYYMMDD-NNN)
│   ├── prisma.ts                     # Prisma singleton
│   ├── stripe.ts                     # Stripe singleton
│   ├── resend.ts                     # Resend singleton
│   └── utils.ts                      # cn(), formatPrice(cents, locale), formatDate()
│
├── types/index.ts                    # Shared TypeScript type definitions
└── middleware.ts                     # Auth middleware + route matcher

prisma/
├── schema.prisma                     # 9 models, 3 enums (152 lines)
├── seed.ts                           # Seed script (497 lines)
└── migrations/                       # Migration history
```

**Totals:** ~5,087 lines of TypeScript source / 87 source files

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech/) recommended)
- [Stripe](https://stripe.com/) account (test mode)
- [Resend](https://resend.com/) account

### 1. Clone and Install

```bash
git clone https://github.com/mer-prog/luxe-store.git
cd luxe-store
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth.js
AUTH_SECRET="openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="LUXE Store <noreply@yourdomain.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Seed Data (optional)
SEED_ADMIN_PASSWORD="change-me-admin"
SEED_USER_PASSWORD="change-me-user"
```

### 3. Set Up Database

```bash
npx prisma migrate dev    # Apply migrations
npm run db:seed            # Seed sample data
```

### 4. Start Stripe Webhook Listener (development)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Accounts (after seeding)

| Role | Email | Password |
|:-----|:------|:---------|
| Admin | `admin@example.com` | Set via `SEED_ADMIN_PASSWORD` |
| Customer | `user@example.com` | Set via `SEED_USER_PASSWORD` |

### npm Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:migrate` | Create and apply migration |

---

## Design Decisions

| Decision | Rationale |
|:---------|:----------|
| **App Router over Pages Router** | Server Components shrink the client bundle; Server Actions eliminate API boilerplate for mutations |
| **JWT over database sessions** | Stateless auth scales horizontally without a session store; 24-hour expiry balances security and UX |
| **Stripe Hosted Checkout over Elements** | PCI compliance out of the box; built-in shipping address collection; reduces custom form surface area |
| **Webhook-driven fulfillment** | Decouples payment confirmation from user session; handles expiration and failure asynchronously |
| **Optimistic stock locking** | Prevents overselling during the Stripe checkout window without distributed locks (`$transaction` with `stock >= quantity` conditional update) |
| **Prisma over raw SQL** | Type-safe queries with generated types; schema-first migrations; serverless-compatible via Neon adapter |
| **Prices stored as integer cents** | Eliminates floating-point arithmetic errors; directly aligned with Stripe's cent-based API |
| **Singleton pattern for service clients** | Prevents connection exhaustion in serverless environments and during development hot-reload |
| **Locale-linked currency formatting** | Currency display switches with language (¥ / $); payment logic (integer cents) remains unchanged — standard pattern for international e-commerce |
| **Cookie-based i18n (no URL prefix)** | Preserves clean product URLs (`/products/[id]`); URL simplicity prioritized over SEO for this demo portfolio |

---

## Running Costs

| Service | Plan | Monthly Cost |
|:--------|:-----|:-------------|
| Vercel | Hobby | Free |
| Neon PostgreSQL | Free Tier | Free |
| Stripe | Pay-as-you-go | 2.9% + 30¢ per transaction (free in test mode) |
| Resend | Free Tier | Free (up to 3,000 emails/month) |
| **Total** | | **$0 (in test mode)** |

---

## Author

[@mer-prog](https://github.com/mer-prog)
