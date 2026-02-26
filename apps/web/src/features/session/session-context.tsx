import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { UserSummary } from "@swapsphere/shared-types";

import { apiClient, ApiClientError } from "../../lib/api-client";
import { getErrorMessage } from "../../lib/error-messages";

const SESSION_STORAGE_KEY = "swapsphere:selected-user-id";

type SessionContextValue = {
  users: UserSummary[];
  selectedUser: UserSummary | null;
  loadingUsers: boolean;
  sessionLoading: boolean;
  errorMessage: string | null;
  refreshUsers: () => Promise<void>;
  selectUser: (userId: string) => Promise<void>;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshUsers = useCallback(async (): Promise<void> => {
    setLoadingUsers(true);
    setErrorMessage(null);

    try {
      const loadedUsers = await apiClient.getUsers();
      setUsers(loadedUsers);

      const persistedUserId = window.localStorage.getItem(SESSION_STORAGE_KEY);
      const persistedUser = loadedUsers.find((user) => user.id === persistedUserId) ?? null;
      setSelectedUser(persistedUser);

      if (!persistedUser && persistedUserId) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(getErrorMessage(error.code, error.message));
      } else {
        setErrorMessage("Impossible de charger les utilisateurs.");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  const selectUser = useCallback(
    async (userId: string): Promise<void> => {
      setSessionLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiClient.selectUser({ userId });
        const nextSelected = users.find((user) => user.id === response.userId) ?? null;

        if (!nextSelected) {
          setErrorMessage("Utilisateur introuvable dans la liste active.");
          return;
        }

        setSelectedUser(nextSelected);
        window.localStorage.setItem(SESSION_STORAGE_KEY, nextSelected.id);
      } catch (error: unknown) {
        if (error instanceof ApiClientError) {
          setErrorMessage(getErrorMessage(error.code, error.message));
        } else {
          setErrorMessage("Impossible de selectionner cet utilisateur.");
        }
      } finally {
        setSessionLoading(false);
      }
    },
    [users]
  );

  const clearSession = useCallback(() => {
    setSelectedUser(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const value = useMemo<SessionContextValue>(() => {
    return {
      users,
      selectedUser,
      loadingUsers,
      sessionLoading,
      errorMessage,
      refreshUsers,
      selectUser,
      clearSession
    };
  }, [users, selectedUser, loadingUsers, sessionLoading, errorMessage, refreshUsers, selectUser, clearSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
};
