const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Admin kullanıcısı oluşturuluyor...')
    
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
    
    console.log('✅ Admin kullanıcısı oluşturuldu!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Şifre: Admin123!')
    console.log('👤 Rol:', admin.role)
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
