import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { supabaseAdmin } from '@/lib/supabaseAdmin' // ensure it's a named export

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

export async function GET(request: Request) {
  // Your cron job logic can go here
  return NextResponse.json({ message: 'Cron job executed!' })
}
