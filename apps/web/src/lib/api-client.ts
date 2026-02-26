import type {
  ApiErrorResponse,
  ItemCategory,
  ItemSummary,
  SelectUserInput,
  SelectUserResponse,
  TradeActionResponse,
  TradeCreateInput,
  TradeCreateResponse,
  TradeDetail,
  TradeInboxSummary,
  TradeMessageCreateInput,
  TradeMessageCreateResponse,
  UserSummary
} from "@swapsphere/shared-types";

import { clientEnv } from "./env";

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  public constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  selectedUserId?: string;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.selectedUserId) {
    headers["x-user-id"] = options.selectedUserId;
  }

  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include"
  });

  const text = await response.text();
  const payload = text.length > 0 ? (JSON.parse(text) as { data?: T; error?: ApiErrorResponse["error"] }) : {};

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      payload.error?.code ?? "INTERNAL_ERROR",
      payload.error?.message ?? "Erreur inattendue",
      payload.error?.details
    );
  }

  return payload.data as T;
};

export const apiClient = {
  getUsers: () => request<UserSummary[]>("/users"),

  selectUser: (input: SelectUserInput) => {
    return request<SelectUserResponse>("/session/select-user", {
      method: "POST",
      body: input
    });
  },

  getMyItems: (selectedUserId: string, category?: ItemCategory) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return request<ItemSummary[]>(`/items/me${query}`, {
      selectedUserId
    });
  },

  getUserItems: (userId: string, selectedUserId?: string, category?: ItemCategory) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";

    return request<ItemSummary[]>(`/users/${userId}/items${query}`, {
      selectedUserId
    });
  },

  createTrade: (selectedUserId: string, input: TradeCreateInput) => {
    return request<TradeCreateResponse>("/trades", {
      method: "POST",
      selectedUserId,
      body: input
    });
  },

  getInboxTrades: (selectedUserId: string) => {
    return request<TradeInboxSummary[]>("/trades/inbox", {
      selectedUserId
    });
  },

  getTradeDetail: (selectedUserId: string, tradeId: string) => {
    return request<TradeDetail>(`/trades/${tradeId}`, {
      selectedUserId
    });
  },

  acceptTrade: (selectedUserId: string, tradeId: string) => {
    return request<TradeActionResponse>(`/trades/${tradeId}/actions/accept`, {
      method: "POST",
      selectedUserId
    });
  },

  rejectTrade: (selectedUserId: string, tradeId: string) => {
    return request<TradeActionResponse>(`/trades/${tradeId}/actions/reject`, {
      method: "POST",
      selectedUserId
    });
  },

  sendTradeMessage: (selectedUserId: string, tradeId: string, input: TradeMessageCreateInput) => {
    return request<TradeMessageCreateResponse>(`/trades/${tradeId}/messages`, {
      method: "POST",
      selectedUserId,
      body: input
    });
  }
};
