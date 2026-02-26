const errorByCode: Record<string, string> = {
  INVALID_INPUT: "Les donnees soumises sont invalides.",
  USER_NOT_SELECTED: "Selectionne un utilisateur pour continuer.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  INVALID_ITEM_OWNERSHIP: "Les objets selectionnes ne correspondent pas aux proprietaires attendus.",
  INVALID_TRADE_STATE: "Cette action n'est pas autorisee dans l'etat actuel du troc.",
  FORBIDDEN_TRADE_ACCESS: "Tu n'as pas acces a cette transaction.",
  TRADE_NOT_FOUND: "Transaction introuvable.",
  NOT_FOUND: "Ressource introuvable.",
  INTERNAL_ERROR: "Une erreur inattendue est survenue."
};

export const getErrorMessage = (code: string, fallback: string): string => {
  return errorByCode[code] ?? fallback;
};
