/**
 * Erreur HTTP de l'API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public body: unknown,
    message?: string
  ) {
    super(message || `API Error: ${statusCode}`);
    this.name = "ApiError";
  }
}

/**
 * Erreur de validation
 */
export class ValidationError extends Error {
  constructor(public errors: unknown) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

/**
 * Erreur réseau / timeout
 */
export class NetworkError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = "NetworkError";
  }
}
