import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { url, user_id } = await req.json();
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    let name = $('title').first().text().trim();
    let image = $('meta[property="og:image"]').attr('content') || '';
    let price = extractPrice($);
    if (!price || !name)
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    const { data: product } = await supabase
      .from('products')
      .insert([{ url, name, image, current_price: price, user_id }])
      .select()
      .single();
    await supabase.from('price_history').insert([
      {
        product_id: product.id,
        user_id,
        price,
      },
    ]);
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error('Error scraping product:', err);
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
  }
}

function extractPrice($: cheerio.CheerioAPI) {
  const text = $('body').text();
  const match = text.match(/₹\s?([\d,]+)/) || text.match(/\$([\d,]+)/);
  return match ? parseFloat(match[1].replace(/,/g, '')) : null;
}
