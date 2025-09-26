import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Test API çalışıyor',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'POST Test API çalışıyor',
    timestamp: new Date().toISOString()
  })
}
