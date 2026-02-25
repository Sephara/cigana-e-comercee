import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { items, total, shipping } = await request.json()
    if (!items || !Array.isArray(items) || total == null || !shipping) {
      return NextResponse.json(
        { error: 'Dados do pedido inválidos' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        userId: payload.userId,
        items,
        total: Number(total),
        shipping,
        status: 'pending',
      },
    })

    return NextResponse.json({ id: order.id })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}
