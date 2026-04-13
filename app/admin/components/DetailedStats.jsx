"use client";
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Zap, TrendingUp,
  BarChart3, Calendar, Activity, Layers
} from 'lucide-react';

const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const DAYS_UZ = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

// ─── KUNLIK KALENDAR ─────────────────────────────────────────
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
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 w-full">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-white transition-colors">
          <ChevronLeft size={14} className="text-slate-500" />
        </button>
        <span className="text-xs font-black text-slate-700 uppercase italic">{MONTHS_UZ[month]} {year}</span>
        <button onClick={() => { const nx = new Date(year, month + 1, 1); if (nx <= new Date()) setViewDate(nx); }}
          className="p-1.5 rounded-lg hover:bg-white transition-colors">
          <ChevronRight size={14} className="text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_UZ.map(d => (
          <div key={d} className="text-center text-[8px] font-black text-slate-300 uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <button key={i} onClick={() => selectDay(d)} disabled={!d || isFuture(d)}
            className={`aspect-square rounded-lg text-[11px] font-bold transition-all ${
              !d ? 'invisible' :
              isSelected(d) ? 'bg-slate-900 text-white shadow-sm' :
              isToday(d) ? 'bg-emerald-100 text-emerald-600 font-black' :
              isFuture(d) ? 'text-slate-200 cursor-not-allowed' :
              'hover:bg-white text-slate-500'
            }`}>{d || ''}</button>
        ))}
      </div>
    </div>
  );
}

// ─── OYLIK OY TANLASH ─────────────────────────────────────────
function MonthPicker({ selectedMonth, setSelectedMonth }) {
  const { year, month } = selectedMonth;
  const now = new Date();
  const prev = () => {
    if (month === 0) setSelectedMonth({ year: year - 1, month: 11 });
    else setSelectedMonth({ year, month: month - 1 });
  };
  const next = () => {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth())) return;
    setSelectedMonth({ year: ny, month: nm });
  };
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-5 py-3 border border-slate-100">
      <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white transition-colors">
        <ChevronLeft size={14} className="text-slate-500" />
      </button>
      <span className="text-xs font-black text-slate-700 uppercase italic min-w-[120px] text-center">
        {MONTHS_UZ[month]} {year}
      </span>
      <button onClick={next} className="p-1.5 rounded-lg hover:bg-white transition-colors">
        <ChevronRight size={14} className="text-slate-500" />
      </button>
    </div>
  );
}

// ─── MAHSULOTLAR RO'YXATI ─────────────────────────────────────
function ProductList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="text-slate-300 text-sm font-bold italic text-center py-6">{emptyText}</p>;
  }
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black italic flex-shrink-0 ${
            i === 0 ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-400'
          }`}>{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-700 uppercase italic truncate pr-2">{item.name}</span>
              <span className="text-xs font-black text-emerald-600 flex-shrink-0">{item.qty} dona</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }}
                animate={{ width: `${(item.qty / (items[0]?.qty || 1)) * 100}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-emerald-400'}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ASOSIY KOMPONENT ─────────────────────────────────────────
