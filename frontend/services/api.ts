const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

console.log("API URL :", API_URL);

export async function apiRequest(
  endpoint: string,
  options?: RequestInit,
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  );

  if (!response.ok) {
    let message = "Erreur API";

    try {
      const data = await response.json();

      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      }
    } catch {
      // La réponse n'est pas du JSON.
    }

    throw new Error(message);
  }

  return response.json();
}