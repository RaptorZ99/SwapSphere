# rules Index (Self-Contained)

## Objectif
Ce dossier contient la documentation operationnelle complete pour implementer le MVP.
L'agent d'implementation ne doit pas avoir besoin d'aller chercher la doc externe pour executer correctement.

## Regle d'usage
- `rules/` est la source de verite implementation.
- Les decisions ici priment sur les habitudes perso de l'agent.
- Si un point n'est pas couvert, l'agent peut proposer une extension de regle avant d'implementer.

## Ordre de lecture obligatoire
1. [01-project-scope.md](./rules/01-project-scope.md)
2. [02-functional-spec.md](./rules/02-functional-spec.md)
3. [03-domain-model.md](./rules/03-domain-model.md)
4. [04-sdd-workflow.md](./rules/04-sdd-workflow.md)
5. [05-monorepo-architecture.md](./rules/05-monorepo-architecture.md)
6. [06-stack-versions.md](./rules/06-stack-versions.md)
7. [07-backend-express.md](./rules/07-backend-express.md)
8. [08-database-prisma-postgres.md](./rules/08-database-prisma-postgres.md)
9. [09-frontend-react-tailwind.md](./rules/09-frontend-react-tailwind.md)
10. [10-api-contracts.md](./rules/10-api-contracts.md)
11. [11-docker-devx.md](./rules/11-docker-devx.md)
12. [12-quality-gates.md](./rules/12-quality-gates.md)
13. [13-bootstrap-runbook.md](./rules/13-bootstrap-runbook.md)
14. [99-sources.md](./rules/99-sources.md)

## Templates
- [templates/spec-template.md](./rules/templates/spec-template.md)
