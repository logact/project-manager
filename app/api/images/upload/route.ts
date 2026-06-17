import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const IMAGES_DIR = path.join(DATA_DIR, 'images')

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = MIME_TO_EXT[file.type] || '.bin'
    const filename = `${crypto.randomUUID()}${ext}`
    const filepath = path.join(IMAGES_DIR, filename)

    const bytes = await file.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(bytes))

    return NextResponse.json({ url: `/api/images/${filename}` })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
