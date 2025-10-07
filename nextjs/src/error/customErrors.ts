export class HttpError extends Error {
  public readonly status: number;
  public readonly data?: any;

  constructor(message: string, status: number, data?: any) {
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
