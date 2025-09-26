#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// GitHub repository bilgileri
const GITHUB_REPO = 'https://github.com/Depogrbt8/admydk2609D1722H.git';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'github-backup');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 GitHub Tam Yedekleme Başlatılıyor...');
console.log(`📅 Zaman: ${new Date().toLocaleString('tr-TR')}`);
console.log(`🎯 Hedef Repo: ${GITHUB_REPO}`);

async function main() {
  try {
    // Token kontrolü
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable gerekli!');
    }

    // 1. Backup dizinini oluştur
    console.log('\n📁 Backup dizini oluşturuluyor...');
    if (fs.existsSync(BACKUP_DIR)) {
      execSync(`rm -rf "${BACKUP_DIR}"`);
    }
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    // 2. Database yedeğini al
    console.log('\n🗄️ Database yedeği alınıyor...');
    await backupDatabase();

    // 3. Upload dosyalarını yedekle
    console.log('\n📎 Upload dosyaları yedekleniyor...');
    await backupUploads();

    // 4. Konfigürasyon dosyalarını yedekle
    console.log('\n⚙️ Konfigürasyon dosyaları yedekleniyor...');
    await backupConfigs();

    // 5. Proje dosyalarını yedekle
    console.log('\n📦 Proje dosyaları yedekleniyor...');
    await backupProjectFiles();

    // 6. Environment variables yedeğini al
    console.log('\n🔐 Environment variables yedekleniyor...');
    await backupEnvironment();

    // 7. GitHub reposuna push et
    console.log('\n🚀 GitHub reposuna push ediliyor...');
    await pushToGitHub();

    console.log('\n✅ Tam yedekleme başarıyla tamamlandı!');
    console.log(`📊 Yedek boyutu: ${getDirectorySize(BACKUP_DIR)}`);

  } catch (error) {
    console.error('\n❌ Yedekleme hatası:', error.message);
    process.exit(1);
  }
}

async function backupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // Tüm tabloları al
    const tables = [
      'User', 'Account', 'Session', 'VerificationToken', 'Reservation', 'Payment',
      'Passenger', 'PriceAlert', 'SearchFavorite', 'SystemSettings', 'Campaign',
      'SurveyResponse', 'SystemLog', 'EmailTemplate', 'EmailQueue', 'EmailLog',
      'EmailSettings', 'BillingInfo', 'SeoSettings'
    ];

    const databaseBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {}
    };

    for (const table of tables) {
      try {
        const data = await prisma[table.toLowerCase()].findMany();
        databaseBackup.tables[table] = data;
        console.log(`  ✓ ${table}: ${data.length} kayıt`);
      } catch (error) {
        console.log(`  ⚠️ ${table}: Tablo bulunamadı veya erişilemedi`);
      }
    }

    // Database yedeğini kaydet
    const dbBackupPath = path.join(BACKUP_DIR, 'database-backup.json');
    fs.writeFileSync(dbBackupPath, JSON.stringify(databaseBackup, null, 2));
    
    // Prisma schema yedeğini al
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    const schemaBackupPath = path.join(BACKUP_DIR, 'schema.prisma');
    fs.copyFileSync(schemaPath, schemaBackupPath);

  } finally {
    await prisma.$disconnect();
  }
}

async function backupUploads() {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  const backupUploadsDir = path.join(BACKUP_DIR, 'uploads');
  
  if (fs.existsSync(uploadsDir)) {
    execSync(`cp -r "${uploadsDir}" "${backupUploadsDir}"`);
    console.log(`  ✓ Upload dosyaları kopyalandı: ${backupUploadsDir}`);
  } else {
    console.log('  ⚠️ Upload dizini bulunamadı');
  }
}

async function backupConfigs() {
  const configFiles = [
    'package.json',
    'next.config.js',
    'vercel.json',
    'tailwind.config.ts',
    'tsconfig.json',
    'postcss.config.js',
    'middleware.ts',
    'next-env.d.ts'
  ];

  for (const file of configFiles) {
    const sourcePath = path.join(__dirname, '..', file);
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(BACKUP_DIR, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ ${file} kopyalandı`);
    }
  }
}

async function backupProjectFiles() {
  const projectDirs = [
    'app',
    'lib',
    'components',
    'scripts',
    'shared'
  ];

  for (const dir of projectDirs) {
    const sourcePath = path.join(__dirname, '..', dir);
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(BACKUP_DIR, dir);
      execSync(`cp -r "${sourcePath}" "${destPath}"`);
      console.log(`  ✓ ${dir}/ dizini kopyalandı`);
    }
  }

  // Diğer önemli dosyalar
  const otherFiles = [
    'README.md',
    'deploy.sh',
    'setup-vercel.sh',
    'vercel-protection.js'
  ];

  for (const file of otherFiles) {
    const sourcePath = path.join(__dirname, '..', file);
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(BACKUP_DIR, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ ${file} kopyalandı`);
    }
  }
}

async function backupEnvironment() {
  const envBackup = {
    timestamp: new Date().toISOString(),
    note: 'Environment variables production ortamından alınmalıdır',
    required_variables: [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'RESEND_API_KEY',
      'GITHUB_TOKEN',
      'GITLAB_TOKEN'
    ]
  };

  const envBackupPath = path.join(BACKUP_DIR, 'environment-template.json');
  fs.writeFileSync(envBackupPath, JSON.stringify(envBackup, null, 2));
  console.log('  ✓ Environment template oluşturuldu');
}

async function pushToGitHub() {
  const repoUrl = GITHUB_REPO.replace('https://', `https://${GITHUB_TOKEN}@`);
  
  try {
    // Git repository'yi klonla
    console.log('  📥 Repository klonlanıyor...');
    execSync(`git clone "${repoUrl}" "${BACKUP_DIR}/repo"`, { stdio: 'inherit' });
    
    const repoDir = path.join(BACKUP_DIR, 'repo');
    
    // Mevcut dosyaları temizle (ilk commit için)
    execSync(`cd "${repoDir}" && rm -rf * .* 2>/dev/null || true`);
    
    // Yedek dosyalarını repo'ya kopyala
    console.log('  📋 Dosyalar repo\'ya kopyalanıyor...');
    execSync(`cp -r "${BACKUP_DIR}"/* "${repoDir}"/ 2>/dev/null || true`);
    execSync(`rm -rf "${repoDir}/repo"`); // Kendi kendini kopyalamayı önle
    
    // Git işlemleri
    console.log('  🔄 Git işlemleri yapılıyor...');
    execSync(`cd "${repoDir}" && git add .`);
    execSync(`cd "${repoDir}" && git commit -m "Tam yedekleme - ${new Date().toLocaleString('tr-TR')}"`);
    execSync(`cd "${repoDir}" && git push origin main`);
    
    console.log('  ✅ GitHub\'a başarıyla push edildi!');
    
  } catch (error) {
    console.error('  ❌ GitHub push hatası:', error.message);
    throw error;
  }
}

function getDirectorySize(dirPath) {
  try {
    const result = execSync(`du -sh "${dirPath}"`, { encoding: 'utf8' });
    return result.split('\t')[0];
  } catch {
    return 'Bilinmiyor';
  }
}

// Script'i çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
