# Docker and Dev Experience

## Objectif
Avoir un environnement local reproductible avec `web + api + db`.

## Contrainte locale de port
- Port PostgreSQL hote impose: `5174` (car `5432` est deja occupe localement).
- Port PostgreSQL dans le conteneur: `5432` (standard).

## Principes retenus de la doc Compose
- Utiliser des `named volumes` pour persister la data PostgreSQL.
- Utiliser `depends_on` pour ordonnancer le demarrage des services.
- Variables via `.env` + `.env.example`.

## Compose blueprint (reference)
```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: swapsphere
      POSTGRES_USER: swapsphere
      POSTGRES_PASSWORD: swapsphere
    ports:
      - "5174:5432"
    volumes:
      - postgres_data:/var/lib/postgresql

  api:
    build:
      context: .
      dockerfile: infra/docker/api.Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://swapsphere:swapsphere@db:5432/swapsphere
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - db

  web:
    build:
      context: .
      dockerfile: infra/docker/web.Dockerfile
    environment:
      VITE_API_BASE_URL: http://localhost:3000/api/v1
    ports:
      - "5173:5173"
    depends_on:
      - api

volumes:
  postgres_data:
```

## URLs DB selon contexte d'execution
- Depuis un conteneur (api -> db): `postgresql://swapsphere:swapsphere@db:5432/swapsphere`
- Depuis la machine hote (Prisma CLI local, outils GUI): `postgresql://swapsphere:swapsphere@localhost:5174/swapsphere`

## Note PostgreSQL 18+
- Avec les images `postgres:18+`, preferer un mount unique sur `/var/lib/postgresql` (et non `/var/lib/postgresql/data`) pour eviter les erreurs d'initialisation/upgrade du cluster.

## Dockerfile strategy
- Multi-stage build pour images runtime plus petites.
- Copier uniquement manifests d'abord pour optimiser cache install.
- Executer en user non-root quand possible.

## Fichiers environnement
- `.env.example` versionne.
- `.env` local ignore par git.
- Jamais de secret reel dans le repo.

## Commandes standard
```bash
docker compose up -d
docker compose logs -f db api web
docker compose down
docker compose down -v
```

## Definition de ready local
L'env local est pret quand:
- `db` est demarre
- `api` repond `GET /health`
- `web` accessible sur port `5173`

## Bootstrap DB en environnement compose
- Sur une base PostgreSQL vide, l'API applique le schema (`prisma db push`) puis execute le seed avant de lancer le serveur. Si la base contient deja des utilisateurs, le seed est ignore pour conserver les donnees persistantes.
