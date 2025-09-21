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

  useEffect(() => {
    fetchBackupStatus()
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

      {/* Durum Kartları */}
      {status && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Son Yedekleme</p>
            <p className="text-lg font-semibold text-blue-900">
              {status.lastBackup 
                ? new Date(status.lastBackup).toLocaleString('tr-TR')
                : 'Henüz yok'
              }
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Sonraki Yedekleme</p>
            <p className="text-lg font-semibold text-green-900">
              {status.nextBackup 
                ? new Date(status.nextBackup).toLocaleString('tr-TR')
                : '2 saat sonra'
              }
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Toplam Kayıt</p>
            <p className="text-lg font-semibold text-purple-900">{status.totalRecords.toLocaleString()}</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Yedek Boyutu</p>
            <p className="text-lg font-semibold text-orange-900">{status.backupSize}</p>
          </div>
        </div>
      )}

      {/* Değişiklik İstatistikleri */}
      {status?.changes && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-3">📊 Son Değişiklikler</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">+{status.changes.newUsers}</p>
              <p className="text-sm text-gray-600">Yeni Kullanıcı</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">+{status.changes.newReservations}</p>
              <p className="text-sm text-gray-600">Yeni Rezervasyon</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">+{status.changes.newPayments}</p>
              <p className="text-sm text-gray-600">Yeni Ödeme</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{status.changes.updatedRecords}</p>
              <p className="text-sm text-gray-600">Güncellenen</p>
            </div>
          </div>
        </div>
      )}

      {/* Ana Kontrol Butonu */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleAutoBackup}
          disabled={isToggling}
          className={`px-8 py-3 rounded-lg font-medium text-lg ${
            isToggling
              ? 'bg-gray-400 cursor-not-allowed'
              : status?.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isToggling ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              İşleniyor...
            </div>
          ) : (
            status?.isActive ? 'Otomatik Yedeklemeyi Durdur' : 'Otomatik Yedeklemeyi Başlat'
          )}
        </button>
      </div>

    </div>
  )
}
