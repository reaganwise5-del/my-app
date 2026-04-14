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

const initialInventory: Car[] = [
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

// ─── Log Sale Sheet ────────────────────────────────────────────────
function LogSaleSheet({ car, onClose, onSave }: {
  car: Car;
  onClose: () => void;
  onSave: (sellPrice: number, expenses: number, soldDate: string) => void;
}) {
  const [sellPrice, setSellPrice] = useState('');
  const [expenses, setExpenses] = useState(String(car.expenses || ''));
  const [soldDate, setSoldDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  const canSave = sellPrice.trim().length > 0 && Number(sellPrice) > 0;
  const estProfit = sellPrice ? Number(sellPrice) - car.buyPrice - Number(expenses || 0) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#1C1C1E', borderRadius: '20px 20px 0 0', width: '100%', padding: '0 0 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 5, background: '#3A3A3C', borderRadius: 3 }} />
        </div>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>Log Sale</h2>
            <button type="button" onClick={onClose} style={{ width: 30, height: 30, background: '#3A3A3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <p style={{ color: '#8E8E93', fontSize: 13, marginBottom: 24 }}>{car.title} · Bought for ${car.buyPrice.toLocaleString()}</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Sold For *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', fontSize: 16 }}>$</span>
              <input type="number" placeholder="0" value={sellPrice} onChange={e => setSellPrice(e.target.value)}
                style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 17, fontWeight: 600, padding: '12px 14px 12px 28px', borderRadius: 12, border: 'none', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Repairs / Expenses</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', fontSize: 16 }}>$</span>
              <input type="number" placeholder="0" value={expenses} onChange={e => setExpenses(e.target.value)}
                style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 17, padding: '12px 14px 12px 28px', borderRadius: 12, border: 'none', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Date Sold</label>
            <input type="text" value={soldDate} onChange={e => setSoldDate(e.target.value)}
              style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 15, padding: '12px 14px', borderRadius: 12, border: 'none', outline: 'none' }} />
          </div>

          {estProfit !== null && (
            <div style={{ background: estProfit >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,69,58,0.1)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#8E8E93', fontSize: 14 }}>Est. Profit</span>
              <span style={{ color: estProfit >= 0 ? '#22c55e' : '#ff453a', fontWeight: 800, fontSize: 20 }}>
                {estProfit >= 0 ? '+' : ''}{estProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          <button type="button" onClick={() => canSave && onSave(Number(sellPrice), Number(expenses || 0), soldDate)}
            disabled={!canSave}
            style={{ width: '100%', background: canSave ? '#22c55e' : '#2C2C2E', color: canSave ? '#000' : '#636366', fontWeight: 800, fontSize: 17, padding: '15px 0', borderRadius: 14 }}>
            Save Sale
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Car Sheet ─────────────────────────────────────────────────
function AddCarSheet({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (car: Omit<Car, 'id' | 'sellPrice' | 'soldDate' | 'daysToSell' | 'status'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [expenses, setExpenses] = useState('');
  const [boughtDate, setBoughtDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  const canAdd = title.trim().length > 0 && buyPrice.trim().length > 0 && Number(buyPrice) > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#1C1C1E', borderRadius: '20px 20px 0 0', width: '100%', padding: '0 0 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 5, background: '#3A3A3C', borderRadius: 3 }} />
        </div>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>Add Car</h2>
            <button type="button" onClick={onClose} style={{ width: 30, height: 30, background: '#3A3A3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <p style={{ color: '#8E8E93', fontSize: 13, marginBottom: 24 }}>Track a car you just bought</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Vehicle *</label>
            <input type="text" placeholder='e.g. "2019 Honda Civic"' value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 15, padding: '12px 14px', borderRadius: 12, border: 'none', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Bought For *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', fontSize: 16 }}>$</span>
              <input type="number" placeholder="0" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 17, fontWeight: 600, padding: '12px 14px 12px 28px', borderRadius: 12, border: 'none', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Repairs / Expenses so far</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', fontSize: 16 }}>$</span>
              <input type="number" placeholder="0" value={expenses} onChange={e => setExpenses(e.target.value)}
                style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 17, padding: '12px 14px 12px 28px', borderRadius: 12, border: 'none', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 8 }}>Date Purchased</label>
            <input type="text" value={boughtDate} onChange={e => setBoughtDate(e.target.value)}
              style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontSize: 15, padding: '12px 14px', borderRadius: 12, border: 'none', outline: 'none' }} />
          </div>

          <button type="button" onClick={() => canAdd && onAdd({ title, buyPrice: Number(buyPrice), expenses: Number(expenses || 0), boughtDate })}
            disabled={!canAdd}
            style={{ width: '100%', background: canAdd ? '#22c55e' : '#2C2C2E', color: canAdd ? '#000' : '#636366', fontWeight: 800, fontSize: 17, padding: '15px 0', borderRadius: 14 }}>
            Add to Inventory
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function TrackerPage() {
  const [tab, setTab] = useState<TabType>('stats');
  const [profitGoal] = useState(5000);
  const [inventory, setInventory] = useState<Car[]>(initialInventory);
  const [logSaleCar, setLogSaleCar] = useState<Car | null>(null);
  const [showAddCar, setShowAddCar] = useState(false);

  const soldCars = inventory.filter(c => c.status === 'sold');
  const activeCars = inventory.filter(c => c.status === 'active');
  const totalProfit = soldCars.reduce((sum, c) => sum + (profit(c) ?? 0), 0);
  const grossRevenue = soldCars.reduce((sum, c) => sum + (c.sellPrice ?? 0), 0);
  const costOfGoods = soldCars.reduce((sum, c) => sum + c.buyPrice + c.expenses, 0);
  const avgSellTime = soldCars.length ? Math.round(soldCars.reduce((sum, c) => sum + (c.daysToSell ?? 0), 0) / soldCars.length) : 0;
  const avgProfit = soldCars.length ? Math.round(totalProfit / soldCars.length) : 0;
  const goalProgress = Math.min((totalProfit / profitGoal) * 100, 100);
  const maxProfit = Math.max(...soldCars.map(c => profit(c) ?? 0), 1);

  function handleLogSale(car: Car, sellPrice: number, expenses: number, soldDate: string) {
    const buyDate = car.boughtDate;
    setInventory(prev => prev.map(c => c.id === car.id ? {
      ...c,
      sellPrice,
      expenses,
      status: 'sold',
      soldDate,
      daysToSell: 0,
    } : c));
    setLogSaleCar(null);
    setTab('sold');
  }

  function handleAddCar(data: Omit<Car, 'id' | 'sellPrice' | 'soldDate' | 'daysToSell' | 'status'>) {
    const newCar: Car = {
      ...data,
      id: String(Date.now()),
      sellPrice: null,
      soldDate: null,
      daysToSell: null,
      status: 'active',
    };
    setInventory(prev => [...prev, newCar]);
    setShowAddCar(false);
  }

  return (
    <div className="min-h-screen pb-safe" style={{ background: '#000' }}>
      <div className="px-5 pt-14 pb-4">
        <Logo size="sm" />
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 28, marginTop: 16, letterSpacing: -0.5 }}>Flip Tracker</h1>
      </div>

      {/* iOS Segmented Control */}
      <div className="px-5 mb-5">
        <div style={{ background: '#2C2C2E', borderRadius: 11, padding: 2, display: 'flex' }}>
          {(['stats', 'inventory', 'sold'] as TabType[]).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 9, fontSize: 13, fontWeight: 600, color: tab === t ? '#000' : '#8E8E93', background: tab === t ? '#fff' : 'transparent', transition: 'all 0.2s ease', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
              {t === 'inventory' ? `In Stock (${activeCars.length})` : t === 'sold' ? `Sold (${soldCars.length})` : 'Stats'}
            </button>
          ))}
        </div>
      </div>

      {/* STATS TAB */}
      {tab === 'stats' && (
        <div className="px-5 space-y-3">
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
              <div style={{ height: '100%', width: `${goalProgress}%`, background: '#22c55e', borderRadius: 6 }} />
            </div>
            <div className="flex justify-between mt-2">
              <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>{Math.round(goalProgress)}% of goal</span>
              <span style={{ color: '#636366', fontSize: 12 }}>${Math.max(0, profitGoal - totalProfit).toLocaleString()} to go</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Gross Revenue', value: `$${grossRevenue.toLocaleString()}`, sub: 'total sold for' },
              { label: 'Cost of Goods', value: `$${costOfGoods.toLocaleString()}`, sub: 'total spent' },
              { label: 'Avg Sell Time', value: `${avgSellTime} Days`, sub: 'per flip' },
              { label: 'Total Flips', value: soldCars.length.toString(), sub: 'this month' },
              { label: 'Avg Profit', value: `$${avgProfit.toLocaleString()}`, sub: 'per car', green: true },
              { label: 'Best Flip', value: soldCars.length ? `$${Math.max(...soldCars.map(c => profit(c) ?? 0)).toLocaleString()}` : '$0', sub: 'single deal', green: true },
            ].map(stat => (
              <div key={stat.label} style={{ borderRadius: 16, padding: 14, background: stat.green ? 'rgba(34,197,94,0.1)' : '#1C1C1E' }}>
                <p style={{ fontWeight: 800, fontSize: 22, color: stat.green ? '#22c55e' : '#fff', letterSpacing: -0.5 }}>{stat.value}</p>
                <p style={{ color: '#8E8E93', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{stat.label}</p>
                <p style={{ color: '#636366', fontSize: 11 }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {soldCars.length > 0 && (
            <div style={{ background: '#1C1C1E', borderRadius: 20, padding: 16 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Profit Per Flip</p>
              <div className="space-y-3">
                {soldCars.map(car => {
                  const p = profit(car) ?? 0;
                  return (
                    <div key={car.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span style={{ color: '#8E8E93', fontSize: 12 }}>{car.title}</span>
                        <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>+${p.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 8, background: '#3A3A3C', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(p / maxProfit) * 100}%`, background: '#22c55e', borderRadius: 8 }} />
                      </div>
                      {car.daysToSell && <p style={{ color: '#636366', fontSize: 11, marginTop: 3 }}>{car.daysToSell} days to sell</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INVENTORY TAB */}
      {tab === 'inventory' && (
        <div className="px-5 space-y-3">
          {activeCars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎉</p>
              <p style={{ color: '#fff', fontWeight: 700 }}>All sold!</p>
              <p style={{ color: '#8E8E93', fontSize: 14, marginTop: 4 }}>Add a new car to track.</p>
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
                  <button type="button" onClick={() => setLogSaleCar(car)}
                    style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 12, padding: 12, textAlign: 'center', cursor: 'pointer' }}>
                    <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>+ Log Sale</p>
                  </button>
                </div>
              </div>
            ))
          )}
          <button type="button" onClick={() => setShowAddCar(true)}
            style={{ width: '100%', border: '1.5px dashed #3A3A3C', borderRadius: 16, padding: '18px 0', color: '#636366', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            + Add Car to Inventory
          </button>
        </div>
      )}

      {/* SOLD TAB */}
      {tab === 'sold' && (
        <div className="px-5 space-y-2">
          {soldCars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: '#8E8E93', fontSize: 15 }}>No sold cars yet.</p>
              <p style={{ color: '#636366', fontSize: 13, marginTop: 4 }}>Log a sale from In Stock.</p>
            </div>
          ) : soldCars.map(car => {
            const p = profit(car)!;
            return (
              <div key={car.id} style={{ background: '#1C1C1E', borderRadius: 16, padding: 16 }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{car.title}</h3>
                    <p style={{ color: '#8E8E93', fontSize: 12, marginTop: 2 }}>{car.boughtDate} → {car.soldDate}{car.daysToSell ? ` · ${car.daysToSell} days` : ''}</p>
                  </div>
                  <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Sold</span>
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

      {logSaleCar && (
        <LogSaleSheet
          car={logSaleCar}
          onClose={() => setLogSaleCar(null)}
          onSave={(sellPrice, expenses, soldDate) => handleLogSale(logSaleCar, sellPrice, expenses, soldDate)}
        />
      )}
      {showAddCar && (
        <AddCarSheet onClose={() => setShowAddCar(false)} onAdd={handleAddCar} />
      )}
    </div>
  );
}
