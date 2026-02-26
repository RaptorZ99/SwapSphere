import type { ApiErrorResponse, ApiSuccess } from "@swapsphere/shared-types";

export type SuccessResponse<T> = ApiSuccess<T>;
export type ErrorResponse = ApiErrorResponse;
