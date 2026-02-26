import { TradeStatus, type TradeDetail } from "@swapsphere/shared-types";
import { isTerminalTradeStatus } from "@swapsphere/shared-utils";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { ItemCard } from "../components/item-card";
import { StateBlock } from "../components/state-block";
import { TradeStatusBadge } from "../components/trade-status-badge";
import { useSession } from "../features/session/session-context";
import { apiClient, ApiClientError } from "../lib/api-client";
import { getErrorMessage } from "../lib/error-messages";
import { formatDateTime } from "../lib/formatters";

export const TradeDetailPage = () => {
  const { tradeId } = useParams<{ tradeId: string }>();
  const { selectedUser, loadingUsers } = useSession();

  const [trade, setTrade] = useState<TradeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const loadTrade = async (): Promise<void> => {
    if (!selectedUser || !tradeId) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.getTradeDetail(selectedUser.id, tradeId);
      setTrade(response);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Impossible de charger cette transaction.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrade();
  }, [selectedUser, tradeId]);

  const canActAsRecipient = useMemo(() => {
    if (!trade || !selectedUser) {
      return false;
    }

    return trade.recipient.id === selectedUser.id && !isTerminalTradeStatus(trade.status);
  }, [trade, selectedUser]);

  const canComment = useMemo(() => {
    if (!trade || !selectedUser) {
      return false;
    }

    const isParticipant = trade.proposer.id === selectedUser.id || trade.recipient.id === selectedUser.id;

    return isParticipant && !isTerminalTradeStatus(trade.status);
  }, [trade, selectedUser]);

  const executeAction = async (action: "accept" | "reject"): Promise<void> => {
    if (!selectedUser || !tradeId) {
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);

    try {
      if (action === "accept") {
        await apiClient.acceptTrade(selectedUser.id, tradeId);
      } else {
        await apiClient.rejectTrade(selectedUser.id, tradeId);
      }

      await loadTrade();
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("L'action n'a pas pu etre appliquee.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const sendComment = async (): Promise<void> => {
    if (!selectedUser || !tradeId || comment.trim().length === 0) {
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);

    try {
      await apiClient.sendTradeMessage(selectedUser.id, tradeId, {
        message: comment.trim()
      });

      setComment("");
      await loadTrade();
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Le commentaire n'a pas pu etre envoye.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUsers) {
    return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  }

  if (!selectedUser) {
    return <Navigate to="/select-user" replace />;
  }

  if (!tradeId) {
    return <StateBlock title="Transaction invalide" message="Identifiant manquant." />;
  }

  if (loading) {
    return <StateBlock title="Chargement" message="Recuperation de la transaction..." />;
  }

  if (errorMessage && !trade) {
    return (
      <StateBlock
        title="Erreur"
        message={errorMessage}
        action={{
          label: "Reessayer",
          onClick: () => {
            void loadTrade();
          }
        }}
      />
    );
  }

  if (!trade) {
    return <StateBlock title="Introuvable" message="Cette transaction n'existe pas." />;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Transaction {trade.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-black/70">Creee le {formatDateTime(trade.createdAt)}</p>
          </div>
          <TradeStatusBadge status={trade.status} />
        </div>

        {canActAsRecipient ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                void executeAction("accept");
              }}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Accepter
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                void executeAction("reject");
              }}
              className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Refuser
            </button>
          </div>
        ) : null}
      </section>

      {errorMessage ? <p className="text-sm font-medium text-rose-700">{errorMessage}</p> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold">Objets proposes par {trade.proposer.displayName}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {trade.offeredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold">Objets demandes a {trade.recipient.displayName}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {trade.requestedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold">Historique des messages</h2>
        <ol className="mt-4 space-y-3">
          {trade.messages.map((messageItem) => (
            <li key={messageItem.id} className="rounded-2xl border border-black/10 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-black/60">
                <span className="font-semibold text-black">{messageItem.authorDisplayName}</span>
                <span>{formatDateTime(messageItem.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-black/80">{messageItem.body}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-black/45">{messageItem.messageType}</p>
            </li>
          ))}
        </ol>

        {canComment ? (
          <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
            <label htmlFor="comment" className="text-sm font-semibold">
              Envoyer un commentaire
            </label>
            <textarea
              id="comment"
              value={comment}
              rows={3}
              onChange={(event) => {
                setComment(event.target.value);
              }}
              className="mt-2 w-full rounded-2xl border border-black/15 p-3 text-sm outline-none ring-[var(--color-brand-200)] focus:ring-2"
              placeholder="Ajouter un message dans la negociation"
            />
            <button
              type="button"
              disabled={actionLoading || comment.trim().length === 0}
              onClick={() => {
                void sendComment();
              }}
              className="mt-3 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Envoyer un commentaire
            </button>
          </div>
        ) : null}

        {trade.status === TradeStatus.ACCEPTED ? (
          <p className="mt-4 rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900">Transaction acceptee.</p>
        ) : null}

        {trade.status === TradeStatus.REJECTED ? (
          <p className="mt-4 rounded-2xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-900">Transaction refusee.</p>
        ) : null}
      </section>
    </main>
  );
};
