'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Mail, CreditCard, Calendar, FileText, Settings, Search, Globe, Briefcase, BookOpen, Megaphone, Code } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Authentication kontrolü
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        // Token veya user yoksa login sayfasına yönlendir
        window.location.href = '/'
        return
      }

      try {
        const userData = JSON.parse(user)
        if (userData.role !== 'admin') {
          // Admin değilse login sayfasına yönlendir
          window.location.href = '/'
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('User data parse hatası:', error)
        window.location.href = '/'
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Authentication başarısız
  if (!isAuthenticated) {
    return null
  }

  const stats = [
    { name: 'Toplam Kullanıcı', value: '12,847', icon: Users, color: 'blue' },
    { name: 'Aktif Rezervasyon', value: '1,234', icon: BookOpen, color: 'green' },
    { name: 'Email Gönderilen', value: '8,456', icon: Mail, color: 'purple' },
    { name: 'Toplam Gelir', value: '₺245,678', icon: CreditCard, color: 'yellow' }
  ]

  const quickActions = [
    { name: 'Sistem', href: '/sistem', icon: Settings, color: 'gray' },
    { name: 'Kullanıcılar', href: '/kullanici', icon: Users, color: 'blue' },
    { name: 'Kampanyalar', href: '/kampanyalar', icon: Megaphone, color: 'orange' },
    { name: 'SEO', href: '/seo', icon: Search, color: 'green' },
    { name: 'Email', href: '/email', icon: Mail, color: 'purple' },
    { name: 'API', href: '/apiler', icon: Code, color: 'indigo' },
    { name: 'Rezervasyonlar', href: '/rezervasyonlar', icon: BookOpen, color: 'pink' },
    { name: 'Uçuşlar', href: '/ucuslar', icon: Calendar, color: 'teal' },
    { name: 'Ödemeler', href: '/odemeler', icon: CreditCard, color: 'yellow' },
    { name: 'Raporlar', href: '/raporlar', icon: FileText, color: 'red' },
    { name: 'İstatistikler', href: '/istatistikler', icon: BarChart3, color: 'cyan' },
    { name: 'Ayarlar', href: '/ayarlar', icon: Settings, color: 'gray' }
  ]

  return (
    <div className="admin-page-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <Header />
        <div className="admin-content-wrapper">
          {/* Page Header */}
          <div className="mb-3">
            <h1 className="admin-text-lg flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </h1>
            <p className="admin-text-xs mt-1">Admin paneli genel bakış</p>
          </div>

          {/* Stats Cards */}
          <div className="admin-grid-4 mb-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.name} className="admin-card">
                  <div className="flex items-center">
                    <div className={`p-2 rounded bg-${stat.color}-100`}>
                      <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-3">
                      <p className="admin-text-xs">{stat.name}</p>
                      <p className="admin-text-lg">{stat.value}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Hızlı Erişim</h3>
            </div>
            <div className="admin-grid-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <a
                    key={action.name}
                    href={action.href}
                    className="admin-card-small hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <div className={`p-1 rounded bg-${action.color}-100 mr-2`}>
                      <Icon className={`h-3 w-3 text-${action.color}-600`} />
                    </div>
                    <span className="admin-text-xs">{action.name}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}