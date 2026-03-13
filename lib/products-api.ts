export interface ProductCombo {
  name: string
  price: number
}

export interface ProductFromApi {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  description?: string
  fullDescription?: string
  originalPrice?: number
  combos?: ProductCombo[]
  featured: boolean
  category: 'boné' | 'conjunto' | 'geral'
  stock?: number
  lowStockThreshold?: number | null
}

export async function getProductsFromApi(): Promise<ProductFromApi[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch('/api/products', { signal: controller.signal, credentials: 'include' })
    clearTimeout(timeout)
    if (!res.ok) throw new Error('Erro ao buscar produtos')
    return res.json()
  } catch (e) {
    clearTimeout(timeout)
    throw e
  }
}

export async function addProductApi(
  product: Omit<ProductFromApi, 'id'>
): Promise<string> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao criar produto')
  }
  const { id } = await res.json()
  return id
}

export async function updateProductApi(
  id: string,
  product: Partial<Omit<ProductFromApi, 'id'>>
): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao atualizar produto')
  }
}

export async function deleteProductApi(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao excluir produto')
  }
}

export async function setProductFeaturedApi(
  id: string,
  featured: boolean
): Promise<void> {
  const res = await fetch(`/api/products/${id}/featured`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ featured }),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Erro ao atualizar destaque')
  }
}
