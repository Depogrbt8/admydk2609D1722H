'use client'
import { useState, useEffect } from 'react'

interface BackupStatus {
  lastBackup?: string
  nextBackup?: string
  totalRecords: number
  backupSize: string
  isActive: boolean
  changes: {
    newUsers: number
    newReservations: number
    newPayments: number
    updatedRecords: number
  }
}

export default function DatabaseBackupSystem() {
  const [status, setStatus] = useState<BackupStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [sources, setSources] = useState<Array<{ key: string; title: string; subtitle: string; active: boolean; pulledInfo: string }>>([])

  useEffect(() => {
    fetchBackupStatus()
    fetchSources()
  }, [])

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch('/api/database-backup/status')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Yedekleme durumu alınamadı:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/database-backup/sources')
      const data = await res.json()
      if (data.success) setSources(data.data)
    } catch (e) {
      // ignore visual section errors
    }
  }

  const toggleAutoBackup = async () => {
    setIsToggling(true)
    
    try {
      const response = await fetch('/api/database-backup/toggle', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchBackupStatus()
      }
    } catch (error) {
      console.error('Otomatik yedekleme durumu değiştirilemedi:', error)
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading && !status) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">🗄️ Database Yedekleme Sistemi</h3>
          <p className="text-sm text-gray-600 mt-1">Incremental Backup - Her 2 saatte bir otomatik</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status?.isActive ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {status?.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>

      {/* Kaynak Kartları (Minimal tasarım) */}
      {sources?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {sources.map((s) => (
            <div key={s.key} className="rounded-xl bg-gray-200 px-3 py-2 text-center shadow-sm">
              <div className={`text-xs font-semibold ${s.active ? 'text-green-600' : 'text-red-500'}`}>{s.active ? 'Aktif' : 'Pasif'}</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{s.title}</div>
              <div className="text-xs text-gray-800 mt-1">{s.pulledInfo}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sistem Durumu */}
      <div className="flex justify-center mb-6">
        <div className={`px-8 py-3 rounded-lg font-medium text-lg ${
          status?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              status?.isActive ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {status?.isActive ? 'Otomatik Yedekleme Aktif' : 'Otomatik Yedekleme Pasif'}
          </div>
        </div>
      </div>

    </div>
  )
}
