/**
 * Ana site admin şifresini güncellemek için script
 * Bu script ana site'nin database'ine bağlanıp admin şifresini güncelleyecek
 */

const bcrypt = require('bcrypt');

async function updateMainSiteAdminPassword() {
  try {
    console.log('🔧 Ana site admin şifresi güncelleniyor...');
    
    // Ana site'nin database URL'ini buraya ekle
    const mainSiteDbUrl = process.env.MAIN_SITE_DATABASE_URL || 'postgresql://...';
    
    if (mainSiteDbUrl === 'postgresql://...') {
      console.log('❌ Ana site database URL\'i bulunamadı');
      console.log('💡 MAIN_SITE_DATABASE_URL environment variable\'ını set edin');
      return;
    }
    
    const { PrismaClient } = require('@prisma/client');
    const mainSitePrisma = new PrismaClient({
      datasources: {
        db: {
          url: mainSiteDbUrl
        }
      }
    });
    
    // Yeni şifreyi hash'le
    const newPassword = 'GRBT8Admin2025!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Admin kullanıcısını bul ve güncelle
    const updated = await mainSitePrisma.user.update({
      where: { email: 'admin@grbt8.store' },
      data: { 
        password: hashedPassword
      }
    });
    
    console.log('✅ Ana site admin şifresi güncellendi!');
    console.log('📧 Email: admin@grbt8.store');
    console.log('🔑 Yeni Şifre: GRBT8Admin2025!');
    
    await mainSitePrisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    if (error.message.includes('Record to update not found')) {
      console.log('💡 Ana site\'de admin kullanıcısı bulunamadı');
      console.log('💡 Önce admin kullanıcısını oluşturmanız gerekebilir');
    }
  }
}

updateMainSiteAdminPassword();
