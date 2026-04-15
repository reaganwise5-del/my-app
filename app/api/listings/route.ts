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

  const citySlug = locationToSlug(location);
  const fbUrl = `https://www.facebook.com/marketplace/${citySlug}/vehicles/`;

  console.log(`[FlipAlert] Starting async run for: ${fbUrl}`);

  try {
    // ── Step 1: Start the run (returns immediately with a run ID) ──
    const startRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}&memory=1024`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: [{ url: fbUrl }],
          getListingDetails: true,
        }),
      }
    );

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error(`[FlipAlert] Failed to start run ${startRes.status}:`, errText.slice(0, 300));
      return NextResponse.json({ error: `Apify start ${startRes.status}`, detail: errText.slice(0, 200), listings: [], source: 'error' }, { status: 502 });
    }

    const startData = await startRes.json();
    const runId: string = startData?.data?.id;
    if (!runId) {
      return NextResponse.json({ error: 'No run ID from Apify', listings: [], source: 'error' }, { status: 502 });
    }

    console.log(`[FlipAlert] Run started: ${runId}`);

    // ── Step 2: Poll until SUCCEEDED or timeout (max 50s) ──
    const deadline = Date.now() + 50_000;
    let status = startData?.data?.status as string;

    while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status) && Date.now() < deadline) {
      await sleep(3000);
      const statusRes = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}?token=${APIFY_TOKEN}`
      );
      const statusData = await statusRes.json();
      status = statusData?.data?.status ?? 'UNKNOWN';
      console.log(`[FlipAlert] Run ${runId} status: ${status}`);
    }

    if (status !== 'SUCCEEDED') {
      console.error(`[FlipAlert] Run ended with status: ${status}`);
      return NextResponse.json({ error: `Run ${status}`, listings: [], source: 'error' }, { status: 502 });
    }

    // ── Step 3: Fetch results ──
    const itemsRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&clean=true`
    );
    let items: FBListing[] = [];
    try {
      items = await itemsRes.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from Apify dataset', listings: [], source: 'error' }, { status: 502 });
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  const subtitle = item.custom_titles_with_rendering_flags?.[0]?.subtitle ?? '';
  const mileage = parseMileage(subtitle) ?? 80000;

  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : 2016;

  const make = parseMake(title);

  const multiplier = year >= 2020 ? 1.30 : year >= 2017 ? 1.24 : year >= 2014 ? 1.18 : 1.12;
  const marketValue = Math.round(askingPrice * multiplier);
  const profit = marketValue - askingPrice;

  const image = item.primary_listing_photo?.image?.url
    ?? 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop';

  const geo = item.location?.reverse_geocode_detailed ?? item.location?.reverse_geocode;
  const locationStr = geo?.city ?? geo?.postal_code_trimmed ?? '';

  const url = item.id ? `https://www.facebook.com/marketplace/item/${item.id}/` : '#';

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
    condition: 'fair' as 'good' | 'fair' | 'rough',
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
  const kMatch = subtitle.match(/(\d+\.?\d*)K/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const numMatch = subtitle.match(/(\d[\d,]+)/);
  if (numMatch) return parseInt(numMatch[1].replace(/,/g, ''), 10);
  return null;
}

function locationToSlug(location: string): string {
  if (!location) return 'richmond';
  const city = location.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
  const overrides: Record<string, string> = {
    'new-york': 'nyc', 'new-york-city': 'nyc',
    'los-angeles': 'la', 'san-francisco': 'sf',
    'washington-dc': 'dc', 'washington': 'dc',
  };
  return overrides[city] ?? city;
}

const MAKES = ['Honda','Toyota','Ford','Chevrolet','Chevy','Nissan','Subaru','Jeep','GMC','Dodge','Ram','Hyundai','Kia','Lexus','Mazda','BMW','Mercedes','Audi','Volkswagen','Volvo','Buick','Cadillac','Infiniti','Acura','Mitsubishi','Lincoln','Chrysler','Pontiac'];
function parseMake(title: string): string {
  const t = title.toLowerCase();
  for (const m of MAKES) if (t.includes(m.toLowerCase())) return m === 'Chevy' ? 'Chevrolet' : m;
  return 'Unknown';
}
function parseModel(title: string): string {
  const parts = title.trim().split(/\s+/);
  return parts.length >= 3 ? parts.slice(2, 4).join(' ') : '';
}
