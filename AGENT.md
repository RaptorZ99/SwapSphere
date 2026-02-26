# AGENT Execution Guide (SwapSphere)

Ce fichier definit les regles obligatoires pour tout agent qui implementera le MVP.

## 1. Mission
Livrer un MVP de troc sans flux monetaire, conforme au besoin pedagogique, avec architecture propre, verifiable, et maintenable.

## 2. Source de verite
Lire et appliquer dans cet ordre:
1. [Rules/00-index.md](/Users/Workingplace/Desktop/MVP_Test/Rules/00-index.md)
2. Tous les fichiers `Rules/0*.md` et `Rules/1*.md` pertinents
3. [Rules/99-sources.md](/Users/Workingplace/Desktop/MVP_Test/Rules/99-sources.md)

Regle cle:
- Les fichiers `Rules/` sont autosuffisants pour implementer.
- L'agent n'a pas a aller chercher la doc externe pendant l'implementation standard.
- Si un besoin depasse `Rules/`, proposer d'abord une mise a jour de regle puis implementer.

## 3. Processus obligatoire par tache
1. Reformuler la user story cible.
2. Verifier/creer la spec dans `docs/specs/` (template obligatoire).
3. Lister impact API + DB + UI.
4. Verifier les impacts fonctionnels attendus avant implementation complete.
5. Implementer en petite tranche verticale.
6. Executer quality gates (`lint`, `check-types`, `build`).
7. Mettre a jour la doc impactee dans `Rules/` si contrat modifie.

## 4. Regles metier non negociables
- Aucun paiement, aucun prix, aucune monnaie.
- Auth limitee a selection d'un utilisateur predefini.
- Objets crees/assignes par admin directement en base (seed/admin ops), pas via onboarding utilisateur.
- Chaque transaction conserve l'historique des messages.

## 5. Contraintes techniques
- Monorepo `pnpm` + `turbo`.
- Front: React 19+ + Vite + Tailwind v4+.
- Back: Node LTS + Express 5.
- DB: PostgreSQL + Prisma.
- Dockerisable localement via compose.

## 6. Politique versions
- Respecter `Rules/06-stack-versions.md`.
- Avant ajout/upgrade de dep, verifier la compatibilite Node et alignement Prisma.

## 7. Prompt engineering operationnel
Toujours produire les etapes sous forme:
1. Hypotheses
2. Plan court
3. Implementation
4. Verification
5. Resultat

Regles de style d'execution:
- Diffs petits et verifiables.
- Noms explicites.
- Aucune abstraction prematuree.
- Pas d'over-engineering (pas de microservices/CQRS/event-bus pour ce MVP).

## 8. Definition of Done globale
- Flows MVP complets fonctionnels.
- Validation fonctionnelle critique backend/frontend en place.
- Documentation synchronisee avec le code.
- Setup/dev reproductibles pour toute l'equipe.
