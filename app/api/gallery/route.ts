import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Lista imagens da galeria (pública, para a home). */
export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, sortOrder: true },
    })
    return NextResponse.json(images.map((i) => ({ id: i.id, url: i.url })), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
  } catch (error) {
    console.error('Erro ao buscar galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar galeria' },
      { status: 500 }
    )
  }
}