export const DetailedStats = ({
  data, subTab, setSubTab, onBack,
  selectedDate, setSelectedDate,
  selectedMonth, setSelectedMonth
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);

  const days = data?.days || [];
  const maxDayTotal = useMemo(() => Math.max(...days.map(d => d.total), 1), [days]);
  const selectedDayData = selectedDayIdx !== null ? days[selectedDayIdx] : null;

  const topProduct = data?.sorted?.[0] || null;
  const kunlikLabel = selectedDate?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const oylikLabel = `${MONTHS_UZ[selectedMonth?.month]} ${selectedMonth?.year}`;

  if (!data) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F3F6FD] p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto">

        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={onBack}
              className="p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-emerald-500 transition-all shadow-lg">
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
                FastMenu <span className="text-emerald-500">Analytics</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                {subTab === 'kunlik' ? kunlikLabel : oylikLabel}
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            {['kunlik', 'oylik'].map(t => (
              <button key={t} onClick={() => { setSubTab(t); setSelectedDayIdx(null); }}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  subTab === t ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}>{t}</button>
            ))}
          </div>
        </header>

        {/* ══════════════════════════════════════════
            KUNLIK VIEW
        ══════════════════════════════════════════ */}
        {subTab === 'kunlik' && (
          <div className="grid grid-cols-12 gap-6">

            {/* Kalendar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-5">
                  <Calendar size={16} className="text-emerald-500" />
                  <h3 className="text-xs font-black text-slate-700 uppercase italic tracking-widest">Sana tanlang</h3>
                </div>
                <MiniCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

                {/* KPI */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-emerald-400 uppercase italic">Savdo</p>
                    <p className="text-sm font-black text-emerald-700 italic mt-1">
                      {(data.summa || 0).toLocaleString()} <span className="text-[9px]">UZS</span>
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-blue-400 uppercase italic">Buyurtma</p>
                    <p className="text-sm font-black text-blue-700 italic mt-1">
                      {data.count || 0} <span className="text-[9px]">TA</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* O'sha kundagi mahsulotlar */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Top product card */}
              {topProduct && (
                <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center justify-between">
                  <div className="absolute -right-6 -top-6 opacity-10">
                    <Zap size={160} fill="currentColor" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] italic mb-1">Eng ko'p sotilgan</p>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">{topProduct.name}</h4>
                  </div>
                  <div className="relative z-10 text-right">
                    <span className="text-5xl font-black italic text-emerald-400">{topProduct.qty}</span>
                    <p className="text-[9px] font-bold text-slate-500 uppercase italic">Dona</p>
                  </div>
                </div>
              )}

              {/* Products list */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-700 uppercase italic tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" />
                  {kunlikLabel} — mahsulotlar
                </h3>
                <ProductList items={data.sorted} emptyText="Bu kunda buyurtma yo'q" />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            OYLIK VIEW
        ══════════════════════════════════════════ */}
        {subTab === 'oylik' && (
          <div className="space-y-6">

            {/* Bar chart + top product */}
            <div className="grid grid-cols-12 gap-6">

              {/* Bar chart */}
              <section className="col-span-12 lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Oylik savdo</p>
                    <h2 className="text-4xl font-black text-slate-900 italic leading-none">
                      {(data.summa || 0).toLocaleString()}
                      <span className="text-sm font-normal text-slate-400 not-italic ml-2">UZS</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-bold">{data.count || 0} ta buyurtma</p>
                  </div>
                  <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                </div>

                {/* Kunlar grafigi — bosing, mahsulotlar ko'rinadi */}
                <div className="h-[260px] flex items-end gap-[3px]">
                  {days.map((d, i) => {
                    const h = d.total > 0 ? Math.max((d.total / maxDayTotal) * 100, 6) : 2;
                    const isActive = selectedDayIdx === i;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                        onClick={() => setSelectedDayIdx(isActive ? null : i)}>
                        <div className="w-full flex flex-col items-center justify-end h-full">
                          {isActive && d.total > 0 && (
                            <span className="text-[9px] font-black text-emerald-600 mb-1 whitespace-nowrap">
                              {(d.total / 1000).toFixed(0)}k
                            </span>
                          )}
                          <motion.div initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.015, type: 'spring', stiffness: 80 }}
                            className={`w-full rounded-t-md transition-colors duration-200 ${
                              isActive ? 'bg-slate-900' :
                              d.total > 0 ? 'bg-emerald-400 group-hover:bg-emerald-500' : 'bg-slate-100'
                            }`}
                            style={{ minHeight: '3px' }} />
                        </div>
                        <span className={`mt-1 text-[8px] font-black transition-colors ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-300 font-bold italic mt-4 text-center">
                  Kunda bosing — o'sha kunning mahsulotlari ko'rinadi
                </p>
              </section>

              {/* Top product dark card */}
              <div className="col-span-12 lg:col-span-4 bg-[#0F172A] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 opacity-10">
                  <Zap size={180} fill="currentColor" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20">
                    <Zap size={28} fill="currentColor" />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] italic mb-2">Eng ko'p sotilgan</p>
                  <h4 className="text-3xl font-black italic uppercase leading-tight tracking-tighter">
                    {topProduct?.name || "N/A"}
                  </h4>
                </div>
                <div className="relative z-10 mt-10 pt-6 border-t border-white/5 flex items-end justify-between">
                  <div>
                    <span className="text-5xl font-black italic text-emerald-400 leading-none">{topProduct?.qty || 0}</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1">Dona sotuvda</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tanlangan kun detail */}
            {selectedDayData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-emerald-100 shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-sm font-black italic">
                    {selectedDayData.day}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase italic">
                      {selectedDayData.label} — mahsulotlar
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {selectedDayData.total.toLocaleString()} UZS · {selectedDayData.count} ta buyurtma
                    </p>
                  </div>
                  <button onClick={() => setSelectedDayIdx(null)}
                    className="text-slate-300 hover:text-slate-600 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all">
                    ✕
                  </button>
                </div>
                {selectedDayData.sorted?.length === 0 ? (
                  <p className="text-slate-300 text-sm font-bold italic text-center py-4">Bu kunda buyurtma yo'q</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedDayData.sorted.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black italic flex-shrink-0 ${
                          i === 0 ? 'bg-slate-900 text-amber-400' : 'bg-white text-slate-400 border border-slate-100'
                        }`}>{i + 1}</span>
                        <span className="flex-1 text-xs font-black text-slate-700 uppercase italic truncate">{item.name}</span>
                        <span className="text-xs font-black text-emerald-600 flex-shrink-0">{item.qty} dona</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Oyning umumiy top mahsulotlari */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase italic tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={14} className="text-emerald-500" /> {oylikLabel} — umumiy top mahsulotlar
              </h3>
              <ProductList items={data.sorted} emptyText="Bu oyda buyurtma yo'q" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap gap-4 mt-6 pb-12">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase italic">System Online</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <Layers size={16} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase italic">
              {subTab === 'kunlik' ? 'Kunlik rejim' : 'Oylik rejim'}
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};