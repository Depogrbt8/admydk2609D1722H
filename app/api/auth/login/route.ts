import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    console.log('Login API çağrıldı')
    
    const { username, password } = await request.json()
    console.log('Username:', username)

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      )
    }

    // Admin kullanıcısını bul
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { firstName: username }
        ],
        role: 'admin',
        status: 'active'
      }
    })

    console.log('User bulundu:', user ? 'Evet' : 'Hayır')

    if (!user) {
      console.log('Kullanıcı bulunamadı:', username)
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Şifre geçerli:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('Yanlış şifre:', username)
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET || 'grbt8-admin-secret-2024',
      { expiresIn: '24h' }
    )

    // Son giriş zamanını güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    console.log('Başarılı admin girişi:', username)

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    })

    // HTTP-only cookie olarak da token'ı set et
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 saat
    })

    return response

  } catch (error) {
    console.error('Login hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
