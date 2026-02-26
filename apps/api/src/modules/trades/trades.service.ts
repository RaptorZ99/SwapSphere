import {
  TradeMessageType,
  TradeSide,
  TradeStatus,
  type TradeSide as TradeSideType,
  type TradeActionResponse,
  type TradeCreateInput,
  type TradeCreateResponse,
  type TradeDetail,
  type TradeInboxSummary,
  type TradeMessageCreateResponse,
  type TradeMessageSummary
} from "@swapsphere/shared-types";
import { isTerminalTradeStatus, sortMessagesByCreatedAtAsc } from "@swapsphere/shared-utils";

import { AppError } from "../../lib/app-error.js";
import type { TradesRepository } from "./trades.repository.js";

export interface TradesServiceContract {
  createTrade: (proposerId: string, input: TradeCreateInput) => Promise<TradeCreateResponse>;
  getInboxTrades: (recipientId: string) => Promise<TradeInboxSummary[]>;
  getTradeDetail: (viewerId: string, tradeId: string) => Promise<TradeDetail>;
  acceptTrade: (actorId: string, tradeId: string) => Promise<TradeActionResponse>;
  rejectTrade: (actorId: string, tradeId: string) => Promise<TradeActionResponse>;
  sendTradeMessage: (actorId: string, tradeId: string, message: string) => Promise<TradeMessageCreateResponse>;
}

export class TradesService implements TradesServiceContract {
  public constructor(private readonly tradesRepository: TradesRepository) {}

  public async createTrade(proposerId: string, input: TradeCreateInput): Promise<TradeCreateResponse> {
    if (proposerId === input.recipientId) {
      throw new AppError(409, "INVALID_TRADE_STATE", "Un utilisateur ne peut pas se proposer un echange");
    }

    const offeredItemIds = [...new Set(input.offeredItemIds)];
    const requestedItemIds = [...new Set(input.requestedItemIds)];
    const requestedIds = [...offeredItemIds, ...requestedItemIds];

    const items = await this.tradesRepository.findItemsByIds(requestedIds);

    if (items.length !== requestedIds.length) {
      throw new AppError(403, "INVALID_ITEM_OWNERSHIP", "Des objets demandes sont invalides ou introuvables");
    }

    const offeredAreOwnedByProposer = offeredItemIds.every((itemId) => {
      const item = items.find((currentItem) => currentItem.id === itemId);
      return item?.ownerId === proposerId;
    });

    const requestedAreOwnedByRecipient = requestedItemIds.every((itemId) => {
      const item = items.find((currentItem) => currentItem.id === itemId);
      return item?.ownerId === input.recipientId;
    });

    if (!offeredAreOwnedByProposer || !requestedAreOwnedByRecipient) {
      throw new AppError(403, "INVALID_ITEM_OWNERSHIP", "Les objets ne correspondent pas aux proprietaires attendus");
    }

    return this.tradesRepository.createTrade({
      proposerId,
      recipientId: input.recipientId,
      offeredItemIds,
      requestedItemIds,
      message: input.message
    });
  }

  public async getInboxTrades(userId: string): Promise<TradeInboxSummary[]> {
    const trades = await this.tradesRepository.findTradeInbox(userId);

    return trades.map((trade) => ({
      id: trade.id,
      status: trade.status,
      createdAt: trade.createdAt.toISOString(),
      updatedAt: trade.updatedAt.toISOString(),
      proposer: trade.proposer,
      recipient: trade.recipient,
      lastMessage: trade.lastMessage
        ? {
            id: trade.lastMessage.id,
            tradeId: trade.id,
            authorId: trade.lastMessage.authorId,
            authorDisplayName: trade.lastMessage.author.displayName,
            messageType: trade.lastMessage.messageType,
            body: trade.lastMessage.body,
            createdAt: trade.lastMessage.createdAt.toISOString()
          }
        : null
    }));
  }

  public async getTradeDetail(viewerId: string, tradeId: string): Promise<TradeDetail> {
    const trade = await this.tradesRepository.findTradeDetailById(tradeId);

    if (!trade) {
      throw new AppError(404, "TRADE_NOT_FOUND", "Transaction introuvable");
    }

    const viewerIsParticipant = viewerId === trade.proposer.id || viewerId === trade.recipient.id;

    if (!viewerIsParticipant) {
      throw new AppError(403, "FORBIDDEN_TRADE_ACCESS", "Acces a la transaction interdit");
    }

    const offeredItems = trade.tradeItems
      .filter((tradeItem) => tradeItem.side === TradeSide.PROPOSER)
      .map((tradeItem) => ({
        id: tradeItem.item.id,
        title: tradeItem.item.title,
        description: tradeItem.item.description,
        category: tradeItem.item.category,
        imageUrl: tradeItem.item.imageUrl,
        ownerId: tradeItem.item.ownerId,
        ownerDisplayName: tradeItem.item.owner.displayName
      }));

    const requestedItems = trade.tradeItems
      .filter((tradeItem) => tradeItem.side === TradeSide.RECIPIENT)
      .map((tradeItem) => ({
        id: tradeItem.item.id,
        title: tradeItem.item.title,
        description: tradeItem.item.description,
        category: tradeItem.item.category,
        imageUrl: tradeItem.item.imageUrl,
        ownerId: tradeItem.item.ownerId,
        ownerDisplayName: tradeItem.item.owner.displayName
      }));

    const messages: TradeMessageSummary[] = sortMessagesByCreatedAtAsc(
      trade.messages.map((message) => ({
        id: message.id,
        tradeId: trade.id,
        authorId: message.authorId,
        authorDisplayName: message.author.displayName,
        messageType: message.messageType,
        body: message.body,
        createdAt: message.createdAt.toISOString()
      }))
    );

    return {
      id: trade.id,
      status: trade.status,
      proposer: trade.proposer,
      recipient: trade.recipient,
      offeredItems,
      requestedItems,
      messages,
      createdAt: trade.createdAt.toISOString(),
      updatedAt: trade.updatedAt.toISOString()
    };
  }

