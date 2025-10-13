// API 에러 응답 타입 정의
interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly data?: ApiErrorResponse;

  constructor(message: string, status: number, data?: ApiErrorResponse) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = this.constructor.name;
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'A request already exists') {
    super(message, 409);
  }
}
