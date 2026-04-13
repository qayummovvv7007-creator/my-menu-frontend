"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ShoppingBag, Award, BarChart3, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const DAYS_UZ = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const API_ORDERS = 'https://my-menu-backend.onrender.com/api/orders';

// ── Toshkent vaqti yordamchilari ─────────────────────────────
const toTashkentDate = (ts) =>
  new Date(ts).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tashkent' });

const toTashkentHour = (ts) =>
  parseInt(new Date(ts).toLocaleString('en-US', { timeZone: 'Asia/Tashkent', hour: 'numeric', hour12: false }));

const getOrderTime = (order) => {
  const raw = order.createdAt || order.date || order.timestamp;
  if (raw) { const d = new Date(raw); if (!isNaN(d)) return d; }
  const id = order._id || '';
  if (typeof id === 'string' && id.length >= 8)
    return new Date(parseInt(id.slice(0, 8), 16) * 1000);
  return null;
};

// ── KUNLIK KALENDAR ───────────────────────────────────────────
function MiniCalendar({ selectedDate, setSelectedDate }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isFuture = (d) => d && new Date(year, month, d) > new Date();
  const isSelected = (d) => {
    if (!d) return false;
    const s = new Date(selectedDate);
    return d === s.getDate() && month === s.getMonth() && year === s.getFullYear();
  };
  const isToday = (d) => {
    if (!d) return false;
    const n = new Date();
    return d === n.getDate() && month === n.getMonth() && year === n.getFullYear();
  };

  const selectDay = (d) => {
    if (!d || isFuture(d)) return;
    const nd = new Date(year, month, d);
    nd.setHours(0, 0, 0, 0);
    setSelectedDate(nd);
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <ChevronLeft size={15} className="text-slate-500" />
        </button>
        <span className="text-sm font-black text-slate-800 uppercase italic tracking-wide">
          {MONTHS_UZ[month]} {year}
        </span>
        <button onClick={() => { const n = new Date(year, month + 1, 1); if (n <= new Date()) setViewDate(n); }}
          className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <ChevronRight size={15} className="text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_UZ.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-300 uppercase py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <button key={i} onClick={() => selectDay(d)} disabled={!d || isFuture(d)}
            className={`aspect-square rounded-xl text-xs font-bold transition-all ${
              !d ? 'invisible' :
              isSelected(d) ? 'bg-slate-900 text-white shadow-md' :
              isToday(d) ? 'bg-emerald-100 text-emerald-600 font-black' :
              isFuture(d) ? 'text-slate-200 cursor-not-allowed' :
              'hover:bg-slate-50 text-slate-600'
            }`}>
            {d || ''}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── OYLIK OY TANLASH ──────────────────────────────────────────
function MonthPicker({ selectedMonth, setSelectedMonth }) {
  const { year, month } = selectedMonth;
  const now = new Date();
  const prev = () => month === 0 ? setSelectedMonth({ year: year - 1, month: 11 }) : setSelectedMonth({ year, month: month - 1 });
  const next = () => {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth())) return;
    setSelectedMonth({ year: ny, month: nm });
  };
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-3 border border-slate-100 shadow-sm">
      <button onClick={prev} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><ChevronLeft size={15} className="text-slate-500" /></button>
      <span className="text-sm font-black text-slate-800 uppercase italic min-w-[150px] text-center">{MONTHS_UZ[month]} {year}</span>
      <button onClick={next} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><ChevronRight size={15} className="text-slate-500" /></button>
    </div>
  );
}

