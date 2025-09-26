import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()

    // Güvenlik kontrolü
    if (secret !== 'grbt8-admin-create-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔧 Production admin kullanıcısı oluşturuluyor...')
    
    const hashedPassword = await bcrypt.hash('Admin123!', 10)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@grbt8.store' },
      update: {
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      },
      create: {
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
    console.error('❌ Admin oluşturma hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
