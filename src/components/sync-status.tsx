import { useEffect, useState } from "react"
import { format } from "date-fns"

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      <div className="text-sm text-gray-500">
        Last synced: {format(new Date(), 'HH:mm:ss')}
      </div>
    </div>
  )
} 