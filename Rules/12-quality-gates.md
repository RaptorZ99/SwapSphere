# Quality Gates

## Gates obligatoires avant merge
- `pnpm lint`
- `pnpm check-types`
- `pnpm build`

## Qualite code
- TypeScript strict.
- ESLint + Prettier partages monorepo.
- Pas de `any` sans justification.
- Pas de TODO non traces dans une issue.

## Performance/safety minimum
- Taille JSON body limitee cote API.
- Validation input stricte via Zod.
- Sanitization basique des messages utilisateur.

## Check manuel final
- Selection user fonctionne.
- Consultation items me + autre user.
- Proposition trade multi-items.
- Accept / reject / commentaire.
- Historique messages visible.
