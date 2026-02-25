import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const SECONDARY_IMAGES_COUNT = 3

function normalizeImages(images: unknown): string[] {
  if (Array.isArray(images)) return images.filter((x) => typeof x === 'string')
  if (typeof images === 'string') return images.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }
    return NextResponse.json({
      ...product,
      combos: product.combos as { name: string; price: number }[] | null,
      stock: product.stock ?? 0,
      lowStockThreshold: product.lowStockThreshold,
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      price,
      image,
      images,
      description,
      fullDescription,
      originalPrice,
      combos,
      featured,
      category,
      stock,
      lowStockThreshold,
    } = body

    if (images !== undefined) {
      const imagesArr = normalizeImages(images)
      if (imagesArr.length !== SECONDARY_IMAGES_COUNT) {
        return NextResponse.json(
          { error: `É obrigatório ter exatamente ${SECONDARY_IMAGES_COUNT} imagens secundárias.` },
          { status: 400 }
        )
      }
      body.images = imagesArr
    }

    const updateData: Record<string, unknown> = {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(image !== undefined && { image }),
      ...(images !== undefined && { images: body.images }),
      ...(description !== undefined && { description: description || null }),
      ...(fullDescription !== undefined && {
        fullDescription: fullDescription || null,
      }),
      ...(originalPrice !== undefined && {
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      }),
      ...(combos !== undefined && { combos }),
      ...(featured !== undefined && { featured: !!featured }),
      ...(category !== undefined && { category: category || 'geral' }),
      ...(stock !== undefined && { stock: typeof stock === 'number' ? stock : parseInt(stock, 10) || 0 }),
      ...(lowStockThreshold !== undefined && {
        lowStockThreshold: lowStockThreshold == null || lowStockThreshold === '' ? null : parseInt(lowStockThreshold, 10),
      }),
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData as Parameters<typeof prisma.product.update>[0]['data'],
    })

    return NextResponse.json({ id: product.id })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    )
  }
}
