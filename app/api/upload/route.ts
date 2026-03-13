import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = 'public/uploads'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    const cwd = process.cwd()
    const dir = path.join(cwd, UPLOAD_DIR)
    await mkdir(dir, { recursive: true })

    const ext = path.extname(file.name) || '.jpg'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
    const filePath = path.join(dir, name)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // URL absoluta para evitar erro de validação "pattern" no cliente (ex.: /uploads/xxx não é aceito como URL em alguns contextos)
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    if (!baseUrl) {
      const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const proto = forwardedProto === 'https' || forwardedProto === 'http' ? forwardedProto : (request.headers.get('x-forwarded-ssl') ? 'https' : 'http')
      if (host) baseUrl = `${proto}://${host}`
    }
    // Usar /api/uploads/ para servir via API e evitar 404 em produção
    const url = baseUrl ? `${baseUrl}/api/uploads/${name}` : `/api/uploads/${name}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
