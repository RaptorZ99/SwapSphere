# Spec Driven Development Workflow

## Regle centrale
Aucune implementation sans spec validee.

## Sequence obligatoire par feature
1. Identifier la user story cible et ses bornes.
2. Creer la spec dans `docs/specs/<id>-<slug>.md` (template obligatoire).
3. Definir contrat API exact (payloads, erreurs, statut HTTP).
4. Definir impact schema Prisma + migration (si necessaire).
5. Implementer une tranche verticale minimale.
6. Executer lint/check-types/build.
7. Valider les parcours fonctionnels critiques.
8. Mettre a jour la doc impactee dans `rules/`.

## Format de spec attendu
- Contexte
- User story
- Criteres d'acceptation verifiables
- Contrat API
- Impact DB
- Plan de validation fonctionnelle
- Definition of done

## Definition of Done (feature)
- Spec mergee et a jour.
- Contrats API appliques et verifies.
- Cas nominaux + erreurs majeures couverts.
- Lint + check-types + build passent.
- Aucune violation des regles metier non negociables.

## Politique de taille de changement
- 1 PR = 1 user story verticale.
- Eviter les mega-PR multi-domaines.
- Diff court > refactor global.

## Checklist de revue SDD
- [ ] La spec existe et correspond au code.
- [ ] Le code implemente strictement les criteres d'acceptation.
- [ ] Les erreurs metier sont explicites.
- [ ] Les invariants DB sont proteges.
- [ ] Les validations fonctionnelles couvrent les regressions probables.
