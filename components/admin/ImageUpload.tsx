'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
}

export function ImageUpload({ value, onChange, label, placeholder }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Erro no upload')
      const url = data?.url
      if (typeof url !== 'string' || !url.trim()) throw new Error('Resposta do servidor sem URL da imagem.')
      onChange(url.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-gray-300 mb-1">{label}</label>
      )}
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-black border border-gold-500/20 flex-shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full min-h-[44px] touch-manipulation cursor-pointer flex items-center justify-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-lg px-4 py-2 text-gold-400 hover:bg-gold-500/30 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span>{uploading ? 'Enviando...' : (placeholder ?? 'Enviar foto')}</span>
          </button>
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          {value && (
            <p className="text-gray-500 text-xs mt-1 truncate" title={value}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
