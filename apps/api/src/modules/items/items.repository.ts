import type { ItemCategory, ItemSummary, UserSummary } from "@swapsphere/shared";

import { prisma } from "../../lib/prisma.js";

export type ItemRecord = ItemSummary;

export interface ItemsRepository {
  findUserById: (userId: string) => Promise<UserSummary | null>;
  findItemsByOwner: (ownerId: string, category?: ItemCategory) => Promise<ItemRecord[]>;
}

export class PrismaItemsRepository implements ItemsRepository {
  public async findUserById(userId: string): Promise<UserSummary | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    };
  }

  public async findItemsByOwner(ownerId: string, category?: ItemCategory): Promise<ItemRecord[]> {
    const items = await prisma.item.findMany({
      where: {
        ownerId,
        category
      },
      include: {
        owner: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      ownerId: item.ownerId,
      ownerDisplayName: item.owner.displayName
    }));
  }
}
