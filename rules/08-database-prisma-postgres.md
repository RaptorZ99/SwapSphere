# Database rules (PostgreSQL + Prisma v7)

## Decision projet (Prisma v7)
- Prisma v7 est utilise avec le nouveau generator `prisma-client`.
- Le generator `prisma-client-js` n'est pas retenu pour Prisma v7.
- Le projet utilise l'approche driver adapter PostgreSQL avec `@prisma/adapter-pg`.
- Le driver Node `pg` est requis et versionne explicitement.

## Packages requis
- Runtime API:
  - `@prisma/client`
  - `@prisma/adapter-pg`
  - `pg`
- Dev API:
  - `prisma`
  - `@types/pg` (si TypeScript)

## Principes Prisma retenus de la doc
- Le schema Prisma est la source de verite du modele relationnel.
- Workflow standard: `migrate dev` -> `generate` -> usage client.
- Relations explicites via `@relation(fields: [...], references: [...])`.
- Transactions applicatives via `prisma.$transaction(...)` pour operations composees.
- En Prisma v7, utiliser `prisma.config.ts` pour la config CLI.

## prisma.config.ts (recommande)
```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
```

## schema.prisma minimal recommande
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

## Initialisation PrismaClient avec adapter-pg
```ts
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = new PrismaClient({
  adapter
});
```

## URL DB selon contexte local
- Depuis l'API en conteneur: `postgresql://swapsphere:swapsphere@db:5432/swapsphere`
- Depuis la machine hote (Prisma CLI local, GUI): `postgresql://swapsphere:swapsphere@localhost:5174/swapsphere`

## Schema MVP recommande
```prisma
model User {
  id          String         @id @default(uuid())
  displayName String
  avatarUrl   String?
  createdAt   DateTime       @default(now())

  items       Item[]
  proposed    Trade[]        @relation("TradeProposer")
  received    Trade[]        @relation("TradeRecipient")
  messages    TradeMessage[]
}

model Item {
  id          String   @id @default(uuid())
  title       String
  description String
  category    ItemCategory
  imageUrl    String
  ownerId     String
  createdAt   DateTime @default(now())

  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  tradeItems  TradeItem[]

  @@index([ownerId])
  @@index([category])
}

model Trade {
  id           String         @id @default(uuid())
  proposerId   String
  recipientId  String
  status       TradeStatus    @default(PENDING)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  proposer     User           @relation("TradeProposer", fields: [proposerId], references: [id], onDelete: Restrict)
  recipient    User           @relation("TradeRecipient", fields: [recipientId], references: [id], onDelete: Restrict)
  tradeItems   TradeItem[]
  messages     TradeMessage[]

  @@index([proposerId])
  @@index([recipientId])
  @@index([status])
}

model TradeItem {
  id        String        @id @default(uuid())
  tradeId   String
  itemId    String
  side      TradeSide

  trade      Trade        @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  item       Item         @relation(fields: [itemId], references: [id], onDelete: Restrict)

  @@index([tradeId])
  @@index([itemId])
  @@unique([tradeId, itemId])
}

model TradeMessage {
  id           String           @id @default(uuid())
  tradeId      String
  authorId     String
  messageType  TradeMessageType
  body         String
  createdAt    DateTime         @default(now())

  trade        Trade            @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  author       User             @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([tradeId, createdAt])
}

enum ItemCategory {
  CARD
  ACCESSORY
  PACK
}

enum TradeStatus {
  PENDING
  NEGOTIATION
  ACCEPTED
  REJECTED
  CANCELED
}

enum TradeSide {
  PROPOSER
  RECIPIENT
}

enum TradeMessageType {
  PROPOSAL
  COMMENT
  SYSTEM
}
```

## Invariants metier a garantir dans le service
- Au moins 1 item cote proposer et 1 cote recipient.
- L'item doit appartenir a l'utilisateur du cote declare.
- `ACCEPTED` et `REJECTED` sont terminaux.
- Message de negotiation bascule `PENDING` -> `NEGOTIATION`.

## Workflow migration recommande
```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

Regles:
- 1 migration = 1 intention metier.
- Ne jamais editer une migration appliquee.
- Rebaser en creant une nouvelle migration corrective.

## Seeding
Objectif seed MVP:
- utilisateurs predefinis
- items assignes
- quelques trades de demo

Commande:
```bash
pnpm prisma db seed
```

Regles seed:
- idempotent
- deterministic autant que possible
- aucun secret hardcode

## Transactions Prisma
Creation de trade doit etre atomique:
```ts
await prisma.$transaction(async (tx) => {
  const trade = await tx.trade.create({ data: { proposerId, recipientId, status: "PENDING" } });

  await tx.tradeItem.createMany({ data: tradeItemsPayload });

  await tx.tradeMessage.create({
    data: {
      tradeId: trade.id,
      authorId: proposerId,
      messageType: "PROPOSAL",
      body: message
    }
  });
});
```

## Query patterns recommandes
- Detail trade: inclure `tradeItems.item` + `messages.author`.
- Inbox user: `where recipientId = currentUser` + tri `updatedAt desc`.
- Liste items user: `where ownerId = currentUser`.

## Performance minimale MVP
- Index sur FKs et statut.
- Eviter N+1 via include/select Prisma.
- Limiter taille reponses (pagination si necessaire).
