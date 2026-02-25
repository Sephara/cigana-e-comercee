'use client'

import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { useProductsList } from '@/lib/products-context'
import { useState } from 'react'

export default function Produtos() {
  const { allProducts, loading } = useProductsList()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')

  const filteredProducts = allProducts
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 pb-24 md:pb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gold-400">
          Nossos Produtos
        </h1>

        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
          >
            <option value="name">Ordenar por nome</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Carregando produtos...</p>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">
              Nenhum produto encontrado.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

