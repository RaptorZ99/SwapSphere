import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { TradeStatus, type TradeInboxSummary } from "@swapsphere/shared-types";

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
    if (!selectedUser) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.getInboxTrades(selectedUser.id);
      setTrades(response);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Impossible de charger l'inbox.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInbox();
  }, [selectedUser]);

  if (loadingUsers) {
    return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  }

  if (!selectedUser) {
    return <Navigate to="/select-user" replace />;
  }

  if (loading) {
    return <StateBlock title="Chargement" message="Recuperation de tes trocs..." />;
  }

  if (errorMessage) {
    return (
      <StateBlock
        title="Erreur"
        message={errorMessage}
        action={{
          label: "Reessayer",
          onClick: () => {
            void loadInbox();
          }
        }}
      />
    );
  }

  if (trades.length === 0) {
    return <StateBlock title="Aucun troc" message="Tu n'as aucun troc en cours ou passe pour le moment." />;
  }

  const activeTrades = trades.filter(
    (trade) => trade.status === TradeStatus.PENDING || trade.status === TradeStatus.NEGOTIATION
  );
  const pastTrades = trades.filter(
    (trade) =>
      trade.status === TradeStatus.ACCEPTED ||
      trade.status === TradeStatus.REJECTED ||
      trade.status === TradeStatus.CANCELED
  );

  const renderTrades = (collection: TradeInboxSummary[]) => {
    return collection.map((trade) => {
      const isRecipient = trade.recipient.id === selectedUser.id;

      return (
        <article key={trade.id} className="rounded-2xl border border-black/10 bg-white/85 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {isRecipient ? `Recu de ${trade.proposer.displayName}` : `Envoye a ${trade.recipient.displayName}`}
            </p>
            <TradeStatusBadge status={trade.status} />
          </div>

          <p className="mt-2 text-xs text-black/60">Mis a jour le {formatDateTime(trade.updatedAt)}</p>
          <p className="mt-2 text-sm text-black/70">
            {trade.lastMessage ? `${trade.lastMessage.authorDisplayName}: ${trade.lastMessage.body}` : "Aucun message"}
          </p>

          <Link
            to={`/trades/${trade.id}`}
            className="mt-3 inline-flex rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
          >
            Ouvrir la transaction
          </Link>
        </article>
      );
    });
  };

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Mes trocs</h1>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/65">En cours ({activeTrades.length})</h2>
        {activeTrades.length > 0 ? renderTrades(activeTrades) : <p className="text-sm text-black/60">Aucun troc en cours.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/65">Historique ({pastTrades.length})</h2>
        {pastTrades.length > 0 ? renderTrades(pastTrades) : <p className="text-sm text-black/60">Aucun troc passe.</p>}
      </section>
    </main>
  );
};
