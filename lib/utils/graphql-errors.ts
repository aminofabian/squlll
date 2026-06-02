/** GraphQL error shape returned by our NestJS API */
export type GraphQLErrorLike = {
  message?: string;
  extensions?: {
    message?: string;
    code?: string;
  };
};

export function getGraphQLErrorMessages(
  errors: GraphQLErrorLike[] | undefined | null,
): string[] {
  if (!errors?.length) return [];
  return errors
    .map((e) => {
      const primary = e.message?.trim();
      const fromExtensions = e.extensions?.message?.trim();
      return primary || fromExtensions || "";
    })
    .filter(Boolean);
}

/** First GraphQL error message, or joined messages if several */
export function getGraphQLErrorMessage(
  errors: GraphQLErrorLike[] | undefined | null,
): string | null {
  const messages = getGraphQLErrorMessages(errors);
  if (messages.length === 0) return null;
  return messages.join("; ");
}

export function getErrorMessageFromGraphQLResponse(
  body: unknown,
): string | null {
  if (!body || typeof body !== "object") return null;
  const errors = (body as { errors?: GraphQLErrorLike[] }).errors;
  return getGraphQLErrorMessage(errors);
}

/**
 * User-facing message from a thrown Error, GraphQL response body, or stringified JSON.
 */
export function getDisplayErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed.startsWith("{") && trimmed.includes('"errors"')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        const fromBody = getErrorMessageFromGraphQLResponse(parsed);
        if (fromBody) return fromBody;
      } catch {
        /* use string as-is */
      }
    }
    return trimmed || "An unknown error occurred";
  }

  if (error instanceof Error) {
    const enhanced = error as Error & {
      rawGraphQLErrors?: GraphQLErrorLike[];
      rawGraphQLResponse?: { errors?: GraphQLErrorLike[] };
    };

    const fromRaw = getGraphQLErrorMessage(enhanced.rawGraphQLErrors);
    if (fromRaw) return fromRaw;

    const fromResponse = getErrorMessageFromGraphQLResponse(
      enhanced.rawGraphQLResponse,
    );
    if (fromResponse) return fromResponse;

    if (error.message?.trim()) return error.message.trim();
  }

  const fromObject = getErrorMessageFromGraphQLResponse(error);
  if (fromObject) return fromObject;

  return "An unknown error occurred";
}

export function throwGraphQLErrors(
  errors: GraphQLErrorLike[],
  response?: unknown,
): never {
  const message =
    getGraphQLErrorMessage(errors) ?? "Request failed";
  const err = new Error(message) as Error & {
    graphqlError: boolean;
    rawGraphQLErrors?: GraphQLErrorLike[];
    rawGraphQLResponse?: unknown;
  };
  err.graphqlError = true;
  err.rawGraphQLErrors = errors;
  if (response !== undefined) err.rawGraphQLResponse = response;
  throw err;
}

/**
 * Parse a GraphQL proxy response. Checks `errors[].message` before HTTP status
 * so 409 CONFLICT still surfaces e.g. "Fee structure already exists…".
 */
export async function parseGraphQLResponse<T extends Record<string, unknown>>(
  response: Response,
): Promise<T> {
  let result: T;
  try {
    result = (await response.json()) as T;
  } catch {
    throw new Error(
      response.ok
        ? "Invalid response from server"
        : `Request failed (${response.status})`,
    );
  }

  const errors = (result as { errors?: GraphQLErrorLike[] }).errors;
  if (errors?.length) {
    throwGraphQLErrors(errors, result);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return result;
}
