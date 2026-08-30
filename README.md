# 🌾 FarmNexus — Agri-Trade & Price Intelligence Platform

> **"Every harvest deserves a fair price."**  
> FarmNexus is an enterprise-grade digital agriculture platform connecting Indian farmers, Farmer Producer Organizations (FPOs), and verified institutional buyers with real-time APMC mandi prices, quality grading assays, price intelligence (net realisation calculation), multi-modal logistics routing, WDRA warehouse storage, and e-NWR virtual escrow settlement.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |     FarmNexus Frontend (React 18)     |
                                  |  Vite 6 • Tailwind 4 • Leaflet (OSM)  |
                                  +---------------------------------------+
                                                     │  REST & JWT
                                                     ▼
                                  +---------------------------------------+
                                  |     FarmNexus Backend (Node.js/TS)    |
                                  |  Express • RBAC • Price Engine • Escrow|
                                  +---------------------------------------+
                                        │             │             │
                    ┌───────────────────┘             │             └───────────────────┐
                    ▼                                 ▼                                 ▼
   +--------------------------------+  +--------------------------------+  +--------------------------------+
   |    External Market & Weather   |  |   PostgreSQL / Memory Cache    |  |     ICICI / e-NWR Escrow       |
   | • data.gov.in (AGMARKNET)      |  | • 13 Relational Tables         |  | • Two-party Contract Binding   |
   | • e-NAM Electronic Auction Hub |  | • Price Trend Sparklines       |  | • Server-Side Amount Validation|
   | • Open-Meteo Agro-Meteorology  |  | • User Profiles & Lots Index   |  | • HMAC Webhook Security        |
   +--------------------------------+  +--------------------------------+  +--------------------------------+
```

---

## ✨ Key Feature Modules

### 👨‍🌾 Farmer Portal
- **Harvest Lot Listing**: Create produce lots with physical moisture, foreign matter, grain size, and damage assays.
- **Price Intelligence & Net Realisation**: Automatically compares nearby and regional APMC mandis using the formula:
  $$\text{Net Return} = (\text{Quantity} \times \text{Modal Price}) - (\text{Distance} \times \text{Freight Rate} \times \text{Metric Tonnes} + \text{Handling})$$
- **Live Agricultural Weather**: Real-time temperature, precipitation probability, humidity, and agronomic transit advisories powered by Open-Meteo.
- **Logistics & Warehousing**: OpenStreetMap routing with Leaflet, booking transport carriers, and WDRA storage facilities.
- **Commercial Offer Management**: Receive, counter, accept, or reject corporate buyer bids.
- **Escrow Settlement Tracker**: Track payments from buyer escrow deposit through dispatch, delivery, and bank release.

### 🏢 Buyer Marketplace
- **Procurement Search & Filters**: Search lots by crop, quality grade, moisture tolerance, and district radius.
- **Matchmaking Engine**: Algorithmic recommendations scoring active lots against corporate procurement criteria.
- **Commercial Bidding**: Place binding purchase offers with price, volume, and pickup terms.
- **Escrow Fund Deposit**: Generate payment orders and lock funds in virtual escrow.

### 🛡️ Admin Operations Desk
- **User & KYC Oversight**: Verify farmer and buyer KYC, bank mandates, and manage account statuses.
- **Market Price Feeds CRUD**: Add, update, and manage regional mandi rates and arrival quantities.
- **Trade & Escrow Auditing**: Full oversight over active lots, offers, transactions, and payments.
- **System & External Integration Diagnostics**: Real-time health monitoring of AGMARKNET, e-NAM, Open-Meteo Weather, and PostgreSQL.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS 4, Lucide Icons, Leaflet 1.9 + OpenStreetMap, GSAP ScrollTrigger, Lenis Smooth Scroll |
| **Backend** | Node.js (v18+), Express.js, TypeScript (`tsx`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Axios |
| **Database** | PostgreSQL (`pg` pool) with high-availability in-memory fallback store |
| **Integrations** | `data.gov.in` (AGMARKNET), e-NAM (SFAC Gateway Adapter), Open-Meteo Weather API |

---

## 📁 Repository Structure

```
farmnexus/
├── frontend/                     # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/       # Admin Dashboard, Users, Lots, Pricing Views
│   │   │   │   ├── components/  # AgriMapView (Leaflet), WeatherWidget, NetCalculator
│   │   │   │   └── views/       # MarketPricesComparisonView, BuyerBrowse, CreateLot
│   │   │   ├── NexusGraph/      # 3D India Agro-Corridor Canvas
│   │   │   ├── sections/        # Hero, HowItWorks, LivePricePreview
│   │   │   └── ui/              # Button, Sparkline, LanguageToggle
│   │   ├── context/             # DashboardContext (State synchronization)
│   │   ├── services/            # apiClient (Axios), apiServices (REST endpoints)
│   │   └── main.tsx
│   ├── package.json
│   ├── vercel.json              # Vercel SPA routing
│   └── vite.config.ts
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/              # env.ts, db.ts (PostgreSQL & inMemory fallback)
│   │   ├── controllers/         # lot, offer, transaction, payment, admin, weather, external
│   │   ├── middleware/          # auth.ts (JWT & RBAC), errorHandler.ts, validateQuery.ts
│   │   ├── models/              # types.ts (Normalized data models)
│   │   ├── routes/              # api.ts and sub-routers
│   │   ├── scripts/             # seedDb.ts, qaSecurityPass.ts
│   │   ├── services/            # agmarknetService, enamService, weatherService, pricing
│   │   └── utils/               # normalizer.ts, validator.ts
│   ├── .env.example             # Backend environment template
│   ├── package.json
│   └── tsconfig.json
├── package.json                  # Root workspace coordinator
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL** (Optional, fallback in-memory store is included for zero-config startup)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/farmnexus.git
cd farmnexus

