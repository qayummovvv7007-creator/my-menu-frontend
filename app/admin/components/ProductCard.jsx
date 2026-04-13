"use client";
import React, { useState } from 'react';
import { Trash2, Pencil, Tag, X, Check, Loader2, Percent, Sparkles, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = "https://my-menu-backend.onrender.com/api/products";

const updateProduct = async (id, body) => {
  return await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

const parseResponse = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

// ── CHEGIRMA BADGE ──────────────────────────────────────
const DiscountBadge = ({ percent }) => (
  <motion.div
    initial={{ scale: 0, rotate: -20, y: -10 }}
    animate={{ scale: 1, rotate: 0, y: 0 }}
    transition={{ type: "spring", stiffness: 500, damping: 15 }}
    className="absolute top-3 left-3 z-20"
  >
    <div className="relative">
      <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-2.5 py-1 rounded-xl font-black text-[11px] shadow-lg flex items-center gap-1">
        <Flame size={10} strokeWidth={3} className="text-yellow-300" />
        <span>-{percent}%</span>
      </div>
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 bg-red-400 rounded-xl -z-10"
      />
    </div>
  </motion.div>
);

// ── NARX ────────────────────────────────────────────────
const PriceDisplay = ({ narxi, chegirma }) => {
  const hasDiscount = chegirma && Number(chegirma) > 0;
  const discountedPrice = hasDiscount ? Math.round(Number(narxi) * (1 - Number(chegirma) / 100)) : null;

  if (!hasDiscount) return (
    <p className="font-black text-base text-[#167472]">{Number(narxi).toLocaleString()} <span className="text-xs font-bold opacity-60">so'm</span></p>
  );
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <p className="font-black text-base text-red-500">{discountedPrice.toLocaleString()} <span className="text-xs font-bold opacity-70">so'm</span></p>
      <p className="text-xs font-bold text-slate-300 line-through">{Number(narxi).toLocaleString()}</p>
    </div>
  );
};

// ── EDIT MODAL ──────────────────────────────────────────
const EditModal = ({ item, onClose, onDone }) => {
  const [form, setForm] = useState({
    nomi: item.nomi || '',
    title: item.title || '',
    narxi: item.narxi || '',
    category: item.category || '',
    rasmi: item.rasmi || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.nomi || !form.narxi) { setError("Nom va narx majburiy!"); return; }
    setSaving(true); setError('');
    try {
      const body = { ...form, narxi: Number(form.narxi), chegirma: Number(item.chegirma) || 0 };
      const res = await updateProduct(item._id, body);
      const data = await parseResponse(res);
      if (res.ok) {
        onDone({ ...item, ...body, ...(data?._id ? data : {}) });
      } else {
        setError(data?.message || data?.raw || `HTTP ${res.status}`);
      }
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const fields = [
    { label: "Nomi", key: "nomi", placeholder: "Osh, Lag'mon...", icon: "🍽️" },
    { label: "Tavsif", key: "title", placeholder: "Qisqa ta'rif...", icon: "✍️" },
    { label: "Kategoriya", key: "category", placeholder: "Asosiy taomlar...", icon: "📂" },
    { label: "Narx (so'm)", key: "narxi", placeholder: "35000", type: "number", icon: "💰" },
    { label: "Rasm URL", key: "rasmi", placeholder: "https://...", icon: "🖼️" },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="w-full max-w-[480px] bg-white rounded-t-[2.5rem] shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-white pt-4 pb-3 px-6 z-10 border-b border-slate-50">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#167472]/10 rounded-2xl flex items-center justify-center">
                <Pencil size={16} className="text-[#167472]" />
              </div>
              <span className="text-lg font-black text-slate-800">Tahrirlash</span>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {field.icon} {field.label}
              </label>
              <input
                type={field.type || "text"}
                value={form[field.key]}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none border-2 border-transparent focus:border-[#167472]/50 focus:bg-[#167472]/5 transition-all placeholder:text-slate-300"
              />
            </div>
          ))}

          {form.rasmi && (
            <div className="rounded-2xl overflow-hidden h-36 border border-slate-100">
              <img src={form.rasmi} className="w-full h-full object-cover" alt="preview"
                onError={e => e.target.parentElement.style.display = 'none'} />
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold px-4 py-3 rounded-2xl"
            >⚠️ {error}</motion.div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 text-sm active:scale-95 transition-transform"
          >Bekor</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-4 rounded-2xl bg-[#167472] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#167472]/30 active:scale-95 transition-transform disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Saqlash</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── CHEGIRMA MODAL ──────────────────────────────────────
const DiscountModal = ({ item, onClose, onDone }) => {
  const [percent, setPercent] = useState(Number(item.chegirma) || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const presets = [5, 10, 15, 20, 25, 30, 50];

  const finalPrice = Math.round(Number(item.narxi) * (1 - percent / 100));
  const savedAmount = Number(item.narxi) - finalPrice;

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const body = {
        nomi: item.nomi, title: item.title || '',
        narxi: Number(item.narxi), category: item.category || '',
        rasmi: item.rasmi || '', chegirma: percent,
      };
      const res = await updateProduct(item._id, body);
      const data = await parseResponse(res);
      if (res.ok) { onDone({ ...item, chegirma: percent }); }
      else { setError(data?.message || data?.raw || `HTTP ${res.status}`); }
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="w-full max-w-[480px] bg-white rounded-t-[2.5rem] shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >
        {/* Handle + Header */}
        <div className="pt-4 pb-3 px-6 border-b border-slate-50">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Tag size={16} className="text-orange-500" />
              </div>
              <span className="text-lg font-black text-slate-800">Chegirma</span>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Big percent display */}
          <div className="bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 rounded-3xl p-6 mb-5 text-center border border-orange-100/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
            <motion.div key={percent} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400 }}>
              <p className="text-6xl font-black text-orange-500 leading-none">{percent}%</p>
              <p className="text-[10px] font-black text-orange-300 uppercase tracking-widest mt-1">chegirma</p>
            </motion.div>
          </div>

          {/* Slider */}
          <div className="mb-5">
            <input type="range" min={0} max={70} step={1} value={percent}
              onChange={e => setPercent(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#f97316' }}
            />
            <div className="flex justify-between text-[10px] text-slate-300 font-black mt-1.5 px-1">
              <span>0%</span><span>70%</span>
            </div>
          </div>

          {/* Preset tugmalar */}
          <div className="flex flex-wrap gap-2 mb-5">
            {presets.map(p => (
              <motion.button key={p} whileTap={{ scale: 0.9 }} onClick={() => setPercent(p)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  percent === p ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-slate-100 text-slate-500'
                }`}
              >{p}%</motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPercent(0)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                percent === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >0%</motion.button>
          </div>

          {/* Hisob-kitob */}
          <AnimatePresence>
            {percent > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Asl narx</span>
                  <span className="text-xs font-bold text-slate-300 line-through">{Number(item.narxi).toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Yangi narx</span>
                  <span className="text-base font-black text-emerald-600">{finalPrice.toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><Sparkles size={10} /> Tejash</span>
                  <span className="text-xs font-black text-emerald-500">{savedAmount.toLocaleString()} so'm</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold px-4 py-3 rounded-2xl mb-4">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 text-sm active:scale-95 transition-transform"
          >Bekor</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-95 transition-transform disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Saqlash</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── MAHSULOT KARTASI ────────────────────────────────────
export const ProductCard = ({ item, onDelete, onUpdate }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  const handleDone = (updated) => {
    setLocalItem(updated);
    if (onUpdate) onUpdate(updated);
  };

  const hasDiscount = localItem.chegirma && Number(localItem.chegirma) > 0;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
      >
        {/* Rasm */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={localItem.rasmi || "https://via.placeholder.com/300"}
            className="w-full h-full object-cover"
            alt={localItem.nomi}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Chegirma badge */}
          <AnimatePresence>
            {hasDiscount && <DiscountBadge percent={localItem.chegirma} />}
          </AnimatePresence>

          {/* Kategoriya */}
          {localItem.category && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[9px] font-black text-emerald-700 uppercase tracking-wide">
              {localItem.category}
            </div>
          )}

          {/* Pastki narx */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-white font-black text-base leading-tight drop-shadow-lg truncate max-w-[140px]">{localItem.nomi}</p>
              <PriceDisplay narxi={localItem.narxi} chegirma={localItem.chegirma} />
            </div>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="p-3 flex gap-2">
          {/* Tahrirlash */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowEdit(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#167472]/8 text-[#167472] rounded-2xl font-black text-xs active:bg-[#167472] active:text-white transition-colors"
          >
            <Pencil size={13} /> Tahrirlash
          </motion.button>

          {/* Chegirma */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowDiscount(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-black text-xs transition-colors ${
              hasDiscount
                ? 'bg-red-50 text-red-500 active:bg-red-500 active:text-white'
                : 'bg-orange-50 text-orange-500 active:bg-orange-500 active:text-white'
            }`}
          >
            <Percent size={13} />
            {hasDiscount ? `${localItem.chegirma}%` : "Chegirma"}
          </motion.button>

          {/* O'chirish */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => onDelete && onDelete(localItem._id, 'products')}
            className="p-2.5 bg-red-50 text-red-400 rounded-2xl active:bg-red-500 active:text-white transition-colors"
          >
            <Trash2 size={15} />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showEdit && (
          <EditModal item={localItem} onClose={() => setShowEdit(false)}
            onDone={(u) => { handleDone(u); setShowEdit(false); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiscount && (
          <DiscountModal item={localItem} onClose={() => setShowDiscount(false)}
            onDone={(u) => { handleDone(u); setShowDiscount(false); }} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;