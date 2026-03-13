import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = 'public/uploads'
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp'])

/**
 * Serve arquivos de public/uploads via API para evitar 404 quando
 * o Next.js não servir a pasta estática em produção (ex.: após deploy).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filename = pathSegments?.join('/')
    if (!filename || filename.includes('..')) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }
    const ext = path.extname(filename).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: 'Tipo não permitido' }, { status: 400 })
    }
    const cwd = process.cwd()
    const filePath = path.join(cwd, UPLOAD_DIR, filename)
    const bytes = await readFile(filePath)
    const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/gif'
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }
}
