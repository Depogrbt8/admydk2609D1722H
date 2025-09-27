import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcrypt'

// Admin güncelle
export async function PUT(request: NextRequest) {
  try {
    const { id, firstName, lastName, email, password, role, status } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID gerekli' },
        { status: 400 }
      )
    }

    // Admin'i bul
    const existingAdmin = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin bulunamadı' },
        { status: 404 }
      )
    }

    // Email kontrolü (kendi email'i hariç)
    if (email !== existingAdmin.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Güncelleme verisi
    const updateData: any = {
      firstName: firstName || existingAdmin.firstName,
      lastName: lastName || existingAdmin.lastName,
      email: email || existingAdmin.email,
      role: role ? role.toLowerCase().replace(' ', '_') : existingAdmin.role,
      status: status || existingAdmin.status
    }

    // Şifre varsa hash'le
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Admin'i güncelle
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin başarıyla güncellendi',
      admin: {
        id: updatedAdmin.id,
        name: `${updatedAdmin.firstName} ${updatedAdmin.lastName}`,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        status: updatedAdmin.status,
        lastLogin: updatedAdmin.lastLoginAt ? 
          new Date(updatedAdmin.lastLoginAt).toLocaleString('tr-TR') : 
          'Henüz giriş yapmadı',
        createdAt: new Date(updatedAdmin.createdAt).toLocaleDateString('tr-TR')
      }
    })

  } catch (error) {
    console.error('Admin güncelleme hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// Admin sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID gerekli' },
        { status: 400 }
      )
    }

    // Admin'i bul
    const admin = await prisma.user.findUnique({
      where: { id }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin bulunamadı' },
        { status: 404 }
      )
    }

    // Silinebilir mi kontrol et
    if (!admin.canDelete) {
      return NextResponse.json(
        { success: false, error: 'Bu admin silinemez' },
        { status: 403 }
      )
    }

    // Admin'i sil
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin başarıyla silindi'
    })

  } catch (error) {
    console.error('Admin silme hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
