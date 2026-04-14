import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────
//  FlipAlert — Real listings via Apify
//  Facebook Marketplace Scraper actor
// ─────────────────────────────────────────────

const APIFY_API_KEY = process.env.APIFY_API_KEY ?? '';
const ACTOR_ID = 'apify~facebook-marketplace-scraper';

export async function POST(req: NextRequest) {
  if (!APIFY_API_KEY) {
    return NextResponse.json(
      { error: 'APIFY_API_KEY not set. Add it to .env.local', listings: [] },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const {
    query = 'car',
    location = 'United States',
    maxPrice,
    minYear,
    maxMileage,
    maxResults = 50,
  } = body;

  // Build search query string  e.g. "2018 Honda Civic under 10000"
  const searchQuery = [query, maxPrice ? `under ${maxPrice}` : ''].filter(Boolean).join(' ');

  const actorInput = {
    searchQuery,
    location,
    maxResults,
    ...(maxPrice ? { maxPrice } : {}),
  };

  try {
    // Run the Apify actor synchronously and get results in one call
    const apifyUrl = `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/run-sync-get-dataset-items?token=${APIFY_API_KEY}&timeout=60&memory=256`;

    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput),
      signal: AbortSignal.timeout(65_000),
    });

    if (!apifyRes.ok) {
      const errText = await apifyRes.text();
      console.error('[FlipAlert] Apify error:', apifyRes.status, errText);
      return NextResponse.json(
        { error: `Apify returned ${apifyRes.status}`, listings: [] },
        { status: 502 }
      );
    }

    const rawItems: ApifyListing[] = await apifyRes.json();

    // Filter + normalize Apify results into FlipAlert Listing shape
    const listings = rawItems
      .filter(isLikelyCar)
      .map((item, idx) => normalizeListing(item, idx))
      .filter(Boolean);

    return NextResponse.json({ listings, source: 'live', count: listings.length });
  } catch (err: unknown) {
    console.error('[FlipAlert] fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to reach Apify', listings: [] },
      { status: 502 }
    );
  }
}

// ─── Types ────────────────────────────────────
interface ApifyListing {
  id?: string;
  title?: string;
  price?: number | string;
  location?: { city?: string; state?: string } | string;
  image?: string;
  images?: string[];
  url?: string;
  description?: string;
  mileage?: number | string;
  year?: number | string;
  make?: string;
  model?: string;
  postedAt?: string;
  condition?: string;
}

// ─── Car-only filter ──────────────────────────
const JUNK_KEYWORDS = /\b(boat|atv|trailer|hitch|mower|rv|camper|motorcycle|motorbike|scooter|tractor|jet ski|snowmobile|parts only|salvage)\b/i;

function isLikelyCar(item: ApifyListing): boolean {
  const title = item.title ?? '';
  const desc = item.description ?? '';
  if (JUNK_KEYWORDS.test(title) || JUNK_KEYWORDS.test(desc)) return false;
  // Must have a price
  if (!item.price) return false;
  return true;
}

// ─── Normalize Apify → FlipAlert Listing ─────
function normalizeListing(item: ApifyListing, idx: number) {
  const askingPrice = typeof item.price === 'string'
    ? parseInt(item.price.replace(/[^0-9]/g, ''), 10)
    : item.price ?? 0;

  if (!askingPrice || askingPrice < 500) return null; // skip freebies / parse failures

  const mileage = typeof item.mileage === 'string'
    ? parseInt(item.mileage.replace(/[^0-9]/g, ''), 10)
    : item.mileage ?? 80000;

  const year = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year ?? 2016;

  // Rough market value estimate: asking + 20% if year > 2015, else +15%
  // In production this will be replaced by MarketCheck / VinAudit API
  const multiplier = year >= 2018 ? 1.28 : year >= 2015 ? 1.22 : 1.16;
  const marketValue = Math.round(askingPrice * multiplier);
  const profit = marketValue - askingPrice;

  const locationStr = typeof item.location === 'string'
    ? item.location
    : `${item.location?.city ?? ''}, ${item.location?.state ?? ''}`.replace(/^, |, $/, '');

  const image = item.images?.[0] ?? item.image ?? 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=400&h=300&fit=crop';

  return {
    id: item.id ?? `live-${idx}`,
    title: item.title ?? 'Vehicle',
    year,
    make: item.make ?? parseMake(item.title),
    model: item.model ?? parseModel(item.title),
    mileage,
    askingPrice,
    marketValue,
    profit,
    image,
    location: locationStr,
    distance: 0, // distance calc requires user location — set at client
    postedMinutesAgo: 0,
    postedAt: item.postedAt ?? new Date().toLocaleString(),
    platform: 'Facebook Marketplace',
    url: item.url ?? '#',
    condition: mapCondition(item.condition),
    description: item.description ?? '',
  };
}

function parseMake(title?: string): string {
  if (!title) return 'Unknown';
  const makes = ['Honda','Toyota','Ford','Chevrolet','Chevy','Nissan','Subaru','Jeep','GMC','Dodge','Ram','Hyundai','Kia','Lexus','Mazda','BMW','Mercedes','Audi','Volkswagen','Volvo','Buick','Cadillac','Chrysler','Infiniti','Acura','Mitsubishi','Lincoln'];
  for (const make of makes) {
    if (title.toLowerCase().includes(make.toLowerCase())) return make === 'Chevy' ? 'Chevrolet' : make;
  }
  return 'Unknown';
}

function parseModel(title?: string): string {
  if (!title) return '';
  // Grab the 3rd word as a rough model guess
  const parts = title.trim().split(/\s+/);
  return parts.length >= 3 ? parts.slice(2, 4).join(' ') : parts.slice(-1)[0] ?? '';
}

function mapCondition(c?: string): 'good' | 'fair' | 'rough' {
  if (!c) return 'fair';
  const lower = c.toLowerCase();
  if (lower.includes('excellent') || lower.includes('good') || lower.includes('like new')) return 'good';
  if (lower.includes('poor') || lower.includes('rough') || lower.includes('salvage')) return 'rough';
  return 'fair';
}
