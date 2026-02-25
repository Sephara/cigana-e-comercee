'use client'

import { useState, useEffect } from 'react'
import { useProducts } from '@/lib/products-context'
import type { ProductFromApi } from '@/lib/products-api'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  X,
  Image as ImageIcon,
} from 'lucide-react'

const SECONDARY_IMAGES_COUNT = 3

export default function AdminProdutosPage() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
  } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    images: '',
    description: '',
    fullDescription: '',
    featured: false,
    category: 'geral',
    stock: '0',
    lowStockThreshold: '5',
  })

  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      image: '',
      images: '',
      description: '',
      fullDescription: '',
      featured: false,
      category: 'geral',
      stock: '0',
      lowStockThreshold: '5',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const imagesArray = formData.images
    ? formData.images.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const hasValidImages = imagesArray.length === SECONDARY_IMAGES_COUNT
  const isFormComplete =
    formData.name.trim() !== '' &&
    formData.price.trim() !== '' &&
    formData.image.trim() !== '' &&
    hasValidImages &&
    formData.description.trim() !== '' &&
    formData.fullDescription.trim() !== '' &&
    formData.stock !== '' &&
    !Number.isNaN(parseInt(formData.stock, 10))

  const fillForm = (p: (typeof products)[0]) => {
    setFormData({
      name: p.name,
      price: p.price.toString(),
      originalPrice: (p as { originalPrice?: number }).originalPrice?.toString() || '',
      image: p.image,
      images: (p.images && p.images.length >= 3 ? p.images.slice(0, 3) : p.images || []).join(', '),
      description: p.description || '',
      fullDescription: p.fullDescription || '',
      featured: !!p.featured,
      category: p.category || 'geral',
      stock: (p as { stock?: number }).stock?.toString() ?? '0',
      lowStockThreshold: (p as { lowStockThreshold?: number }).lowStockThreshold?.toString() ?? '5',
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormComplete) {
      toast.error('Preencha todos os campos obrigatórios: título, preço, 1 imagem principal, exatamente 3 imagens secundárias, descrição curta, descrição completa e estoque.')
      return
    }
    const price = parseFloat(formData.price.replace(',', '.'))
    const originalPrice = formData.originalPrice
      ? parseFloat(formData.originalPrice.replace(',', '.'))
      : undefined
    const images = imagesArray

    const product = {
      name: formData.name.trim(),
      price,
      image: formData.image.trim(),
      images,
      description: formData.description.trim() || undefined,
      fullDescription: formData.fullDescription.trim() || undefined,
      originalPrice,
      featured: formData.featured,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0,
      lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold, 10) : null,
    } as Omit<ProductFromApi, 'id'> & { stock: number; lowStockThreshold: number | null }

    try {
      if (editingId) {
        await updateProduct(editingId, product)
        toast.success('Produto atualizado!')
      } else {
        await addProduct(product)
        toast.success('Produto adicionado!')
      }
      resetForm()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar produto'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    try {
      await deleteProduct(id)
      toast.success('Produto excluído')
      resetForm()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Produtos</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="btn-gold-laminated text-black px-6 py-2 rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-black border border-gold-500/30 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gold-400">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-amber-400/90 text-sm mb-4">
              Regra: 1 foto principal + exatamente 3 fotos secundárias. Todos os campos são obrigatórios para publicar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Link da imagem principal * (1 foto)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Links das 3 imagens secundárias * (exatamente 3, separadas por vírgula)
                </label>
                <input
                  type="text"
                  required
                  placeholder="url1, url2, url3"
                  value={formData.images}
                  onChange={(e) =>
                    setFormData({ ...formData, images: e.target.value })
                  }
                  className={`w-full bg-black border rounded-lg px-4 py-2 text-white ${
                    formData.images && !hasValidImages
                      ? 'border-amber-500/50'
                      : 'border-gold-500/20'
                  }`}
                />
                <p className="text-gray-500 text-xs mt-1">
                  {imagesArray.length}/3 imagens. Obrigatório ter exatamente 3.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="99,90"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">
                    Preço original (R$) — para desconto
                  </label>
                  <input
                    type="text"
                    placeholder="149,90"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Estoque *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">
                    Alerta estoque baixo (quando &lt;=)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="5"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, lowStockThreshold: e.target.value })
                    }
                    className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Descrição curta *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Descrição completa *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.fullDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, fullDescription: e.target.value })
                  }
                  className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white"
                >
                  {categories.length === 0 ? (
                    <>
                      <option value="geral">Geral</option>
                      <option value="boné">Boné</option>
                      <option value="conjunto">Conjunto</option>
                    </>
                  ) : (
                    categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    Crie categorias em Admin → Categorias para mais opções.
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded border-gold-500/50"
                />
                <span className="text-gray-300">Produto em destaque</span>
              </label>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={!isFormComplete}
                  className="flex-1 btn-gold-laminated text-black py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? 'Salvar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gold-500/30 rounded-xl text-gray-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Carregando produtos...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-gold-500/20 rounded-xl">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Nenhum produto cadastrado</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-gold-laminated text-black px-6 py-2 rounded-xl"
          >
            Adicionar primeiro produto
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-4 border border-gold-500/20 rounded-xl bg-black/50"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{p.name}</p>
                <p className="text-gold-400 font-bold">
                  R$ {p.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-gray-500 text-sm">
                  Estoque: {(p as { stock?: number }).stock ?? 0}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeatured(p.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    p.featured
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-500 hover:text-yellow-400'
                  }`}
                  title={p.featured ? 'Remover destaque' : 'Destacar'}
                >
                  {p.featured ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => fillForm(p)}
                  className="p-2 text-gray-400 hover:text-gold-400 rounded-lg"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
