import type { ApiErrorResponse, ApiSuccess } from "@swapsphere/shared";

export type SuccessResponse<T> = ApiSuccess<T>;
export type ErrorResponse = ApiErrorResponse;
