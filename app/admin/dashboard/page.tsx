'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Award,
  RefreshCw,
  Plus,
  BarChart3,
} from 'lucide-react'
import Image from 'next/image'

type DashboardData = {
  salesThisWeek: number
  salesThisMonth: number
  salesByDayLast7: number[]
  salesByDayLabels: string[]
  topProducts: { id: string; name: string; quantitySold: number; image: string }[]
  productsWithStock: {
    id: string
    name: string
    stock: number
    lowStockThreshold: number
    image: string
    isOut: boolean
    isLow: boolean
  }[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStock, setUpdatingStock] = useState<string | null>(null)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' })
      if (!res.ok) throw new Error('Erro ao carregar')
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const updateStock = async (productId: string, newStock: number) => {
    setUpdatingStock(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro')
      await fetchDashboard()
    } catch {
      alert('Erro ao atualizar estoque')
    } finally {
      setUpdatingStock(null)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gold-400 animate-spin" />
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-400 mb-4">Erro ao carregar o dashboard.</p>
        <button
          onClick={fetchDashboard}
          className="btn-gold-laminated text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const maxSales = Math.max(1, ...(data.salesByDayLast7 || []))

  return (
    <div className="max-w-4xl mx-auto pb-8 md:pb-12">
      {/* Header — estilo app */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-gold-400 hover:bg-white/10 transition-colors touch-manipulation"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm font-medium">Atualizar</span>
        </button>
      </div>

      {/* Cards de resumo — grid responsivo tipo app */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-500/5 border border-gold-500/20 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <span className="text-gray-400 text-xs md:text-sm truncate">Esta semana</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{data.salesThisWeek}</p>
          <p className="text-gray-500 text-xs mt-0.5">pedidos</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-500/5 border border-gold-500/20 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <span className="text-gray-400 text-xs md:text-sm truncate">Este mês</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{data.salesThisMonth}</p>
          <p className="text-gray-500 text-xs mt-0.5">pedidos</p>
        </div>
      </div>

      {/* Gráfico de vendas — últimos 7 dias */}
      <section className="rounded-2xl bg-black/50 border border-gold-500/20 p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gold-400" />
          Vendas nos últimos 7 dias
        </h2>
        <div className="flex items-end gap-2 md:gap-3 h-32 md:h-40">
          {(data.salesByDayLast7 || Array(7).fill(0)).map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-gold-500/80 to-gold-400/90 min-h-[4px] transition-all duration-500"
                style={{ height: `${Math.max(4, (value / maxSales) * 100)}%` }}
              />
              <span className="text-gray-500 text-[10px] md:text-xs uppercase truncate w-full text-center">
                {data.salesByDayLabels?.[i] ?? '-'}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-gray-500 text-xs">
          <span>0</span>
          <span>{maxSales} pedidos</span>
        </div>
      </section>

      {/* Produtos mais vendidos */}
      <section className="rounded-2xl bg-black/50 border border-gold-500/20 p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-gold-400" />
          Produtos mais vendidos
        </h2>
        {data.topProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma venda registrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {data.topProducts.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-gold-500/10"
              >
                <span className="text-gold-400 font-bold w-6 text-sm">{i + 1}º</span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-gray-500 absolute inset-0 m-auto" />
                  )}
                </div>
                <span className="text-white font-medium truncate flex-1">{p.name}</span>
                <span className="text-gold-400 font-semibold tabular-nums">{p.quantitySold} vendidos</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Estoque de produtos */}
      <section className="rounded-2xl bg-black/50 border border-gold-500/20 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Package className="w-5 h-5 text-gold-400" />
          Estoque de produtos
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Atualize o estoque. O comprador vê &quot;Esgotado&quot; quando zerar. Você recebe alerta quando estiver acabando.
        </p>

        {data.productsWithStock.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gold-500/30 bg-gold-500/5 p-6 md:p-8 text-center">
            <Package className="w-12 h-12 text-gold-400/60 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Nenhum produto cadastrado</p>
            <p className="text-gray-400 text-sm mb-4">
              Os produtos do dashboard vêm do cadastro em <strong>Produtos</strong>. Cadastre na página de Produtos para ver estoque e vendas aqui.
            </p>
            <Link
              href="/admin/produtos"
              className="inline-flex items-center gap-2 btn-gold-laminated text-black px-6 py-3 rounded-2xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Ir para Produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gold-500/20 text-sm">
                    <th className="pb-3 font-medium">Produto</th>
                    <th className="pb-3 font-medium w-20">Estoque</th>
                    <th className="pb-3 font-medium w-20 hidden sm:table-cell">Alerta</th>
                    <th className="pb-3 font-medium w-24">Status</th>
                    <th className="pb-3 font-medium w-28">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productsWithStock.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gold-500/10 ${
                        p.isOut ? 'bg-red-500/5' : p.isLow ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                            {p.image ? (
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-500 absolute inset-0 m-auto" />
                            )}
                          </div>
                          <span className="text-white font-medium truncate max-w-[140px] md:max-w-none">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            p.isOut
                              ? 'text-red-400 font-bold'
                              : p.isLow
                              ? 'text-amber-400 font-semibold'
                              : 'text-white'
                          }
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-sm hidden sm:table-cell">{p.lowStockThreshold}</td>
                      <td className="py-3">
                        {p.isOut ? (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Esgotado
                          </span>
                        ) : p.isLow ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Baixo
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Normal</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            defaultValue={p.stock}
                            onBlur={(e) => {
                              const v = parseInt(e.target.value, 10)
                              if (!Number.isNaN(v) && v !== p.stock) updateStock(p.id, v)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const v = parseInt((e.target as HTMLInputElement).value, 10)
                                if (!Number.isNaN(v) && v !== p.stock) updateStock(p.id, v)
                              }
                            }}
                            disabled={updatingStock === p.id}
                            className="w-14 md:w-20 bg-black border border-gold-500/20 rounded-lg px-2 py-1.5 text-white text-sm touch-manipulation"
                          />
                          {updatingStock === p.id && (
                            <RefreshCw className="w-4 h-4 text-gray-500 animate-spin flex-shrink-0" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
