import { ItemCategory, type ItemSummary } from "@swapsphere/shared-types";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { ItemCard } from "../components/item-card";
import { StateBlock } from "../components/state-block";
import { useSession } from "../features/session/session-context";
import { apiClient, ApiClientError } from "../lib/api-client";
import { getErrorMessage } from "../lib/error-messages";

const categoryOptions: Array<{ label: string; value: ItemCategory | "ALL" }> = [
  { label: "Tous", value: "ALL" },
  { label: "Cards", value: ItemCategory.CARD },
  { label: "Accessoires", value: ItemCategory.ACCESSORY },
  { label: "Packs", value: ItemCategory.PACK }
];

export const DashboardPage = () => {
  const { selectedUser, users, loadingUsers } = useSession();
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ItemCategory | "ALL">("ALL");

  const loadMyItems = async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const category = activeCategory === "ALL" ? undefined : activeCategory;
      const response = await apiClient.getMyItems(selectedUser.id, category);
      setItems(response);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Impossible de charger tes objets.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMyItems();
  }, [selectedUser, activeCategory]);

  const otherUsers = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return users.filter((user) => user.id !== selectedUser.id);
  }, [selectedUser, users]);

  if (loadingUsers) {
    return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  }

  if (!selectedUser) {
    return <Navigate to="/select-user" replace />;
  }

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-8">
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Bonjour {selectedUser.displayName}</h1>
        <p className="mt-3 max-w-3xl text-sm text-black/70">
          Consulte ton inventaire, explore les collections des autres collectionneurs et demarre une proposition
          d'echange.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setActiveCategory(option.value);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeCategory === option.value
                  ? "bg-black text-white"
                  : "bg-black/5 text-black hover:bg-black/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? <StateBlock title="Chargement" message="Recuperation de ton inventaire..." /> : null}

      {!loading && errorMessage ? (
        <StateBlock
          title="Erreur"
          message={errorMessage}
          action={{
            label: "Recharger",
            onClick: () => {
              void loadMyItems();
            }
          }}
        />
      ) : null}

      {!loading && !errorMessage && items.length === 0 ? (
        <StateBlock title="Inventaire vide" message="Aucun objet trouve avec ce filtre." />
      ) : null}

      {!loading && !errorMessage && items.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </section>
      ) : null}

      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Collectionneurs disponibles</h2>
          <Link to="/trades/inbox" className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white">
            Voir mes trocs
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {otherUsers.map((user) => (
            <article key={user.id} className="rounded-2xl border border-black/10 bg-white p-4">
              <h3 className="text-base font-semibold">{user.displayName}</h3>
              <p className="text-xs text-black/60">Partenaire d'echange</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/users/${user.id}/items`}
                  className="rounded-full bg-black/5 px-3 py-2 text-xs font-semibold text-black hover:bg-black/10"
                >
                  Voir ses objets
                </Link>
                <Link
                  to={`/trades/new/${user.id}`}
                  className="rounded-full bg-[var(--color-brand-500)] px-3 py-2 text-xs font-semibold text-white"
                >
                  Proposer un troc
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
