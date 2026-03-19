import type { ApiErrorCode } from "@swapsphere/shared";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode | string;
  public readonly details?: Record<string, unknown>;

  public constructor(
    status: number,
    code: ApiErrorCode | string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
