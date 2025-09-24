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
  const [security, setSecurity] = useState<any>(null)

  useEffect(() => {
    fetchBackupStatus()
    fetchSources()
    fetchSecurity()
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

  const fetchSecurity = async () => {
    try {
      const res = await fetch('/api/system/security/status')
      const json = await res.json()
      if (json.success) {
        setSecurity(json.data)
      }
    } catch (e) {
      console.log('Security data fetch failed:', e)
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
      {/* Güvenlik Bölümü */}
      {security && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              🛡️ Güvenlik Durumu
            </h4>
            <div className={`text-sm px-2 py-1 rounded-full ${
              security.overallScore >= 90 ? 'bg-green-100 text-green-700' :
              security.overallScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Skor: {security.overallScore}/100
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Aktif Saldırılar */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">Aktif Saldırı</div>
                {security.realTimeThreats?.activeAttacks > 5 && (
                  <span className="text-red-500 text-xs">⚠️</span>
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {security.realTimeThreats?.activeAttacks || 0}
              </div>
            </div>

            {/* Engellenen İstekler */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">Engellenen</div>
                {security.realTimeThreats?.blockedRequests > 500 && (
                  <span className="text-yellow-500 text-xs">⚠️</span>
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {security.realTimeThreats?.blockedRequests || 0}
              </div>
            </div>

            {/* Rate Limit */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">Rate Limit</div>
                {security.rateLimitingStatus?.blockedRequests > 100 && (
                  <span className="text-orange-500 text-xs">⚠️</span>
                )}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {security.rateLimitingStatus?.blockedRequests || 0}
              </div>
            </div>

            {/* Son Tehdit */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-xs text-gray-600">Son Tehdit</div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {security.realTimeThreats?.lastThreat || 'Yok'}
              </div>
            </div>
          </div>

          {/* Durum Mesajı */}
          <div className="mt-3 text-xs text-gray-600 text-center">
            {security.message || 'Güvenlik sistemleri izleniyor'}
          </div>
        </div>
      )}
    </div>
  )
}
