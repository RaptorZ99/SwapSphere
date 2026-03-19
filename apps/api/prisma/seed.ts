import { PrismaPg } from "@prisma/adapter-pg";
import { ItemCategory, TradeMessageType, TradeSide, TradeStatus } from "@swapsphere/shared";

import { env } from "../src/config/env.js";
import { PrismaClient } from "../src/generated/prisma/client.js";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL })
});

const users = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    displayName: "Alice",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    displayName: "Bruno",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    displayName: "Camille",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80"
  }
];

const items = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    ownerId: users[0].id,
    title: "Dracaufeu Holo",
    description: "Carte premium edition anniversaire.",
    category: ItemCategory.CARD,
    imageUrl: "https://images.unsplash.com/photo-1611931960487-4932667079f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjU1MDF8MHwxfHNlYXJjaHwzfHxwb2tlbW9ufGVufDB8MXx8fDE3NzIwMjYxODN8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    ownerId: users[0].id,
    title: "Sleeves Titan Shield",
    description: "Pack de protections rigides transparentes.",
    category: ItemCategory.ACCESSORY,
    imageUrl: "https://images.unsplash.com/photo-1707209598871-5f6d73cd6586?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjU1MDF8MHwxfHNlYXJjaHw2NXx8Y2FyZHMlMjBwcm90ZWN0aW9ufGVufDB8MHx8fDE3NzIwMjYxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    ownerId: users[1].id,
    title: "Mewtwo Full Art",
    description: "Carte brillante en etat mint.",
    category: ItemCategory.CARD,
    imageUrl: "https://images.unsplash.com/photo-1631677640766-7f7e94505c30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjU1MDF8MHwxfHNlYXJjaHwzNXx8cG9rZW1vbiUyMGNhcmR8ZW58MHwxfHx8MTc3MjAyNjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    ownerId: users[1].id,
    title: "Booster Box",
    description: "Booster de cartes.",
    category: ItemCategory.PACK,
    imageUrl: "https://images.unsplash.com/photo-1666302937150-44f5af2ab474?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjU1MDF8MHwxfHNlYXJjaHw2MHx8cG9rZW1vbnxlbnwwfDB8fHwxNzcyMDI2NDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    ownerId: users[2].id,
    title: "Pikachu Promo",
    description: "Carte promo event local.",
    category: ItemCategory.CARD,
    imageUrl: "https://images.unsplash.com/photo-1672757694547-ff9fe584729b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjU1MDF8MHwxfHNlYXJjaHwxMnx8cGlrYWNodXxlbnwwfDF8fHwxNzcyMDI1ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    ownerId: users[2].id,
    title: "Deck Box Carbon",
    description: "Boitier de rangement rigide.",
    category: ItemCategory.ACCESSORY,
    imageUrl: "https://images.unsplash.com/photo-1686632979221-62fab48a9028?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjU1MDF8MHwxfHNlYXJjaHwxOHx8Ym94fGVufDB8MXx8fDE3NzIwMjY1NDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

const trades = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    proposerId: users[0].id,
    recipientId: users[1].id,
    status: TradeStatus.PENDING,
    offeredItems: [
      {
        id: "40000000-0000-4000-8000-000000000001",
        itemId: items[0].id
      }
    ],
    requestedItems: [
      {
        id: "40000000-0000-4000-8000-000000000002",
        itemId: items[2].id
      }
    ],
    messages: [
      {
        id: "30000000-0000-4000-8000-000000000001",
        authorId: users[0].id,
        messageType: TradeMessageType.PROPOSAL,
        body: "Hello Bruno, je propose un echange direct Dracaufeu contre Mewtwo."
      }
    ]
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    proposerId: users[2].id,
    recipientId: users[0].id,
    status: TradeStatus.NEGOTIATION,
    offeredItems: [
      {
        id: "40000000-0000-4000-8000-000000000003",
        itemId: items[4].id
      },
      {
        id: "40000000-0000-4000-8000-000000000004",
        itemId: items[5].id
      }
    ],
    requestedItems: [
      {
        id: "40000000-0000-4000-8000-000000000005",
        itemId: items[1].id
      }
    ],
    messages: [
      {
        id: "30000000-0000-4000-8000-000000000002",
        authorId: users[2].id,
        messageType: TradeMessageType.PROPOSAL,
        body: "Je te propose Pikachu Promo + Deck Box contre tes sleeves Titan Shield."
      },
      {
        id: "30000000-0000-4000-8000-000000000003",
        authorId: users[0].id,
        messageType: TradeMessageType.COMMENT,
        body: "J'aime l'idee, tu peux ajouter un visuel de la carte ?"
      }
    ]
  }
];

export const seed = async (): Promise<void> => {
  for (const user of users) {
    await prisma.user.upsert({
      where: {
        id: user.id
      },
      create: user,
      update: {
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    });
  }

  for (const item of items) {
    await prisma.item.upsert({
      where: {
        id: item.id
      },
      create: item,
      update: {
        ownerId: item.ownerId,
        title: item.title,
        description: item.description,
        category: item.category,
        imageUrl: item.imageUrl
      }
    });
  }

  const tradeIds = trades.map((trade) => trade.id);

  await prisma.tradeMessage.deleteMany({
    where: {
      tradeId: {
        in: tradeIds
      }
    }
  });

  await prisma.tradeItem.deleteMany({
    where: {
      tradeId: {
        in: tradeIds
      }
    }
  });

  await prisma.trade.deleteMany({
    where: {
      id: {
        in: tradeIds
      }
    }
  });

  for (const trade of trades) {
    await prisma.trade.create({
      data: {
        id: trade.id,
        proposerId: trade.proposerId,
        recipientId: trade.recipientId,
        status: trade.status
      }
    });

    await prisma.tradeItem.createMany({
      data: [
        ...trade.offeredItems.map((offeredItem) => ({
          id: offeredItem.id,
          tradeId: trade.id,
          itemId: offeredItem.itemId,
          side: TradeSide.PROPOSER
        })),
        ...trade.requestedItems.map((requestedItem) => ({
          id: requestedItem.id,
          tradeId: trade.id,
          itemId: requestedItem.itemId,
          side: TradeSide.RECIPIENT
        }))
      ]
    });

    await prisma.tradeMessage.createMany({
      data: trade.messages.map((message) => ({
        id: message.id,
        tradeId: trade.id,
        authorId: message.authorId,
        messageType: message.messageType,
        body: message.body
      }))
    });
  }

  console.info("SwapSphere seed completed.");
};

const isDirectExecution = process.argv[1]?.endsWith("/prisma/seed.ts") || process.argv[1]?.endsWith("\\prisma\\seed.ts");

if (isDirectExecution) {
  seed()
    .catch((error: unknown) => {
      console.error("SwapSphere seed failed", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
