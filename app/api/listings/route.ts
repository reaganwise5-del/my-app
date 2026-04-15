import { NextRequest, NextResponse } from 'next/server';

const APIFY_TOKEN = process.env.APIFY_API_KEY ?? process.env.APIFY_API_TOKEN ?? '';

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: 'APIFY_API_KEY not set', listings: [], source: 'demo' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { make, model, maxPrice, maxMileage, minYear, location, maxResults = 30 } = body;

  // Build search query from customer's alert filters
  let searchQuery = '';
  if (make && make !== 'Any') searchQuery += make;
  if (model && model !== 'Any') searchQuery += ` ${model}`;
  if (!searchQuery.trim()) searchQuery = 'used car';
  searchQuery = searchQuery.trim();

  console.log(`[FlipAlert] Searching Apify: "${searchQuery}" maxPrice=$${maxPrice} location=${location}`);

  try {
    // Use run-sync — starts the actor and waits for results in one call
    const url = `https://api.apify.com/v2/acts/apify~facebook-marketplace-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120&memory=512`;

    const input: Record<string, unknown> = {
      searchQuery,
      maxItems: maxResults,
      proxyConfiguration: { useApifyProxy: true },
    };

    if (location) input.location = location;
    if (maxPrice) input.maxPrice = maxPrice;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(125_000),
    });

    const text = await res.text();
    console.log(`[FlipAlert] Apify status: ${res.status}, body preview: ${text.slice(0, 200)}`);

    if (!res.ok) {
      return NextResponse.json({ error: `Apify ${res.status}: ${text.slice(0, 200)}`, listings: [], source: 'error' }, { status: 502 });
    }

    let items: ApifyItem[] = [];
    try { items = JSON.parse(text); } catch {
      return NextResponse.json({ error: 'Apify returned invalid JSON', listings: [], source: 'error' }, { status: 502 });
    }

    console.log(`[FlipAlert] Got ${items.length} raw items`);

    const listings = items
      .filter(item => isValidCar(item, maxPrice, maxMileage, minYear))
      .map((item, idx) => normalize(item, idx, location ?? ''))
      .filter(Boolean);

    return NextResponse.json({ listings, source: 'live', count: listings.length });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[FlipAlert] Error:', msg);
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

// ─── Filter ───────────────────────────────────────────────────
const JUNK = /\b(boat|atv|trailer|mower|rv|camper|motorcycle|scooter|tractor|jet ski|snowmobile|parts only|salvage|furniture|couch)\b/i;

function isValidCar(item: ApifyItem, maxPrice?: number, maxMileage?: number, minYear?: number): boolean {
  const title = item.title ?? item.name ?? '';
  if (JUNK.test(title)) return false;
  const rawPrice = item.price ?? item.priceAmount;
  if (!rawPrice) return false;
  const price = typeof rawPrice === 'string' ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) : rawPrice;
  if (!price || price < 500) return false;
  if (maxPrice && price > maxPrice) return false;
  if (maxMileage && item.mileage) {
    const miles = typeof item.mileage === 'string' ? parseInt(item.mileage.replace(/[^0-9]/g, ''), 10) : item.mileage;
    if (miles && miles > maxMileage) return false;
  }
  if (minYear && item.year) {
    const yr = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
    if (yr && yr < minYear) return false;
  }
  return true;
}

// ─── Normalize ────────────────────────────────────────────────
function normalize(item: ApifyItem, idx: number, searchLocation: string) {
  const rawPrice = item.price ?? item.priceAmount ?? 0;
  const askingPrice = typeof rawPrice === 'string' ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) : rawPrice;
  if (!askingPrice || askingPrice < 500) return null;

  const mileage = parseMiles(item.mileage) ?? 80000;
  const year = parseYear(item.year) ?? 2016;
  const title = item.title ?? item.name ?? 'Vehicle';
  const multiplier = year >= 2020 ? 1.30 : year >= 2017 ? 1.24 : year >= 2014 ? 1.18 : 1.12;
  const marketValue = Math.round(askingPrice * multiplier);
  const profit = marketValue - askingPrice;

  let locationStr = searchLocation;
  if (item.location) {
    if (typeof item.location === 'string') locationStr = item.location;
    else { const c = item.location.city ?? item.location.name ?? ''; const s = item.location.state ?? ''; locationStr = s ? `${c}, ${s}` : c || searchLocation; }
  }

  const image = item.photoUrls?.[0] ?? item.images?.[0] ?? item.thumbnail ?? item.image ?? 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop';
  const url = item.listingUrl ?? item.url ?? '#';
  const postedAt = item.createdAt ?? item.postedAt ?? new Date().toLocaleString();
  const postedMinutesAgo = postedAt ? Math.max(0, Math.round((Date.now() - new Date(postedAt).getTime()) / 60000)) : 0;

  return {
    id: item.listingId ?? item.id ?? `live-${idx}-${Date.now()}`,
    title, year,
    make: item.make ?? parseMake(title),
    model: item.model ?? parseModel(title),
    mileage, askingPrice, marketValue, profit, image,
    location: locationStr, distance: 0, postedMinutesAgo, postedAt,
    platform: 'Facebook Marketplace', url,
    condition: mapCondition(item.condition),
    description: item.description ?? item.text ?? '',
  };
}

function parseMiles(v?: string | number) { if (!v) return null; return typeof v === 'string' ? (parseInt(v.replace(/[^0-9]/g, ''), 10) || null) : v; }
function parseYear(v?: string | number) { if (!v) return null; return typeof v === 'string' ? (parseInt(v, 10) || null) : v; }

const MAKES = ['Honda','Toyota','Ford','Chevrolet','Chevy','Nissan','Subaru','Jeep','GMC','Dodge','Ram','Hyundai','Kia','Lexus','Mazda','BMW','Mercedes','Audi','Volkswagen','Volvo','Buick','Cadillac','Infiniti','Acura','Mitsubishi','Lincoln'];
function parseMake(t: string) { for (const m of MAKES) if (t.toLowerCase().includes(m.toLowerCase())) return m === 'Chevy' ? 'Chevrolet' : m; return 'Unknown'; }
function parseModel(t: string) { const p = t.trim().split(/\s+/); return p.length >= 3 ? p.slice(2, 4).join(' ') : ''; }
function mapCondition(c?: string): 'good' | 'fair' | 'rough' {
  if (!c) return 'fair';
  const l = c.toLowerCase();
  if (l.includes('excellent') || l.includes('like new') || l.includes('good')) return 'good';
  if (l.includes('poor') || l.includes('rough') || l.includes('salvage')) return 'rough';
  return 'fair';
}
