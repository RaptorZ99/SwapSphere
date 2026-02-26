# Spec Template

## 1. Meta
- `spec_id`: US-05
- `feature_name`: Historique de transaction
- `owner`: implementation-agent
- `status`: done

## 2. Contexte
- Assurer une trace complete des echanges de messages pour contexte et preuve.
- Offrir une lecture chronologique simple non editable dans le MVP.
- Permettre a chaque utilisateur de suivre ses trocs en cours et passes (envoyes + recus).

## 3. User Story
En tant qu'`utilisateur implique`, je veux `voir mes trocs et l'historique complet des messages`, afin de `suivre la negociation sans perte de contexte`.

## 4. Criteres d'acceptation
- [ ] Critere 1 (testable): messages ordonnes par date croissante dans le detail (`/trades/:tradeId`).
- [ ] Critere 2 (testable): auteur et horodatage visibles pour chaque message.
- [ ] Critere 3 (testable): `GET /api/v1/trades/inbox` retourne les trocs ou le user est participant (proposer + recipient).
- [ ] Critere 4 (testable): la page `/trades/inbox` distingue les trocs `En cours` (`PENDING`, `NEGOTIATION`) et `Historique` (`ACCEPTED`, `REJECTED`, `CANCELED`).
- [ ] Critere 5 (testable): aucun mecanisme d'edition/suppression des messages MVP.

## 5. Contrat API
- Endpoint(s)
  - `GET /api/v1/trades/inbox`
  - `GET /api/v1/trades/:tradeId`
- Requete(s)
  - `tradeId` en param UUID pour le detail.
- Reponse(s)
  - Inbox: `{ "data": [{ "id": "uuid", "status": "PENDING", "proposer": {...}, "recipient": {...}, "lastMessage": {...}, "updatedAt": "..." }] }`
  - Detail: `{ "data": { "id": "uuid", "status": "NEGOTIATION", "offeredItems": [...], "requestedItems": [...], "messages": [...] } }`
- Erreurs
  - `401 USER_NOT_SELECTED`
  - `403 FORBIDDEN_TRADE_ACCESS`
  - `404 TRADE_NOT_FOUND`

## 6. Impact Donnees
- Modeles Prisma concernes
  - `Trade`, `TradeMessage`, `User`, `TradeItem`, `Item`
- Migrations necessaires
  - Aucune si schema initial applique.
- Strategie seed/update
  - Seed trades avec plusieurs messages types `PROPOSAL` et `COMMENT`.
- Invariants metier a garantir
  - Tri ascendant `createdAt` sur messages.
  - Historique immutable dans le MVP.
  - Les statuts terminaux (`ACCEPTED`, `REJECTED`, `CANCELED`) restent consultables dans l'historique.
  - Aucun champ financier.

## 7. UI / UX Impact
- Ecrans/routes concernes
  - `/trades/inbox`
  - `/trades/:tradeId`
- Etats loading/empty/error/success
  - Inbox: etats explicites + sections `En cours` / `Historique`.
  - Detail: timeline chronologique des messages.
- Accessibilite minimale
  - Messages lisibles, contraste correct, labels temporels explicites.

## 8. Plan de tests
- Unit
  - Mapper detail trade vers payload UI (ordre chronologique preserve).
- Integration
  - `GET /trades/inbox` (recus + envoyes).
  - `GET /trades/:tradeId` avec include items + messages + author.
- UI
  - Affichage inbox segmentee en cours/passes.
  - Affichage timeline messages (auteur + date + corps).
- Cas erreur
  - `401` user non selectionne, `403` utilisateur non implique, `404` trade absent.

## 9. Risques
- Risque principal
  - Retour de messages non tries ou incomplets selon la requete.
- Mitigation
  - Requetes Prisma avec `orderBy` explicites et controles d'acces stricts.

## 10. Definition of Done
- [x] Spec validee
- [x] Contrats valides
- [x] Tests passent
- [x] Documentation mise a jour
