export type Uuid = string;
export type IsoDateTime = string;

export const ItemCategory = {
  CARD: "CARD",
  ACCESSORY: "ACCESSORY",
  PACK: "PACK"
} as const;

export type ItemCategory = (typeof ItemCategory)[keyof typeof ItemCategory];

export const TradeStatus = {
  PENDING: "PENDING",
  NEGOTIATION: "NEGOTIATION",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED"
} as const;

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];

export const TradeSide = {
  PROPOSER: "PROPOSER",
  RECIPIENT: "RECIPIENT"
} as const;

export type TradeSide = (typeof TradeSide)[keyof typeof TradeSide];

export const TradeMessageType = {
  PROPOSAL: "PROPOSAL",
  COMMENT: "COMMENT",
  SYSTEM: "SYSTEM"
} as const;

export type TradeMessageType = (typeof TradeMessageType)[keyof typeof TradeMessageType];

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "USER_NOT_SELECTED"
  | "USER_NOT_FOUND"
  | "INVALID_ITEM_OWNERSHIP"
  | "INVALID_TRADE_STATE"
  | "FORBIDDEN_TRADE_ACCESS"
  | "TRADE_NOT_FOUND"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorPayload = {
  code: ApiErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  error: ApiErrorPayload;
};

export type UserSummary = {
  id: Uuid;
  displayName: string;
  avatarUrl: string | null;
};

export type ItemSummary = {
  id: Uuid;
  title: string;
  description: string;
  category: ItemCategory;
  imageUrl: string;
  ownerId: Uuid;
  ownerDisplayName: string;
};

export type TradeCreateInput = {
  recipientId: Uuid;
  offeredItemIds: Uuid[];
  requestedItemIds: Uuid[];
  message: string;
};

export type TradeCreateResponse = {
  tradeId: Uuid;
  status: TradeStatus;
};

export type TradeActionResponse = {
  status: TradeStatus;
};

export type TradeMessageCreateInput = {
  message: string;
};

export type TradeMessageCreateResponse = {
  messageId: Uuid;
  status: TradeStatus;
};

export type TradeMessageSummary = {
  id: Uuid;
  tradeId: Uuid;
  authorId: Uuid;
  authorDisplayName: string;
  messageType: TradeMessageType;
  body: string;
  createdAt: IsoDateTime;
};

export type TradeInboxSummary = {
  id: Uuid;
  status: TradeStatus;
  proposer: UserSummary;
  recipient: UserSummary;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  lastMessage: TradeMessageSummary | null;
};

export type TradeDetail = {
  id: Uuid;
  status: TradeStatus;
  proposer: UserSummary;
  recipient: UserSummary;
  offeredItems: ItemSummary[];
  requestedItems: ItemSummary[];
  messages: TradeMessageSummary[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type SelectUserInput = {
  userId: Uuid;
};

export type SelectUserResponse = {
  userId: Uuid;
};
