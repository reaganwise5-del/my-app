export type Listing = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  askingPrice: number;
  marketValue: number;
  profit: number;
  image: string;
  location: string;
  distance: number;
  postedMinutesAgo: number;
  postedAt: string;
  platform: string;
  url: string;
  condition: 'good' | 'fair' | 'rough';
  description: string;
};

export const mockListings: Listing[] = [
  {
    id: '1',
    title: '2018 Honda Civic EX',
    year: 2018,
    make: 'Honda',
    model: 'Civic',
    mileage: 67000,
    askingPrice: 9500,
    marketValue: 12800,
    profit: 3300,
    image: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=400&h=300&fit=crop',
    location: 'Richmond, VA',
    distance: 8,
    postedMinutesAgo: 3,
    postedAt: 'Apr 12, 2026 at 9:42 AM',
    platform: 'Facebook Marketplace',
    url: '#',
    condition: 'good',
    description: 'Super clean Civic EX. New tires, oil just changed. Ice cold AC. No accidents. Serious inquiries only — asking $9,500 firm.',
  },
  {
    id: '2',
    title: '2016 Toyota Camry SE',
    year: 2016,
    make: 'Toyota',
    model: 'Camry',
    mileage: 94000,
    askingPrice: 7200,
    marketValue: 10100,
    profit: 2900,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    location: 'Roanoke, VA',
    distance: 22,
    postedMinutesAgo: 7,
    postedAt: 'Apr 12, 2026 at 9:38 AM',
    platform: 'Facebook Marketplace',
    url: '#',
    condition: 'good',
    description: 'Selling my 2016 Camry SE. Runs great, no issues. Just bought a truck and don\'t need two cars. $7,200 or best offer.',
  },
  {
    id: '3',
    title: '2015 Ford F-150 XLT',
    year: 2015,
    make: 'Ford',
    model: 'F-150',
    mileage: 112000,
    askingPrice: 14000,
    marketValue: 17500,
    profit: 3500,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    location: 'Charlottesville, VA',
    distance: 35,
    postedMinutesAgo: 12,
    postedAt: 'Apr 12, 2026 at 9:33 AM',
    platform: 'Facebook Marketplace',
    url: '#',
    condition: 'fair',
    description: '2015 F-150 XLT 4x4. 5.0 V8. Tows great. Has some minor rust on the bed rail but drives perfect. Priced to sell at $14k.',
  },
  {
    id: '4',
    title: '2019 Nissan Altima SR',
    year: 2019,
    make: 'Nissan',
    model: 'Altima',
    mileage: 52000,
    askingPrice: 11000,
    marketValue: 14200,
    profit: 3200,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop',
    location: 'Danville, VA',
    distance: 14,
    postedMinutesAgo: 18,
    postedAt: 'Apr 12, 2026 at 9:27 AM',
    platform: 'Facebook Marketplace',
    url: '#',
    condition: 'good',
    description: 'Low miles for year. SR trim with sport package. One owner, all highway miles. Clean title. $11,000 OBO.',
  },
  {
    id: '5',
    title: '2017 Chevrolet Malibu LT',
    year: 2017,
    make: 'Chevrolet',
    model: 'Malibu',
    mileage: 78000,
    askingPrice: 8800,
    marketValue: 10500,
    profit: 1700,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
    location: 'Harrisonburg, VA',
    distance: 5,
    postedMinutesAgo: 25,
    postedAt: 'Apr 12, 2026 at 9:20 AM',
    platform: 'Facebook Marketplace',
    url: '#',
    condition: 'fair',
    description: 'Reliable daily driver. AC works, heat works. Needs new brakes but otherwise solid. $8,800.',
  },
];

export type Search = {
  id: string;
  name: string;
  make: string;
  model: string;
  minYear: number;
  maxYear: number;
  maxPrice: number;
  maxMileage: number;
  zipCode: string;
  radius: number;
  active: boolean;
  alertsToday: number;
};

export const mockSearches: Search[] = [
  {
    id: '1',
    name: 'Honda Civics',
    make: 'Honda',
    model: 'Civic',
    minYear: 2015,
    maxYear: 2023,
    maxPrice: 12000,
    maxMileage: 100000,
    zipCode: '24501',
    radius: 50,
    active: true,
    alertsToday: 4,
  },
  {
    id: '2',
    name: 'Toyota Sedans',
    make: 'Toyota',
    model: 'Any',
    minYear: 2014,
    maxYear: 2023,
    maxPrice: 15000,
    maxMileage: 120000,
    zipCode: '24501',
    radius: 75,
    active: true,
    alertsToday: 7,
  },
  {
    id: '3',
    name: 'F-150 Trucks',
    make: 'Ford',
    model: 'F-150',
    minYear: 2013,
    maxYear: 2021,
    maxPrice: 18000,
    maxMileage: 150000,
    zipCode: '24501',
    radius: 100,
    active: false,
    alertsToday: 0,
  },
];
