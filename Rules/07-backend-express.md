# Backend Rules (Node + Express 5)

## Principes issus de la doc Express 5
- Le handler d'erreur final doit avoir 4 arguments: `(err, req, res, next)`.
- L'ordre des middlewares est critique: Express execute dans l'ordre d'enregistrement.
- Express 5 gere mieux les promesses rejetees dans middleware/handlers async.
- `req.body` n'est pas garanti initialise si parser absent ou payload vide.

## Architecture en couches
- `routes/`: definition URL + chain middleware
- `controllers/`: adaptation HTTP
- `services/`: logique metier pure
- `repositories/`: acces DB via Prisma
- `validators/`: schemas Zod
- `mappers/`: conversion domain <-> transport

## Arborescence API recommandee
```text
apps/api/src/
  app.ts
  server.ts
  config/
  middleware/
  modules/
    users/
    items/
    trades/
  lib/
  types/
```

## Middleware order obligatoire
1. correlation/request id
2. access logger
3. `express.json({ limit: "1mb" })`
4. session utilisateur simplifiee (header/cookie de selection)
5. routes `/api/v1/*`
6. 404 JSON
7. error handler JSON

## Standard de reponse
Succes:
```json
{
  "data": {},
  "meta": {}
}
```

Erreur:
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Payload invalide",
    "details": {}
  }
}
```

## Strategy validation (Zod)
- Un schema par endpoint pour `params`, `query`, `body`.
- Validation en middleware avant controller.
- Les messages d'erreur de validation sont mappes vers `400 INVALID_INPUT`.

Pattern recommande:
```ts
const schema = z.object({
  body: z.object({
    recipientId: z.string().uuid(),
    offeredItemIds: z.array(z.string().uuid()).min(1),
    requestedItemIds: z.array(z.string().uuid()).min(1),
    message: z.string().min(1).max(1000)
  })
});
```

## Strategy async/error handling
- Controllers et services en `async`.
- Lever des erreurs metier explicites (`AppError`).
- Mapper Prisma errors -> erreurs metier stables.

Exemple handler final:
```ts
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }

  req.log?.error?.(err);
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Unexpected error" } });
});
```

## Conventions de routes
- Prefixe global: `/api/v1`
- Ressources nommees au pluriel (`/users`, `/items`, `/trades`)
- Actions metier explicites quand necessaire (`/trades/:id/actions/accept`)

## Time and data conventions
- Horodatages en UTC ISO-8601.
- IDs exposes en UUID string.
- Pagination cursor-based si liste potentiellement grande.

## Regles metier non negociables
- Aucun champ prix/montant/monnaie dans API.
- Verifier que l'auteur de l'action participe a la transaction.
- Interdire transition de statut invalide.
