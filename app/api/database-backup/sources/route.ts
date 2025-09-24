import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SourceStatus {
  key: string
  title: string
  subtitle: string
  active: boolean
  pulledInfo: string
}

export async function GET() {
  try {
    // GitHub repo'dan en son işlem tarihini çek
    const lastBackupDate = await getLastBackupDate()

    // Gerçek durumları kontrol et
    const statusChecks = await checkAllStatuses()

    const sources: SourceStatus[] = [
      {
        key: 'github-hourly',
        title: 'GitHub Her Saat',
        subtitle: statusChecks.githubApi ? 'Aktif' : 'Pasif',
        active: statusChecks.githubApi,
        pulledInfo: lastBackupDate,
      },
      {
        key: 'github-repo',
        title: 'adminhersaat',
        subtitle: statusChecks.githubRepo ? 'Aktif' : 'Pasif',
        active: statusChecks.githubRepo,
        pulledInfo: 'grbt8yedek',
      },
      {
        key: 'backup-type',
        title: 'Kapsamlı Backup',
        subtitle: statusChecks.databaseConnection ? 'Aktif' : 'Pasif',
        active: statusChecks.databaseConnection,
        pulledInfo: 'DB+Schema+Users',
      },
      {
        key: 'cron-status',
        title: 'Vercel Cron',
        subtitle: statusChecks.vercelCron ? 'Aktif' : 'Pasif',
        active: statusChecks.vercelCron,
        pulledInfo: '0 * * * *',
      },
    ]

    return NextResponse.json({ success: true, data: sources })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Tüm durumları kontrol eden fonksiyon
async function checkAllStatuses() {
  const statusChecks = {
    githubApi: false,
    githubRepo: false,
    databaseConnection: false,
    vercelCron: false
  }

  try {
    // 1. GitHub API durumu kontrolü
    try {
      const githubToken = process.env.GITHUB_BACKUP_TOKEN
      if (githubToken) {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        statusChecks.githubApi = response.ok
      }
    } catch (error) {
      console.log('GitHub API kontrolü başarısız:', error)
    }

    // 2. GitHub Repository durumu kontrolü
    try {
      const githubToken = process.env.GITHUB_BACKUP_TOKEN
      if (githubToken) {
        const response = await fetch('https://api.github.com/repos/grbt8yedek/adminhersaat', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        statusChecks.githubRepo = response.ok
      }
    } catch (error) {
      console.log('GitHub Repository kontrolü başarısız:', error)
    }

    // 3. Database bağlantı durumu kontrolü
    try {
      await prisma.user.count()
      statusChecks.databaseConnection = true
    } catch (error) {
      console.log('Database bağlantı kontrolü başarısız:', error)
      statusChecks.databaseConnection = false
    }

    // 4. Vercel Cron durumu (her zaman aktif - Vercel'de çalışıyor)
    statusChecks.vercelCron = true

  } catch (error) {
    console.error('Durum kontrolü hatası:', error)
  }

  return statusChecks
}

// GitHub repo'dan en son commit tarihini çeken fonksiyon
async function getLastBackupDate(): Promise<string> {
  try {
    const githubToken = process.env.GITHUB_BACKUP_TOKEN
    if (!githubToken) {
      return 'Token yok'
    }

    // GitHub API'den en son commit'i çek
    const response = await fetch('https://api.github.com/repos/grbt8yedek/adminhersaat/commits', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      return 'API Hatası'
    }

    const commits = await response.json()
    if (!Array.isArray(commits) || commits.length === 0) {
      return 'Commit yok'
    }

    // En son commit'i al
    const latestCommit = commits[0]

    // Commit tarihini al
    const commitDate = new Date(latestCommit.commit.committer.date)

    // Geçersiz tarih kontrolü
    if (isNaN(commitDate.getTime())) {
      return 'Tarih hatası'
    }

    // Avrupa Paris saati ile tam tarih formatı
    return commitDate.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    })

  } catch (error) {
    console.error('GitHub commit tarihi alınamadı:', error)
    return 'Hata'
  }
}


