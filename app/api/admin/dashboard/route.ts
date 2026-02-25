import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth-server'

type OrderItem = { id: string; name: string; price: number; quantity: number }

export async function GET() {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let products: { id: string; name: string; image: string; stock?: number; lowStockThreshold?: number | null }[]
    try {
      products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          lowStockThreshold: true,
          image: true,
        },
        orderBy: { name: 'asc' },
      })
    } catch (productError) {
      console.error('Dashboard products query failed (rode: npx prisma migrate dev):', productError)
      throw productError
    }

    const [
      ordersLast7DaysResult,
      manualLast7DaysResult,
      ordersWeek,
      ordersMonth,
      manualWeek,
      manualMonth,
      allOrders,
      allManualSales,
    ] = await Promise.all([
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now)
          d.setDate(d.getDate() - (6 - i))
          d.setHours(0, 0, 0, 0)
          const next = new Date(d)
          next.setDate(next.getDate() + 1)
          return prisma.order.count({
            where: { createdAt: { gte: d, lt: next } },
          })
        })
      ),
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now)
          d.setDate(d.getDate() - (6 - i))
          d.setHours(0, 0, 0, 0)
          const next = new Date(d)
          next.setDate(next.getDate() + 1)
          return prisma.manualSale.count({
            where: { createdAt: { gte: d, lt: next } },
          })
        })
      ),
      prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.manualSale.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.manualSale.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.findMany({ select: { items: true } }),
      prisma.manualSale.findMany({ select: { items: true } }),
    ])

    const ordersLast7Days = ordersLast7DaysResult.map((c, i) => c + manualLast7DaysResult[i])
    const salesThisWeek = ordersWeek + manualWeek
    const salesThisMonth = ordersMonth + manualMonth

    const productSales: Record<string, number> = {}
    for (const order of allOrders) {
      const items = order.items as OrderItem[]
      if (!Array.isArray(items)) continue
      for (const item of items) {
        const id = item.id || (item as unknown as { productId?: string }).productId
        if (id) productSales[id] = (productSales[id] || 0) + (item.quantity || 1)
      }
    }
    for (const sale of allManualSales) {
      const items = sale.items as OrderItem[]
      if (!Array.isArray(items)) continue
      for (const item of items) {
        if (item.id) productSales[item.id] = (productSales[item.id] || 0) + (item.quantity || 1)
      }
    }

    const productIds = new Set(products.map((p) => p.id))
    const topProductIds = Object.entries(productSales)
      .filter(([id]) => productIds.has(id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topProducts = topProductIds.map(([id]) => {
      const p = products.find((x) => x.id === id)!
      return {
        id: p.id,
        name: p.name,
        quantitySold: productSales[id],
        image: p.image,
      }
    })

    const productsWithStock = products.map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock ?? 0,
      lowStockThreshold: p.lowStockThreshold ?? 5,
      image: p.image,
      isOut: (p.stock ?? 0) <= 0,
      isLow:
        (p.stock ?? 0) > 0 &&
        (p.stock ?? 0) <= (p.lowStockThreshold ?? 5),
    }))

    const dayLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('pt-BR', { weekday: 'short' })
    })

    return NextResponse.json({
      salesThisWeek,
      salesThisMonth,
      salesByDayLast7: ordersLast7Days,
      salesByDayLabels: dayLabels,
      topProducts,
      productsWithStock,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard' },
      { status: 500 }
    )
  }
}
