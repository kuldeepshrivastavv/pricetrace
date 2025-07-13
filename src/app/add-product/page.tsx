'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabaseClient'

export default function AddProductPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const session = useSession()

  const handleAddProduct = async () => {
    if (!url) return
    setLoading(true)
    setError('')
    const response = await fetch('/api/add-link', {
      method: 'POST',
      body: JSON.stringify({ url, user_id: session?.user?.id }),
    })
    const data = await response.json()
    if (response.ok) {
      router.push(`/product/${data.id}`)
    } else {
      setError(data.message || 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">🔗 Add Product</h1>
      <input
        type="url"
        placeholder="Paste product URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />
      <button
        onClick={handleAddProduct}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Adding...' : 'Track Product'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
