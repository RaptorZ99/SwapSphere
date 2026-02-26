# Spec Template

## 1. Meta
- `spec_id`: US-04
- `feature_name`: Reponse du destinataire
- `owner`: implementation-agent
- `status`: done

## 2. Contexte
- Permettre au destinataire de conclure ou poursuivre une transaction.
- Encadrer strictement les transitions d'etat autorisees.
- Garantir la coherence de propriete des objets lors d'acceptation en concurrence.

## 3. User Story
En tant que `User` destinataire, je veux `accepter, refuser ou commenter`, afin de `conclure ou negocier la transaction`.

## 4. Criteres d'acceptation
- [ ] Critere 1 (verifiable): action `ACCEPT` positionne le trade a `ACCEPTED` (terminal) et transfere les objets entre participants.
- [ ] Critere 2 (verifiable): action `REJECT` positionne le trade a `REJECTED` (terminal) sans transfert de propriete.
- [ ] Critere 3 (verifiable): action `COMMENT` conserve la transaction ouverte en `NEGOTIATION`.
- [ ] Critere 4 (verifiable): si un objet du trade n'est plus disponible (deja echange ailleurs), l'action invalide renvoie `409 INVALID_TRADE_STATE` et le trade passe en `CANCELED`.
- [ ] Critere 5 (verifiable): l'acceptation d'un trade annule automatiquement les autres trades ouverts qui partagent au moins un objet (`CANCELED`).

## 5. Contrat API
- Endpoint(s)
  - `POST /api/v1/trades/:tradeId/actions/accept`
  - `POST /api/v1/trades/:tradeId/actions/reject`
  - `POST /api/v1/trades/:tradeId/messages`
- Requete(s)
  - `POST /messages`: `{ "message": "Contre proposition" }`
- Reponse(s)
  - `200 { "data": { "status": "ACCEPTED" } }`
  - `200 { "data": { "status": "REJECTED" } }`
  - `201 { "data": { "messageId": "uuid", "status": "NEGOTIATION" } }`
- Erreurs
  - `400 INVALID_INPUT`
  - `403 FORBIDDEN_TRADE_ACCESS`
  - `409 INVALID_TRADE_STATE`

## 6. Impact Donnees
- Modeles Prisma concernes
  - `Trade`, `TradeMessage`, `TradeItem`, `Item`
- Migrations necessaires
  - Aucune si schema initial applique.
- Strategie seed/update
  - Trades de demo en `PENDING` et `NEGOTIATION`.
- Invariants metier a garantir
  - `ACCEPTED`, `REJECTED`, `CANCELED` restent terminaux.
  - Seuls les participants peuvent agir.
  - Commentaire transforme `PENDING` en `NEGOTIATION`.
  - `ACCEPT` est transactionnel: swap ownership + message systeme + annulation des conflits.

## 7. UI / UX Impact
- Ecrans/routes concernes
  - `/trades/:tradeId`
  - `/trades/inbox`
- Etats loading/empty/error/success
  - CTA explicites: `Accepter`, `Refuser`, `Envoyer un commentaire`.
  - Message d'erreur explicite si objet deja indisponible.
- Accessibilite minimale
  - Boutons desactives pendant requete, message d'erreur lisible.

## 8. Plan de validation fonctionnelle
- API
  - Endpoints actions + controle acces participant.
  - Transfert de propriete sur `accept`.
  - Annulation des trades concurrents sur objets partages.
- UI
  - Parcours action destinataire sur detail transaction.
- Cas erreur
  - `403` acces interdit, `409` transition invalide / objet indisponible.

## 9. Risques
- Risque principal
  - Changement d'etat concurrent menant a une transition invalide.
- Mitigation
  - Verification d'etat courant et ownership en transaction Prisma, annulation systeme des conflits.

## 10. Definition of Done
- [x] Spec validee
- [x] Contrats valides
- [x] Validation fonctionnelle confirmee
- [x] Documentation mise a jour
