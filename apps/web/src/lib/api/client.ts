const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export async function apiClient<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.message ?? body.error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
