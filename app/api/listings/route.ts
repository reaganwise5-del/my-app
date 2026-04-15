import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// ─────────────────────────────────────────────────────────────
//  FlipAlert — Real listings via Apify
//  Runs one search per active customer alert
// ─────────────────────────────────────────────────────────────

const APIFY_API_KEY = process.env.APIFY_API_KEY ?? process.env.APIFY_API_TOKEN ?? '';

export interface SearchParams {
  make: string;       // e.g. "Honda"
  model: string;      // e.g. "Civic" or "Any"
  maxPrice: number;   // e.g. 12000
  maxMileage: number; // e.g. 100000
  minYear: number;    // e.g. 2015
  location: string;   // zip code or city name e.g. "24501" or "Richmond, VA"
  radius: number;     // miles
  maxResults?: number;
}

export async function POST(req: NextRequest) {
  if (!APIFY_API_KEY) {
    return NextResponse.json(
      { error: 'APIFY_API_KEY not set', listings: [], source: 'demo' },
      { status: 503 }
    );
  }

  const body: SearchParams = await req.json().catch(() => ({
    make: 'Any', model: 'Any', maxPrice: 20000, maxMileage: 150000,
    minYear: 2010, location: '', radius: 50, maxResults: 40,
  }));

  const { make, model, maxPrice, maxMileage, minYear, location, maxResults = 40 } = body;

  // Build the search query — e.g. "Honda Civic" or "Toyota" or "used car"
  let query = '';
  if (make && make !== 'Any') query += make;
  if (model && model !== 'Any') query += ` ${model}`;
  if (!query) query = 'used car';
  query = query.trim();

  // Build Facebook Marketplace search URL
  const fbParams = new URLSearchParams({ query });
  if (maxPrice) fbParams.set('maxPrice', String(maxPrice));
  if (location) fbParams.set('deliveryMethod', 'local_pick_up');
  const searchUrl = `https://www.facebook.com/marketplace/search/?${fbParams.toString()}`;

  const client = new ApifyClient({ token: APIFY_API_KEY });

  try {
    console.log(`[FlipAlert] Searching: "${query}" | max $${maxPrice} | ${location}`);

    const run = await client.actor('apify/facebook-marketplace-scraper').call({
      startUrls: [{ url: searchUrl }],
      maxItems: maxResults,
      proxyConfiguration: { useApifyProxy: true },
    }, {
      waitSecs: 90,
      memory: 512,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: maxResults });
    console.log(`[FlipAlert] Got ${items.length} raw items for "${query}"`);

    const listings = (items as ApifyItem[])
      .filter(item => isValidCar(item, { maxPrice, maxMileage, minYear }))
      .map((item, idx) => normalizeListing(item, idx, location))
      .filter(Boolean);

    return NextResponse.json({ listings, source: 'live', count: listings.length, query });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[FlipAlert] Apify error:', msg);
    return NextResponse.json({ error: msg, listings: [], source: 'error' }, { status: 502 });
  }
}

// ─── Types ────────────────────────────────────────────────────
interface ApifyItem {
  id?: string;
  listingId?: string;
  title?: string;
  name?: string;
  price?: number | string;
  priceAmount?: number;
  location?: string | { city?: string; state?: string; name?: string };
  image?: string;
  thumbnail?: string;
  images?: string[];
  photoUrls?: string[];
  url?: string;
  listingUrl?: string;
  description?: string;
  text?: string;
  mileage?: number | string;
  year?: number | string;
  make?: string;
  model?: string;
  postedAt?: string;
  createdAt?: string;
  condition?: string;
}

// ─── Filters ──────────────────────────────────────────────────
const JUNK = /\b(boat|atv|trailer|mower|rv|camper|motorcycle|scooter|tractor|jet ski|snowmobile|parts only|salvage|furniture|couch|dresser)\b/i;

