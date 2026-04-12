'use client';

import { useState } from 'react';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';

type Car = {
  id: string;
  title: string;
  buyPrice: number;
  sellPrice: number | null;
  expenses: number;
  status: 'active' | 'sold';
  boughtDate: string;
  soldDate: string | null;
  daysToSell: number | null;
};

const mockInventory: Car[] = [
  { id: '1', title: '2017 Honda Civic', buyPrice: 7500, sellPrice: 10200, expenses: 300, status: 'sold', boughtDate: 'Mar 15', soldDate: 'Mar 28', daysToSell: 13 },
  { id: '2', title: '2016 Toyota Camry', buyPrice: 6800, sellPrice: 9500, expenses: 150, status: 'sold', boughtDate: 'Mar 22', soldDate: 'Apr 2', daysToSell: 11 },
  { id: '3', title: '2015 Ford F-150', buyPrice: 11200, sellPrice: 15800, expenses: 400, status: 'sold', boughtDate: 'Feb 10', soldDate: 'Feb 24', daysToSell: 14 },
  { id: '4', title: '2018 Ford F-150', buyPrice: 14500, sellPrice: null, expenses: 0, status: 'active', boughtDate: 'Apr 8', soldDate: null, daysToSell: null },
];

function profit(car: Car) {
  if (!car.sellPrice) return null;
  return car.sellPrice - car.buyPrice - car.expenses;
}

type TabType = 'stats' | 'inventory' | 'sold';

