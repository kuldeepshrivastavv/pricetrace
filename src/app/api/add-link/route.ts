import { NextResponse } from 'next/server'
import cheerio from 'cheerio'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const { url, user_id } = await req.json()
  if (!url || !user_id) return NextResponse.json({ message: 'Missing data' }, { status: 400 })
  try {
    const res = await fetch(url)
    const html = await res.text()
    const $ = cheerio.load(html)
    // Basic scraping (customize for each site)
    const title = $('title').first().text()
    const priceMatch = html.match(/(\₹|Rs\.?|INR)?[\s]?[0-9,]+/)
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/[^0-9.]/g, '')) : null
    const image = $('img').first().attr('src') || ''
    if (!title || !price) {
      return NextResponse.json({ message: 'Could not extract data' }, { status: 500 })
    }
    const { data, error } = await supabase.from('products').insert({
      title, url, price, image, user_id,
    }).select().single()
    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Scraping failed' }, { status: 500 })
  }
}
