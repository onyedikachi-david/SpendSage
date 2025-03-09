import { useEffect, useState } from "react"
import { format } from "date-fns"

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSynced, setLastSynced] = useState(new Date())

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        setLastSynced(new Date())
      }
    }
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full transition-colors ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        <span className="text-xs font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <span className="text-xs">
        {format(lastSynced, 'HH:mm')}
      </span>
    </div>
  )
} 