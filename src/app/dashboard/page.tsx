'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@supabase/auth-helpers-react'
import Link from 'next/link'

export default function DashboardPage() {
  const session = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) return
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      if (!error) setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [session])

  if (!session) return <p className="text-center mt-20">Please log in to view your dashboard.</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Your Tracked Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found. Add some from the <Link href="/add-product" className="underline text-blue-600">Add Product</Link> page.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="border rounded shadow hover:shadow-lg transition p-4 flex gap-4"
            >
              <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded" />
              <div>
                <h2 className="font-semibold text-lg">{product.title}</h2>
                <p className="text-gray-600">₹{product.price}</p>
                <p className="text-sm text-gray-400">{new Date(product.created_at).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
