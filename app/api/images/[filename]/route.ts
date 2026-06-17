import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const IMAGES_DIR = path.join(DATA_DIR, 'images')

const EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const filepath = path.join(IMAGES_DIR, filename)

  if (!fs.existsSync(filepath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = EXT_TO_MIME[ext] || 'application/octet-stream'

  const bytes = fs.readFileSync(filepath)
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
