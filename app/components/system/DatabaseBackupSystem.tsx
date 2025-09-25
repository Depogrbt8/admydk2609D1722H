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
    <div className="border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">🗄️ Database Yedekleme Sistemi</h3>
          <p className="text-xs text-gray-500 mt-1">Incremental Backup - Her saatte bir otomatik</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            status?.isActive ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-500">
            {status?.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>

      {/* Kaynak Kartları (Monitor tasarımı) */}
      {sources?.length > 0 && (
        <div className="grid gap-2 md:grid-cols-4 mb-3">
          {sources.map((s) => (
            <div key={s.key} className={`border rounded p-2 ${s.active ? 'border-green-300' : 'border-red-300'}`}>
              <div className={`text-[10px] text-gray-500 ${s.active ? 'text-green-600' : 'text-red-500'}`}>{s.active ? 'Aktif' : 'Pasif'}</div>
              <div className="text-sm font-semibold text-gray-900">{s.title}</div>
              <div className="text-[10px] text-gray-500">{s.pulledInfo}</div>
            </div>
          ))}
        </div>
      )}
      {/* Güvenlik Bölümü */}
      {security && (
        <div className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              🛡️ Güvenlik Durumu
            </h4>
            <div className={`text-xs px-2 py-0.5 rounded ${
              security.overallScore >= 90 ? 'bg-green-100 text-green-700' :
              security.overallScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Skor: {security.overallScore}/100
            </div>
          </div>
          
          <div className="grid gap-2 md:grid-cols-4">
            {/* Aktif Saldırılar */}
            <div className={`border rounded p-2 ${security.realTimeThreats?.activeAttacks > 5 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500">Aktif Saldırı</div>
                {security.realTimeThreats?.activeAttacks > 5 && (
                  <span className="text-red-500 text-[10px]">⚠️</span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {security.realTimeThreats?.activeAttacks || 0}
              </div>
            </div>

            {/* Engellenen İstekler */}
            <div className={`border rounded p-2 ${security.realTimeThreats?.blockedRequests > 500 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500">Engellenen</div>
                {security.realTimeThreats?.blockedRequests > 500 && (
                  <span className="text-yellow-500 text-[10px]">⚠️</span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {security.realTimeThreats?.blockedRequests || 0}
              </div>
            </div>

            {/* Rate Limit */}
            <div className={`border rounded p-2 ${security.rateLimitingStatus?.blockedRequests > 100 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500">Rate Limit</div>
                {security.rateLimitingStatus?.blockedRequests > 100 && (
                  <span className="text-orange-500 text-[10px]">⚠️</span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {security.rateLimitingStatus?.blockedRequests || 0}
              </div>
            </div>

            {/* Son Tehdit */}
            <div className="border rounded p-2 border-gray-200">
              <div className="text-[10px] text-gray-500">Son Tehdit</div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {security.realTimeThreats?.lastThreat || 'Yok'}
              </div>
            </div>
          </div>

          {/* Durum Mesajı */}
          <div className="mt-2 text-[10px] text-gray-500 text-center">
            {security.message || 'Güvenlik sistemleri izleniyor'}
          </div>
        </div>
      )}
    </div>
  )
}
