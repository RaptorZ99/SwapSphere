# Frontend Rules (React 19 + Vite + Tailwind v4)

## Principes React retenus de la doc
- Le state React est un snapshot: ne pas supposer une mutation immediate apres setState.
- Utiliser des composants controles pour les formulaires critiques.
- Utiliser `useReducer + Context` si la logique de state devient complexe et transversale.
- `useEffect` sert aux side effects externes, pas a recalculer de l'etat derive.

## Routing minimum
- `/select-user`
- `/dashboard`
- `/users/:userId/items`
- `/trades/new/:userId`
- `/trades/:tradeId`
- `/trades/inbox`

## Structure frontend recommandee
```text
apps/web/src/
  app/
    router.tsx
    providers.tsx
  pages/
  features/
    auth-select-user/
    items/
    trades/
  components/
  lib/
    api-client.ts
    env.ts
  hooks/
  styles/
    app.css
    theme.css
```

## Vite: conventions doc officielle
- Variables exposees au client uniquement avec prefixe `VITE_`.
- Acces via `import.meta.env`.
- Utiliser `server.proxy` pour developpement API local.

Exemple `vite.config.ts` (web):
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
```

Exemple `.env`:
```bash
VITE_APP_NAME=SwapSphere
VITE_API_BASE_URL=/api/v1
```

## Tailwind v4: conventions doc officielle
- Installer integration Vite `@tailwindcss/vite`.
- Dans le CSS principal: `@import "tailwindcss";`.
- Tailwind v4 detecte automatiquement les classes (avec heuristiques).
- Utiliser `@source` seulement si une source est ignoree par defaut.
- Centraliser tokens visuels avec `@theme`.

Exemple `styles/theme.css`:
```css
@theme {
  --font-sans: "Inter", "Segoe UI", sans-serif;
  --radius-card: 0.75rem;

  --color-brand-50: oklch(0.97 0.02 220);
  --color-brand-500: oklch(0.63 0.16 250);
  --color-brand-700: oklch(0.52 0.18 250);
}
```

Exemple `styles/app.css`:
```css
@import "tailwindcss";
@import "./theme.css";
```

## Regles d'UX MVP
- Toujours afficher: `loading`, `empty`, `error`, `success`.
- Les CTA d'action de trade doivent etre explicites (`Accepter`, `Refuser`, `Envoyer un commentaire`).
- L'historique messages doit etre chronologique ascendant.
- Afficher auteur + date/heure pour chaque message.

## Regles d'accessibilite minimales
- Inputs associes a `label`.
- Etats de focus visibles.
- Boutons desactives pendant soumission.
- Textes d'erreur lisibles et relies aux champs.

## Gestion du state recommande
- Session user selection: context global leger.
- Data serveur: fetch via couche `lib/api-client.ts` + hooks de feature.
- Eviter copie locale inutile d'etat serveur.

## Erreurs front
- Mapper codes API (`INVALID_INPUT`, `FORBIDDEN_TRADE_ACCESS`, etc.) vers messages UI stables.
- Ne pas exposer stack traces API en UI.
