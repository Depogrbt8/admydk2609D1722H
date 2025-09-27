import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcrypt'

// Admin listesini getir
export async function GET(request: NextRequest) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin', 'moderator']
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        canDelete: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin.id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        lastLogin: admin.lastLoginAt ? 
          new Date(admin.lastLoginAt).toLocaleString('tr-TR') : 
          'Henüz giriş yapmadı',
        createdAt: new Date(admin.createdAt).toLocaleDateString('tr-TR'),
        canDelete: admin.canDelete
      }))
    })

  } catch (error) {
    console.error('Admin listesi getirme hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// Yeni admin oluştur
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, role, permissions } = await request.json()

    // Validasyon
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanlar gerekli' },
        { status: 400 }
      )
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifre hash'le
    const hashedPassword = await bcrypt.hash(password, 10)

    // Admin oluştur
    const admin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role.toLowerCase().replace(' ', '_'),
        status: 'active',
        canDelete: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin başarıyla oluşturuldu',
      admin: {
        id: admin.id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        createdAt: new Date(admin.createdAt).toLocaleDateString('tr-TR')
      }
    })

  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
