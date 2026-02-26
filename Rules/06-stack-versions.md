# Stack Versions Policy

## Baseline verifiee (2026-02-25)

| Composant | Version cible |
|---|---|
| Node.js LTS | 24.14.0 (Krypton, date release: 2026-02-24) |
| pnpm | 10.30.2 |
| turbo | 2.8.10 |
| React | 19.2.4 |
| React DOM | 19.2.4 |
| Vite | 7.3.1 |
| @vitejs/plugin-react | 5.1.4 |
| Tailwind CSS | 4.2.1 |
| Express | 5.2.1 |
| Prisma / @prisma/client | 7.4.1 |
| @prisma/adapter-pg | 7.4.1 |
| pg | 8.18.0 |
| @types/pg | 8.16.0 |
| TypeScript | 5.9.3 |
| ESLint | 10.0.2 |
| Prettier | 3.8.1 |
| PostgreSQL | 18.2 |

## Compatibilite Node importante
- Vite 7 requiert `^20.19.0 || >=22.12.0`.
- Prisma 7 requiert `^20.19 || ^22.12 || >=24.0`.
- Strategie projet: rester sur Node 24.x (LTS) tant que tous les outils sont compatibles.

## Politique de verrouillage
- Toujours commit `pnpm-lock.yaml`.
- Pas de mise a jour massive sans branche dediee.
- Toute mise a jour majeure doit passer `lint + check-types + build + smoke manual`.

## Politique de verification avant implementation
Executer ces commandes et mettre a jour ce fichier si ecart:
```bash
npm view react react-dom vite tailwindcss prisma @prisma/client express version
npm view @prisma/adapter-pg pg @types/pg version
npm view vite prisma @prisma/client engines
npm view turbo pnpm eslint prettier typescript version
node -e "const https=require('https');https.get('https://nodejs.org/dist/index.json',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{const a=JSON.parse(d);const l=a.find(x=>x.lts);console.log(JSON.stringify({latest:a[0].version,lts:l.version,codename:l.lts,date:l.date},null,2));});});"
curl -fsSL https://www.postgresql.org/versions.rss | head -n 30
```

## Policy semver dans package.json
- Runtime deps: `^` autorise pour patch/minor.
- Tooling sensible (lint/build infra): version fixe si historique de regressions.
- Prisma + @prisma/client: garder strictement alignees.
