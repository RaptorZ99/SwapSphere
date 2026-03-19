import {
  TradeMessageType,
  TradeSide,
  TradeStatus,
  type ItemCategory,
  type UserSummary
} from "@swapsphere/shared";

import { prisma } from "../../lib/prisma.js";

export type CreateTradeRepositoryInput = {
  proposerId: string;
  recipientId: string;
  offeredItemIds: string[];
  requestedItemIds: string[];
  message: string;
};

export type TradeActionRecord = {
  id: string;
  proposerId: string;
  recipientId: string;
  status: TradeStatus;
  tradeItems: Array<{
    itemId: string;
    side: TradeSide;
    ownerId: string;
  }>;
};

export type ItemOwnershipRecord = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: ItemCategory;
  imageUrl: string;
};

export type TradeDetailRecord = {
  id: string;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
  proposer: UserSummary;
  recipient: UserSummary;
  tradeItems: Array<{
    side: TradeSide;
    item: {
      id: string;
      title: string;
      description: string;
      category: ItemCategory;
      imageUrl: string;
      ownerId: string;
      owner: UserSummary;
    };
  }>;
  messages: Array<{
    id: string;
    authorId: string;
    body: string;
    messageType: TradeMessageType;
    createdAt: Date;
    author: UserSummary;
  }>;
};

export type TradeInboxRecord = {
  id: string;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
  proposer: UserSummary;
  recipient: UserSummary;
  lastMessage: {
    id: string;
    authorId: string;
    body: string;
    messageType: TradeMessageType;
    createdAt: Date;
    author: UserSummary;
  } | null;
};

export type CreateTradeMessageInput = {
  tradeId: string;
  authorId: string;
  messageType: TradeMessageType;
  body: string;
};

export interface TradesRepository {
  findItemsByIds: (itemIds: string[]) => Promise<ItemOwnershipRecord[]>;
  createTrade: (input: CreateTradeRepositoryInput) => Promise<{ tradeId: string; status: TradeStatus }>;
  findTradeInbox: (userId: string) => Promise<TradeInboxRecord[]>;
  findTradeForAction: (tradeId: string) => Promise<TradeActionRecord | null>;
  updateTradeStatus: (tradeId: string, status: TradeStatus) => Promise<TradeActionRecord>;
  acceptTradeWithOwnershipTransfer: (input: {
    tradeId: string;
    actorId: string;
    proposerId: string;
    recipientId: string;
  }) => Promise<{ status: TradeStatus; ownershipTransferred: boolean }>;
  cancelTradeAsUnavailable: (input: { tradeId: string; actorId: string }) => Promise<TradeActionRecord>;
  createTradeMessage: (input: CreateTradeMessageInput) => Promise<{ id: string }>;
  findTradeDetailById: (tradeId: string) => Promise<TradeDetailRecord | null>;
}

