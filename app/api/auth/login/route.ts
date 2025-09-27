import { NextRequest, NextResponse } from 'next/server'

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

    // Basit test - admin@grbt8.store ve GRBT8Admin2025! kontrolü
    if (username === 'admin@grbt8.store' && password === 'GRBT8Admin2025!') {
      const token = 'test-token-' + Date.now()
      
      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: 'admin-1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@grbt8.store',
          role: 'admin'
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
    }

    return NextResponse.json(
      { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
