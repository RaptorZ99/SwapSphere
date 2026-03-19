import { TradeStatus, type TradeStatus as TradeStatusType } from "@swapsphere/shared";

import { tradeStatusLabel } from "../lib/formatters";

const statusConfig: Record<TradeStatusType, { colorVar: string; softVar: string }> = {
  [TradeStatus.PENDING]: { colorVar: "--nm-warning", softVar: "--nm-warning-soft" },
  [TradeStatus.NEGOTIATION]: { colorVar: "--nm-info", softVar: "--nm-info-soft" },
  [TradeStatus.ACCEPTED]: { colorVar: "--nm-success", softVar: "--nm-success-soft" },
  [TradeStatus.REJECTED]: { colorVar: "--nm-danger", softVar: "--nm-danger-soft" },
  [TradeStatus.CANCELED]: { colorVar: "--nm-muted", softVar: "--nm-text-tertiary" }
};

export const TradeStatusBadge = ({ status }: { status: TradeStatusType }) => {
  const c = statusConfig[status];

  return (
    <span
      className="nm-pressed inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color: `var(${c.colorVar})` }}
    >
      <span className="status-dot" style={{ background: `var(${c.colorVar})` }} />
      {tradeStatusLabel[status]}
    </span>
  );
};
