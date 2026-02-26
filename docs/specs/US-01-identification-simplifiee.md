# Spec Template

## 1. Meta
- `spec_id`: US-01
- `feature_name`: Identification simplifiee
- `owner`: implementation-agent
- `status`: done

## 2. Contexte
- Permettre un acces rapide a l'application sans onboarding ni gestion de mot de passe.
- Adresser la contrainte MVP: utilisateurs predefinis et session applicative simple.

## 3. User Story
En tant que `User`, je veux `selectionner mon profil predefini`, afin de `demarrer l'utilisation de SwapSphere rapidement`.

## 4. Criteres d'acceptation
- [ ] Critere 1 (testable): `GET /api/v1/users` retourne la liste des utilisateurs predefinis.
- [ ] Critere 2 (testable): `POST /api/v1/session/select-user` enregistre le `userId` selectionne dans la session applicative.
- [ ] Critere 3 (testable): aucun formulaire inscription/mot de passe n'est expose dans l'UI.

## 5. Contrat API
- Endpoint(s)
  - `GET /api/v1/users`
  - `POST /api/v1/session/select-user`
- Requete(s)
  - `POST /session/select-user`: `{ "userId": "uuid" }`
- Reponse(s)
  - `GET /users`: `{ "data": [{ "id": "uuid", "displayName": "Alice", "avatarUrl": null }] }`
  - `POST /session/select-user`: `{ "data": { "userId": "uuid" } }`
- Erreurs
  - `400 INVALID_INPUT`
  - `404 USER_NOT_FOUND`

## 6. Impact Donnees
- Modeles Prisma concernes
  - `User`
- Migrations necessaires
  - Aucune migration supplementaire si schema MVP initial deja applique.
- Strategie seed/update
  - Seed deterministic des utilisateurs predefinis (minimum 3 profils).
- Invariants metier a garantir
  - Pas de credentials stockes pour cette authentification simplifiee.
  - Aucun champ monetaire.

## 7. UI / UX Impact
- Ecrans/routes concernes
  - `/select-user`
- Etats loading/empty/error/success
  - `loading`: attente chargement liste users
  - `empty`: aucun utilisateur disponible
  - `error`: echec API avec message stable
  - `success`: utilisateur selectionne et redirection `/dashboard`
- Accessibilite minimale
  - Liste selectionnable avec labels explicites et focus visible.

## 8. Plan de tests
- Unit
  - Validation du payload `select-user` (uuid requis).
- Integration
  - API `GET /users`, `POST /session/select-user` (cas nominal + user inexistant).
- UI
  - Rendering page `/select-user`, selection utilisateur, redirection.
- Cas erreur
  - `400` payload invalide, `404` user inconnu.

## 9. Risques
- Risque principal
  - Incoherence entre stockage session front et contexte user API.
- Mitigation
  - Contrat de session unique (`userId`) et tests integration front/back.

## 10. Definition of Done
- [x] Spec validee
- [x] Contrats valides
- [x] Tests passent
- [x] Documentation mise a jour