export class PrismaTradesRepository implements TradesRepository {
  public async findItemsByIds(itemIds: string[]): Promise<ItemOwnershipRecord[]> {
    const items = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds
        }
      }
    });

    return items.map((item) => ({
      id: item.id,
      ownerId: item.ownerId,
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl
    }));
  }

  public async createTrade(input: CreateTradeRepositoryInput): Promise<{ tradeId: string; status: TradeStatus }> {
    return prisma.$transaction(async (transaction) => {
      const trade = await transaction.trade.create({
        data: {
          proposerId: input.proposerId,
          recipientId: input.recipientId,
          status: TradeStatus.PENDING
        }
      });

      await transaction.tradeItem.createMany({
        data: [
          ...input.offeredItemIds.map((itemId) => ({
            tradeId: trade.id,
            itemId,
            side: TradeSide.PROPOSER
          })),
          ...input.requestedItemIds.map((itemId) => ({
            tradeId: trade.id,
            itemId,
            side: TradeSide.RECIPIENT
          }))
        ]
      });

      await transaction.tradeMessage.create({
        data: {
          tradeId: trade.id,
          authorId: input.proposerId,
          messageType: TradeMessageType.PROPOSAL,
          body: input.message
        }
      });

      return {
        tradeId: trade.id,
        status: trade.status
      };
    });
  }

  public async findTradeInbox(userId: string): Promise<TradeInboxRecord[]> {
    const trades = await prisma.trade.findMany({
      where: {
        OR: [{ recipientId: userId }, { proposerId: userId }]
      },
      include: {
        proposer: true,
        recipient: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc"
          },
          include: {
            author: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return trades.map((trade) => ({
      id: trade.id,
      status: trade.status,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      proposer: {
        id: trade.proposer.id,
        displayName: trade.proposer.displayName,
        avatarUrl: trade.proposer.avatarUrl
      },
      recipient: {
        id: trade.recipient.id,
        displayName: trade.recipient.displayName,
        avatarUrl: trade.recipient.avatarUrl
      },
      lastMessage: trade.messages[0]
        ? {
            id: trade.messages[0].id,
            authorId: trade.messages[0].authorId,
            body: trade.messages[0].body,
            messageType: trade.messages[0].messageType,
            createdAt: trade.messages[0].createdAt,
            author: {
              id: trade.messages[0].author.id,
              displayName: trade.messages[0].author.displayName,
              avatarUrl: trade.messages[0].author.avatarUrl
            }
          }
        : null
    }));
  }

  public async findTradeForAction(tradeId: string): Promise<TradeActionRecord | null> {
    const trade = await prisma.trade.findUnique({
      where: {
        id: tradeId
      },
      include: {
        tradeItems: {
          include: {
            item: {
              select: {
                ownerId: true
              }
            }
          }
        }
      }
    });

    if (!trade) {
      return null;
    }

    return {
      id: trade.id,
      proposerId: trade.proposerId,
      recipientId: trade.recipientId,
      status: trade.status,
      tradeItems: trade.tradeItems.map((tradeItem) => ({
        itemId: tradeItem.itemId,
        side: tradeItem.side,
        ownerId: tradeItem.item.ownerId
      }))
    };
  }

  public async updateTradeStatus(tradeId: string, status: TradeStatus): Promise<TradeActionRecord> {
    const trade = await prisma.trade.update({
      where: {
        id: tradeId
      },
      data: {
        status
      },
      include: {
        tradeItems: {
          include: {
            item: {
              select: {
                ownerId: true
              }
            }
          }
        }
      }
    });

    return {
      id: trade.id,
      proposerId: trade.proposerId,
      recipientId: trade.recipientId,
      status: trade.status,
      tradeItems: trade.tradeItems.map((tradeItem) => ({
        itemId: tradeItem.itemId,
        side: tradeItem.side,
        ownerId: tradeItem.item.ownerId
      }))
    };
  }

  public async acceptTradeWithOwnershipTransfer(input: {
    tradeId: string;
    actorId: string;
    proposerId: string;
    recipientId: string;
  }): Promise<{ status: TradeStatus; ownershipTransferred: boolean }> {
    return prisma.$transaction(async (transaction) => {
      const trade = await transaction.trade.findUnique({
        where: {
          id: input.tradeId
        },
        include: {
          tradeItems: {
            include: {
              item: true
            }
          }
        }
      });

      if (!trade) {
        return {
          status: TradeStatus.CANCELED,
          ownershipTransferred: false
        };
      }

      const offeredItemIds = trade.tradeItems.filter((tradeItem) => tradeItem.side === TradeSide.PROPOSER).map(
        (tradeItem) => tradeItem.itemId
      );
      const requestedItemIds = trade.tradeItems.filter((tradeItem) => tradeItem.side === TradeSide.RECIPIENT).map(
        (tradeItem) => tradeItem.itemId
      );

      const offeredOwnershipIsValid = trade.tradeItems
        .filter((tradeItem) => tradeItem.side === TradeSide.PROPOSER)
        .every((tradeItem) => tradeItem.item.ownerId === input.proposerId);
      const requestedOwnershipIsValid = trade.tradeItems
        .filter((tradeItem) => tradeItem.side === TradeSide.RECIPIENT)
        .every((tradeItem) => tradeItem.item.ownerId === input.recipientId);

      if (!offeredOwnershipIsValid || !requestedOwnershipIsValid) {
        const canceledTrade = await transaction.trade.update({
          where: {
            id: input.tradeId
          },
          data: {
            status: TradeStatus.CANCELED
          }
        });

        await transaction.tradeMessage.create({
          data: {
            tradeId: input.tradeId,
            authorId: input.actorId,
            messageType: TradeMessageType.SYSTEM,
            body: "Transaction annulee: un ou plusieurs objets ne sont plus disponibles."
          }
        });

        return {
          status: canceledTrade.status,
          ownershipTransferred: false
        };
      }

      if (offeredItemIds.length > 0) {
        await transaction.item.updateMany({
          where: {
            id: {
              in: offeredItemIds
            }
          },
          data: {
            ownerId: input.recipientId
          }
        });
      }

      if (requestedItemIds.length > 0) {
        await transaction.item.updateMany({
          where: {
            id: {
              in: requestedItemIds
            }
          },
          data: {
            ownerId: input.proposerId
          }
        });
      }

      const acceptedTrade = await transaction.trade.update({
        where: {
          id: input.tradeId
        },
        data: {
          status: TradeStatus.ACCEPTED
        }
      });

      await transaction.tradeMessage.create({
        data: {
          tradeId: input.tradeId,
          authorId: input.actorId,
          messageType: TradeMessageType.SYSTEM,
          body: "Echange accepte"
        }
      });

      const swappedItemIds = [...new Set([...offeredItemIds, ...requestedItemIds])];

      if (swappedItemIds.length > 0) {
        const conflictingTrades = await transaction.trade.findMany({
          where: {
            id: {
              not: input.tradeId
            },
            status: {
              in: [TradeStatus.PENDING, TradeStatus.NEGOTIATION]
            },
            tradeItems: {
              some: {
                itemId: {
                  in: swappedItemIds
                }
              }
            }
          },
          select: {
            id: true
          }
        });

        const conflictingTradeIds = conflictingTrades.map((tradeRecord) => tradeRecord.id);

        if (conflictingTradeIds.length > 0) {
          await transaction.trade.updateMany({
            where: {
              id: {
                in: conflictingTradeIds
              }
            },
            data: {
              status: TradeStatus.CANCELED
            }
          });

          await transaction.tradeMessage.createMany({
            data: conflictingTradeIds.map((tradeId) => ({
              tradeId,
              authorId: input.actorId,
              messageType: TradeMessageType.SYSTEM,
              body: "Transaction annulee: un ou plusieurs objets ont deja ete echanges."
            }))
          });
        }
      }

      return {
        status: acceptedTrade.status,
        ownershipTransferred: true
      };
    });
  }

  public async cancelTradeAsUnavailable(input: { tradeId: string; actorId: string }): Promise<TradeActionRecord> {
    return prisma.$transaction(async (transaction) => {
      const trade = await transaction.trade.update({
        where: {
          id: input.tradeId
        },
        data: {
          status: TradeStatus.CANCELED
        },
        include: {
          tradeItems: {
            include: {
              item: {
                select: {
                  ownerId: true
                }
              }
            }
          }
        }
      });

      await transaction.tradeMessage.create({
        data: {
          tradeId: input.tradeId,
          authorId: input.actorId,
          messageType: TradeMessageType.SYSTEM,
          body: "Transaction annulee: un ou plusieurs objets ne sont plus disponibles."
        }
      });

      return {
        id: trade.id,
        proposerId: trade.proposerId,
        recipientId: trade.recipientId,
        status: trade.status,
        tradeItems: trade.tradeItems.map((tradeItem) => ({
          itemId: tradeItem.itemId,
          side: tradeItem.side,
          ownerId: tradeItem.item.ownerId
        }))
      };
    });
  }

  public async createTradeMessage(input: CreateTradeMessageInput): Promise<{ id: string }> {
    const message = await prisma.tradeMessage.create({
      data: {
        tradeId: input.tradeId,
        authorId: input.authorId,
        messageType: input.messageType,
        body: input.body
      }
    });

    return {
      id: message.id
    };
  }

  public async findTradeDetailById(tradeId: string): Promise<TradeDetailRecord | null> {
    const trade = await prisma.trade.findUnique({
      where: {
        id: tradeId
      },
      include: {
        proposer: true,
        recipient: true,
        tradeItems: {
          include: {
            item: {
              include: {
                owner: true
              }
            }
          }
        },
        messages: {
          include: {
            author: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!trade) {
      return null;
    }

    return {
      id: trade.id,
      status: trade.status,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      proposer: {
        id: trade.proposer.id,
        displayName: trade.proposer.displayName,
        avatarUrl: trade.proposer.avatarUrl
      },
      recipient: {
        id: trade.recipient.id,
        displayName: trade.recipient.displayName,
        avatarUrl: trade.recipient.avatarUrl
      },
      tradeItems: trade.tradeItems.map((tradeItem) => ({
        side: tradeItem.side,
        item: {
          id: tradeItem.item.id,
          title: tradeItem.item.title,
          description: tradeItem.item.description,
          category: tradeItem.item.category,
          imageUrl: tradeItem.item.imageUrl,
          ownerId: tradeItem.item.ownerId,
          owner: {
            id: tradeItem.item.owner.id,
            displayName: tradeItem.item.owner.displayName,
            avatarUrl: tradeItem.item.owner.avatarUrl
          }
        }
      })),
      messages: trade.messages.map((message) => ({
        id: message.id,
        authorId: message.authorId,
        body: message.body,
        messageType: message.messageType,
        createdAt: message.createdAt,
        author: {
          id: message.author.id,
          displayName: message.author.displayName,
          avatarUrl: message.author.avatarUrl
        }
      }))
    };
  }
}
