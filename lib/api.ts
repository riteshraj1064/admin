import { pwaManager } from "@/lib/pwa"

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const isOnline = navigator.onLine

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  // If offline and it's a mutation, queue the action
  if (!isOnline && (options.method === "POST" || options.method === "PUT" || options.method === "DELETE")) {
    await pwaManager.queueOfflineAction(
      `${options.method}_${url}`,
      url,
      options.method || "POST",
      options.body ? JSON.parse(options.body as string) : undefined,
      token,
    )

    // Return a mock response for offline mutations
    return { success: true, offline: true } as T
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Cache successful GET requests
    if (options.method === "GET" || !options.method) {
      await pwaManager.storeOfflineData(url, data, Date.now() + 5 * 60 * 1000) // 5 minutes expiry
    }

    return data
  } catch (error) {
    // If offline and it's a GET request, try to return cached data
    if (!isOnline && (!options.method || options.method === "GET")) {
      const cachedData = await pwaManager.getOfflineData(url)
      if (cachedData) {
        return { ...cachedData, fromCache: true } as T
      }
    }

    throw error
  }
}

function getAuthToken(): string | null {
  // Implementation for getting auth token
  return localStorage.getItem("authToken")
}
