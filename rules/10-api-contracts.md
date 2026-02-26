# API Contracts (MVP)

Base URL: `/api/v1`
Format de reponse: JSON uniquement.

## Convention succes
```json
{
  "data": {},
  "meta": {}
}
```

## Convention erreur
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Payload invalide",
    "details": {}
  }
}
```

## Session
### GET `/users`
But: retourner les utilisateurs predefinis.

Succes 200:
```json
{
  "data": [
    { "id": "uuid", "displayName": "Alice", "avatarUrl": null }
  ]
}
```

### POST `/session/select-user`
Body:
```json
{ "userId": "uuid" }
```
Succes 200:
```json
{ "data": { "userId": "uuid" } }
```

Erreurs:
- `400 INVALID_INPUT`
- `404 USER_NOT_FOUND`

## Items
### GET `/items/me`
Retourne les items du user actif.

Erreurs:
- `401 USER_NOT_SELECTED`

### GET `/users/:userId/items`
Retourne les items d'un autre utilisateur.

Erreurs:
- `400 INVALID_INPUT`
- `404 USER_NOT_FOUND`

## Trades
### POST `/trades`
Body:
```json
{
  "recipientId": "uuid",
  "offeredItemIds": ["uuid"],
  "requestedItemIds": ["uuid"],
  "message": "Je propose cet echange"
}
```

Succes 201:
```json
{
  "data": {
    "tradeId": "uuid",
    "status": "PENDING"
  }
}
```

Erreurs:
- `400 INVALID_INPUT`
- `401 USER_NOT_SELECTED`
- `403 INVALID_ITEM_OWNERSHIP`
- `409 INVALID_TRADE_STATE`

### GET `/trades/inbox`
Retourne les trades ou l'utilisateur actif est implique (recus et envoyes), tries par `updatedAt desc`.

### GET `/trades/:tradeId`
Retourne detail trade + items + historique messages.

Erreurs:
- `403 FORBIDDEN_TRADE_ACCESS`
- `404 TRADE_NOT_FOUND`

### POST `/trades/:tradeId/actions/accept`
Succes 200 -> `status: ACCEPTED`

Erreurs:
- `403 FORBIDDEN_TRADE_ACCESS`
- `409 INVALID_TRADE_STATE`

### POST `/trades/:tradeId/actions/reject`
Succes 200 -> `status: REJECTED`

Erreurs:
- `403 FORBIDDEN_TRADE_ACCESS`
- `409 INVALID_TRADE_STATE`

### POST `/trades/:tradeId/messages`
Body:
```json
{ "message": "Contre proposition" }
```

Succes 201:
```json
{
  "data": {
    "messageId": "uuid",
    "status": "NEGOTIATION"
  }
}
```

Erreurs:
- `400 INVALID_INPUT`
- `403 FORBIDDEN_TRADE_ACCESS`
- `409 INVALID_TRADE_STATE`

## Statuts de transaction
- `PENDING`: proposition initiale creee.
- `NEGOTIATION`: commentaires echanges.
- `ACCEPTED`: terminal.
- `REJECTED`: terminal.
- `CANCELED`: terminal (reserve system, par ex. objet devenu indisponible car echange ailleurs).

## Transitions autorisees
- `PENDING -> NEGOTIATION` (commentaire)
- `PENDING -> ACCEPTED` (accept)
- `PENDING -> REJECTED` (reject)
- `NEGOTIATION -> ACCEPTED` (accept)
- `NEGOTIATION -> REJECTED` (reject)

## Idempotence
- `accept/reject` sur etat terminal renvoie `409 INVALID_TRADE_STATE`.
- Aucune operation de suppression hard sur messages dans MVP.
- Si une transaction concurrente est acceptee avec un objet commun, les autres transactions ouvertes concernees passent en `CANCELED`.
