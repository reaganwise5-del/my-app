import { NextRequest, NextResponse } from 'next/server';

// Extend Vercel serverless function timeout to 60s (max on Hobby plan)
export const maxDuration = 60;

const APIFY_TOKEN = process.env.APIFY_API_KEY ?? process.env.APIFY_API_TOKEN ?? '';
// curious_coder/facebook-marketplace actor
const ACTOR_ID = 'Y0QGH7cuqgKtNbEgt';

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: 'APIFY_API_KEY not set', listings: [], source: 'demo' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { location = 'richmond', maxPrice, maxResults = 1 } = body;

  // Build Facebook Marketplace URL from customer's location
  // e.g. "Richmond, VA" → "richmond", "New York" → "new-york"
  const citySlug = locationToSlug(location);
  const fbUrl = `https://www.facebook.com/marketplace/${citySlug}/vehicles/`;

  console.log(`[FlipAlert] Scraping: ${fbUrl}`);

  try {
    // timeout=55 keeps us under Vercel's 60s function limit
    const url = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=55&memory=1024`;

    // Only send fields the actor definitely supports
    const input = {
      urls: [{ url: fbUrl }],
      getListingDetails: true,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(58_000),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error(`[FlipAlert] Apify error ${res.status}:`, text.slice(0, 500));
      return NextResponse.json({ error: `Apify ${res.status}`, detail: text.slice(0, 300), listings: [], source: 'error' }, { status: 502 });
    }

    let items: FBListing[] = [];
    try { items = JSON.parse(text); } catch {
      return NextResponse.json({ error: 'Invalid JSON from Apify', listings: [], source: 'error' }, { status: 502 });
    }

    console.log(`[FlipAlert] Got ${items.length} items`);

    const listings = items
      .filter(item => isValidCar(item, maxPrice))
      .map((item, idx) => normalize(item, idx))
      .filter(Boolean);

    return NextResponse.json({ listings, source: 'live', count: listings.length });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[FlipAlert] Error:', msg);
    return NextResponse.json({ error: msg, listings: [], source: 'error' }, { status: 502 });
  }
}

// ─── Facebook Marketplace data shape ─────────────────────────
interface FBListing {
  id?: string;
  marketplace_listing_title?: string;
  custom_title?: string;
  listing_price?: {
    amount?: string;
    formatted_amount?: string;
    currency?: string;
  };
  primary_listing_photo?: {
    image?: { url?: string };
  };
  location?: {
    latitude?: number;
    longitude?: number;
    reverse_geocode_detailed?: { postal_code_trimmed?: string; city?: string };
    reverse_geocode?: { postal_code_trimmed?: string; city?: string };
  };
  custom_titles_with_rendering_flags?: Array<{ subtitle?: string }>;
  condition?: string;
  creation_time?: number;
  creation_time_formatted?: string;
  is_sold?: boolean;
  is_live?: boolean;
}

// ─── Filter ───────────────────────────────────────────────────
const JUNK = /\b(boat|atv|trailer|mower|rv|camper|motorcycle|scooter|tractor|jet ski|snowmobile|parts only|salvage|furniture)\b/i;

function isValidCar(item: FBListing, maxPrice?: number): boolean {
  if (item.is_sold) return false;
  const title = item.marketplace_listing_title ?? item.custom_title ?? '';
  if (JUNK.test(title)) return false;
  const price = parsePrice(item);
  if (!price || price < 500) return false;
  if (maxPrice && price > maxPrice) return false;
  return true;
}

// ─── Normalize FB data → FlipAlert Listing ────────────────────
function normalize(item: FBListing, idx: number) {
  const askingPrice = parsePrice(item);
  if (!askingPrice) return null;

  const title = item.marketplace_listing_title ?? item.custom_title ?? 'Vehicle';

  // Extract mileage from subtitle e.g. "166K miles" → 166000
  const subtitle = item.custom_titles_with_rendering_flags?.[0]?.subtitle ?? '';
  const mileage = parseMileage(subtitle) ?? 80000;

  // Extract year from title
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : 2016;

  // Extract make
  const make = parseMake(title);

  // Market value estimate
  const multiplier = year >= 2020 ? 1.30 : year >= 2017 ? 1.24 : year >= 2014 ? 1.18 : 1.12;
  const marketValue = Math.round(askingPrice * multiplier);
  const profit = marketValue - askingPrice;

  // Image
  const image = item.primary_listing_photo?.image?.url
    ?? 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop';

  // Location
  const geo = item.location?.reverse_geocode_detailed ?? item.location?.reverse_geocode;
  const locationStr = geo?.city ?? geo?.postal_code_trimmed ?? '';

  // URL
  const url = item.id ? `https://www.facebook.com/marketplace/item/${item.id}/` : '#';

  // Posted time
  const createdMs = item.creation_time ? item.creation_time * 1000 : Date.now();
  const postedMinutesAgo = Math.max(0, Math.round((Date.now() - createdMs) / 60000));
  const postedAt = item.creation_time_formatted ?? new Date(createdMs).toLocaleString();

  return {
    id: item.id ?? `live-${idx}-${Date.now()}`,
    title,
    year,
    make,
    model: parseModel(title),
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
    condition: item.condition?.toLowerCase().includes('used') ? 'fair' : 'fair' as 'good' | 'fair' | 'rough',
    description: subtitle,
  };
}

// ─── Helpers ──────────────────────────────────────────────────
function parsePrice(item: FBListing): number {
  const raw = item.listing_price?.amount ?? '';
  if (!raw) return 0;
  return Math.round(parseFloat(raw));
}

function parseMileage(subtitle: string): number | null {
  // "166K miles" → 166000, "45,000 miles" → 45000
  const kMatch = subtitle.match(/(\d+\.?\d*)K/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const numMatch = subtitle.match(/(\d[\d,]+)/);
  if (numMatch) return parseInt(numMatch[1].replace(/,/g, ''), 10);
  return null;
}

function locationToSlug(location: string): string {
  if (!location) return 'richmond';
  // "Richmond, VA" → "richmond", "New York, NY" → "new-york"
  const city = location.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
  // Common Facebook city slug overrides
  const overrides: Record<string, string> = {
    'new-york': 'nyc', 'new-york-city': 'nyc',
    'los-angeles': 'la', 'san-francisco': 'sf',
    'washington-dc': 'dc', 'washington': 'dc',
  };
  return overrides[city] ?? city;
}

const MAKES = ['Honda','Toyota','Ford','Chevrolet','Chevy','Nissan','Subaru','Jeep','GMC','Dodge','Ram','Hyundai','Kia','Lexus','Mazda','BMW','Mercedes','Audi','Volkswagen','Volvo','Buick','Cadillac','Infiniti','Acura','Mitsubishi','Lincoln','Chrysler','Pontiac','Acura'];
function parseMake(title: string): string {
  const t = title.toLowerCase();
  for (const m of MAKES) if (t.includes(m.toLowerCase())) return m === 'Chevy' ? 'Chevrolet' : m;
  return 'Unknown';
}
function parseModel(title: string): string {
  const parts = title.trim().split(/\s+/);
  return parts.length >= 3 ? parts.slice(2, 4).join(' ') : '';
}
