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

  const recipient = users.find((user) => user.id === recipientId) ?? null;

  const toggleSelection = (itemId: string, side: "offered" | "requested") => {
    if (side === "offered") {
      setSelectedOfferedIds((current) =>
        current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
      );
      return;
    }

    setSelectedRequestedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    );
  };

  const loadItems = async (): Promise<void> => {
    if (!selectedUser || !recipientId) {
      return;
    }

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

  useEffect(() => {
    void loadItems();
  }, [selectedUser, recipientId]);

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

  if (loadingUsers) {
    return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  }

  if (!selectedUser) {
    return <Navigate to="/select-user" replace />;
  }

  if (!recipientId || !recipient) {
    return <StateBlock title="Utilisateur introuvable" message="Le destinataire selectionne n'existe pas." />;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Nouvelle proposition vers {recipient.displayName}</h1>
        <p className="mt-2 text-sm text-black/70">Selectionne les objets a echanger des deux cotes et ajoute un message initial obligatoire.</p>
      </section>

      {loading ? <StateBlock title="Chargement" message="Recuperation des objets disponibles..." /> : null}

      {!loading ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3 rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">Tes objets (offerts)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {myItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selectable
                  selected={selectedOfferedIds.includes(item.id)}
                  onToggle={() => {
                    toggleSelection(item.id, "offered");
                  }}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">Objets demandes a {recipient.displayName}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {recipientItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selectable
                  selected={selectedRequestedIds.includes(item.id)}
                  onToggle={() => {
                    toggleSelection(item.id, "requested");
                  }}
                />
              ))}
            </div>
          </section>
        </section>
      ) : null}

      <section className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
        <label htmlFor="trade-message" className="text-sm font-semibold">
          Message initial
        </label>
        <textarea
          id="trade-message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
          rows={4}
          placeholder="Explique clairement ta proposition de troc"
          className="mt-2 w-full rounded-2xl border border-black/15 bg-white p-3 text-sm outline-none ring-[var(--color-brand-200)] focus:ring-2"
        />

        {errorMessage ? <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage}</p> : null}

        <button
          type="button"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={!formIsValid || submitting || loading}
          className="mt-4 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Envoi en cours..." : "Envoyer la proposition"}
        </button>
      </section>
    </main>
  );
};