export default function TrackerPage() {
  const [tab, setTab] = useState<TabType>('stats');
  const [profitGoal] = useState(5000);

  const soldCars = mockInventory.filter(c => c.status === 'sold');
  const activeCars = mockInventory.filter(c => c.status === 'active');
  const totalProfit = soldCars.reduce((sum, c) => sum + (profit(c) ?? 0), 0);
  const grossRevenue = soldCars.reduce((sum, c) => sum + (c.sellPrice ?? 0), 0);
  const costOfGoods = soldCars.reduce((sum, c) => sum + c.buyPrice + c.expenses, 0);
  const avgSellTime = Math.round(soldCars.reduce((sum, c) => sum + (c.daysToSell ?? 0), 0) / soldCars.length);
  const avgProfit = soldCars.length ? Math.round(totalProfit / soldCars.length) : 0;
  const goalProgress = Math.min((totalProfit / profitGoal) * 100, 100);
  const maxProfit = Math.max(...soldCars.map(c => profit(c) ?? 0), 1);

  return (
    <div className="min-h-screen pb-safe" style={{ background: '#000' }}>
      <div className="px-5 pt-14 pb-4">
        <Logo size="sm" />
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 28, marginTop: 16, letterSpacing: -0.5 }}>Flip Tracker</h1>
      </div>

      {/* iOS Segmented Control */}
      <div className="px-5 mb-5">
        <div style={{ background: '#2C2C2E', borderRadius: 11, padding: 2, display: 'flex', position: 'relative' }}>
          {(['stats', 'inventory', 'sold'] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                color: tab === t ? '#000' : '#8E8E93',
                background: tab === t ? '#fff' : 'transparent',
                transition: 'all 0.2s ease',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}>
              {t === 'inventory' ? `In Stock (${activeCars.length})` : t === 'sold' ? `Sold (${soldCars.length})` : 'Stats'}
            </button>
          ))}
        </div>
      </div>

      {/* STATS TAB */}
      {tab === 'stats' && (
        <div className="px-5 space-y-3">
          {/* Monthly profit goal */}
          <div style={{ background: '#1C1C1E', borderRadius: 20, padding: 16 }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p style={{ color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>Monthly Profit</p>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 34, letterSpacing: -1, marginTop: 2 }}>${totalProfit.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#636366', fontSize: 12 }}>Goal</p>
                <p style={{ color: '#8E8E93', fontSize: 14, fontWeight: 700 }}>${profitGoal.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ height: 6, background: '#3A3A3C', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${goalProgress}%`, background: '#22c55e', borderRadius: 6, transition: 'width 0.4s ease' }} />
            </div>
            <div className="flex justify-between mt-2">
              <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>{Math.round(goalProgress)}% of goal</span>
              <span style={{ color: '#636366', fontSize: 12 }}>${(profitGoal - totalProfit).toLocaleString()} to go</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Gross Revenue', value: `$${grossRevenue.toLocaleString()}`, sub: 'total sold for' },
              { label: 'Cost of Goods', value: `$${costOfGoods.toLocaleString()}`, sub: 'total spent' },
              { label: 'Avg Sell Time', value: `${avgSellTime} Days`, sub: 'per flip' },
              { label: 'Total Flips', value: soldCars.length.toString(), sub: 'this month' },
              { label: 'Avg Profit', value: `$${avgProfit.toLocaleString()}`, sub: 'per car', green: true },
              { label: 'Best Flip', value: `$${Math.max(...soldCars.map(c => profit(c) ?? 0)).toLocaleString()}`, sub: 'single deal', green: true },
            ].map(stat => (
              <div key={stat.label} style={{ borderRadius: 16, padding: 14, background: stat.green ? 'rgba(34,197,94,0.1)' : '#1C1C1E' }}>
                <p style={{ fontWeight: 800, fontSize: 22, color: stat.green ? '#22c55e' : '#fff', letterSpacing: -0.5 }}>{stat.value}</p>
                <p style={{ color: '#8E8E93', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{stat.label}</p>
                <p style={{ color: '#636366', fontSize: 11 }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Profit per flip bar chart */}
          <div style={{ background: '#1C1C1E', borderRadius: 20, padding: 16 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Profit Per Flip</p>
            <div className="space-y-3">
              {soldCars.map(car => {
                const p = profit(car) ?? 0;
                const width = (p / maxProfit) * 100;
                return (
                  <div key={car.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ color: '#8E8E93', fontSize: 12 }}>{car.title}</span>
                      <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>+${p.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 8, background: '#3A3A3C', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${width}%`, background: '#22c55e', borderRadius: 8, transition: 'width 0.4s ease' }} />
                    </div>
                    <p style={{ color: '#636366', fontSize: 11, marginTop: 3 }}>{car.daysToSell} days to sell</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {tab === 'inventory' && (
        <div className="px-5 space-y-3">
          {activeCars.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-white font-bold">All sold!</p>
              <p className="text-zinc-500 text-sm mt-1">You've sold everything in inventory.</p>
            </div>
          ) : (
            activeCars.map(car => (
              <div key={car.id} style={{ background: '#1C1C1E', borderRadius: 16, padding: 16 }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{car.title}</h3>
                    <p style={{ color: '#8E8E93', fontSize: 12, marginTop: 2 }}>Bought {car.boughtDate}</p>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                    <span style={{ width: 6, height: 6, background: '#60a5fa', borderRadius: '50%' }} />
                    In Stock
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div style={{ background: '#2C2C2E', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <p style={{ color: '#8E8E93', fontSize: 11 }}>Bought For</p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>${car.buyPrice.toLocaleString()}</p>
                  </div>
                  <button style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>+ Log Sale</p>
                  </button>
                </div>
              </div>
            ))
          )}
          <button style={{ width: '100%', border: '1.5px dashed #3A3A3C', borderRadius: 16, padding: '18px 0', color: '#636366', fontWeight: 600, fontSize: 14 }}>
            + Add Car to Inventory
          </button>
        </div>
      )}

      {/* SOLD TAB */}
      {tab === 'sold' && (
        <div className="px-5 space-y-2">
          {soldCars.map(car => {
            const p = profit(car)!;
            return (
              <div key={car.id} style={{ background: '#1C1C1E', borderRadius: 16, padding: 16 }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{car.title}</h3>
                    <p style={{ color: '#8E8E93', fontSize: 12, marginTop: 2 }}>{car.boughtDate} → {car.soldDate} · {car.daysToSell} days</p>
                  </div>
                  <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                    Sold
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Bought', value: `$${car.buyPrice.toLocaleString()}` },
                    { label: 'Sold', value: `$${car.sellPrice!.toLocaleString()}` },
                    { label: 'Expenses', value: `$${car.expenses.toLocaleString()}` },
                    { label: 'Profit', value: `+$${p.toLocaleString()}`, green: true },
                  ].map(s => (
                    <div key={s.label} style={{ borderRadius: 10, padding: '10px 4px', textAlign: 'center', background: s.green ? 'rgba(34,197,94,0.1)' : '#2C2C2E' }}>
                      <p style={{ color: '#8E8E93', fontSize: 10 }}>{s.label}</p>
                      <p style={{ fontWeight: 700, fontSize: 12, marginTop: 2, color: s.green ? '#22c55e' : '#fff' }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