// ── SOATLIK GRAFIK (Chart.js dinamik) ────────────────────────
function HourlyChart({ selectedDate }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [hourData, setHourData] = useState(new Array(24).fill(0));
  const [peak, setPeak] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const dateKey = selectedDate
    ? new Date(selectedDate).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tashkent' })
    : null;

  useEffect(() => {
    if (!dateKey) return;
    setLoading(true);

    fetch(API_ORDERS)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : (data.orders || data.data || []);
        const counts = new Array(24).fill(0);

        all.forEach(order => {
          const t = getOrderTime(order);
          if (!t) return;
          if (toTashkentDate(t) !== dateKey) return;
          const h = toTashkentHour(t);
          if (h >= 0 && h < 24) counts[h]++;
        });

        const totalOrders = counts.reduce((a, b) => a + b, 0);
        const maxVal = Math.max(...counts);
        const peakH = counts.indexOf(maxVal);

        setHourData(counts);
        setTotal(totalOrders);
        setPeak(maxVal > 0 ? { hour: peakH, count: maxVal } : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateKey]);

  // Chart yaratish / yangilash
  useEffect(() => {
    if (loading || !canvasRef.current) return;

    // Chart.js yuklanganini tekshiramiz
    if (typeof window === 'undefined' || !window.Chart) return;

    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const labels = Array.from({ length: 24 }, (_, i) => i + ':00');
    const colors = hourData.map((_, i) => {
      if (i >= 11 && i <= 14) return '#1D9E75'; // tushlik
      if (i >= 18 && i <= 21) return '#BA7517'; // kechki
      return '#378ADD';                           // oddiy
    });

    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Buyurtmalar',
          data: hourData,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: ctx => ctx[0].label + '–' + (parseInt(ctx[0].label) + 1) + ':00',
              label: ctx => ' ' + ctx.raw + ' ta buyurtma',
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, color: '#888780', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
            grid: { display: false }
          },
          y: {
            ticks: { font: { size: 10 }, color: '#888780', stepSize: 1 },
            grid: { color: 'rgba(136,135,128,0.12)' },
            beginAtZero: true,
          }
        }
      }
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [hourData, loading]);

  return (
    <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-xl relative z-10">
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Clock size={22} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-tight">Soatlik savdo</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qaysi soatda eng ko'p zakas</p>
          </div>
        </div>
        {/* Stat mini */}
        <div className="flex gap-3">
          <div className="bg-slate-50 rounded-2xl px-4 py-2 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase">Jami</p>
            <p className="text-lg font-black text-slate-800">{total}</p>
          </div>
          {peak && (
            <div className="bg-amber-50 rounded-2xl px-4 py-2 text-center border border-amber-100">
              <p className="text-[9px] font-black text-amber-500 uppercase">Band soat</p>
              <p className="text-lg font-black text-amber-600">{peak.hour}:00</p>
            </div>
          )}
        </div>
      </div>

      {/* Rang izoh */}
      <div className="flex gap-4 flex-wrap mb-5">
        {[
          { color: '#378ADD', label: 'Oddiy vaqt' },
          { color: '#1D9E75', label: 'Tushlik (11–14)' },
          { color: '#BA7517', label: 'Kechki (18–21)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            <span className="text-[10px] font-bold text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Graf */}
      {loading ? (
        <div className="flex items-center justify-center h-44">
          <div className="flex items-end gap-1.5">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i}
                animate={{ height: ['16px', '48px', '16px'] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                className="w-2 bg-emerald-300 rounded-full"
              />
            ))}
          </div>
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center h-44 text-slate-300">
          <Clock size={32} className="mb-2 opacity-40" />
          <p className="text-sm font-bold">Bu kunda buyurtma yo'q</p>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '200px' }}>
          <canvas ref={canvasRef} role="img" aria-label="Soat bo'yicha buyurtmalar grafigi">
            Soatlik buyurtmalar: {hourData.map((c, i) => `${i}:00 — ${c} ta`).filter(s => !s.endsWith('0 ta')).join(', ')}
          </canvas>
        </div>
      )}

      {/* Peak banner */}
      {peak && !loading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5 flex items-center gap-2"
        >
          <span className="text-amber-500 font-black text-xs uppercase tracking-widest">🔥 Eng gavjum:</span>
          <span className="text-amber-700 font-black text-sm">{peak.hour}:00 – {peak.hour + 1}:00</span>
          <span className="ml-auto text-amber-500 font-black text-xs">{peak.count} ta buyurtma</span>
        </motion.div>
      )}
    </div>
  );
}

