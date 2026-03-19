import type { ItemSummary } from "@swapsphere/shared-types";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { ItemCard } from "../components/item-card";
import { StateBlock } from "../components/state-block";
import { useSession } from "../features/session/session-context";
import { apiClient, ApiClientError } from "../lib/api-client";
import { getErrorMessage } from "../lib/error-messages";

export const TradeNewPage = () => {
  const { userId: recipientId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { selectedUser, users, loadingUsers } = useSession();

  const [myItems, setMyItems] = useState<ItemSummary[]>([]);
  const [recipientItems, setRecipientItems] = useState<ItemSummary[]>([]);
  const [selectedOfferedIds, setSelectedOfferedIds] = useState<string[]>([]);
  const [selectedRequestedIds, setSelectedRequestedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recipient = users.find((u) => u.id === recipientId) ?? null;

  const toggleSelection = (itemId: string, side: "offered" | "requested") => {
    const setter = side === "offered" ? setSelectedOfferedIds : setSelectedRequestedIds;
    setter((c) => c.includes(itemId) ? c.filter((id) => id !== itemId) : [...c, itemId]);
  };

  const loadItems = async (): Promise<void> => {
    if (!selectedUser || !recipientId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const [mine, target] = await Promise.all([
        apiClient.getMyItems(selectedUser.id),
        apiClient.getUserItems(recipientId, selectedUser.id)
      ]);
      setMyItems(mine);
      setRecipientItems(target);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Impossible de preparer la proposition.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, [selectedUser, recipientId]);

  const formIsValid = useMemo(() => {
    return selectedOfferedIds.length > 0 && selectedRequestedIds.length > 0 && message.trim().length > 0;
  }, [selectedOfferedIds, selectedRequestedIds, message]);

  const handleSubmit = async (): Promise<void> => {
    if (!selectedUser || !recipientId || !formIsValid) {
      setErrorMessage("Selectionne au moins un objet de chaque cote et ajoute un message.");
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.createTrade(selectedUser.id, {
        recipientId,
        offeredItemIds: selectedOfferedIds,
        requestedItemIds: selectedRequestedIds,
        message: message.trim()
      });
      navigate(`/trades/${response.tradeId}`);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("La proposition n'a pas pu etre envoyee.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUsers) return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  if (!selectedUser) return <Navigate to="/select-user" replace />;
  if (!recipientId || !recipient) return <StateBlock title="Utilisateur introuvable" message="Le destinataire n'existe pas." />;

  return (
    <main className="space-y-6">
      <section className="nm-raised-lg p-6 animate-in sm:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>Nouvelle proposition</p>
        <h1 className="heading-display text-2xl sm:text-3xl">Troc avec {recipient.displayName}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--nm-text-secondary)" }}>
          Selectionne les objets a echanger des deux cotes et ajoute un message initial.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="nm-pill" data-active={selectedOfferedIds.length > 0}>
            {selectedOfferedIds.length} offert{selectedOfferedIds.length > 1 ? "s" : ""}
          </span>
          <span style={{ color: "var(--nm-text-tertiary)" }}>⇄</span>
          <span className="nm-pill" data-active={selectedRequestedIds.length > 0}>
            {selectedRequestedIds.length} demande{selectedRequestedIds.length > 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {loading ? <StateBlock title="Chargement" message="Recuperation des objets disponibles..." /> : null}

      {!loading ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <section className="nm-raised p-5 animate-in stagger-2">
            <h2 className="heading-section text-lg">
              Tes objets <span className="text-xs" style={{ color: "var(--nm-accent)" }}>a offrir</span>
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {myItems.map((item) => (
                <ItemCard key={item.id} item={item} selectable selected={selectedOfferedIds.includes(item.id)} onToggle={() => { toggleSelection(item.id, "offered"); }} />
              ))}
            </div>
          </section>

          <section className="nm-raised p-5 animate-in stagger-3">
            <h2 className="heading-section text-lg">
              Objets de {recipient.displayName} <span className="text-xs" style={{ color: "var(--nm-accent)" }}>a demander</span>
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {recipientItems.map((item) => (
                <ItemCard key={item.id} item={item} selectable selected={selectedRequestedIds.includes(item.id)} onToggle={() => { toggleSelection(item.id, "requested"); }} />
              ))}
            </div>
          </section>
        </section>
      ) : null}

      <section className="nm-raised p-5 animate-in stagger-4 sm:p-6">
        <label htmlFor="trade-message" className="heading-section text-sm">Message initial</label>
        <textarea
          id="trade-message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); }}
          rows={4}
          placeholder="Explique clairement ta proposition de troc..."
          className="nm-input mt-3"
        />

        {errorMessage ? (
          <p className="nm-pressed mt-3 rounded-xl px-4 py-2 text-sm font-medium" style={{ color: "var(--nm-danger)" }}>
            {errorMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => { void handleSubmit(); }}
          disabled={!formIsValid || submitting || loading}
          className="nm-btn nm-btn-accent mt-5 px-6 py-2.5 text-sm"
        >
          {submitting ? "Envoi..." : "Envoyer la proposition"}
        </button>
      </section>
    </main>
  );
};
