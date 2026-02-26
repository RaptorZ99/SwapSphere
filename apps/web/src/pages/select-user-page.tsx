import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { StateBlock } from "../components/state-block";
import { useSession } from "../features/session/session-context";

export const SelectUserPage = () => {
  const navigate = useNavigate();
  const { users, selectedUser, loadingUsers, sessionLoading, errorMessage, refreshUsers, selectUser } = useSession();

  useEffect(() => {
    if (selectedUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [selectedUser, navigate]);

  if (loadingUsers) {
    return <StateBlock title="Chargement" message="Recuperation des profils SwapSphere..." />;
  }

  if (errorMessage) {
    return (
      <StateBlock
        title="Erreur"
        message={errorMessage}
        action={{
          label: "Reessayer",
          onClick: () => {
            void refreshUsers();
          }
        }}
      />
    );
  }

  if (users.length === 0) {
    return <StateBlock title="Aucun profil" message="Aucun utilisateur n'est disponible actuellement." />;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 pt-6">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-8 shadow-sm backdrop-blur">
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Selectionne ton profil</h1>
        <p className="mt-3 max-w-2xl text-sm text-black/70">
          Aucun mot de passe, aucune inscription. Choisis simplement un profil predefini pour acceder a ton espace
          de troc.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-200)] text-base font-bold text-[var(--color-brand-700)]">
                {user.displayName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.displayName}</h2>
                <p className="text-xs text-black/60">Profil preconfigure</p>
              </div>
            </div>

            <button
              type="button"
              disabled={sessionLoading}
              onClick={() => {
                void selectUser(user.id);
              }}
              className="mt-5 w-full rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sessionLoading ? "Connexion..." : "Utiliser ce profil"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
};
