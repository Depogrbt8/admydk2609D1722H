'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import AdminList from '../../components/admin/AdminList'
import AdminForm from '../../components/admin/AdminForm'
import PermissionManager from '../../components/admin/PermissionManager'

interface Admin {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
  canDelete?: boolean
}

export default function AdminYonetimiPage() {
  const [activeTab, setActiveTab] = useState('ayarlar')
  const [activeAdminTab, setActiveAdminTab] = useState('liste')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Admin listesini API'den çek
  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin')
      const data = await response.json()
      
      if (data.success) {
        setAdmins(data.admins)
      } else {
        console.error('Admin listesi çekme hatası:', data.error)
      }
    } catch (error) {
      console.error('Admin listesi çekme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  // Admin işlemleri
  const handleAddAdmin = (adminData: any) => {
    // Admin eklendikten sonra listeyi yenile
    fetchAdmins()
    setActiveAdminTab('liste')
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
    setShowEditModal(true)
  }

  const handleUpdateAdmin = (updatedAdmin: any) => {
    // Admin güncellendikten sonra listeyi yenile
    fetchAdmins()
    setShowEditModal(false)
    setEditingAdmin(null)
  }

  const handleDeleteAdmin = async (admin: Admin) => {
    if (confirm(`${admin.name} adlı admini silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await fetch(`/api/admin/${admin.id}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (data.success) {
          alert('Admin başarıyla silindi!')
          fetchAdmins() // Listeyi yenile
        } else {
          alert(data.error || 'Silme işlemi başarısız!')
        }
      } catch (error) {
        console.error('Admin silme hatası:', error)
        alert('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    }
  }

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const newStatus = admin.status === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`/api/admin/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Admin durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı!`)
        fetchAdmins() // Listeyi yenile
      } else {
        alert(data.error || 'Durum değiştirme başarısız!')
      }
    } catch (error) {
      console.error('Admin durum değiştirme hatası:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik */}
        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Admin Yönetimi</h1>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveAdminTab('liste')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeAdminTab === 'liste'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Admin Listesi
                </button>
                <button
                  onClick={() => setActiveAdminTab('ekle')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeAdminTab === 'ekle'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Yeni Admin Ekle
                </button>
                <button
                  onClick={() => setActiveAdminTab('yetkiler')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeAdminTab === 'yetkiler'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Yetki Yönetimi
                </button>
              </nav>
            </div>

                {/* Tab İçerikleri */}
                {activeAdminTab === 'liste' && (
                  <>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Admin listesi yükleniyor...</span>
                      </div>
                    ) : (
                      <AdminList 
                        admins={admins} 
                        onEdit={handleEditAdmin}
                        onDelete={handleDeleteAdmin}
                        onToggleStatus={handleToggleStatus}
                      />
                    )}
                  </>
                )}

            {activeAdminTab === 'ekle' && (
              <AdminForm 
                onSubmit={handleAddAdmin}
                onCancel={() => setActiveAdminTab('liste')}
              />
            )}

            {activeAdminTab === 'yetkiler' && (
              <PermissionManager onSave={(roles) => console.log('Yetkiler kaydedildi:', roles)} />
            )}
          </div>
        </main>
      </div>

      {/* Admin Düzenleme Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Admin Düzenle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingAdmin(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <AdminForm
              onSubmit={handleUpdateAdmin}
              onCancel={() => {
                setShowEditModal(false)
                setEditingAdmin(null)
              }}
              editingAdmin={editingAdmin}
              isEdit={true}
            />
          </div>
        </div>
      )}
    </div>
  )
} 