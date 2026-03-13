'use client'

import { useState, useEffect } from 'react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import toast from 'react-hot-toast'
import { LayoutGrid, Trash2 } from 'lucide-react'

type GalleryImage = { id: string; url: string; sortOrder: number }

export default function AdminGaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [newImageUrl, setNewImageUrl] = useState('')

  const load = () => {
    fetch('/api/admin/gallery', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setImages(data) : setImages([])))
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = () => {
    if (!newImageUrl.trim()) {
      toast.error('Envie uma imagem primeiro.')
      return
    }
    setLoading(true)
    fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newImageUrl.trim() }),
      credentials: 'include',
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || 'Erro') })
        return r.json()
      })
      .then(() => {
        toast.success('Imagem adicionada à galeria.')
        setNewImageUrl('')
        load()
      })
      .catch((e) => toast.error(e.message || 'Erro ao adicionar'))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta imagem da galeria?')) return
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro ao excluir')
      toast.success('Imagem removida.')
      load()
    } catch {
      toast.error('Erro ao remover imagem')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <LayoutGrid className="w-7 h-7 text-gold-400" />
        Galeria da home
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Imagens exibidas no bloco de galeria da página inicial (separadas dos produtos). Recomendado 8 imagens.
      </p>

      <div className="mb-8 p-4 border border-gold-500/20 rounded-xl bg-black/50">
        <h2 className="text-lg font-semibold text-gold-400 mb-3">Adicionar imagem</h2>
        <ImageUpload
          label="Nova imagem da galeria"
          value={newImageUrl}
          onChange={setNewImageUrl}
          placeholder="Enviar foto"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newImageUrl.trim() || loading}
          className="mt-3 min-h-[44px] px-4 py-2 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-400 font-medium touch-manipulation cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Adicionar à galeria
        </button>
      </div>

      <h2 className="text-lg font-semibold text-white mb-3">
        Imagens atuais ({images.length})
      </h2>
      {loading && images.length === 0 ? (
        <p className="text-gray-400">Carregando...</p>
      ) : images.length === 0 ? (
        <div className="text-center py-12 border border-gold-500/20 rounded-xl">
          <LayoutGrid className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma imagem na galeria.</p>
          <p className="text-gray-500 text-sm mt-1">Adicione acima para aparecer na home.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-gold-500/20 bg-black/50 aspect-square"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute bottom-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-red-500/90 text-white touch-manipulation cursor-pointer hover:bg-red-500"
                aria-label="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