# Install root, frontend, and backend dependencies
npm run install:all
```

### 3. Environment Configuration
Create `backend/.env` from the example template:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=farmnexus_secure_jwt_secret_2026
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmnexus
CACHE_TTL_MINUTES=30

# External API Configuration
DATA_GOV_IN_API_KEY=your_ogd_api_key
AGMARKNET_API_URL=https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
ENAM_API_URL=https://enam.gov.in/web/api/getTradeData
WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
```

### 4. Database Setup & Seeding (Optional for PostgreSQL)
```bash
npm run db:seed
```

### 5. Start Development Servers
```bash
# Start both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

- **Frontend Web App**: `http://localhost:5173/`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Automated QA & Security Test Suite

Run the full end-to-end authorization, transaction flow, and integration test pass:
```bash
npm --prefix backend run build
npx tsx backend/src/scripts/qaSecurityPass.ts
```

---

## 🚢 Production Deployment

### Frontend Deployment (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

### Backend Deployment (Render)
1. Create a **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Start Command** to `npm start`.
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `<Generate 32-char secret>`
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app`
   - `DATABASE_URL` = `<PostgreSQL connection string>`
   - `DATA_GOV_IN_API_KEY` = `<OGD API Key>`

---

## 📡 REST API Reference

| Method | Endpoint | Role / Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and database health |
| `POST` | `/api/auth/register` | Public | Register farmer, buyer, or FPO |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/lots` | Public | Browse active produce listings |
| `POST` | `/api/lots` | Farmer / Admin | Create new produce listing with quality assay |
| `GET` | `/api/price-intelligence/:lotId` | Public | Dynamic Net Realisation calculation |
| `GET` | `/api/weather` | Public | Open-Meteo live agricultural weather & advisory |
| `GET` | `/api/external/market-prices` | Public | AGMARKNET government price feed |
| `GET` | `/api/external/enam/market-prices` | Public | e-NAM electronic trade price feed |
| `POST` | `/api/offers` | Buyer / Admin | Place commercial procurement bid |
| `POST` | `/api/offers/:id/accept` | Farmer / Admin | Accept bid & generate binding transaction |
| `POST` | `/api/payments/create` | Authenticated | Create e-NWR escrow deposit order |
| `POST` | `/api/payments/verify` | Authenticated | Verify and lock funds in escrow |
| `GET` | `/api/admin/system-status` | Admin | Diagnostics for all external services |
| `GET` | `/api/admin/users` | Admin | User directory and KYC verification |

---

## 📄 License
FarmNexus Platform Core Engine. Built with pride for Indian agriculture.
