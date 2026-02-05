"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconBasket } from "@tabler/icons-react";
import { Search, ShoppingBasket, Heart, ClipboardList, User, Plus, Check, X, Trash2, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MAHSULOT KARTASI ---
const FoodCard = ({ food, onToggle, isAdded }) => {
  const [showHeart, setShowHeart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const handleDoubleClick = () => {
    setIsLiked(!isLiked);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="relative h-32 w-full cursor-pointer select-none" onDoubleClick={handleDoubleClick}>
        <img src={food.rasmi || "https://via.placeholder.com/300"} alt={food.nomi} className="w-full h-full object-cover shadow-sm" />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-10 animate-bounce">
            <Heart size={40} className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-gray-400'} drop-shadow-lg`} />
          </div>
        )}
        <button 
          onClick={() => onToggle(food)} 
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 shadow-md border-2 border-white z-20 
          ${isAdded ? 'bg-orange-500 text-white scale-110' : 'bg-[#167472] text-white active:scale-95'}`}
        >
          {isAdded ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
        </button>
      </div>
      <div className="px-3 pb-4 pt-2 text-black">
        <h3 className="font-bold text-gray-800 text-[11px] mb-1 truncate">{food.nomi}</h3>
        <p className="text-[10px] text-gray-400 line-clamp-1 italic mb-2">{food.title}</p>
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
    const loadData = async () => {
      try {
        const prodRes = await fetch("https://my-menu-backend-1.onrender.com/api/products");
        const products = await prodRes.json();
        setFoods(products);

        const catRes = await fetch("https://my-menu-backend-1.onrender.com/api/categories");
        if (catRes.ok) {
          const catsData = await catRes.json();
          const adminCats = catsData.map(c => c.nomi); 
          setCategories(["Barchasi", ...adminCats]);
        }
      } catch (err) {
        console.error("Ma'lumot yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPrice = basket.reduce((sum, item) => sum + (item.narxi * item.quantity), 0);

  // --- TELEFON RAQAM INPUTINI BOSHQARISH ---
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // Foydalanuvchi +998 qismini o'chirib tashlay olmasligi kerak
    if (!value.startsWith("+998")) {
      setPhoneNumber("+998");
      return;
    }

    // Faqat raqamlarni qoldirish (va + belgisini)
    const cleaned = value.replace(/[^\d+]/g, "");

    // Uzunlik 13 tadan oshib ketmasligi kerak (+998 va 9 ta raqam)
    if (cleaned.length <= 13) {
      setPhoneNumber(cleaned);
    }
  };

  const handleOrderClick = () => {
    if (basket.length === 0) return;
    setShowPhoneModal(true);
  };

  const sendOrder = async () => {
    // To'liq tekshirish: Uzunlik roppa-rosa 13 ta bo'lishi shart
    if (phoneNumber.length !== 13) {
      alert("Iltimos, telefon raqamingizni to'liq kiriting (masalan: +998901234567)");
      return;
    }

    setSending(true);
    setShowPhoneModal(false);

    const orderData = {
      items: basket.map(item => ({
        nomi: item.nomi,
        soni: item.quantity,
        narxi: item.narxi
      })),
      totalPrice: totalPrice,
      phone: phoneNumber,
      date: new Date().toLocaleString('uz-UZ'),
      status: "Yangi"
    };

    try {
      const res = await fetch("https://my-menu-backend-1.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        setBasket([]); 
        setIsBasketOpen(false);
        setPhoneNumber("+998");
        setShowSuccess(true);
      }
    } catch (err) {
      alert("Server bilan bog'lanishda xato!");
    } finally {
      setSending(false);
    }
  };

  const toggleBasket = (food) => {
    setBasket(prev => {
      const existing = prev.find(item => item._id === food._id);
      if (existing) return prev.filter(item => item._id !== food._id);
      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setBasket(prev => prev.map(item => 
      item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => setBasket(prev => prev.filter(item => item._id !== id));

// foods massiv ekanligini tekshiramiz (Array.isArray), bo'lmasa bo'sh massiv [] ishlatamiz
const filteredFoods = (Array.isArray(foods) ? foods : []).filter(f => {
    const matchesCategory = selectedCategory === "Barchasi" || f.category === selectedCategory;
    const matchesSearch = f.nomi?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
});

  return (
    <div className="flex justify-center bg-gray-200 min-h-screen font-sans">
      <div className="w-full max-w-[450px] bg-white shadow-2xl h-[100vh] flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="w-full bg-white border-b border-gray-50 z-10">
          <div className="flex justify-between items-center px-4 pt-4 pb-2">
            <Link href="/" className="text-black text-[23px] font-[700]">Menu</Link>
            <button 
              onClick={() => setIsBasketOpen(true)}
              className="relative w-10 h-10 bg-[#167472] flex justify-center items-center rounded-full active:scale-90 transition-all shadow-md"
            >
              <IconBasket color="white" stroke={1.5} size={22}/>
              {basket.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-[10px] font-bold text-white w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {basket.length}
                </span>
              )}
            </button>
          </div>
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 focus:ring-2 focus:ring-[#167472] outline-none text-sm text-black" 
              />
            </div>
          </div>
        </header>

        {/* CONTENT */}
       {/* CONTENT */}
<div className="flex-1 overflow-y-auto pb-24 no-scrollbar bg-white">
  <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100">
    <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
   <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
 <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
  {categories && categories.map((cat, index) => (
    <button
      key={cat._id || `cat-${index}`} // Agar _id bo'lmasa, index'dan foydalanadi
      onClick={() => setSelectedCategory(cat.nomi || cat)} 
      className={`px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
        selectedCategory === (cat.nomi || cat) 
          ? "bg-[#167472] text-white border-[#167472] shadow-md" 
          : "bg-white text-slate-500 border-slate-200 hover:border-[#167472]"
      }`}
    >
      {cat.nomi || cat}
    </button>
  ))}
</div>
</div>
    </div>
  </div>

  {/* MANA SHU YERDA O'ZGARTIRISH KIRITILDI */}
  <div className="bg-[#b7d5d4] min-h-full p-6 pt-10 -mt-1 shadow-inner">
    {/* rounded-tl-[4rem] -> faqat tepa-chap burchakni yumaloq qiladi */}
    
    {loading ? (
      <div className="flex flex-col items-center py-20 gap-4 text-black">
         <div className="w-8 h-8 border-4 border-[#167472] border-t-transparent rounded-full animate-spin"></div>
         <p className="font-bold text-sm">Yuklanmoqda...</p>
      </div>
    ) : filteredFoods.length > 0 ? (
      <div className="grid grid-cols-2 gap-4">
        {filteredFoods.map((food) => (
          <FoodCard 
            key={food._id} 
            food={food} 
            onToggle={toggleBasket} 
            isAdded={basket.some(i => i._id === food._id)} 
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-20 text-[#167472] font-medium italic">
        Bu kategoriyada mahsulot topilmadi
      </div>
    )}
  </div>
</div>

        {/* BOTTOM NAV */}
        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t p-4 flex justify-around items-center z-40">
          <button className="flex flex-col items-center gap-1 text-[#167472] font-bold">
            <ClipboardList size={22} /><span className="text-[10px]">Menyu</span>
          </button>
          <button onClick={() => setIsBasketOpen(true)} className="flex flex-col items-center gap-1 relative text-gray-400">
            <ShoppingBasket size={24} className={basket.length > 0 ? "text-orange-500" : ""} />
            <span className="text-[10px]">Savat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-300">
            <User size={22} /><span className="text-[10px]">Profil</span>
          </button>
        </nav>

        {/* BASKET MODAL */}
        <AnimatePresence>
          {isBasketOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end" 
              onClick={() => setIsBasketOpen(false)}
            >
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full bg-white rounded-t-[2.5rem] p-6 max-h-[85%] flex flex-col" 
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-800">Savat</h2>
                  <button onClick={() => setIsBasketOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar text-black">
                  {basket.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-medium">Savat hozircha bo'sh</div>
                  ) : (
                    basket.map(item => (
                      <div key={item._id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-white">
                        <img src={item.rasmi} className="w-14 h-14 rounded-xl object-cover" alt={item.nomi} />
                        <div className="flex-1 text-black">
                          <h4 className="font-bold text-[13px] line-clamp-1">{item.nomi}</h4>
                          <p className="text-[#167472] font-black text-xs">{item.narxi.toLocaleString()} so'm</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-500 font-bold">-</button>
                            <span className="text-sm font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-500 font-bold">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item._id)} className="p-2 text-red-400"><Trash2 size={18} /></button>
                      </div>
                    ))
                  )}
                </div>

                {basket.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4 px-1">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Jami:</span>
                      <span className="text-xl font-black text-gray-900">{totalPrice.toLocaleString()} so'm</span>
                    </div>
                    <button 
                      onClick={handleOrderClick}
                      className="w-full bg-[#167472] text-white py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex justify-center items-center"
                    >
                      Buyurtma berish
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TELEFON RAQAM MODAL */}
        <AnimatePresence>
          {showPhoneModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full p-6 rounded-[2.5rem] shadow-2xl text-black"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#167472]/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="text-[#167472]" size={30} />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-center">Aloqa uchun raqam</h3>
                  <p className="text-gray-500 text-sm text-center mb-6 font-medium">
                    Operatorimiz siz bilan bog'lanishi uchun telefon raqamingizni kiriting
                  </p>
                  
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    autoFocus
                    className="w-full bg-gray-100 border-2 border-transparent focus:border-[#167472] rounded-2xl p-4 text-center text-xl font-black outline-none transition-all mb-6 text-black"
                    placeholder="+998901234567"
                  />

                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setShowPhoneModal(false)}
                      className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-500 active:scale-95"
                    >
                      Bekor qilish
                    </button>
                    <button 
                      disabled={sending}
                      onClick={sendOrder}
                      className="flex-[2] py-4 rounded-2xl font-bold bg-[#167472] text-white shadow-lg shadow-[#167472]/30 active:scale-95 flex justify-center items-center gap-2"
                    >
                      {sending ? <Loader2 className="animate-spin" size={20}/> : "Tasdiqlash"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUCCESS ANIMATION MODAL */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[120] flex items-center justify-center bg-[#167472]/90 backdrop-blur-md p-6"
            >
              <motion.div 
                initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] flex flex-col items-center shadow-2xl w-full"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} transition={{ delay: 0.2, type: "spring" }}>
                    <Check size={40} className="text-green-600" strokeWidth={4} />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-black text-gray-800 text-center">Tayyor!</h2>
                <p className="text-gray-500 text-center mt-2 font-medium">
                  Buyurtmangiz qabul qilindi. <br/> Tez orada bog'lanamiz!
                </p>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="mt-8 w-full bg-[#167472] text-white py-4 rounded-2xl font-bold active:scale-95 shadow-lg"
                >
                  Tushunarli
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MenuPage;