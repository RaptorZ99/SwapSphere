# Spec Template

## 1. Meta
- `spec_id`: US-02
- `feature_name`: Consultation des objets
- `owner`: implementation-agent
- `status`: done

## 2. Contexte
- Rendre visibles les objets d'un utilisateur et ceux d'un autre profil pour preparer un troc.
- Cibler un affichage simple avec filtrage minimal par categorie.

## 3. User Story
En tant que `User`, je veux `consulter mes objets et ceux d'un autre utilisateur`, afin de `preparer une proposition d'echange`.

## 4. Criteres d'acceptation
- [ ] Critere 1 (verifiable): chaque fiche objet affiche titre, description, categorie, image, proprietaire.
- [ ] Critere 2 (verifiable): `GET /api/v1/items/me` retourne uniquement les objets du user actif.
- [ ] Critere 3 (verifiable): un filtrage minimal par `category` est disponible.
- [ ] Critere 4 (verifiable): apres un troc `ACCEPTED`, `GET /api/v1/items/me` reflete les nouveaux proprietaires.

## 5. Contrat API
- Endpoint(s)
  - `GET /api/v1/items/me`
  - `GET /api/v1/users/:userId/items`
- Requete(s)
  - Query optionnelle: `?category=CARD|ACCESSORY|PACK`
- Reponse(s)
  - `{ "data": [{ "id": "uuid", "title": "...", "description": "...", "category": "CARD", "imageUrl": "...", "ownerId": "uuid" }] }`
- Erreurs
  - `400 INVALID_INPUT`
  - `401 USER_NOT_SELECTED`
  - `404 USER_NOT_FOUND`

## 6. Impact Donnees
- Modeles Prisma concernes
  - `Item`, `User`
- Migrations necessaires
  - Aucune si schema initial applique.
- Strategie seed/update
  - Seed objets de demonstration assignes a des users.
- Invariants metier a garantir
  - `ownerId` valide et coherent.
  - `ownerId` peut changer uniquement via acceptation de troc valide.
  - Aucun champ prix/montant/monnaie.

## 7. UI / UX Impact
- Ecrans/routes concernes
  - `/dashboard`
  - `/users/:userId/items`
- Etats loading/empty/error/success
  - Affichage explicite des 4 etats pour chaque liste.
- Accessibilite minimale
  - Filtres avec labels, focus visible, feedback textuel en cas de resultat vide.

## 8. Plan de validation fonctionnelle
- API
  - Endpoints items avec session active/inactive.
  - Verification des proprietaires apres acceptation d'un troc.
- UI
  - Affichage listes, changement filtre, etat empty.
- Cas erreur
  - `401` sans user selectionne, `404` user cible introuvable.

## 9. Risques
- Risque principal
  - N+1 ou payload trop volumineux si includes Prisma non maitrises.
- Mitigation
  - Selection explicite des champs et pagination prete si besoin.

## 10. Definition of Done
- [x] Spec validee
- [x] Contrats valides
- [x] Validation fonctionnelle confirmee
- [x] Documentation mise a jour
