import { ItemCategory, type ItemSummary } from "@swapsphere/shared";
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
    if (!selectedUser) return;
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

  useEffect(() => { void loadMyItems(); }, [selectedUser, activeCategory]);

  const otherUsers = useMemo(() => {
    if (!selectedUser) return [];
    return users.filter((u) => u.id !== selectedUser.id);
  }, [selectedUser, users]);

  if (loadingUsers) return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  if (!selectedUser) return <Navigate to="/select-user" replace />;

  return (
    <main className="space-y-8">
      {/* Hero */}
      <section className="nm-raised-lg p-8 animate-in">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>
          Tableau de bord
        </p>
        <h1 className="heading-display text-3xl sm:text-4xl">Bonjour {selectedUser.displayName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--nm-text-secondary)" }}>
          Consulte ton inventaire, explore les collections des autres et demarre un echange.
        </p>

        {/* Category pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setActiveCategory(opt.value); }}
              className="nm-pill"
              data-active={activeCategory === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Items grid */}
      {loading ? <StateBlock title="Chargement" message="Recuperation de ton inventaire..." /> : null}

      {!loading && errorMessage ? (
        <StateBlock title="Erreur" message={errorMessage} action={{ label: "Recharger", onClick: () => { void loadMyItems(); } }} />
      ) : null}

      {!loading && !errorMessage && items.length === 0 ? (
        <StateBlock title="Inventaire vide" message="Aucun objet trouve avec ce filtre." />
      ) : null}

      {!loading && !errorMessage && items.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={item.id} className={`animate-in stagger-${Math.min(i + 1, 9)}`}>
              <ItemCard item={item} />
            </div>
          ))}
        </section>
      ) : null}

      {/* Collectors */}
      <section className="nm-raised-lg p-6 animate-in sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>
              Communaute
            </p>
            <h2 className="heading-section text-xl">Collectionneurs</h2>
          </div>
          <Link to="/trades/inbox" className="nm-btn nm-btn-accent px-4 py-2 text-xs">
            Mes trocs
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {otherUsers.map((user, i) => (
            <article key={user.id} className={`nm-pressed p-5 animate-in stagger-${Math.min(i + 3, 9)}`}>
              <div className="flex items-center gap-3">
                <div
                  className="nm-raised-sm flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{ color: "var(--nm-accent)" }}
                >
                  {user.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="heading-section text-base">{user.displayName}</h3>
                  <p className="text-xs" style={{ color: "var(--nm-text-tertiary)" }}>Partenaire d'echange</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/users/${user.id}/items`} className="nm-btn px-3 py-1.5 text-xs">
                  Voir ses objets
                </Link>
                <Link to={`/trades/new/${user.id}`} className="nm-btn nm-btn-accent px-3 py-1.5 text-xs">
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
