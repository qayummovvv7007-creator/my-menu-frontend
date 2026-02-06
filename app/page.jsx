"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconBasket } from "@tabler/icons-react";
import { Search, ShoppingBasket, Heart, ClipboardList, User, Plus, Check, X, Trash2, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MAHSULOT KARTASI (Ixchamlashtirildi) ---
const FoodCard = ({ food, onToggle, isAdded }) => {
  const [showHeart, setShowHeart] = useState(false);
  const handleDoubleClick = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden relative">
      <div className="relative h-32 w-full cursor-pointer" onDoubleClick={handleDoubleClick}>
        <img src={food.rasmi || "https://via.placeholder.com/300"} alt={food.nomi} className="w-full h-full object-cover" />
        {showHeart && <div className="absolute inset-0 flex items-center justify-center z-10 animate-ping"><Heart size={40} className="text-red-500 fill-red-500" /></div>}
        <button onClick={() => onToggle(food)} className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md border-2 border-white z-20 transition-all ${isAdded ? 'bg-orange-500 text-white' : 'bg-[#167472] text-white'}`}>
          {isAdded ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
        </button>
      </div>
      <div className="p-3 text-black">
        <h3 className="font-bold text-[11px] truncate">{food.nomi}</h3>
        <p className="text-[10px] text-gray-400 truncate italic mb-2">{food.title}</p>
        <div className="text-sm font-black text-gray-900">{Number(food.narxi).toLocaleString()} so'm</div>
      </div>
    </div>
  );
};

const MenuPage = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState(["Barchasi"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [basket, setBasket] = useState([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+998");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, cRes] = await Promise.all([
          fetch("https://my-menu-backend-1.onrender.com/api/products"),
          fetch("https://my-menu-backend-1.onrender.com/api/categories")
        ]);
        const fData = await fRes.json();
        setFoods(fData);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(["Barchasi", ...cData.map(c => c.nomi)]);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalPrice = basket.reduce((sum, item) => sum + (item.narxi * item.quantity), 0);
  const filtered = (Array.isArray(foods) ? foods : []).filter(f => 
    (selectedCategory === "Barchasi" || f.category === selectedCategory) && 
    f.nomi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendOrder = async () => {
    if (phoneNumber.length !== 13) return alert("Raqamni to'liq kiriting!");
    setSending(true);
    try {
      const res = await fetch("https://my-menu-backend-1.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: basket, totalPrice, phone: phoneNumber, status: "Yangi" })
      });
      if (res.ok) { setBasket([]); setIsBasketOpen(false); setShowPhoneModal(false); setShowSuccess(true); }
    } catch (e) { alert("Xato yuz berdi"); } finally { setSending(false); }
  };

  return (
    <div className="flex justify-center bg-gray-200 min-h-screen font-sans">
      <div className="w-full max-w-[450px] bg-white shadow-2xl min-h-screen flex flex-col relative overflow-x-hidden">
        
        {/* HEADER */}
        <header className="sticky top-0 bg-white border-b z-40 p-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-black text-2xl font-bold">Menu</Link>
            <button onClick={() => setIsBasketOpen(true)} className="relative p-2 bg-[#167472] rounded-full text-white">
              <IconBasket size={22}/>
              {basket.length > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{basket.length}</span>}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input type="text" placeholder="Qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 outline-none text-sm text-black focus:ring-1 ring-[#167472]" />
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-3 flex gap-2 overflow-x-auto no-scrollbar border-b">
            {categories.map((cat, i) => (
              <button key={i} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${selectedCategory === cat ? "bg-[#167472] text-white" : "bg-white text-gray-500"}`}>{cat}</button>
            ))}
          </div>

          <div className="bg-[#b7d5d4] p-6 min-h-full shadow-inner">
            {loading ? <div className="text-center py-20 text-black font-bold">Yuklanmoqda...</div> : 
              <div className="grid grid-cols-2 gap-4">
                {filtered.map(food => <FoodCard key={food._id} food={food} isAdded={basket.some(i => i._id === food._id)} onToggle={(f) => setBasket(prev => prev.find(i => i._id === f._id) ? prev.filter(i => i._id !== f._id) : [...prev, {...f, quantity: 1}])} />)}
              </div>
            }
          </div>
        </main>

        {/* FIXED BOTTOM NAV - ENDI YO'QOLMAYDI */}
        <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[450px] bg-white/95 backdrop-blur-md border-t p-4 flex justify-around items-center z-50 pb-8 shadow-lg">
          <button className="flex flex-col items-center text-[#167472] font-bold"><ClipboardList size={22} /><span className="text-[10px]">Menyu</span></button>
          <button onClick={() => setIsBasketOpen(true)} className="flex flex-col items-center text-gray-400 relative">
            <ShoppingBasket size={24} className={basket.length > 0 ? "text-orange-500" : ""} />
            <span className="text-[10px]">Savat</span>
          </button>
          <button className="flex flex-col items-center text-gray-400"><User size={22} /><span className="text-[10px]">Profil</span></button>
        </nav>

        {/* BASKET MODAL */}
        <AnimatePresence>
          {isBasketOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex flex-col justify-end" onClick={() => setIsBasketOpen(false)}>
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-[450px] mx-auto bg-white rounded-t-[2.5rem] p-6 max-h-[80%] flex flex-col text-black" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                <h2 className="text-2xl font-black mb-6">Savat</h2>
                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                  {basket.length === 0 ? <p className="text-center py-10 text-gray-400">Savat bo'sh</p> : 
                    basket.map(item => (
                      <div key={item._id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border">
                        <img src={item.rasmi} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold text-xs">{item.nomi}</h4>
                          <p className="text-[#167472] font-black text-xs">{item.narxi.toLocaleString()} so'm</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setBasket(prev => prev.map(i => i._id === item._id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} className="w-6 h-6 bg-white rounded shadow text-xs">-</button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => setBasket(prev => prev.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i))} className="w-6 h-6 bg-white rounded shadow text-xs">+</button>
                        </div>
                        <button onClick={() => setBasket(prev => prev.filter(i => i._id !== item._id))} className="text-red-400 p-1"><Trash2 size={18}/></button>
                      </div>
                    ))
                  }
                </div>
                {basket.length > 0 && <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between mb-4 font-black"><span>Jami:</span><span>{totalPrice.toLocaleString()} so'm</span></div>
                  <button onClick={() => setShowPhoneModal(true)} className="w-full bg-[#167472] text-white py-4 rounded-2xl font-bold">Buyurtma berish</button>
                </div>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHONE & SUCCESS MODALS */}
        <AnimatePresence>
          {showPhoneModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6" onClick={() => setShowPhoneModal(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-[2.5rem] w-full max-w-[350px] text-black" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#167472]/10 rounded-full flex items-center justify-center mb-4"><Phone className="text-[#167472]" /></div>
                  <h3 className="font-black text-lg mb-4">Raqamingizni kiriting</h3>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-gray-100 p-4 rounded-2xl text-center text-xl font-black outline-none mb-6 border-2 border-transparent focus:border-[#167472]" />
                  <button onClick={sendOrder} disabled={sending} className="w-full bg-[#167472] text-white py-4 rounded-2xl font-bold flex justify-center">{sending ? <Loader2 className="animate-spin" /> : "Tasdiqlash"}</button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[120] bg-[#167472]/95 flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-[3rem] text-center w-full max-w-[350px]">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="text-green-600" strokeWidth={4} /></div>
                <h2 className="text-2xl font-black text-black">Tayyor!</h2>
                <p className="text-gray-500 my-4 text-sm">Buyurtma qabul qilindi. Tez orada bog'lanamiz!</p>
                <button onClick={() => setShowSuccess(false)} className="w-full bg-[#167472] text-white py-4 rounded-2xl font-bold">Tushunarli</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MenuPage;