'use client'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function KampanyalarPage() {
  const [activeTab, setActiveTab] = useState('kampanyalar')

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <Header />

        {/* Ana İçerik - Boş */}
        <main className="flex-1 p-4 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Kampanya Yönetimi</h3>
                <p className="text-gray-500">Kampanyalar artık ana siteden yönetiliyor.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 