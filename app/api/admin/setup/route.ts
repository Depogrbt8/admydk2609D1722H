import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Production admin setup başlatılıyor...')
    
    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@grbt8.store' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin kullanıcısı zaten mevcut:', existingAdmin.email)
      return NextResponse.json({
        success: true,
        message: 'Admin kullanıcısı zaten mevcut',
        admin: {
          email: existingAdmin.email,
          role: existingAdmin.role,
          status: existingAdmin.status
        }
      })
    }
    
    // Admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('Admin123!', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@grbt8.store',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        canDelete: false
      }
    })
    
    console.log('✅ Production admin kullanıcısı oluşturuldu!')
    
    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      admin: {
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    })

  } catch (error) {
    console.error('❌ Admin setup hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}