// ── ASOSIY KOMPONENT ─────────────────────────────────────────
export const StatsView = ({
  data, subTab, setSubTab, onDetailClick,
  selectedDate, setSelectedDate,
  selectedMonth, setSelectedMonth
}) => {
  const topItems = Array.isArray(data?.sorted) ? data.sorted : [];
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [chartJsLoaded, setChartJsLoaded] = useState(false);

  // Chart.js ni bir marta yuklash
  useEffect(() => {
    if (window.Chart) { setChartJsLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => setChartJsLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleStartTransition = () => {
    setIsTransitioning(true);
    setTimeout(() => onDetailClick(), 800);
  };

  const dateLabel = subTab === 'kunlik'
    ? (selectedDate ? new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '')
    : `${MONTHS_UZ[selectedMonth?.month]} ${selectedMonth?.year}`;

  return (
    <div className="relative space-y-10 pb-20 w-full px-2 md:px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900">
            <div className="flex items-end gap-2 h-32 mb-6">
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} animate={{ height: [20, 100, 40, 100] }}
                  transition={{ duration: 0.6, delay: i * 0.05, repeat: Infinity }}
                  className="w-3 bg-emerald-500 rounded-full shadow-[0_0_20px_#10b981]" />
              ))}
            </div>
            <p className="text-emerald-500 font-black tracking-[1em] uppercase text-[10px]">Data Loading</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Global Analytics
          </p>
          <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter">
            DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 uppercase">Intelligence</span>
          </h2>
        </div>
        <motion.button whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }} onClick={handleStartTransition}
          className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] flex items-center gap-4 shadow-xl">
          <div className="text-left">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Analytics</p>
            <p className="text-xs font-black uppercase italic tracking-widest">To'liq hisobot</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center rotate-3">
            <BarChart3 size={20} />
          </div>
        </motion.button>
      </div>

      {/* TABS */}
      <div className="flex justify-center relative z-10">
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-full border border-slate-100 shadow-xl flex gap-1">
          {['kunlik', 'oylik'].map((t) => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                subTab === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* DATE / MONTH PICKER */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        {subTab === 'kunlik'
          ? <MiniCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          : <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        }
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={12} className="text-emerald-500" /> {dateLabel}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {[
          { label: 'Jami Savdo', val: data?.summa || 0, icon: TrendingUp, color: 'from-emerald-600 to-teal-600', unit: 'UZS' },
          { label: 'Buyurtmalar', val: data?.count || 0, icon: ShoppingBag, color: 'from-blue-600 to-indigo-600', unit: 'TA' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[3rem] bg-gradient-to-br ${card.color} text-white shadow-2xl relative overflow-hidden group`}>
            <card.icon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 italic">{card.label}</p>
                <h3 className="text-4xl font-black italic tracking-tighter">
                  {card.val.toLocaleString()}
                  <span className="text-sm font-light opacity-60 ml-2 uppercase">{card.unit}</span>
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ SOATLIK GRAFIK — faqat kunlik tabda */}
      {subTab === 'kunlik' && chartJsLoaded && (
        <HourlyChart selectedDate={selectedDate} />
      )}

      {/* Oylik: kunbay mini bar chart */}
      {subTab === 'oylik' && Array.isArray(data?.days) && data.days.length > 0 && (
        <div className="relative z-10 bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest mb-6">Kunbay savdo grafigi</h3>
          <div className="flex items-end gap-1 h-24">
            {(() => {
              const maxT = Math.max(...data.days.map(d => d.total), 1);
              return data.days.map((d, i) => {
                const h = d.total > 0 ? Math.max((d.total / maxT) * 100, 8) : 3;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.02 }}
                      className={`w-full rounded-t-sm ${d.total > 0 ? 'bg-emerald-400' : 'bg-slate-100'}`}
                      style={{ minHeight: '3px' }} />
                    {data.days.length <= 20 && (
                      <span className="text-[7px] font-bold text-slate-300 mt-0.5">{d.day}</span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          {data.days.length > 20 && (
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-300">1</span>
              <span className="text-[9px] text-slate-300">{data.days.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      <div className="relative z-10 bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[4rem] border border-white shadow-2xl">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-amber-200">
            <Award size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Top Performers</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sotuvlar yetakchilari · {dateLabel}</p>
          </div>
        </div>

        {topItems.length === 0 ? (
          <p className="text-slate-300 text-sm font-bold italic text-center py-10">
            Bu {subTab === 'kunlik' ? 'kunda' : 'oyda'} buyurtma yo'q
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {topItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-6 p-4 rounded-[2.5rem] transition-all hover:bg-white/50 ${i === 0 ? 'bg-amber-50/50 border border-amber-100' : ''}`}>
                <div className={`w-16 h-20 rounded-[1.8rem] flex items-center justify-center font-black text-2xl italic ${
                  i === 0 ? 'bg-slate-900 text-amber-400 shadow-xl' : 'bg-slate-100 text-slate-300'
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-black text-slate-800 uppercase italic tracking-tighter">{item.name}</h4>
                    <span className="font-black text-emerald-600 italic">{item.qty} <span className="text-[9px] uppercase">dona</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      whileInView={{ width: `${(item.qty / (topItems[0]?.qty || 1)) * 100}%` }}
                      transition={{ duration: 1.5 }}
                      className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-slate-900'}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};