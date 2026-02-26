import { Link, NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";

import { useSession } from "../features/session/session-context";
import { clientEnv } from "../lib/env";

const navigationItems = [
  {
    to: "/dashboard",
    label: "Dashboard"
  },
  {
    to: "/trades/inbox",
    label: "Mes trocs"
  }
];

export const AppLayout = () => {
  const { selectedUser, clearSession } = useSession();

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[28px] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/dashboard" className="text-2xl font-bold tracking-tight text-black">
              {clientEnv.appName}
            </Link>
            <p className="text-sm text-black/70">Plateforme de troc TCG sans flux monetaire.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {selectedUser ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[var(--color-brand-50)] px-4 py-3 text-sm">
            <p>
              Connecte en tant que <strong>{selectedUser.displayName}</strong>
            </p>
            <button
              type="button"
              onClick={clearSession}
              className="rounded-full border border-black/15 bg-white px-3 py-1 font-semibold hover:bg-black/5"
            >
              Changer de profil
            </button>
          </div>
        ) : null}
      </header>

      <Outlet />
    </div>
  );
};
