# Spec Template

## 1. Meta
- `spec_id`: US-03
- `feature_name`: Proposition d'echange
- `owner`: implementation-agent
- `status`: done

## 2. Contexte
- Formaliser la creation de transaction de troc multi-objets avec message initial obligatoire.
- Garantir les invariants de proprietaire et de composition minimale des cotes.

## 3. User Story
En tant que `User`, je veux `proposer un echange avec plusieurs objets`, afin de `demarrer une negotiation tracee`.

## 4. Criteres d'acceptation
- [ ] Critere 1 (verifiable): au moins 1 item cote proposant (`offeredItemIds`).
- [ ] Critere 2 (verifiable): au moins 1 item cote destinataire (`requestedItemIds`).
- [ ] Critere 3 (verifiable): message initial non vide obligatoire.
- [ ] Critere 4 (verifiable): la creation ne transfere pas la propriete des objets (transfert uniquement a l'acceptation).

## 5. Contrat API
- Endpoint(s)
  - `POST /api/v1/trades`
- Requete(s)
  - `{ "recipientId": "uuid", "offeredItemIds": ["uuid"], "requestedItemIds": ["uuid"], "message": "..." }`
- Reponse(s)
  - `201 { "data": { "tradeId": "uuid", "status": "PENDING" } }`
- Erreurs
  - `400 INVALID_INPUT`
  - `401 USER_NOT_SELECTED`
  - `403 INVALID_ITEM_OWNERSHIP`
  - `409 INVALID_TRADE_STATE`

## 6. Impact Donnees
- Modeles Prisma concernes
  - `Trade`, `TradeItem`, `TradeMessage`, `Item`
- Migrations necessaires
  - Aucune si schema initial applique.
- Strategie seed/update
  - Jeu de donnees seed avec items sur au moins 2 users pour verification de propriete.
- Invariants metier a garantir
  - Transaction Prisma atomique (`trade + tradeItems + message PROPOSAL`).
  - Verification ownership des items par cote.
  - La creation de troc n'implique pas de reservation forte d'objet.
  - Aucun champ monetaire.

## 7. UI / UX Impact
- Ecrans/routes concernes
  - `/trades/new/:userId`
- Etats loading/empty/error/success
  - Bouton d'envoi desactive pendant soumission.
  - Feedback clair si item invalide ou message manquant.
- Accessibilite minimale
  - Labels associes a tous les champs, erreurs reliees aux inputs.

## 8. Plan de validation fonctionnelle
- API
  - `POST /trades` avec validations et transitions initiales.
- UI
  - Parcours de creation trade depuis selection des objets jusqu'au succes.
- Cas erreur
  - `400`, `401`, `403`, `409` selon scenario.

## 9. Risques
- Risque principal
  - Incoherence si ecriture partielle sans transaction.
- Mitigation
  - Utilisation obligatoire de `prisma.$transaction(...)`.

## 10. Definition of Done
- [x] Spec validee
- [x] Contrats valides
- [x] Validation fonctionnelle confirmee
- [x] Documentation mise a jour
