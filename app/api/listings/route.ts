import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// ─────────────────────────────────────────────────────────────
//  FlipAlert — Real listings via Apify
//  Actor: apify/facebook-marketplace-scraper
// ─────────────────────────────────────────────────────────────

const APIFY_API_KEY = process.env.APIFY_API_KEY ?? process.env.APIFY_API_TOKEN ?? '';

export async function POST(req: NextRequest) {
  if (!APIFY_API_KEY) {
    return NextResponse.json(
      { error: 'APIFY_API_KEY not set', listings: [], source: 'demo' },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const {
    query = 'used car',
    location = '',
    maxPrice,
    maxResults = 40,
  } = body;

  // Build the Facebook Marketplace search URL
  const params = new URLSearchParams({ query });
  if (maxPrice) params.set('maxPrice', String(maxPrice));

  // FB Marketplace search URL — Apify navigates this directly
  const searchUrl = `https://www.facebook.com/marketplace/search/?${params.toString()}`;

  const client = new ApifyClient({ token: APIFY_API_KEY });

  try {
    console.log(`[FlipAlert] Starting Apify run — query: "${query}", location: "${location}"`);

    // Run the actor and wait for it to finish
    const run = await client.actor('apify/facebook-marketplace-scraper').call({
      startUrls: [{ url: searchUrl }],
      maxItems: maxResults,
      proxyConfiguration: { useApifyProxy: true },
    }, {
      waitSecs: 90,  // wait up to 90 seconds
      memory: 512,
    });

    // Fetch results from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: maxResults });

    console.log(`[FlipAlert] Got ${items.length} raw items from Apify`);

    const listings = (items as ApifyItem[])
      .filter(isLikelyCar)
      .map((item, idx) => normalizeListing(item, idx, location))
      .filter(Boolean);

    console.log(`[FlipAlert] Returning ${listings.length} car listings`);

    return NextResponse.json({
      listings,
      source: 'live',
      count: listings.length,
      rawCount: items.length,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[FlipAlert] Apify error:', msg);
    return NextResponse.json(
      { error: msg, listings: [], source: 'error' },
      { status: 502 }
    );
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
  categoryName?: string;
}

// ─── Car-only filter ──────────────────────────────────────────
const JUNK_KEYWORDS = /\b(boat|atv|trailer|hitch|mower|rv|camper|motorcycle|motorbike|scooter|tractor|jet ski|snowmobile|parts only|salvage title|furniture|couch|sofa|dresser|table)\b/i;

function isLikelyCar(item: ApifyItem): boolean {
  const title = (item.title ?? item.name ?? '').toLowerCase();
  const desc = (item.description ?? item.text ?? '').toLowerCase();
  const category = (item.categoryName ?? '').toLowerCase();

  // Skip obvious non-cars
  if (JUNK_KEYWORDS.test(title) || JUNK_KEYWORDS.test(desc)) return false;

  // Skip if no price
  const rawPrice = item.price ?? item.priceAmount;
  if (!rawPrice) return false;

  // Skip "free" or very cheap listings
  const price = typeof rawPrice === 'string'
    ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10)
    : rawPrice;
  if (!price || price < 500) return false;

  return true;
}

// ─── Normalize Apify item → FlipAlert Listing ─────────────────
function normalizeListing(item: ApifyItem, idx: number, searchLocation: string) {
  // Price
  const rawPrice = item.price ?? item.priceAmount ?? 0;
  const askingPrice = typeof rawPrice === 'string'
    ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10)
    : rawPrice;
  if (!askingPrice || askingPrice < 500) return null;

  // Mileage
  const rawMileage = item.mileage ?? '';
  const mileage = typeof rawMileage === 'string'
    ? (parseInt(rawMileage.replace(/[^0-9]/g, ''), 10) || 80000)
    : (rawMileage || 80000);

  // Year
  const rawYear = item.year ?? '';
  const year = typeof rawYear === 'string'
    ? (parseInt(rawYear, 10) || 2016)
    : (rawYear || 2016);

  // Title
  const title = item.title ?? item.name ?? 'Vehicle';

  // Market value estimate (will be replaced with real API later)
  // Newer cars tend to be priced below market on FB Marketplace
  const multiplier = year >= 2020 ? 1.30 : year >= 2017 ? 1.24 : year >= 2014 ? 1.18 : 1.12;
  const marketValue = Math.round(askingPrice * multiplier);
  const profit = marketValue - askingPrice;

  // Location
  let locationStr = searchLocation || 'Unknown';
  if (item.location) {
    if (typeof item.location === 'string') {
      locationStr = item.location;
    } else {
      const city = item.location.city ?? item.location.name ?? '';
      const state = item.location.state ?? '';
      if (city) locationStr = state ? `${city}, ${state}` : city;
    }
  }

  // Image
  const image =
    item.photoUrls?.[0] ??
    item.images?.[0] ??
    item.thumbnail ??
    item.image ??
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop';

  // URL
  const url = item.listingUrl ?? item.url ?? '#';

  // Posted time
  const postedAt = item.createdAt ?? item.postedAt ?? new Date().toLocaleString();
  const postedMinutesAgo = postedAt
    ? Math.max(0, Math.round((Date.now() - new Date(postedAt).getTime()) / 60000))
    : 0;

  return {
    id: item.listingId ?? item.id ?? `live-${idx}`,
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

// ─── Helpers ──────────────────────────────────────────────────
const MAKES = ['Honda','Toyota','Ford','Chevrolet','Chevy','Nissan','Subaru','Jeep','GMC','Dodge','Ram','Hyundai','Kia','Lexus','Mazda','BMW','Mercedes','Audi','Volkswagen','Volvo','Buick','Cadillac','Chrysler','Infiniti','Acura','Mitsubishi','Lincoln','Pontiac','Saturn','Oldsmobile'];

function parseMake(title: string): string {
  const t = title.toLowerCase();
  for (const make of MAKES) {
    if (t.includes(make.toLowerCase())) return make === 'Chevy' ? 'Chevrolet' : make;
  }
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
