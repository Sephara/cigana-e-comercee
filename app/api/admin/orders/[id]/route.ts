import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth-server'

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
    await prisma.order.delete({
      where: { id },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin order delete error:', error)
    return NextResponse.json({ error: 'Erro ao excluir pedido' }, { status: 500 })
  }
}
