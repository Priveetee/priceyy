**ARCHITECTURE CODEBASE REACT - PRICEYY FRONTEND**

---

## 1. STRUCTURE DES DOSSIERS

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              (axios instance + interceptors)
│   │   ├── auth.ts                (login, register endpoints)
│   │   ├── estimations.ts         (calculate, save, list, get, delete, export, compare)
│   │   ├── discovery.ts           (providers, services, resources, regions, models)
│   │   └── types.ts               (types des responses)
│   │
│   ├── stores/
│   │   ├── authStore.ts           (JWT, user, login/logout)
│   │   ├── estimationStore.ts     (current form data, results)
│   │   └── uiStore.ts             (loading, errors, notifications)
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx          (home + list estimations)
│   │   ├── Calculator.tsx         (main multi-step form)
│   │   ├── EstimationDetail.tsx   (view single)
│   │   ├── Compare.tsx            (compare 2)
│   │   └── Export.tsx             (CSV download)
│   │
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Calculator/
│   │   │   ├── StepProvider.tsx
│   │   │   ├── StepServices.tsx
│   │   │   ├── StepDiscounts.tsx
│   │   │   └── ResultsDisplay.tsx
│   │   ├── Estimation/
│   │   │   ├── EstimationCard.tsx
│   │   │   └── ComparisonTable.tsx
│   │   ├── Common/
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorAlert.tsx
│   │   │   ├── SuccessToast.tsx
│   │   │   └── Navbar.tsx
│   │   └── Forms/
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── Button.tsx
│   │
│   ├── types/
│   │   └── index.ts               (tous les types TypeScript)
│   │
│   ├── utils/
│   │   ├── formatters.ts          (format currency, dates)
│   │   ├── validators.ts          (validate inputs)
│   │   └── constants.ts           (hardcoded values)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             (auth store hook)
│   │   ├── useEstimation.ts       (estimation store hook)
│   │   └── useApi.ts              (common API patterns)
│   │
│   ├── App.tsx                    (routing + layout)
│   ├── main.tsx                   (entry point)
│   └── index.css                  (global styles + tailwind)
│
├── public/
│   └── favicon.ico
│
├── .env                           (API_URL, etc)
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

---

## 2. FLOW DE DONNÉES

```
User Action (CLI)
  ↓
Component dispatches action
  ↓
Zustand Store updates
  ↓
Component re-renders (subscription)
  ↓
OR API call via axios
  ↓
Response interceptor (401? → logout)
  ↓
Store updates
  ↓
UI updates
```

---

## 3. FICHIERS À CRÉER (En ordre de priorité)

**TIER 1 - Foundation:**
- `src/types/index.ts`
- `src/api/client.ts`
- `src/api/types.ts`
- `src/stores/authStore.ts`
- `src/stores/uiStore.ts`
- `src/stores/estimationStore.ts`

**TIER 2 - API Layer:**
- `src/api/auth.ts`
- `src/api/discovery.ts`
- `src/api/estimations.ts`

**TIER 3 - Common Components:**
- `src/components/Common/Header.tsx`
- `src/components/Common/Loading.tsx`
- `src/components/Common/ErrorAlert.tsx`
- `src/components/Common/SuccessToast.tsx`
- `src/components/Auth/ProtectedRoute.tsx`
- `src/components/Forms/Input.tsx`
- `src/components/Forms/Select.tsx`

**TIER 4 - Auth Pages:**
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/components/Auth/LoginForm.tsx`
- `src/components/Auth/RegisterForm.tsx`

**TIER 5 - Main Features:**
- `src/pages/Calculator.tsx`
- `src/components/Calculator/StepProvider.tsx`
- `src/components/Calculator/StepServices.tsx`
- `src/components/Calculator/StepDiscounts.tsx`
- `src/components/Calculator/ResultsDisplay.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/Estimation/EstimationCard.tsx`

**TIER 6 - Detail Pages:**
- `src/pages/EstimationDetail.tsx`
- `src/pages/Compare.tsx`
- `src/components/Estimation/ComparisonTable.tsx`
- `src/pages/Export.tsx`

**TIER 7 - Utils & Hooks:**
- `src/utils/formatters.ts`
- `src/utils/validators.ts`
- `src/utils/constants.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useEstimation.ts`

**TIER 8 - Root:**
- `src/App.tsx` (routing)
- `src/main.tsx` (entry)

---

## 4. ROUTES REACT ROUTER

```typescript
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    
    <Route element={<ProtectedRoute />}>
      <Route path="calculator" element={<Calculator />} />
      <Route path="estimation/:id" element={<EstimationDetail />} />
      <Route path="estimation/:id1/compare/:id2" element={<Compare />} />
      <Route path="estimation/:id/export" element={<Export />} />
    </Route>
  </Route>
</Routes>
```

---

## 5. STORES ZUSTAND (Détaillé)

**authStore:**
```typescript
{
  token: string | null
  userId: string | null
  isLoggedIn: boolean
  login(username, password) → API call
  register(username, password) → API call
  logout() → clear everything
  setToken(token)
  hydrate() → check localStorage on mount
}
```

**estimationStore:**
```typescript
{
  provider: "aws" | "azure" | "gcp" | null
  services: ServiceConfig[]
  discountMultipliers: Record<string, number>
  results: CalculationResponse | null
  
  setProvider(provider)
  addService(service)
  removeService(index)
  updateService(index, updates)
  setDiscountMultiplier(model, value)
  setResults(results)
  clearEstimation()
}
```

**uiStore:**
```typescript
{
  loading: boolean
  error: string | null
  notification: {type: "success"|"error"|"info", message: string} | null
  
  setLoading(bool)
  setError(msg)
  clearError()
  showNotification(type, msg)
  clearNotification()
}
```

---

## 6. API CLIENT PATTERN

```typescript
// client.ts
const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000"
})

// Interceptor: add JWT
client.interceptors.request.use((config) => {
  const token = authStore.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: handle 401
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      authStore.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default client
```

---

## 7. COMPOSANTS CLÉS - Patterns

**Protected Route Pattern:**
```typescript
<ProtectedRoute>
  → Check authStore.isLoggedIn
  → If false → redirect /login
  → If true → render children
</ProtectedRoute>
```

**Calculator Multi-Step Pattern:**
```typescript
<Calculator>
  state: currentStep (0-3)
  ├─ Step 0: ProviderSelect
  ├─ Step 1: ServiceAdder
  ├─ Step 2: DiscountConfig
  └─ Step 3: ResultsDisplay
  buttons: Previous / Next / Calculate / Save
</Calculator>
```

---

## 8. DÉPENDANCES (package.json essentielles)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.x",
    "zustand": "^4.x",
    "axios": "^1.x",
    "tailwindcss": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "vitest": "^1.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---
