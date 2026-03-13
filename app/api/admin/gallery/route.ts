import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** Lista todas as imagens da galeria (admin). */
export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error('Erro ao buscar galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar galeria' },
      { status: 500 }
    )
  }
}

/** Adiciona uma imagem à galeria. */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, sortOrder } = body
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória.' },
        { status: 400 }
      )
    }
    const maxOrder = await prisma.galleryImage
      .aggregate({ _max: { sortOrder: true } })
      .then((r) => r._max.sortOrder ?? -1)
    const image = await prisma.galleryImage.create({
      data: {
        url: url.trim(),
        sortOrder: typeof sortOrder === 'number' ? sortOrder : maxOrder + 1,
      },
    })
    return NextResponse.json(image)
  } catch (error) {
    console.error('Erro ao adicionar imagem na galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar imagem' },
      { status: 500 }
    )
  }
}
