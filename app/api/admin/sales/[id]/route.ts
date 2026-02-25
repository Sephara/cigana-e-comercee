import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth-server'

type SaleItem = { id: string; name: string; price: number; quantity: number }

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const sale = await prisma.manualSale.findUnique({
      where: { id },
      select: { items: true },
    })
    if (!sale) {
      return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 })
    }

    const items = sale.items as SaleItem[]
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id && (item.quantity ?? 0) > 0) {
          await prisma.product.update({
            where: { id: item.id },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }

    await prisma.manualSale.delete({
      where: { id },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin manual sale delete error:', error)
    return NextResponse.json({ error: 'Erro ao excluir venda' }, { status: 500 })
  }
}
