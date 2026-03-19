import { TradeStatus } from "@swapsphere/shared";

export const formatDateTime = (isoDate: string): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
};

export const tradeStatusLabel: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: "En attente",
  [TradeStatus.NEGOTIATION]: "Negociation",
  [TradeStatus.ACCEPTED]: "Accepte",
  [TradeStatus.REJECTED]: "Refuse",
  [TradeStatus.CANCELED]: "Annule"
};
