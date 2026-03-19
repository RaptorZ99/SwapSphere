import { TradeStatus, isTerminalTradeStatus, type TradeDetail } from "@swapsphere/shared";
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
    if (!selectedUser || !tradeId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      setTrade(await apiClient.getTradeDetail(selectedUser.id, tradeId));
    } catch (error: unknown) {
      if (error instanceof ApiClientError) setErrorMessage(getErrorMessage(error.code, error.message));
      else setErrorMessage("Impossible de charger cette transaction.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadTrade(); }, [selectedUser, tradeId]);

  const canActAsRecipient = useMemo(() => {
    if (!trade || !selectedUser) return false;
    return trade.recipient.id === selectedUser.id && !isTerminalTradeStatus(trade.status);
  }, [trade, selectedUser]);

  const canComment = useMemo(() => {
    if (!trade || !selectedUser) return false;
    return (trade.proposer.id === selectedUser.id || trade.recipient.id === selectedUser.id) && !isTerminalTradeStatus(trade.status);
  }, [trade, selectedUser]);

  const executeAction = async (action: "accept" | "reject"): Promise<void> => {
    if (!selectedUser || !tradeId) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      if (action === "accept") await apiClient.acceptTrade(selectedUser.id, tradeId);
      else await apiClient.rejectTrade(selectedUser.id, tradeId);
      await loadTrade();
    } catch (error: unknown) {
      if (error instanceof ApiClientError) setErrorMessage(getErrorMessage(error.code, error.message));
      else setErrorMessage("L'action n'a pas pu etre appliquee.");
    } finally {
      setActionLoading(false);
    }
  };

  const sendComment = async (): Promise<void> => {
    if (!selectedUser || !tradeId || comment.trim().length === 0) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.sendTradeMessage(selectedUser.id, tradeId, { message: comment.trim() });
      setComment("");
      await loadTrade();
    } catch (error: unknown) {
      if (error instanceof ApiClientError) setErrorMessage(getErrorMessage(error.code, error.message));
      else setErrorMessage("Le commentaire n'a pas pu etre envoye.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUsers) return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  if (!selectedUser) return <Navigate to="/select-user" replace />;
  if (!tradeId) return <StateBlock title="Transaction invalide" message="Identifiant manquant." />;
  if (loading) return <StateBlock title="Chargement" message="Recuperation de la transaction..." />;
  if (errorMessage && !trade) return <StateBlock title="Erreur" message={errorMessage} action={{ label: "Reessayer", onClick: () => { void loadTrade(); } }} />;
  if (!trade) return <StateBlock title="Introuvable" message="Cette transaction n'existe pas." />;

  return (
    <main className="space-y-6">
      {/* Header */}
      <section className="nm-raised-lg p-6 animate-in sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>Transaction</p>
            <h1 className="heading-display text-2xl sm:text-3xl">{trade.id.slice(0, 8)}</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--nm-text-secondary)" }}>{formatDateTime(trade.createdAt)}</p>
          </div>
          <TradeStatusBadge status={trade.status} />
        </div>

        {/* Participants */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="nm-pressed inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
            {trade.proposer.displayName}
          </span>
          <span style={{ color: "var(--nm-text-tertiary)" }}>⇄</span>
          <span className="nm-pressed inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
            {trade.recipient.displayName}
          </span>
        </div>

        {canActAsRecipient ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={actionLoading} onClick={() => { void executeAction("accept"); }} className="nm-btn nm-btn-success px-5 py-2 text-sm">
              Accepter
            </button>
            <button type="button" disabled={actionLoading} onClick={() => { void executeAction("reject"); }} className="nm-btn nm-btn-danger px-5 py-2 text-sm">
              Refuser
            </button>
          </div>
        ) : null}
      </section>

      {errorMessage ? (
        <p className="nm-pressed rounded-xl px-4 py-3 text-sm font-medium" style={{ color: "var(--nm-danger)" }}>{errorMessage}</p>
      ) : null}

      {/* Items */}
      <section className="grid gap-6 lg:grid-cols-2">
        <section className="nm-raised p-5 animate-in stagger-2">
          <h2 className="heading-section text-lg">
            Objets proposes <span className="text-xs" style={{ color: "var(--nm-accent)" }}>par {trade.proposer.displayName}</span>
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {trade.offeredItems.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
        <section className="nm-raised p-5 animate-in stagger-3">
          <h2 className="heading-section text-lg">
            Objets demandes <span className="text-xs" style={{ color: "var(--nm-accent)" }}>a {trade.recipient.displayName}</span>
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {trade.requestedItems.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      </section>

      {/* Messages */}
      <section className="nm-raised-lg p-5 animate-in stagger-4 sm:p-6">
        <h2 className="heading-section text-lg">Messages</h2>

        <ol className="mt-5 space-y-3">
          {trade.messages.map((msg) => (
            <li key={msg.id} className="nm-pressed p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">{msg.authorDisplayName}</span>
                <span className="text-xs" style={{ color: "var(--nm-text-tertiary)" }}>{formatDateTime(msg.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--nm-text-secondary)" }}>{msg.body}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--nm-text-tertiary)" }}>{msg.messageType}</p>
            </li>
          ))}
        </ol>

        {canComment ? (
          <div className="nm-pressed mt-5 p-4">
            <label htmlFor="comment" className="text-sm font-semibold">Envoyer un commentaire</label>
            <textarea
              id="comment"
              value={comment}
              rows={3}
              onChange={(e) => { setComment(e.target.value); }}
              className="nm-input mt-3"
              placeholder="Ajouter un message..."
            />
            <button
              type="button"
              disabled={actionLoading || comment.trim().length === 0}
              onClick={() => { void sendComment(); }}
              className="nm-btn nm-btn-accent mt-3 px-4 py-2 text-xs"
            >
              Envoyer
            </button>
          </div>
        ) : null}

        {trade.status === TradeStatus.ACCEPTED ? (
          <p className="nm-pressed mt-5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ color: "var(--nm-success)" }}>
            Transaction acceptee — les objets ont ete echanges.
          </p>
        ) : null}

        {trade.status === TradeStatus.REJECTED ? (
          <p className="nm-pressed mt-5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ color: "var(--nm-danger)" }}>
            Transaction refusee.
          </p>
        ) : null}
      </section>
    </main>
  );
};
