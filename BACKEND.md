# Priceyy Backend - Roadmap de Robustesse

## PHASE 1: FONDATIONS (Semaine 1)
*Blockers critiques, sans ça le reste s'effondre*

### 1.1 Database Migrations
- [ ] Créer structure Alembic pour migrations
- [ ] Version la DB actuelle
- [ ] Tests de rollback/forward
- **Impact:** Production-ready DB schema

### 1.2 Database Indexes
- [ ] Index sur `(provider, service_name, resource_type, region, pricing_model)`
- [ ] Index sur `estimation.user_id`
- [ ] Index sur `estimation.created_at`
- **Impact:** Performance x10 sur requêtes

### 1.3 Data Model Fixes
- [ ] Ajouter `created_by` à `Estimation` (au lieu de `user_id` libre)
- [ ] Ajouter `session_expires_at` à `UserPriceOverride`
- [ ] Ajouter TTL sur overrides (24h max)
- **Impact:** Sécurité + données cohérentes

---

## PHASE 2: ALGORITHMES CORRECTS (Semaine 1-2)
*Les calculs doivent être vrais*

### 2.1 Reserved Instances - Upfront Cost
- [ ] Parser `upfront_cost` depuis AWS API
- [ ] Calculer coût mensuel = `(upfront / 36) + hourly_rate`
- [ ] Tests: `reserved-1y` et `reserved-3y` avec upfront
- **Impact:** Estimations ±5% au lieu de ±30%

### 2.2 Data Transfer Costs (MAJOR)
- [ ] Créer table `DataTransferPrice` (`provider`, `from_region`, `to_region`, `cost_per_gb`)
- [ ] Fetch data transfer pricing AWS/Azure
- [ ] Ajouter champ `data_transfer_gb` à `CalculationRequest`
- [ ] Calculer `data_transfer_cost` = `gb * price`
- **Impact:** +15-30% des coûts réels

### 2.3 Pricing Fallbacks
- [ ] Si prix manquant: retourner "conservative estimate" (prix +20%)
- [ ] Pas d'erreur 404, juste `warning`
- [ ] Logger les fallbacks pour debug
- **Impact:** UX meilleure, pas de blockers

### 2.4 Edge Cases
- [ ] `hours_per_month` validation (0-8760)
- [ ] `quantity` validation (1-100000)
- [ ] Test: `quantity=1`, `hours=1` (minimal case)
- [ ] Test: `quantity=10000`, `hours=8760` (maximal case)
- **Impact:** Zéro crashes mystérieux

---

## PHASE 3: TESTING (Semaine 2)
*Zéro confiance sans tests*

### 3.1 Tests Unitaires - Pricing
- [ ] `test_calculate_on_demand()`
- [ ] `test_calculate_reserved_1y()`
- [ ] `test_calculate_reserved_3y_with_upfront()`
- [ ] `test_calculate_spot()`
- [ ] `test_data_transfer_cost()`
- [ ] `test_discount_application()`
- **Coverage target:** 95%+ pricing logic

### 3.2 Tests Unitaires - Validation
- [ ] `test_invalid_provider()`
- [ ] `test_invalid_pricing_model()`
- [ ] `test_invalid_quantity_zero()`
- [ ] `test_invalid_quantity_overflow()`
- [ ] `test_invalid_hours_overflow()`
- **Coverage target:** 100% validation

### 3.3 Tests Unitaires - Cache
- [ ] `test_cache_hit()`
- [ ] `test_cache_miss_fallback_to_db()`
- [ ] `test_cache_stale_detection()`
- [ ] `test_override_applied()`
- **Coverage target:** 90%+ cache logic

### 3.4 Tests d'Intégration
- [ ] `test_full_calculation_flow()`
- [ ] `test_save_estimation_flow()`
- [ ] `test_export_csv()`
- **Coverage target:** 80%+ endpoints

---

## PHASE 4: SÉCURITÉ (Semaine 2-3)
*Pas d'auth = vuln critique*

### 4.1 Authentication
- [ ] Ajouter JWT tokens
- [ ] Endpoint `POST /auth/login` (mock pour maintenant)
- [ ] Middleware d'authentification
- [ ] Valider token sur chaque requête
- **Impact:** Traçabilité réelle des utilisateurs

