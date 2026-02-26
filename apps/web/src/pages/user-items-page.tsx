import { ItemCategory, type ItemSummary } from "@swapsphere/shared-types";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { ItemCard } from "../components/item-card";
import { StateBlock } from "../components/state-block";
import { useSession } from "../features/session/session-context";
import { apiClient, ApiClientError } from "../lib/api-client";
import { getErrorMessage } from "../lib/error-messages";

export const UserItemsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { selectedUser, users, loadingUsers } = useSession();

  const [myItems, setMyItems] = useState<ItemSummary[]>([]);
  const [targetItems, setTargetItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [category, setCategory] = useState<ItemCategory | "ALL">("ALL");

  const targetUser = users.find((user) => user.id === userId) ?? null;

  const loadItems = async (): Promise<void> => {
    if (!selectedUser || !userId) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const categoryFilter = category === "ALL" ? undefined : category;

      const [mine, target] = await Promise.all([
        apiClient.getMyItems(selectedUser.id, categoryFilter),
        apiClient.getUserItems(userId, selectedUser.id, categoryFilter)
      ]);

      setMyItems(mine);
      setTargetItems(target);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Impossible de charger les inventaires.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [selectedUser, userId, category]);

  const categoryButtons = useMemo(
    () => ["ALL", ItemCategory.CARD, ItemCategory.ACCESSORY, ItemCategory.PACK] as const,
    []
  );

  if (loadingUsers) {
    return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  }

  if (!selectedUser) {
    return <Navigate to="/select-user" replace />;
  }

  if (!userId || !targetUser) {
    return <StateBlock title="Utilisateur introuvable" message="Ce profil n'existe pas ou n'est plus disponible." />;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Inventaires compares</h1>
        <p className="mt-2 text-sm text-black/70">
          Compare ton inventaire avec celui de <strong>{targetUser.displayName}</strong> pour preparer une proposition.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {categoryButtons.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setCategory(value);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                category === value ? "bg-black text-white" : "bg-black/5"
              }`}
            >
              {value === "ALL" ? "Tous" : value}
            </button>
          ))}

          <Link
            to={`/trades/new/${targetUser.id}`}
            className="ml-auto rounded-full bg-[var(--color-brand-500)] px-4 py-2 text-xs font-semibold text-white"
          >
            Demarrer un troc
          </Link>
        </div>
      </section>

      {loading ? <StateBlock title="Chargement" message="Recuperation des objets..." /> : null}
      {!loading && errorMessage ? (
        <StateBlock
          title="Erreur"
          message={errorMessage}
          action={{
            label: "Recharger",
            onClick: () => {
              void loadItems();
            }
          }}
        />
      ) : null}

      {!loading && !errorMessage ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">Tes objets ({myItems.length})</h2>
            {myItems.length === 0 ? <p className="text-sm text-black/60">Aucun objet dans cette categorie.</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {myItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">Objets de {targetUser.displayName} ({targetItems.length})</h2>
            {targetItems.length === 0 ? <p className="text-sm text-black/60">Aucun objet dans cette categorie.</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {targetItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </section>
      ) : null}
    </main>
  );
};
