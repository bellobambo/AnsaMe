export function getClientErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  return error.message || fallback;
}
