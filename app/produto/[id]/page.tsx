'use client'

import { useCart } from '@/lib/cart'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { useProductsList } from '@/lib/products-context'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

function ProductDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { getProductById, getFeaturedProducts } = useProductsList()
  const productId = params.id as string
  const product = getProductById(productId)
  const featuredProducts = getFeaturedProducts(productId)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-xl mb-4">Produto não encontrado</p>
        <button
          onClick={() => router.push('/produtos')}
          className="btn-gold-laminated text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Voltar aos Produtos
        </button>
      </div>
    )
  }

  const images = product.images || [product.image]
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0

  const handleAddToCart = () => {
    if (outOfStock) return
    addToCart(product)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-400 hover:text-gold-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Galeria de Imagens */}
        <div>
          <div className="relative w-full h-[500px] mb-4 rounded-lg overflow-hidden border border-gold-500/20">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-full h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-gold-400'
                      : 'border-gold-500/20 hover:border-gold-400/50'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
          <div className="mb-6">
            {product.originalPrice && (
              <span className="line-through text-gray-500 text-xl mr-3">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-gold-400 font-bold text-3xl">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {product.fullDescription && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">
                Descrição
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {product.fullDescription}
              </p>
            </div>
          )}

          {product.description && (
            <div className="mb-6">
              <p className="text-gray-400">{product.description}</p>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="w-full btn-gold-laminated text-black py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{outOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}</span>
          </button>

          {product.combos && product.combos.length > 0 && (
            <div className="mt-6 p-4 bg-black/50 border border-gold-500/20 rounded-lg">
              <h3 className="text-white font-semibold mb-2">
                O que inclui neste combo
              </h3>
              <ul className="text-gray-400 space-y-1 text-sm">
                {product.combos.map((combo) => (
                  <li key={combo.name} className="flex justify-between">
                    <span>• {combo.name}</span>
                    <span className="text-gray-500">
                      R$ {combo.price.toFixed(2).replace('.', ',')}
                    </span>
                  </li>
                ))}
                <li className="text-gold-400 font-semibold pt-2 border-t border-gold-500/20 mt-2">
                  Total no combo: R$ {product.price.toFixed(2).replace('.', ',')}
                </li>
              </ul>
            </div>
          )}

          <div className="mt-6 p-4 bg-black/50 border border-gold-500/20 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Informações</h3>
            <ul className="text-gray-400 space-y-1 text-sm">
              <li>✓ Produto exclusivo e de alta qualidade</li>
              <li>✓ Entrega rápida e segura</li>
              <li>✓ Garantia de satisfação</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Produtos em Destaque */}
      {featuredProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gold-400 mb-8">
            Outros Produtos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((featuredProduct) => (
              <ProductCard key={featuredProduct.id} product={featuredProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ProductDetailsContent />
      </main>
    </div>
  )
}

