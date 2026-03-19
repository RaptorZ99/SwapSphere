# Monorepo Architecture (pnpm + turbo)

## Objectif
Standardiser une architecture monorepo reproductible et rapide en local/CI.

## Outils
- Package manager: `pnpm`
- Workspace orchestration: `turbo`
- Langage: TypeScript partout

## Arborescence cible
```text
apps/
  api/
  web/
packages/
  shared/                 # Types partages + utilitaires purs
infra/
  docker/
rules/
docs/
  specs/
```

## Fichiers racine obligatoires
- `pnpm-workspace.yaml`
- `turbo.json`
- `package.json`
- `tsconfig.base.json`
- `tsconfig.node.json` — extends base, ajoute lib Node
- `tsconfig.react.json` — extends base, ajoute lib DOM + JSX
- `eslint.config.mjs` — config ESLint centralisee (flat config ESLint 10)
- `.gitignore`
- `.env.example`

## pnpm workspace (doc officielle retenue)
La racine workspace est definie par `pnpm-workspace.yaml`.
La section `packages` inclut/exclut les chemins du monorepo.

Exemple recommande:
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "!**/dist/**"
```

## Regles pnpm pour ce projet
- Toujours installer depuis la racine.
- Utiliser `--filter` pour cibler une app/package.
- Eviter `npm`/`yarn` en parallele dans le repo.
- Committer `pnpm-lock.yaml`.

Commandes utiles:
```bash
pnpm install
pnpm --filter @swapsphere/api dev
pnpm --filter @swapsphere/web dev
```

## turbo.json (doc officielle retenue)
- `tasks` definit les taches executables.
- `dependsOn: ["^build"]` force le build des dependances internes avant le package courant.
- `outputs` definit les artefacts caches.
- `dev` doit etre `persistent: true` et `cache: false`.

Template recommande:
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "globalDependencies": [".env", ".env.*", "tsconfig.base.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Scripts racine recommandes
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types"
  }
}
```

## Conventions de nommage packages
- `@swapsphere/api`
- `@swapsphere/web`
- `@swapsphere/shared`

## Frontieres de dependances
- `apps/web` ne depend pas de `apps/api`.
- Les types partages et utilitaires purs passent par `packages/shared`.
- Les configs ESLint et TypeScript sont centralisees a la racine du monorepo (pas de packages `config-*` dedies).

## Anti-patterns interdits
- Copier/coller des types API entre front et back.
- Scripts differents pour le meme objectif selon package sans raison.
- Multiples sources de verite pour les versions outillage.
