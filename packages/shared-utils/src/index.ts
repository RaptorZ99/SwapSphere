import { TradeStatus, type TradeMessageSummary } from "@swapsphere/shared-types";

export const isTerminalTradeStatus = (status: TradeStatus): boolean => {
  return status === TradeStatus.ACCEPTED || status === TradeStatus.REJECTED || status === TradeStatus.CANCELED;
};

export const sortMessagesByCreatedAtAsc = <T extends Pick<TradeMessageSummary, "createdAt">>(messages: T[]): T[] => {
  return [...messages].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};
