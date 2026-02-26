# Domain Model

## Entites

### User
- `id` (uuid)
- `displayName` (string)
- `avatarUrl` (string, nullable)
- `createdAt`

### Item
- `id` (uuid)
- `title` (string, max 120)
- `description` (text)
- `category` (enum: CARD, ACCESSORY, DIGITAL)
- `imageUrl` (string)
- `ownerId` (fk -> User)
- `createdAt`

### Trade
- `id` (uuid)
- `proposerId` (fk -> User)
- `recipientId` (fk -> User)
- `status` (enum: PENDING, NEGOTIATION, ACCEPTED, REJECTED, CANCELED)
- `createdAt`
- `updatedAt`

### TradeItem
- `id` (uuid)
- `tradeId` (fk -> Trade)
- `itemId` (fk -> Item)
- `side` (enum: PROPOSER, RECIPIENT)

### TradeMessage
- `id` (uuid)
- `tradeId` (fk -> Trade)
- `authorId` (fk -> User)
- `messageType` (enum: PROPOSAL, COMMENT, SYSTEM)
- `body` (text)
- `createdAt`

## Regles metier essentielles
- A la creation d'un trade: minimum 1 `TradeItem` cote `PROPOSER` et 1 cote `RECIPIENT`.
- Les objets selectionnes doivent appartenir au bon utilisateur au moment de la proposition.
- `ACCEPTED` et `REJECTED` sont des etats terminaux.
- Toute reponse textuelle d'un participant bascule le statut a `NEGOTIATION` si la transaction etait `PENDING`.
- Aucun champ monetaire n'est autorise dans le schema.
