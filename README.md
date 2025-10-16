# Architecture Logique - Cheminement des Données

## 1. COUCHE DE DONNÉES

**PostgreSQL** stocke trois types de données:
- Les prix officiels (source de vérité)
- Les estimations sauvegardées par l'utilisateur
- L'historique des changements de prix

**Redis** stocke:
- Les prix en cache (copie temporaire de PostgreSQL)
- TTL de 8 heures

## 2. ACTUALISATION DES PRIX

Toutes les 6-8 heures:
- LLM va chercher les prix AWS/Azure actuels
- Compare chaque prix avec ce qui est en DB
- Si différence > 0.1%, met à jour PostgreSQL et log le changement
- Vide le cache Redis (tous les prix expirent)

## 3. QUAND L'UTILISATEUR CALCULE UNE ESTIMATION

### Etape 1: L'utilisateur remplit les paramètres (service, région, quantité, modèle de pricing)

### Etape 2: Le backend cherche le prix
- Cherche d'abord en Redis
- Si pas en cache, cherche en PostgreSQL
- Compare les deux (validation que cache n'est pas stale)
- Cherche s'il y a un override utilisateur pour cette session
- Retourne le prix final

### Etape 3: Applique les réductions
- **on-demand**: pas de réduction
- **reserved-1y**: -40%
- **reserved-3y**: -60%
- **spot**: -90%

### Etape 4: Calcul du coût
- Prix horaire final x quantité x heures du mois = coût mensuel
- Coût mensuel x 12 = coût annuel

### Etape 5: Pour tous les services
- Répète les étapes 2-4 pour chaque service
- Cumule les coûts
- Retourne le breakdown complet

## 4. OVERRIDES UTILISATEUR (Session)

L'utilisateur peut modifier un prix pour sa session actuelle:
- Ce prix modifié ne s'applique que pour lui, seulement cette session
- Ne modifie pas la DB
- S'il veut proposer un prix définitif, crée une proposition pour validation admin

## 5. SAUVEGARDE DE L'ESTIMATION

Quand l'utilisateur clique "Sauvegarder":
- Sauvegarde la configuration complète en PostgreSQL
- Sauvegarde le breakdown par service
- Crée une version avec timestamp
- Permet d'exporter plus tard

## 6. EXPORT CSV

Récupère l'estimation sauvegardée, formate les données et retourne un fichier CSV structuré.

---

## Flux Complet d'une Requête

```
Utilisateur remplit form -> Backend reçoit ->

Pour chaque service:
  Récupère prix (Redis ou DB) -> Valide cache/DB -> Applique override -> Applique réduction -> Calcul coût

Cumule tous les services -> Retourne breakdown

Si sauvegarde: -> Persiste en DB -> Peut exporter

Si propose nouveau prix: -> Crée proposition en attente (admin valide)
```