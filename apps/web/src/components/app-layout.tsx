import { Link, NavLink, Outlet } from "react-router-dom";

import { useSession } from "../features/session/session-context";
import { useTheme } from "../hooks/use-theme";
import { clientEnv } from "../lib/env";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/trades/inbox", label: "Mes trocs" }
];

export const AppLayout = () => {
  const { selectedUser, clearSession } = useSession();
  const { isDark, toggle } = useTheme();

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {/* Header — raised panel */}
      <header className="nm-raised-lg mb-8 p-6 animate-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/dashboard" className="heading-display text-2xl no-underline" style={{ color: "var(--nm-text)" }}>
            {clientEnv.appName}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nm-btn text-xs ${isActive ? "nm-btn-accent" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Theme toggle — neumorphic button */}
            <button
              type="button"
              onClick={toggle}
              className="nm-btn ml-1 px-3 py-2 text-base"
              aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDark ? "☀" : "☾"}
            </button>
          </div>
        </div>

        {selectedUser ? (
          <div className="nm-pressed mt-4 flex items-center justify-between px-4 py-3">
            <p className="text-sm">
              <span style={{ color: "var(--nm-text-secondary)" }}>Connecte :</span>{" "}
              <strong>{selectedUser.displayName}</strong>
            </p>
            <button type="button" onClick={clearSession} className="nm-btn px-3 py-1.5 text-xs">
              Changer
            </button>
          </div>
        ) : null}
      </header>

      <Outlet />
    </div>
  );
};
