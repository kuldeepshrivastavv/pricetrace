'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSession } from '@supabase/auth-helpers-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const session = useSession()
  const [targetPrice, setTargetPrice] = useState('')
  const [savingAlert, setSavingAlert] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleAlertSubmit = async () => {
    if (!session?.user || !targetPrice || isNaN(Number(targetPrice))) return
    setSavingAlert(true)
    const { error } = await supabase.from('alerts').insert({
      user_id: session.user.id,
      product_id: product.id,
      target_price: Number(targetPrice),
    })
    setSavingAlert(false)
    if (!error) {
      setTargetPrice('')
      setSuccessMsg('✅ Alert set! You’ll be notified when the price drops.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      const { data: historyData } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: true })
      setProduct(productData)
      setHistory(historyData || [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!product) return <p className="text-center mt-10">Product not found</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex gap-6">
        <img src={product.image} className="w-40 h-40 object-cover rounded" />
        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-600 text-lg">Current Price: ₹{product.price}</p>
          <p className="text-sm text-gray-400 mt-2">Tracked from: {new Date(product.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <h2 className="mt-10 text-xl font-semibold mb-4">📈 Price History</h2>
      {history.length === 0 ? (
        <p>No price data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history.map((d) => ({ ...d, date: new Date(d.created_at).toLocaleDateString() }))}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#1e40af" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
      {session && (
        <div className="mt-10">
          <h3 className="font-semibold mb-2">🔔 Set Price Drop Alert</h3>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              placeholder="Enter target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="border p-2 rounded w-40"
            />
            <button
              onClick={handleAlertSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={savingAlert}
            >
              {savingAlert ? 'Saving...' : 'Set Alert'}
            </button>
          </div>
          {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
        </div>
      )}
    </div>
  )
}
