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
        key: 'github-2h',
        title: 'Github 2 saat',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: pulled,
      },
      {
        key: 'gitlab-daily',
        title: 'Gitlab Gunluk',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: pulled,
      },
      {
        key: 'github-6h',
        title: 'Github 6 saat',
        subtitle: 'Aktif',
        active: true,
        pulledInfo: pulled,
      },
      {
        key: 'future',
        title: 'Sonra eklenecek',
        subtitle: 'Pasif',
        active: false,
        pulledInfo: '! cekilen veri !',
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