  public async acceptTrade(actorId: string, tradeId: string): Promise<TradeActionResponse> {
    return this.transitionTradeStatus(actorId, tradeId, TradeStatus.ACCEPTED, "Echange accepte");
  }

  public async rejectTrade(actorId: string, tradeId: string): Promise<TradeActionResponse> {
    return this.transitionTradeStatus(actorId, tradeId, TradeStatus.REJECTED, "Echange refuse");
  }

  public async sendTradeMessage(
    actorId: string,
    tradeId: string,
    message: string
  ): Promise<TradeMessageCreateResponse> {
    const trade = await this.requireTrade(tradeId);

    const actorIsParticipant = actorId === trade.proposerId || actorId === trade.recipientId;

    if (!actorIsParticipant) {
      throw new AppError(403, "FORBIDDEN_TRADE_ACCESS", "Acces a la transaction interdit");
    }

    if (isTerminalTradeStatus(trade.status)) {
      throw new AppError(409, "INVALID_TRADE_STATE", "Impossible de commenter une transaction terminee");
    }

    if (!this.isTradeItemsOwnershipValid(trade)) {
      await this.tradesRepository.cancelTradeAsUnavailable({
        tradeId,
        actorId
      });

      throw new AppError(
        409,
        "INVALID_TRADE_STATE",
        "Impossible de commenter: un ou plusieurs objets de ce troc ont deja ete echanges"
      );
    }

    const nextStatus = trade.status === TradeStatus.PENDING ? TradeStatus.NEGOTIATION : trade.status;

    if (nextStatus !== trade.status) {
      await this.tradesRepository.updateTradeStatus(tradeId, nextStatus);
    }

    const createdMessage = await this.tradesRepository.createTradeMessage({
      tradeId,
      authorId: actorId,
      messageType: TradeMessageType.COMMENT,
      body: message
    });

    return {
      messageId: createdMessage.id,
      status: nextStatus
    };
  }

  private async transitionTradeStatus(
    actorId: string,
    tradeId: string,
    status: TradeStatus,
    systemMessage: string
  ): Promise<TradeActionResponse> {
    const trade = await this.requireTrade(tradeId);

    if (actorId !== trade.recipientId) {
      throw new AppError(403, "FORBIDDEN_TRADE_ACCESS", "Seul le destinataire peut effectuer cette action");
    }

    if (isTerminalTradeStatus(trade.status)) {
      throw new AppError(409, "INVALID_TRADE_STATE", "Cette transaction est deja terminee");
    }

    if (status === TradeStatus.ACCEPTED) {
      const acceptedTrade = await this.tradesRepository.acceptTradeWithOwnershipTransfer({
        tradeId,
        actorId,
        proposerId: trade.proposerId,
        recipientId: trade.recipientId
      });

      if (!acceptedTrade.ownershipTransferred) {
        throw new AppError(
          409,
          "INVALID_TRADE_STATE",
          "Impossible d'accepter: un ou plusieurs objets de ce troc ont deja ete echanges"
        );
      }

      return {
        status: acceptedTrade.status
      };
    }

    const updatedTrade = await this.tradesRepository.updateTradeStatus(tradeId, status);

    await this.tradesRepository.createTradeMessage({
      tradeId,
      authorId: actorId,
      messageType: TradeMessageType.SYSTEM,
      body: systemMessage
    });

    return {
      status: updatedTrade.status
    };
  }

  private async requireTrade(tradeId: string) {
    const trade = await this.tradesRepository.findTradeForAction(tradeId);

    if (!trade) {
      throw new AppError(404, "TRADE_NOT_FOUND", "Transaction introuvable");
    }

    return trade;
  }

  private isTradeItemsOwnershipValid(trade: {
    proposerId: string;
    recipientId: string;
    tradeItems: Array<{ side: TradeSideType; ownerId: string }>;
  }): boolean {
    const offeredOwnershipIsValid = trade.tradeItems
      .filter((tradeItem) => tradeItem.side === TradeSide.PROPOSER)
      .every((tradeItem) => tradeItem.ownerId === trade.proposerId);

    const requestedOwnershipIsValid = trade.tradeItems
      .filter((tradeItem) => tradeItem.side === TradeSide.RECIPIENT)
      .every((tradeItem) => tradeItem.ownerId === trade.recipientId);

    return offeredOwnershipIsValid && requestedOwnershipIsValid;
  }
}
