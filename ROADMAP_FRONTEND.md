## **ROADMAP PRICEYY FRONTEND**

### **TIER 1 - Foundation (Types & Stores)**
- [ ] `src/types/index.ts` - Tous les types TypeScript
- [ ] `src/stores/authStore.ts` - Auth state (JWT, user)
- [ ] `src/stores/estimationStore.ts` - Estimation form state
- [ ] `src/stores/uiStore.ts` - UI state (loading, errors, notifications)

### **TIER 2 - API Layer**
- [ ] `src/api/client.ts` - Axios client avec interceptors
- [ ] `src/api/auth.ts` - Login, register endpoints
- [ ] `src/api/discovery.ts` - Providers, services, resources, regions, models
- [ ] `src/api/estimations.ts` - Calculate, save, list, get, delete, export, compare

### **TIER 3 - Common Components & Utils**
- [ ] `src/utils/formatters.ts` - Format currency, dates
- [ ] `src/utils/validators.ts` - Validate inputs
- [ ] `src/utils/constants.ts` - Hardcoded values
- [ ] `src/hooks/useAuth.ts` - Auth hook
- [ ] `src/hooks/useEstimation.ts` - Estimation hook
- [ ] `src/components/Common/Header.tsx` - Navbar + logout
- [ ] `src/components/Common/Loading.tsx` - Spinner
- [ ] `src/components/Common/ErrorAlert.tsx` - Error display
- [ ] `src/components/Common/SuccessToast.tsx` - Success notification
- [ ] `src/components/Auth/ProtectedRoute.tsx` - Auth guard
- [ ] `src/components/Forms/Input.tsx` - Input component
- [ ] `src/components/Forms/Select.tsx` - Select component
- [ ] `src/components/Forms/Button.tsx` - Button component

### **TIER 4 - Auth Pages**
- [ ] `src/components/Auth/LoginForm.tsx` - Login form
- [ ] `src/components/Auth/RegisterForm.tsx` - Register form
- [ ] `src/pages/Login.tsx` - Login page
- [ ] `src/pages/Register.tsx` - Register page

### **TIER 5 - Calculator (Main Feature)**
- [ ] `src/components/Calculator/StepProvider.tsx` - Step 1: Provider select
- [ ] `src/components/Calculator/StepServices.tsx` - Step 2: Add services
- [ ] `src/components/Calculator/StepDiscounts.tsx` - Step 3: Configure discounts
- [ ] `src/components/Calculator/ResultsDisplay.tsx` - Step 4: Show results
- [ ] `src/pages/Calculator.tsx` - Main calculator page (orchestrator)

### **TIER 6 - Dashboard & Estimations**
- [ ] `src/components/Estimation/EstimationCard.tsx` - Card pour list
- [ ] `src/pages/Dashboard.tsx` - Home page + list estimations

### **TIER 7 - Detail Pages**
- [ ] `src/pages/EstimationDetail.tsx` - View single estimation
- [ ] `src/components/Estimation/ComparisonTable.tsx` - Comparison table
- [ ] `src/pages/Compare.tsx` - Compare 2 estimations
- [ ] `src/pages/Export.tsx` - Export CSV

### **TIER 8 - Root & Layout**
- [ ] `src/App.tsx` - Routing setup
- [ ] `src/main.tsx` - Entry point (déjà existant)
- [ ] `src/App.css` - Layout styles (si besoin)

---

## **ORDRE DE CRÉATION OPTIMAL**

```
1. TIER 1 (Foundation)
   ↓
2. TIER 2 (API Layer)
   ↓
3. TIER 3 (Common Components)
   ↓
4. TIER 4 (Auth - pour tester authentification)
   ↓
5. TIER 8 (Root - pour pouvoir router et tester)
   ↓
6. TIER 5 (Calculator - feature principale)
   ↓
7. TIER 6 (Dashboard)
   ↓
8. TIER 7 (Detail pages - finition)
```

---
