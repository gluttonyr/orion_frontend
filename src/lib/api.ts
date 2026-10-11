const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function getUploadUrl(filename?: string): string {
  if (!filename) return "";
  if (/^(https?:|data:|blob:)/i.test(filename)) return filename;
  if (filename.startsWith("/upload/")) return `${API_BASE_URL}${filename}`;
  if (filename.startsWith("/")) return `${API_BASE_URL}${filename}`;
  return `${API_BASE_URL}/upload/${filename}`;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload === "object") {
      return (
        (payload as { message?: string; error?: string; errorMessage?: string }).message ??
        (payload as { message?: string; error?: string; errorMessage?: string }).error ??
        (payload as { message?: string; error?: string; errorMessage?: string }).errorMessage ??
        "Erreur API"
      );
    }
  } catch {
    // Ignore JSON parsing errors and fall back to the default text.
  }

  try {
    return await response.text();
  } catch {
    return "Erreur API";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  const hasExplicitJsonBody = typeof options.body === "string" && !(options.headers instanceof Headers);

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      Accept: "application/json",
      ...(!isFormDataBody && hasExplicitJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}
