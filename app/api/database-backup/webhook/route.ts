import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// GitHub Webhook: push events
export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET || ''
  const githubEvent = request.headers.get('x-github-event') || ''
  const signature = request.headers.get('x-hub-signature-256') || ''

  try {
    if (!secret) {
      return NextResponse.json({ success: false, error: 'Webhook secret missing' }, { status: 500 })
    }

    if (githubEvent !== 'push') {
      return NextResponse.json({ success: true, message: 'Ignored event' })
    }

    const rawBody = await request.text()

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret)
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex')
    const isValid = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature || 'sha256='))
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const commit = payload.head_commit
    const repository = payload.repository?.full_name
    const ref = payload.ref
    const pusher = payload.pusher?.name

    // Persist minimal info for Sources API
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'GitHub push webhook received',
        source: 'backup_github_webhook',
        metadata: JSON.stringify({
          repository,
          ref,
          pusher,
          commitId: commit?.id,
          commitTimestamp: commit?.timestamp,
          commitMessage: commit?.message,
          added: commit?.added,
          removed: commit?.removed,
          modified: commit?.modified
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}


