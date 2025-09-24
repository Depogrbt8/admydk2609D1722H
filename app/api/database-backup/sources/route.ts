import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface SourceStatus {
  key: string
  title: string
  subtitle: string
  active: boolean
  pulledInfo: string
}

export async function GET() {
  try {
    // Read common backup file size to show as pulled info
    const backupFile = path.join(process.cwd(), 'backups', 'database-backup.json')
    let pulled = '! cekilen veri !'
    if (fs.existsSync(backupFile)) {
      const sizeKb = (fs.statSync(backupFile).size / 1024).toFixed(1)
      pulled = `${sizeKb} KB cekilen veri`
    }

    const sources: SourceStatus[] = [
      {
        key: 'github-hourly',
        title: 'GitHub Her Saat',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: pulled,
      },
      {
        key: 'github-repo',
        title: 'adminhersaat',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: 'grbt8yedek',
      },
      {
        key: 'backup-type',
        title: 'Kapsamlı Backup',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: 'DB+Schema+Users',
      },
      {
        key: 'cron-status',
        title: 'Vercel Cron',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: '0 * * * *',
      },
    ]

    return NextResponse.json({ success: true, data: sources })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}