### 4.2 Authorization
- [ ] Checks ownership: User A ne peut voir/modifier que ses estimations
- [ ] Checks ownership sur overrides
- [ ] Tests d'autorisation (tentative cross-user)
- **Impact:** Zéro fuite de données

### 4.3 Session Security
- [ ] Générer `session_id` sécurisé (UUID4, pas string libre)
- [ ] TTL de 24h sur `UserPriceOverride`
- [ ] Supprimer automatiquement overrides expirées
- **Impact:** Pas de pollution de données

---

## PHASE 5: FEATURES CRITIQUES (Semaine 3)
*Endpoints manquants*

### 5.1 Discovery Endpoints
- [ ] `GET /api/providers` → liste providers
- [ ] `GET /api/services?provider=aws` → liste services
- [ ] `GET /api/resources?provider=aws&service=EC2` → liste types
- [ ] `GET /api/regions?provider=aws` → liste régions
- **Impact:** UX complète, pas de hardcoding frontend

### 5.2 CRUD Complet
- [ ] `GET /api/estimations` → lister mes estimations
- [ ] `GET /api/estimations?limit=10&offset=0` → pagination
- [ ] `PATCH /api/estimations/{id}` → modifier
- [ ] `DELETE /api/estimations/{id}` → supprimer
- [ ] `GET /api/estimations/{id}/history` → versions
- **Impact:** Gestion complète des estimations

### 5.3 Comparaison Estimations
- [ ] `GET /api/estimations/{id1}/compare/{id2}`
- [ ] Retourne diff: coûts, services, changements
- **Impact:** Feature utile pour les clients

---

## PHASE 6: OPÉRATIONS (Semaine 3-4)
*Production reliability*

### 6.1 Scheduler Resilience
- [ ] Add retry logic (3x avec backoff exponentiel)
- [ ] Monitoring: log succès/fail de chaque refresh
- [ ] Alerting: si refresh fail pendant 2h
- [ ] Graceful degradation: use old prices si API down
- **Impact:** Pas de stale data crashes

### 6.2 Database Backups
- [ ] Auto-backup toutes les 6h
- [ ] Test restore procedure
- [ ] Documentation
- **Impact:** Récupération après disaster

### 6.3 Monitoring & Alerting
- [ ] Ajouter metrics: `calculation latency`, `cache hit rate`
- [ ] Alert si `latency > 1s`
- [ ] Alert si `cache hit rate < 80%`
- [ ] Dashboard basique
- **Impact:** Détecte les problèmes avant les users

---

## PHASE 7: POLISH (Semaine 4)
*Optimisations + finesse*

### 7.1 Performance
- [ ] Profile code (où sont les bottlenecks?)
- [ ] Batch pricing refreshes
- [ ] Connection pooling optimisé
- [ ] Query optimization

### 7.2 Logging Amélioré
- [ ] Structured logging (JSON)
- [ ] Correlation IDs sur les requêtes
- [ ] Better audit trail

### 7.3 Documentation
- [ ] OpenAPI/Swagger complet
- [ ] Architecture diagrams
- [ ] Runbook d'opérations
- [ ] Troubleshooting guide

---

## DEPENDENCY GRAPH

Phase 1 (Foundations)

↓

Phase 2 (Algorithms) ← dépend de Phase 1

↓

Phase 3 (Testing) ← dépend de Phase 2

↓

Phase 4 (Security) ← dépend de Phase 1, peut être parallèle à Phase 2-3

↓

Phase 5 (Features) ← dépend de Phase 1-4

↓

Phase 6 (Operations) ← peut être parallèle à Phase 5

↓

Phase 7 (Polish) ← final

## HIGH IMPACT, LOW EFFORT (Do First):


- Database indexes

- Data transfer costs

- Tests unitaires simples

- Pricing fallbacks

## HIGH IMPACT, HIGH EFFORT (Plan Well):


- Auth + Authorization

- Reserved instances upfront

- CRUD complet

## LOW IMPACT, LOW EFFORT (Quick Wins):


- `GET /providers` endpoint

- Logging amélioré

## LOW IMPACT, HIGH EFFORT (Avoid):


- Micro-optimizations

- Perfect monitoring