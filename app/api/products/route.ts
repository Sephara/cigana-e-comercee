import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    type ProductFromDb = (typeof products)[number]
    const formatted = products.map((p: ProductFromDb) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      images: p.images,
      description: p.description,
      fullDescription: p.fullDescription,
      originalPrice: p.originalPrice,
      combos: p.combos as { name: string; price: number }[] | null,
      featured: p.featured,
      category: p.category as 'boné' | 'conjunto' | 'geral',
      stock: p.stock ?? 0,
      lowStockThreshold: p.lowStockThreshold ?? null,
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

const SECONDARY_IMAGES_COUNT = 3

function normalizeImages(images: unknown): string[] {
  if (Array.isArray(images)) return images.filter((x) => typeof x === 'string')
  if (typeof images === 'string') return images.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

export async function POST(request: Request) {
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

    if (!name || price == null || !image) {
      return NextResponse.json(
        { error: 'Preencha nome, preço e imagem principal.' },
        { status: 400 }
      )
    }
    const imagesArr = normalizeImages(images)
    if (imagesArr.length !== SECONDARY_IMAGES_COUNT) {
      return NextResponse.json(
        { error: `É obrigatório ter exatamente ${SECONDARY_IMAGES_COUNT} imagens secundárias.` },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        image,
        images: imagesArr,
        description: description || null,
        fullDescription: fullDescription || null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        combos: combos || null,
        featured: !!featured,
        category: category || 'geral',
        stock: typeof stock === 'number' ? stock : parseInt(stock, 10) || 0,
        lowStockThreshold: lowStockThreshold != null ? parseInt(lowStockThreshold, 10) : null,
      },
    })

    return NextResponse.json({ id: product.id })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
