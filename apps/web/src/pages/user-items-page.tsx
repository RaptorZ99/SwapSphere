import { ItemCategory, type ItemSummary } from "@swapsphere/shared";
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

  const targetUser = users.find((u) => u.id === userId) ?? null;

  const loadItems = async (): Promise<void> => {
    if (!selectedUser || !userId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const f = category === "ALL" ? undefined : category;
      const [mine, target] = await Promise.all([
        apiClient.getMyItems(selectedUser.id, f),
        apiClient.getUserItems(userId, selectedUser.id, f)
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

  useEffect(() => { void loadItems(); }, [selectedUser, userId, category]);

  const cats = useMemo(() => ["ALL", ItemCategory.CARD, ItemCategory.ACCESSORY, ItemCategory.PACK] as const, []);

  if (loadingUsers) return <StateBlock title="Chargement" message="Recuperation de la session..." />;
  if (!selectedUser) return <Navigate to="/select-user" replace />;
  if (!userId || !targetUser) return <StateBlock title="Utilisateur introuvable" message="Ce profil n'existe pas." />;

  return (
    <main className="space-y-6">
      <section className="nm-raised-lg p-6 animate-in sm:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nm-accent)" }}>Comparaison</p>
        <h1 className="heading-display text-2xl sm:text-3xl">Inventaires compares</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--nm-text-secondary)" }}>
          Compare ton inventaire avec celui de <strong>{targetUser.displayName}</strong>.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {cats.map((v) => (
            <button key={v} type="button" onClick={() => { setCategory(v); }} className="nm-pill" data-active={category === v}>
              {v === "ALL" ? "Tous" : v}
            </button>
          ))}
          <Link to={`/trades/new/${targetUser.id}`} className="nm-btn nm-btn-accent ml-auto px-4 py-2 text-xs">
            Demarrer un troc
          </Link>
        </div>
      </section>

      {loading ? <StateBlock title="Chargement" message="Recuperation des objets..." /> : null}
      {!loading && errorMessage ? <StateBlock title="Erreur" message={errorMessage} action={{ label: "Recharger", onClick: () => { void loadItems(); } }} /> : null}

      {!loading && !errorMessage ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <section className="nm-raised p-5 animate-in stagger-2">
            <h2 className="heading-section text-lg">Tes objets <span className="text-sm" style={{ color: "var(--nm-text-tertiary)" }}>({myItems.length})</span></h2>
            {myItems.length === 0 ? <p className="mt-3 text-sm" style={{ color: "var(--nm-text-tertiary)" }}>Aucun objet.</p> : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {myItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </section>
          <section className="nm-raised p-5 animate-in stagger-3">
            <h2 className="heading-section text-lg">Objets de {targetUser.displayName} <span className="text-sm" style={{ color: "var(--nm-text-tertiary)" }}>({targetItems.length})</span></h2>
            {targetItems.length === 0 ? <p className="mt-3 text-sm" style={{ color: "var(--nm-text-tertiary)" }}>Aucun objet.</p> : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {targetItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </section>
        </section>
      ) : null}
    </main>
  );
};
