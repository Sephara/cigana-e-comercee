'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Plus, Trash2, Loader2, ListOrdered } from 'lucide-react'
import toast from 'react-hot-toast'

type Product = { id: string; name: string; price: number; stock: number }
type SaleLine = { productId: string; name: string; price: string; quantity: string }

type OrderRow = { id: string; createdAt: string; total: number; items: unknown; type: 'order' }
type ManualSaleRow = { id: string; createdAt: string; total: number; items: unknown; type: 'manual' }

export default function AdminVendasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [lines, setLines] = useState<SaleLine[]>([
    { productId: '', name: '', price: '', quantity: '1' },
  ])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [manualSales, setManualSales] = useState<ManualSaleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadLists = useCallback(async () => {
    try {
      const [ordersRes, salesRes] = await Promise.all([
        fetch('/api/admin/orders', { credentials: 'include' }),
        fetch('/api/admin/sales', { credentials: 'include' }),
      ])
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data.map((o: { id: string; createdAt: string; total: number; items: unknown }) => ({ ...o, type: 'order' as const })))
      } else setOrders([])
      if (salesRes.ok) {
        const data = await salesRes.json()
        setManualSales(data.map((s: { id: string; createdAt: string; total: number; items: unknown }) => ({ ...s, type: 'manual' as const })))
      } else setManualSales([])
    } catch {
      setOrders([])
      setManualSales([])
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/products', { credentials: 'include' })
        if (!res.ok) throw new Error('Erro')
        const data = await res.json()
        setProducts(data)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    loadLists()
  }, [loadLists])

  const addLine = () => {
    setLines((prev) => [...prev, { productId: '', name: '', price: '', quantity: '1' }])
  }

  const removeLine = (index: number) => {
    if (lines.length <= 1) return
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const setLineProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    setLines((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              productId,
              name: product?.name ?? '',
              price: product ? String(product.price) : '',
              quantity: l.quantity,
            }
          : l
      )
    )
  }

  const setLineField = (index: number, field: keyof SaleLine, value: string) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    )
  }

  const total = lines.reduce((sum, l) => {
    const q = parseInt(l.quantity, 10) || 0
    const p = parseFloat(l.price.replace(',', '.')) || 0
    return sum + q * p
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const items = lines
      .filter((l) => l.productId && (parseInt(l.quantity, 10) || 0) > 0)
    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto com quantidade.')
      return
    }
    const productIds = items.map((l) => l.productId)
    const names = Object.fromEntries(products.map((p) => [p.id, p.name]))
    const payload = {
      items: items.map((l) => ({
        id: l.productId,
        name: names[l.productId] ?? l.name,
        price: parseFloat(l.price.replace(',', '.')) || 0,
        quantity: parseInt(l.quantity, 10) || 1,
      })),
      total,
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar')
      toast.success('Venda registrada! Estoque atualizado.')
      setLines([{ productId: '', name: '', price: '', quantity: '1' }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar venda')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (type: 'order' | 'manual', id: string) => {
    setDeletingId(id)
    try {
      const url = type === 'order' ? `/api/admin/orders/${id}` : `/api/admin/sales/${id}`
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
      const data = res.ok ? null : await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Erro ao excluir')
      toast.success(type === 'order' ? 'Pedido excluído.' : 'Venda excluída. Estoque restaurado.')
      await loadLists()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeletingId(null)
    }
  }

  const allSales = [
    ...orders.map((o) => ({ ...o, createdAt: o.createdAt })),
    ...manualSales.map((s) => ({ ...s, createdAt: s.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-gold-400" />
        Registrar venda (WhatsApp)
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Vendeu direto pelo WhatsApp? Registre aqui para atualizar o estoque e as estatísticas do dashboard.
      </p>

      {loading ? (
        <p className="text-gray-400">Carregando produtos...</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
          <p className="text-amber-200 mb-2">Cadastre produtos primeiro.</p>
          <p className="text-gray-400 text-sm">Vá em Produtos e adicione itens para poder registrar vendas.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-4 rounded-xl bg-black/50 border border-gold-500/20"
              >
                <div className="sm:col-span-5">
                  <label className="block text-gray-400 text-xs mb-1">Produto</label>
                  <select
                    value={line.productId}
                    onChange={(e) => setLineProduct(index, e.target.value)}
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-3 py-2 text-white text-sm"
                    required={index === 0 && lines.length === 1}
                  >
                    <option value="">Selecione...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (estoque: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 text-xs mb-1">Qtd</label>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => setLineField(index, 'quantity', e.target.value)}
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-gray-400 text-xs mb-1">Valor un. (R$)</label>
                  <input
                    type="text"
                    value={line.price}
                    onChange={(e) => setLineField(index, 'price', e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end gap-1">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 1}
                    className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-30"
                    title="Remover linha"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar outro produto
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gold-500/20">
            <p className="text-xl font-bold text-white">
              Total: R$ {total.toFixed(2).replace('.', ',')}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold-laminated text-black px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              Registrar venda
            </button>
          </div>
        </form>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-gold-400" />
          Últimas vendas e pedidos
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Pedidos da loja e vendas registradas aqui. Exclua apenas se for um registro que não existiu (ex.: teste ou engano).
        </p>
        {allSales.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma venda ou pedido ainda.</p>
        ) : (
          <div className="rounded-xl border border-gold-500/20 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-black/50 text-gray-400 border-b border-gold-500/20">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {allSales.map((row) => (
                  <tr key={row.id} className="border-b border-gold-500/10 last:border-0">
                    <td className="px-4 py-3 text-white">
                      {new Date(row.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {row.type === 'order' ? 'Pedido loja' : 'Venda WhatsApp'}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      R$ {Number(row.total).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(row.type, row.id)}
                        disabled={deletingId === row.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-1"
                        title="Excluir este registro"
                      >
                        {deletingId === row.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
