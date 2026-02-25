'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/dashboard')
  }, [router])
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Redirecionando...</p>
    </div>
  )
}
