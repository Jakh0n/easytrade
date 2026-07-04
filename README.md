# Trade — AI-Powered Crypto Spot Trading Analysis

Monorepo loyiha: kripto spot trading uchun AI-powered tahlil web-app MVP.

## Struktura

```
trade/
├── backend/    # Node.js + Express API
├── frontend/   # Next.js web-app
└── README.md
```

## Ishga tushirish

### Backend

```bash
cd backend
cp .env.example .env   # ANTHROPIC_API_KEY ni to'ldiring
npm install
npm run dev            # http://localhost:4000
```

Health check: `GET http://localhost:4000/health` → `{ "status": "ok" }`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev            # http://localhost:3000
```

## O'rnatilgan paket versiyalari

Loyiha quyidagi eng so'nggi stable versiyalar bilan qurilgan (2026-07-04):

### Backend

| Paket | Versiya |
|-------|---------|
| Node.js (runtime) | ES modules (`"type": "module"`) |
| Express | 5.2.1 |
| cors | 2.8.6 |
| dotenv | 17.4.2 |
| axios | 1.18.1 |
| @anthropic-ai/sdk | 0.110.0 |
| TypeScript | 6.0.3 |
| tsx | 4.23.0 |
| @types/express | 5.0.6 |
| @types/cors | 2.8.19 |
| @types/node | 26.1.0 |

### Frontend

| Paket | Versiya |
|-------|---------|
| Next.js | 16.2.10 |
| React | 19.2.4 |
| React DOM | 19.2.4 |
| Tailwind CSS | 4.3.2 |
| TypeScript | 5.9.3 |
| ESLint | 9.39.4 |
| shadcn CLI | 4.13.0 |
| @base-ui/react | 1.6.0 |

## Keyingi bosqichlar

- Backend: `src/routes/`, `src/services/` — API va AI tahlil logikasi
- Frontend: trading dashboard UI va backend integratsiyasi
