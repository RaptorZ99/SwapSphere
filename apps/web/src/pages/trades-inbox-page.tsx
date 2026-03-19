import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { TradeStatus, type TradeInboxSummary } from "@swapsphere/shared";

import { StateBlock } from "../components/state-block";
import { TradeStatusBadge } from "../components/trade-status-badge";
import { useSession } from "../features/session/session-context";
import { apiClient, ApiClientError } from "../lib/api-client";
import { getErrorMessage } from "../lib/error-messages";
import { formatDateTime } from "../lib/formatters";

export const TradesInboxPage = () => {
  const { selectedUser, loadingUsers } = useSession();
  const [trades, setTrades] = useState<TradeInboxSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInbox = async (): Promise<void> => {
    if (!selectedUser) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      setTrades(await apiClient.getInboxTrades(selectedUser.id));
    } catch (error: unknown) {
      if (error instanceof ApiClientError) setErrorMessage(getErrorMessage(error.code, error.message));
      else setErrorMessage("Impossible de charger l'inbox.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadInbox(); }, [selectedUser]);

  if (loadingUsers) return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  if (!selectedUser) return <Navigate to="/select-user" replace />;
  if (loading) return <StateBlock title="Chargement" message="Recuperation de tes trocs..." />;
  if (errorMessage) return <StateBlock title="Erreur" message={errorMessage} action={{ label: "Reessayer", onClick: () => { void loadInbox(); } }} />;
  if (trades.length === 0) return <StateBlock title="Aucun troc" message="Tu n'as aucun troc en cours ou passe." />;

  const activeTrades = trades.filter((t) => t.status === TradeStatus.PENDING || t.status === TradeStatus.NEGOTIATION);
  const pastTrades = trades.filter((t) => t.status === TradeStatus.ACCEPTED || t.status === TradeStatus.REJECTED || t.status === TradeStatus.CANCELED);

  const renderTrades = (collection: TradeInboxSummary[]) => {
    return collection.map((trade, i) => {
      const isRecipient = trade.recipient.id === selectedUser.id;
      return (
        <article key={trade.id} className={`nm-raised p-5 animate-in stagger-${Math.min(i + 2, 9)}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {isRecipient ? `Recu de ${trade.proposer.displayName}` : `Envoye a ${trade.recipient.displayName}`}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--nm-text-tertiary)" }}>
                {formatDateTime(trade.updatedAt)}
              </p>
            </div>
            <TradeStatusBadge status={trade.status} />
          </div>

          {trade.lastMessage ? (
            <div className="nm-pressed mt-3 p-3">
              <p className="text-xs leading-relaxed" style={{ color: "var(--nm-text-secondary)" }}>
                <span className="font-semibold" style={{ color: "var(--nm-text)" }}>{trade.lastMessage.authorDisplayName}:</span>{" "}
                {trade.lastMessage.body}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs" style={{ color: "var(--nm-text-tertiary)" }}>Aucun message</p>
          )}

          <Link to={`/trades/${trade.id}`} className="nm-btn nm-btn-accent mt-4 px-4 py-2 text-xs">
            Ouvrir
          </Link>
        </article>
      );
    });
  };

  return (
    <main className="space-y-6">
      <section className="nm-raised-lg p-6 animate-in sm:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>Centre d'echanges</p>
        <h1 className="heading-display text-2xl sm:text-3xl">Mes trocs</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="nm-pill" data-active="true">{activeTrades.length} en cours</span>
          <span className="nm-pill">{pastTrades.length} termines</span>
        </div>
      </section>

      {/* Active */}
      <section className="space-y-3">
        <h2 className="heading-section flex items-center gap-2 px-1 text-sm uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>
          <span className="status-dot" style={{ background: "var(--nm-accent)" }} />
          En cours ({activeTrades.length})
        </h2>
        {activeTrades.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">{renderTrades(activeTrades)}</div>
        ) : (
          <p className="px-1 text-sm" style={{ color: "var(--nm-text-tertiary)" }}>Aucun troc en cours.</p>
        )}
      </section>

      {/* Past */}
      <section className="space-y-3">
        <h2 className="heading-section flex items-center gap-2 px-1 text-sm uppercase tracking-widest" style={{ color: "var(--nm-text-tertiary)" }}>
          <span className="status-dot" style={{ background: "var(--nm-muted)", animation: "none" }} />
          Historique ({pastTrades.length})
        </h2>
        {pastTrades.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">{renderTrades(pastTrades)}</div>
        ) : (
          <p className="px-1 text-sm" style={{ color: "var(--nm-text-tertiary)" }}>Aucun troc passe.</p>
        )}
      </section>
    </main>
  );
};