function isValidCar(item: ApifyItem, filters: { maxPrice: number; maxMileage: number; minYear: number }): boolean {
  const title = (item.title ?? item.name ?? '');
  if (JUNK.test(title)) return false;

  const rawPrice = item.price ?? item.priceAmount;
  if (!rawPrice) return false;
  const price = typeof rawPrice === 'string' ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) : rawPrice;
  if (!price || price < 500) return false;

  // Respect the customer's max price filter
  if (filters.maxPrice && price > filters.maxPrice) return false;

  // Respect mileage filter if available
  if (item.mileage && filters.maxMileage) {
    const miles = typeof item.mileage === 'string'
      ? parseInt(item.mileage.replace(/[^0-9]/g, ''), 10)
      : item.mileage;
    if (miles && miles > filters.maxMileage) return false;
  }

  // Respect min year filter if available
  if (item.year && filters.minYear) {
    const yr = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
    if (yr && yr < filters.minYear) return false;
  }

  return true;
}

// ─── Normalize ────────────────────────────────────────────────
function normalizeListing(item: ApifyItem, idx: number, searchLocation: string) {
  const rawPrice = item.price ?? item.priceAmount ?? 0;
  const askingPrice = typeof rawPrice === 'string'
    ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) : rawPrice;
  if (!askingPrice || askingPrice < 500) return null;

  const rawMileage = item.mileage ?? '';
  const mileage = typeof rawMileage === 'string'
    ? (parseInt(rawMileage.replace(/[^0-9]/g, ''), 10) || 80000) : (rawMileage || 80000);

  const rawYear = item.year ?? '';
  const year = typeof rawYear === 'string' ? (parseInt(rawYear, 10) || 2016) : (rawYear || 2016);

  const title = item.title ?? item.name ?? 'Vehicle';

  // Estimated market value (replaced with real API later)
  const multiplier = year >= 2020 ? 1.30 : year >= 2017 ? 1.24 : year >= 2014 ? 1.18 : 1.12;
  const marketValue = Math.round(askingPrice * multiplier);
  const profit = marketValue - askingPrice;

  let locationStr = searchLocation || '';
  if (item.location) {
    if (typeof item.location === 'string') locationStr = item.location;
    else {
      const city = item.location.city ?? item.location.name ?? '';
      const state = item.location.state ?? '';
      if (city) locationStr = state ? `${city}, ${state}` : city;
    }
  }

  const image = item.photoUrls?.[0] ?? item.images?.[0] ?? item.thumbnail ?? item.image
    ?? 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop';

  const url = item.listingUrl ?? item.url ?? '#';
  const postedAt = item.createdAt ?? item.postedAt ?? new Date().toLocaleString();
  const postedMinutesAgo = postedAt
    ? Math.max(0, Math.round((Date.now() - new Date(postedAt).getTime()) / 60000)) : 0;

  return {
    id: item.listingId ?? item.id ?? `live-${idx}-${Date.now()}`,
    title,
    year,
    make: item.make ?? parseMake(title),
    model: item.model ?? parseModel(title),
    mileage,
    askingPrice,
    marketValue,
    profit,
    image,
    location: locationStr,
    distance: 0,
    postedMinutesAgo,
    postedAt,
    platform: 'Facebook Marketplace',
    url,
    condition: mapCondition(item.condition),
    description: item.description ?? item.text ?? '',
  };
}

const MAKES = ['Honda','Toyota','Ford','Chevrolet','Chevy','Nissan','Subaru','Jeep','GMC','Dodge','Ram','Hyundai','Kia','Lexus','Mazda','BMW','Mercedes','Audi','Volkswagen','Volvo','Buick','Cadillac','Chrysler','Infiniti','Acura','Mitsubishi','Lincoln','Pontiac'];

function parseMake(title: string): string {
  const t = title.toLowerCase();
  for (const m of MAKES) if (t.includes(m.toLowerCase())) return m === 'Chevy' ? 'Chevrolet' : m;
  return 'Unknown';
}

function parseModel(title: string): string {
  const parts = title.trim().split(/\s+/);
  return parts.length >= 3 ? parts.slice(2, 4).join(' ') : '';
}

function mapCondition(c?: string): 'good' | 'fair' | 'rough' {
  if (!c) return 'fair';
  const l = c.toLowerCase();
  if (l.includes('excellent') || l.includes('like new') || l.includes('good')) return 'good';
  if (l.includes('poor') || l.includes('rough') || l.includes('salvage')) return 'rough';
  return 'fair';
}
