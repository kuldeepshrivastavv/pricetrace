// scripts/trackPrices.ts
import axios from 'axios'
import * as cheerio from 'cheerio'
import supabaseAdmin from '../src/lib/supabaseAdmin'

async function getCurrentPrice(url: string): Promise<number | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })
    const $ = cheerio.load(data)
    // Sample selectors (you'll improve these)
    const priceText = $('span.a-price-whole').first().text() || $('div._30jeq3').first().text()
    const price = parseFloat(priceText.replace(/[₹,]/g, ''))
    return isNaN(price) ? null : price
  } catch (err) {
    console.error(`Failed to fetch price for ${url}`, err)
    return null
  }
}

async function updatePrices() {
  const { data: products, error } = await supabaseAdmin.from('products').select()
  if (error) {
    console.error('Failed to fetch products', error)
    return
  }
  for (const product of products) {
    const price = await getCurrentPrice(product.url)
    if (price != null) {
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ price })
        .eq('id', product.id)
      if (updateError) {
        console.error(`Failed to update product ${product.title}`, updateError)
      } else {
        console.log(`✅ Updated ${product.title} → ₹${price}`)
      }
    }
  }
}

updatePrices()
