import { TradeStatus, type TradeStatus as TradeStatusType } from "@swapsphere/shared-types";

import { tradeStatusLabel } from "../lib/formatters";

const statusStyles: Record<TradeStatusType, string> = {
  [TradeStatus.PENDING]: "bg-amber-100 text-amber-900",
  [TradeStatus.NEGOTIATION]: "bg-sky-100 text-sky-900",
  [TradeStatus.ACCEPTED]: "bg-emerald-100 text-emerald-900",
  [TradeStatus.REJECTED]: "bg-rose-100 text-rose-900",
  [TradeStatus.CANCELED]: "bg-slate-200 text-slate-900"
};

export const TradeStatusBadge = ({ status }: { status: TradeStatusType }) => {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {tradeStatusLabel[status]}
    </span>
  );
};
