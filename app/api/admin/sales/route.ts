import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth-server'

type SaleItem = { id: string; name: string; price: number; quantity: number }

async function requireAdmin() {
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
  return null
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth
  try {
    const manualSales = await prisma.manualSale.findMany({
      select: { id: true, createdAt: true, total: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(manualSales)
  } catch (error) {
    console.error('Admin sales list error:', error)
    return NextResponse.json({ error: 'Erro ao listar vendas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (auth) return auth
  try {
    const body = await request.json()
    const { items, total } = body as { items: SaleItem[]; total: number }
    if (!Array.isArray(items) || items.length === 0 || typeof total !== 'number') {
      return NextResponse.json(
        { error: 'Envie items (array com id, name, price, quantity) e total' },
        { status: 400 }
      )
    }

    for (const item of items) {
      if (!item.id || item.quantity == null || item.quantity < 1) {
        return NextResponse.json({ error: 'Cada item deve ter id e quantity >= 1' }, { status: 400 })
      }
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { stock: true, name: true },
      })
      if (!product) {
        return NextResponse.json({ error: `Produto não encontrado: ${item.id}` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente de "${product.name}". Disponível: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    const sale = await prisma.manualSale.create({
      data: {
        items: items.map((i) => ({
          id: i.id,
          name: i.name ?? '',
          price: Number(i.price) ?? 0,
          quantity: i.quantity,
        })),
        total,
      },
    })

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ id: sale.id })
  } catch (error) {
    console.error('Register sale error:', error)
    return NextResponse.json({ error: 'Erro ao registrar venda' }, { status: 500 })
  }
}
