import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { StateBlock } from "../components/state-block";
import { useSession } from "../features/session/session-context";
import { useTheme } from "../hooks/use-theme";
import { clientEnv } from "../lib/env";

export const SelectUserPage = () => {
  const navigate = useNavigate();
  const { users, selectedUser, loadingUsers, sessionLoading, errorMessage, refreshUsers, selectUser } = useSession();
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    if (selectedUser) navigate("/dashboard", { replace: true });
  }, [selectedUser, navigate]);

  if (loadingUsers) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <StateBlock title="Chargement" message="Recuperation des profils SwapSphere..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <StateBlock title="Erreur" message={errorMessage} action={{ label: "Reessayer", onClick: () => { void refreshUsers(); } }} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <StateBlock title="Aucun profil" message="Aucun utilisateur disponible." />
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-12">
      {/* Hero — large raised panel */}
      <section className="nm-raised-lg mb-10 w-full p-10 text-center animate-in">
        {/* Neumorphic icon */}
        <div
          className="nm-raised-sm mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ color: "var(--nm-accent)" }}
        >
          S
        </div>

        <h1 className="heading-display text-4xl sm:text-5xl">{clientEnv.appName}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: "var(--nm-text-secondary)" }}>
          Plateforme de troc TCG sans flux monetaire. Choisis ton profil pour commencer.
        </p>

        {/* Theme toggle */}
        <button type="button" onClick={toggle} className="nm-btn mx-auto mt-5 px-4 py-2 text-sm">
          {isDark ? "☀ Mode clair" : "☾ Mode sombre"}
        </button>
      </section>

      {/* User cards */}
      <section className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user, i) => (
          <article key={user.id} className={`nm-raised p-6 animate-in stagger-${Math.min(i + 2, 9)}`}>
            <div className="flex items-center gap-3">
              {/* Avatar — pressed circle */}
              <div
                className="nm-pressed flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                style={{ color: "var(--nm-accent)" }}
              >
                {user.displayName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="heading-section text-lg">{user.displayName}</h2>
                <p className="text-xs" style={{ color: "var(--nm-text-tertiary)" }}>Collectionneur TCG</p>
              </div>
            </div>

            <button
              type="button"
              disabled={sessionLoading}
              onClick={() => { void selectUser(user.id); }}
              className="nm-btn nm-btn-accent mt-6 w-full py-2.5 text-sm"
            >
              {sessionLoading ? "Connexion..." : "Utiliser ce profil"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
};
