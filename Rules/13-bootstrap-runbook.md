# Bootstrap Runbook (Setup Only)

Ce document decrit les commandes de bootstrap recommandees pour creer le socle monorepo.
Il ne couvre pas encore la logique metier finale.

## 1) Initialiser racine monorepo
```bash
pnpm init
pnpm add -D turbo typescript eslint prettier
```

## 2) Creer workspace pnpm
`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## 3) Creer structure dossiers
```bash
mkdir -p apps/api apps/web packages/shared-types packages/shared-utils packages/config-eslint packages/config-typescript infra/docker docs/specs
```

## 4) Initialiser app web (Vite React TS)
```bash
pnpm create vite apps/web --template react-ts
pnpm --filter ./apps/web add react react-dom
pnpm --filter ./apps/web add -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

## 5) Initialiser app api (Node/Express TS)
```bash
pnpm --filter ./apps/api init
pnpm --filter ./apps/api add express zod @prisma/client @prisma/adapter-pg pg
pnpm --filter ./apps/api add -D typescript tsx prisma @types/express @types/node @types/pg
```

## 6) Initialiser Prisma
```bash
pnpm --filter ./apps/api prisma init
```
Puis adapter `schema.prisma` et `prisma.config.ts` selon `rules/08-database-prisma-postgres.md`.

## 6.1) URL base locale PostgreSQL
Si Prisma CLI tourne sur la machine hote, utiliser:
```bash
DATABASE_URL=postgresql://swapsphere:swapsphere@localhost:5174/swapsphere
```

## 7) Configurer turbo
`turbo.json` minimal:
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", "build/**"] },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

## 8) Scripts racine
`package.json`:
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

## 9) Docker baseline
Creer:
- `infra/docker/api.Dockerfile`
- `infra/docker/web.Dockerfile`
- `docker-compose.yml`

Suivre blueprint dans `rules/11-docker-devx.md`.

## 10) Gate de fin setup
Le setup est valide si:
- `pnpm install` passe
- `pnpm dev` lance web + api
- `docker compose up -d` lance db + api + web
- `pnpm lint && pnpm check-types && pnpm build` passent
