'use client'

import React from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { Product } from '@/lib/products'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addToCart(product)
  }

  return (
    <Link href={`/produto/${product.id}`}>
      <div className="bg-black border border-gold-500/20 rounded-lg overflow-hidden hover:border-gold-400/50 transition-colors cursor-pointer">
        <div className="relative w-full h-64 overflow-hidden bg-black/50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg uppercase tracking-wide">
                Esgotado
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-400 text-sm mb-3">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span>
              {product.originalPrice && (
                <span className="line-through text-gray-500 text-sm mr-2">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="text-gold-400 font-bold text-xl">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </span>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-gold-laminated text-black px-4 py-2 rounded-2xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{outOfStock ? 'Esgotado' : 'Comprar'}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default React.memo(ProductCard)
