import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import supabaseAdmin from '@/lib/supabaseAdmin'

async function getCurrentPrice(url: string): Promise<number | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })
    const $ = cheerio.load(data)
    const priceText = $('span.a-price-whole').first().text() || $('div._30jeq3').first().text()
    const price = parseFloat(priceText.replace(/[₹,]/g, ''))
    return isNaN(price) ? null : price
  } catch (err) {
    console.error(`Scraping failed: ${url}`, err)
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { data: products, error } = await supabaseAdmin.from('products').select()
  if (error) return res.status(500).json({ error: error.message })
  for (const product of products) {
    const price = await getCurrentPrice(product.url)
    if (price != null) {
      await supabaseAdmin
        .from('products')
        .update({ price })
        .eq('id', product.id)
    }
  }
  return res.status(200).json({ status: 'Price update complete' })
}
