'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import {
  getProductsFromApi,
  addProductApi,
  updateProductApi,
  deleteProductApi,
  setProductFeaturedApi,
  type ProductFromApi,
} from './products-api'
import { allProducts as staticProducts } from './products'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  description?: string
  fullDescription?: string
  originalPrice?: number
  combos?: { name: string; price: number }[]
  featured?: boolean
  category?: 'boné' | 'conjunto' | 'geral'
  stock?: number
}

function apiToProduct(p: ProductFromApi): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    images: p.images,
    description: p.description,
    fullDescription: p.fullDescription,
    originalPrice: p.originalPrice,
    combos: p.combos,
    featured: p.featured,
    category: p.category,
    stock: p.stock ?? 0,
  }
}

interface ProductsContextType {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: (showLoading?: boolean) => Promise<void>
  addProduct: (p: Omit<ProductFromApi, 'id'>) => Promise<string>
  updateProduct: (id: string, p: Partial<ProductFromApi>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  toggleFeatured: (id: string) => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | null>(null)

const defaultProducts = staticProducts.map((p) => ({
  ...p,
  featured: false,
  category: 'geral' as const,
}))

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useApi, setUseApi] = useState(false)

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const apiProducts = await getProductsFromApi()
      if (apiProducts.length > 0) {
        setProducts(apiProducts.map(apiToProduct))
        setUseApi(true)
      }
    } catch (err) {
      setError('Erro ao carregar produtos')
      setProducts(defaultProducts)
      setUseApi(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(false) // carrega em background, não bloqueia a página
  }, [fetchProducts])

  const addProduct = useCallback(
    async (p: Omit<ProductFromApi, 'id'>) => {
      const id = await addProductApi(p)
      await fetchProducts(true)
      return id
    },
    [fetchProducts]
  )

  const updateProduct = useCallback(
    async (id: string, p: Partial<ProductFromApi>) => {
      await updateProductApi(id, p)
      await fetchProducts(true)
    },
    [fetchProducts]
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteProductApi(id)
      await fetchProducts(true)
    },
    [fetchProducts]
  )

  const toggleFeatured = useCallback(
    async (id: string) => {
      const product = products.find((p) => p.id === id)
      if (!product) return
      if (useApi) {
        await setProductFeaturedApi(id, !product.featured)
        await fetchProducts(true)
      }
    },
    [products, useApi, fetchProducts]
  )

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refetch: () => fetchProducts(true),
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFeatured,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) {
    throw new Error('useProducts must be used within ProductsProvider')
  }
  return ctx
}

export function useProductsList() {
  const { products, loading } = useProducts()
  const getProductById = (id: string) => products.find((p) => p.id === id)
  const getFeaturedProducts = (excludeId?: string) => {
    const featured = products.filter((p) => p.featured && p.id !== excludeId)
    if (featured.length > 0) return featured.slice(0, 6)
    return products.filter((p) => p.id !== excludeId).slice(0, 6)
  }
  const getBonesProducts = () =>
    products.filter(
      (p) =>
        p.category === 'boné' ||
        p.name.includes('Boné Simples') ||
        p.name.includes('Boné Premium')
    )
  const getConjuntosKitProducts = () =>
    products.filter(
      (p) =>
        p.category === 'conjunto' ||
        p.name.includes('Conjunto') ||
        p.name.includes('Rédea') ||
        p.name.includes('Cabeçada')
    )
  const allProducts = products

  return {
    products,
    allProducts,
    loading,
    getProductById,
    getFeaturedProducts,
    getBonesProducts,
    getConjuntosKitProducts,
  }
}
