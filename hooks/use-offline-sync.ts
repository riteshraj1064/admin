"use client"

import { useState, useEffect, useCallback } from "react"
import { pwaManager } from "@/lib/pwa"

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingActions, setPendingActions] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check pending actions on mount
    checkPendingActions()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkPendingActions = useCallback(async () => {
    try {
      const actions = await pwaManager.getPendingActions()
      setPendingActions(actions.length)
    } catch (error) {
      console.error("Failed to check pending actions:", error)
    }
  }, [])

  const queueOfflineAction = useCallback(
    async (type: string, url: string, method: string, data?: any, token?: string) => {
      try {
        await pwaManager.queueOfflineAction(type, url, method, data, token)
        await checkPendingActions()
      } catch (error) {
        console.error("Failed to queue offline action:", error)
        throw error
      }
    },
    [checkPendingActions],
  )

  const syncOfflineActions = useCallback(async () => {
    if (!isOnline) return

    setSyncing(true)
    try {
      await pwaManager.syncOfflineActions()
      await checkPendingActions()
    } catch (error) {
      console.error("Failed to sync offline actions:", error)
    } finally {
      setSyncing(false)
    }
  }, [isOnline, checkPendingActions])

  const storeOfflineData = useCallback(async (key: string, data: any, expiry?: number) => {
    try {
      await pwaManager.storeOfflineData(key, data, expiry)
    } catch (error) {
      console.error("Failed to store offline data:", error)
    }
  }, [])

  const getOfflineData = useCallback(async (key: string) => {
    try {
      return await pwaManager.getOfflineData(key)
    } catch (error) {
      console.error("Failed to get offline data:", error)
      return null
    }
  }, [])

  return {
    isOnline,
    pendingActions,
    syncing,
    queueOfflineAction,
    syncOfflineActions,
    storeOfflineData,
    getOfflineData,
    checkPendingActions,
  }
}
