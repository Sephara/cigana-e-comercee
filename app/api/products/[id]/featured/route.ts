import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { featured } = await request.json()

    await prisma.product.update({
      where: { id: params.id },
      data: { featured: !!featured },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar destaque:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar destaque' },
      { status: 500 }
    )
  }
}
