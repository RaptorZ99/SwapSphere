# SwapSphere

SwapSphere est une application de troc (MVP) orientee collection TCG, sans aucun flux monetaire.
Le produit permet a des utilisateurs predefinis de proposer des echanges d'objets, negocier via messages, puis accepter/refuser une transaction.

## Table des matieres
- [1. Objectif produit](#1-objectif-produit)
- [2. Fonctionnalites MVP (US-01 a US-05)](#2-fonctionnalites-mvp-us-01-a-us-05)
- [3. Contraintes metier non negociables](#3-contraintes-metier-non-negociables)
- [4. Architecture du monorepo](#4-architecture-du-monorepo)
- [5. Stack technique et versions cibles](#5-stack-technique-et-versions-cibles)
- [6. Prerequis](#6-prerequis)
- [7. Variables d'environnement](#7-variables-denvironnement)
- [8. Lancer le projet en local (apps en local + DB Docker)](#8-lancer-le-projet-en-local-apps-en-local--db-docker)
- [9. Lancer le projet full Docker](#9-lancer-le-projet-full-docker)
- [10. API HTTP (resume des endpoints)](#10-api-http-resume-des-endpoints)
- [11. Flux fonctionnels](#11-flux-fonctionnels)
- [12. Modele de donnees](#12-modele-de-donnees)
- [13. Validation et quality gates](#13-validation-et-quality-gates)
- [14. Commandes utiles](#14-commandes-utiles)
- [15. Documentation interne](#15-documentation-interne)
- [16. Troubleshooting](#16-troubleshooting)

## 1. Objectif produit
SwapSphere cible un besoin simple: faciliter l'echange d'objets de collection entre utilisateurs, avec une logique claire, verifiable et reproductible en local.

Le MVP couvre:
- identification simplifiee via selection de profil predefini,
- consultation d'inventaires,
- creation de proposition d'echange multi-objets,
- reponse du destinataire (accepter/refuser/commenter) avec controle de disponibilite des objets,
- transfert de propriete des objets a l'acceptation,
- vue "Mes trocs" avec trocs en cours et passes (envoyes + recus),
- historique complet des messages de transaction.

## 2. Fonctionnalites MVP (US-01 a US-05)
- `US-01` Identification simplifiee (`/select-user` + `GET /api/v1/users` + `POST /api/v1/session/select-user`)
- `US-02` Consultation des objets (`/dashboard`, `/users/:userId/items`)
- `US-03` Proposition d'echange (`/trades/new/:userId` + `POST /api/v1/trades`)
- `US-04` Reponse destinataire (`accept`, `reject`, `comment`) avec swap d'ownership et annulation de conflits
- `US-05` Historique et suivi des transactions (`GET /api/v1/trades/inbox`, `GET /api/v1/trades/:tradeId`)

Les specs sont dans `docs/specs/`.

## 3. Contraintes metier non negociables
- Aucun paiement, aucun prix, aucune monnaie dans le code ou le modele.
- Pas d'inscription ni mot de passe: selection d'un utilisateur predefini.
- Les objets sont administres en base (seed/admin ops), pas via onboarding utilisateur.
- L'historique des messages d'une transaction est conserve.
- Les etats `ACCEPTED`, `REJECTED` et `CANCELED` sont terminaux.

## 4. Architecture du monorepo
```text
apps/
  api/                    # Express 5 + Prisma + Zod
  web/                    # React 19 + Vite 7 + Tailwind 4
packages/
  config-eslint/          # Config ESLint partagee
  config-typescript/      # Config TS partagee
  shared-types/           # Contrats types front/back
  shared-utils/           # Utilitaires purs partages
infra/
  docker/                 # Dockerfiles dev
rules/                    # Source de verite implementation
docs/
  specs/                  # Specs US-01..US-05
```

Principes de frontiere:
- `apps/web` ne depend pas de `apps/api`.
- Les contrats passent par `packages/shared-types`.
- Les utilitaires metier transverses passent par `packages/shared-utils`.

## 5. Stack technique et versions cibles
Versions alignees avec `rules/06-stack-versions.md`:
- Node.js `24.14.0`
- pnpm `10.30.2`
- turbo `2.8.10`
- React / React DOM `19.2.4`
- Vite `7.3.1`
- Tailwind CSS `4.2.1`
- Express `5.2.1`
- Prisma / @prisma/client `7.4.1`
- PostgreSQL `18`
- TypeScript `5.9.3`
- ESLint `10.0.2`
- Prettier `3.8.1`

## 6. Prerequis
- Node `24.14.0`
- pnpm `10.30.2`
- Docker + Docker Compose

Verification rapide:
```bash
node -v
pnpm -v
docker --version
docker compose version
```

## 7. Variables d'environnement
Le repo fournit `.env.example`:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://swapsphere:swapsphere@localhost:5174/swapsphere
VITE_APP_NAME=SwapSphere
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://localhost:3000
```

Variables importantes:
- `DATABASE_URL`: URL Postgres utilisee par Prisma/API en local host.
- `VITE_API_BASE_URL`: base HTTP appelee par le client (`/api/v1`).
- `VITE_API_PROXY_TARGET`: cible du proxy Vite en dev (`/api -> api`).

## 8. Lancer le projet en local (apps en local + DB Docker)
1. Installer les dependances depuis la racine:
```bash
pnpm install
```

2. Creer ton env local:
```bash
cp .env.example .env
```

3. Demarrer uniquement PostgreSQL:
```bash
docker compose up -d db
```

4. Initialiser la base (schema + seed):
```bash
pnpm --filter @swapsphere/api prisma:push
pnpm --filter @swapsphere/api prisma:seed
```

5. Lancer l'API et le front en local:
```bash
pnpm --filter @swapsphere/api dev
pnpm --filter @swapsphere/web dev
```

6. Ouvrir:
- Web: `http://localhost:5173`
- API health: `http://localhost:3000/health`

Note: `pnpm dev` depuis la racine lance Turbo sur les taches `dev`, mais la base doit etre prete avant.

## 9. Lancer le projet full Docker
Mode le plus simple pour un bootstrap complet reproductible:

```bash
docker compose up -d --build
```

Ce mode:
- demarre `db`,
- demarre `api`, applique `prisma db push`, execute le seed uniquement si la base est vide, puis lance le serveur,
- demarre `web`.

Verification:
```bash
curl -fsS http://localhost:3000/health
curl -fsS http://localhost:3000/api/v1/users
```

Arret:
```bash
docker compose down
```

Reset complet (volume DB inclus):
```bash
docker compose down -v
```

## 10. API HTTP (resume des endpoints)
Base URL: `/api/v1`

Endpoints publics (pas de `x-user-id` requis):
- `GET /users`
- `POST /session/select-user`

Endpoints necessitant un utilisateur selectionne:
- `GET /items/me`
- `GET /users/:userId/items`
- `POST /trades`
- `GET /trades/inbox` (trocs envoyes + recus pour l'utilisateur actif)
- `GET /trades/:tradeId`
- `POST /trades/:tradeId/actions/accept`
- `POST /trades/:tradeId/actions/reject`
- `POST /trades/:tradeId/messages`

Identification utilisateur:
- header `x-user-id` prioritaire,
- fallback cookie `swapsphere_user_id` (pose par `POST /session/select-user`).

Codes d'erreur metier exposes:
- `INVALID_INPUT`
- `USER_NOT_SELECTED`
- `USER_NOT_FOUND`
- `INVALID_ITEM_OWNERSHIP`
- `INVALID_TRADE_STATE`
- `FORBIDDEN_TRADE_ACCESS`
- `TRADE_NOT_FOUND`
- `NOT_FOUND`
- `INTERNAL_ERROR`

Exemple minimal:
```bash
# 1) lister les profils
curl -s http://localhost:3000/api/v1/users

# 2) selectionner un profil
curl -s -X POST http://localhost:3000/api/v1/session/select-user \
  -H 'Content-Type: application/json' \
  -d '{"userId":"00000000-0000-4000-8000-000000000001"}'

# 3) consulter ses objets
curl -s http://localhost:3000/api/v1/items/me \
  -H 'x-user-id: 00000000-0000-4000-8000-000000000001'
```

## 11. Flux fonctionnels
### 11.1 Session simplifiee
- L'utilisateur choisit un profil predefini.
- Le front persiste le `userId` dans `localStorage`.
- L'API ecrit aussi un cookie de session simplifie.

### 11.2 Proposition d'echange
- Le proposant selectionne au moins 1 objet de son cote.
- Le proposant selectionne au moins 1 objet du destinataire.
- Un message initial est obligatoire.
- L'API verifie strictement la propriete des objets de chaque cote.

### 11.3 Negociation et cloture
Transitions autorisees:
- `PENDING -> NEGOTIATION` via commentaire.
- `PENDING|NEGOTIATION -> ACCEPTED` (destinataire uniquement).
- `PENDING|NEGOTIATION -> REJECTED` (destinataire uniquement).
- `ACCEPTED`, `REJECTED` et `CANCELED` sont terminaux.

Effets metier a l'acceptation:
- transfert transactionnel des proprietes d'objets entre proposant et destinataire,
- annulation automatique (`CANCELED`) des autres trocs ouverts qui partagent au moins un objet,
- si un objet n'est plus disponible au moment d'agir, l'action echoue en `409 INVALID_TRADE_STATE`.

### 11.4 Historique
- Les messages sont renvoyes en ordre chronologique ascendant.
- Chaque message expose auteur, type, contenu et horodatage.

### 11.5 Mes trocs
- La page `/trades/inbox` regroupe tous les trocs ou l'utilisateur est implique.
- L'UI separe les sections `En cours` (`PENDING`, `NEGOTIATION`) et `Historique` (`ACCEPTED`, `REJECTED`, `CANCELED`).
- Chaque carte indique si le troc est `Recu de ...` ou `Envoye a ...`.

## 12. Modele de donnees
Entites principales:
- `User`
- `Item` (owner -> User)
- `Trade` (proposer -> User, recipient -> User)
- `TradeItem` (lien trade/item + side proposer/recipient)
- `TradeMessage` (proposition/commentaire/systeme)

Enums:
- `ItemCategory`: `CARD | ACCESSORY | PACK`
- `TradeStatus`: `PENDING | NEGOTIATION | ACCEPTED | REJECTED | CANCELED`
- `TradeSide`: `PROPOSER | RECIPIENT`
- `TradeMessageType`: `PROPOSAL | COMMENT | SYSTEM`

Seed demo (idempotent) fourni:
- 3 utilisateurs (`Alice`, `Bruno`, `Camille`)
- 6 objets
- 2 transactions d'exemple (PENDING + NEGOTIATION)

## 13. Validation et quality gates
Commandes obligatoires avant merge:
```bash
pnpm lint
pnpm check-types
pnpm build
```

Validation fonctionnelle minimale:
- selection utilisateur (`/select-user`)
- consultation inventaires (`/dashboard`, `/users/:userId/items`)
- creation proposition (`/trades/new/:userId`)
- actions destinataire (`accept`, `reject`, `comment`)
- suivi et historique (`/trades/inbox`, `/trades/:tradeId`)

## 14. Commandes utiles
Depuis la racine:
```bash
pnpm install
pnpm dev
pnpm lint
pnpm check-types
pnpm build
pnpm format
pnpm format:write
```

Par package:
```bash
pnpm --filter @swapsphere/api dev
pnpm --filter @swapsphere/web dev
pnpm --filter @swapsphere/api prisma:push
pnpm --filter @swapsphere/api prisma:seed
```

## 15. Documentation interne
Source de verite implementation:
- `CLAUDE.md`
- `rules/00-index.md` (ordre de lecture)
- `rules/01..13` (scope, architecture, stack, API, DB, frontend, quality gates)
- `docs/specs/US-01-identification-simplifiee.md`
- `docs/specs/US-02-consultation-objets.md`
- `docs/specs/US-03-proposition-echange.md`
- `docs/specs/US-04-reponse-destinataire.md`
- `docs/specs/US-05-historique-transaction.md`

## 16. Troubleshooting
### 16.1 "Unsupported engine" sur Node
Le repo cible `>=24.14.0`.
Verifie:
```bash
node -v
```

### 16.2 Erreur Prisma "relation does not exist"
Schema non applique sur DB vide:
```bash
pnpm --filter @swapsphere/api prisma:push
pnpm --filter @swapsphere/api prisma:seed
```

### 16.3 Ports deja occupes
Ports utilises:
- Web: `5173`
- API: `3000`
- Postgres host: `5174`

Adapte ton environnement local si conflit.

### 16.4 Repartir d'un etat propre Docker
```bash
docker compose down -v
docker compose up -d --build
```

### 16.5 Pourquoi des JSON 500 "Unexpected error" ?
L'API masque les details internes cote client et journalise l'erreur complete cote serveur avec `requestId`.
Consulte les logs API pour le detail.
