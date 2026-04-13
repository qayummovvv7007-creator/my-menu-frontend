"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconBasket } from "@tabler/icons-react";
import {
  Search,
  ShoppingBasket,
  Heart,
  ClipboardList,
  User,
  Plus,
  Check,
  X,
  Trash2,
  Loader2,
  Phone,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "https://my-menu-backend.onrender.com";

const getDiscountedPrice = (narxi, chegirma) => {
  if (!chegirma || chegirma === 0) return narxi;
  return Math.round(narxi * (1 - chegirma / 100));
};

const DiscountBadge = ({ percent }) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="absolute top-3 left-3 z-20"
  >
    <div className="bg-red-500 text-white px-2.5 py-1.5 rounded-2xl font-black text-[10px] shadow-lg flex items-center gap-1">
      <Percent size={9} strokeWidth={3} />
      {percent}% OFF
    </div>
  </motion.div>
);

const FoodCard = ({ food, onToggle, isAdded, index }) => {
  const [showHeart, setShowHeart] = useState(false);
  const hasDiscount = food.chegirma && food.chegirma > 0;
  const finalPrice = getDiscountedPrice(food.narxi, food.chegirma);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group"
    >
      <div
        className="relative h-44 w-full mb-3 rounded-[1.5rem] overflow-hidden cursor-pointer"
        onDoubleClick={() => {
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 800);
        }}
      >
        <motion.img
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.7 }}
          src={food.rasmi || "https://via.placeholder.com/300"}
          alt={food.nomi}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {hasDiscount && <DiscountBadge percent={food.chegirma} />}

        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={56} className="text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggle(food)}
          className={`absolute bottom-3 right-3 p-2.5 rounded-2xl backdrop-blur-md transition-all z-20 shadow-lg border ${
            isAdded
              ? "bg-orange-500 text-white border-orange-400"
              : "bg-white/90 text-[#167472] border-white/60"
          }`}
        >
          {isAdded ? (
            <Check size={18} strokeWidth={3} />
          ) : (
            <Plus size={18} strokeWidth={3} />
          )}
        </motion.button>
      </div>

      <div className="px-1 pb-1">
        <h3 className="font-black text-[14px] text-gray-800 line-clamp-1 mb-0.5">
          {food.nomi}
        </h3>
        <p className="text-[10px] text-gray-400 font-medium mb-2 uppercase tracking-wide">
          {food.category || food.title || "Mahsulot"}
        </p>
        <div className="flex flex-col">
          {hasDiscount && (
            <span className="text-[10px] text-gray-300 line-through font-bold">
              {Number(food.narxi).toLocaleString()} so'm
            </span>
          )}
          <span
            className={`text-sm font-black ${hasDiscount ? "text-red-500" : "text-[#167472]"}`}
          >
            {finalPrice.toLocaleString()}{" "}
            <span className="text-[10px] font-bold opacity-50 uppercase">
              so'm
            </span>
          </span>
        </div>
      </div>
    </motion.div>
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
          fetch(`${API}/api/products`),
          fetch(`${API}/api/categories`),
        ]);
        const fData = await fRes.json();
        setFoods(fData);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(["Barchasi", ...cData.map((c) => c.nomi)]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) val = "+998";
    const digits = val.slice(4).replace(/\D/g, "").slice(0, 9);
    setPhoneNumber("+998" + digits);
  };

  const handleToggle = (food) => {
    setBasket((prev) => {
      if (prev.find((i) => i._id === food._id))
        return prev.filter((i) => i._id !== food._id);
      return [
        ...prev,
        {
          ...food,
          actualPrice: getDiscountedPrice(food.narxi, food.chegirma),
          quantity: 1,
        },
      ];
    });
  };

  const updateQty = (id, delta) => {
    setBasket((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  };

  const removeItem = (id) =>
    setBasket((prev) => prev.filter((i) => i._id !== id));

  const totalPrice = basket.reduce(
    (sum, item) => sum + item.actualPrice * item.quantity,
    0,
  );

  const filtered = (Array.isArray(foods) ? foods : []).filter(
    (f) =>
      (selectedCategory === "Barchasi" || f.category === selectedCategory) &&
      f.nomi?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sendOrder = async () => {
    if (phoneNumber.length !== 13) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: basket,
          totalPrice,
          phone: phoneNumber,
          status: "Yangi",
        }),
      });
      if (res.ok) {
        setBasket([]);
        setIsBasketOpen(false);
        setShowPhoneModal(false);
        setShowSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const isPhoneComplete = phoneNumber.length === 13;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans">
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-3">
          {/* Top row */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
                <img
                  src="/image.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Link
                  href="/"
                  className="text-xl font-black tracking-tight text-gray-900 leading-none block"
                >
                  CLOUD DRESS
                </Link>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Premium Dress Experience
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setIsBasketOpen(true)}
              className="relative p-3 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-gray-100"
            >
              <IconBasket size={24} className="text-gray-700" />
              <AnimatePresence>
                {basket.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                  >
                    {basket.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={17}
            />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 focus:border-[#167472]/30 focus:bg-white rounded-2xl py-3 pl-11 pr-4 outline-none text-sm font-medium transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-[12px] font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-[#167472] text-white shadow-md shadow-[#167472]/20"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </header>

      {/* ══ MAHSULOTLAR ═════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2
              className="animate-spin text-[#167472]"
              size={40}
              strokeWidth={1.5}
            />
            <p className="text-gray-400 font-medium text-sm">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3 opacity-30">
            <Search size={48} strokeWidth={1} />
            <p className="font-bold text-gray-600">Mahsulot topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((food, index) => (
              <FoodCard
                key={food._id}
                index={index}
                food={food}
                isAdded={basket.some((i) => i._id === food._id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </main>

      {/* ══ BOTTOM NAV ══════════════════════════════════════════ */}
      <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-5">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-full max-w-[400px] bg-white/85 backdrop-blur-3xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.10)] rounded-[2.5rem] p-2 flex justify-between items-center"
        >
          <button className="flex-1 flex flex-col items-center gap-1 py-1.5">
            <div className="p-2 bg-[#167472]/10 rounded-xl text-[#167472]">
              <ClipboardList size={20} strokeWidth={2} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight text-[#167472]">
              Menyu
            </span>
          </button>

          <div className="relative -mt-12">
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsBasketOpen(true)}
              className="bg-[#167472] p-5 rounded-[1.8rem] text-white shadow-[0_8px_30px_rgba(22,116,114,0.40)] border-[5px] border-[#F7F9FC] relative"
            >
              <ShoppingBasket size={26} strokeWidth={2} />
              <AnimatePresence>
                {basket.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-orange-500 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white"
                  >
                    {basket.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <button className="flex-1 flex flex-col items-center gap-1 py-1.5">
            <div className="p-2 rounded-xl text-gray-400 hover:text-[#167472] transition-colors">
              <User size={20} strokeWidth={2} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight text-gray-400">
              Profil
            </span>
          </button>
        </motion.nav>
      </div>

      {/* ══ SAVAT MODALI ════════════════════════════════════════ */}
      <AnimatePresence>
        {isBasketOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
            onClick={() => setIsBasketOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-[500px] sm:mx-4 sm:mb-4 bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col"
              style={{ maxHeight: "88vh" }}
            >
              {/* ── Modal Header (qotib turadi) ── */}
              <div className="flex-shrink-0 px-6 pt-5 pb-4">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-gray-900">Savat</h2>
                    <span className="bg-[#167472]/10 text-[#167472] text-xs font-black px-2.5 py-1 rounded-xl">
                      {basket.length} ta
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBasketOpen(false)}
                    className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* ── Scroll qismi ── */}
              <div className="flex-1 overflow-y-auto min-h-0 px-6 space-y-2.5 pb-2">
                {basket.length === 0 ? (
                  <div className="flex flex-col items-center py-16 opacity-20">
                    <ShoppingBasket size={64} strokeWidth={1} />
                    <p className="mt-3 font-bold">Savat bo'sh</p>
                  </div>
                ) : (
                  basket.map((item) => (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-[1.5rem] border border-gray-100"
                    >
                      <img
                        src={item.rasmi}
                        className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                        alt={item.nomi}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-gray-800 truncate mb-0.5">
                          {item.nomi}
                        </h4>
                        {item.chegirma > 0 ? (
                          <>
                            <p className="text-red-500 font-black text-xs">
                              {(
                                item.actualPrice * item.quantity
                              ).toLocaleString()}{" "}
                              so'm
                            </p>
                            <p className="text-gray-300 text-[10px] line-through">
                              {(item.narxi * item.quantity).toLocaleString()}{" "}
                              so'm
                            </p>
                          </>
                        ) : (
                          <p className="text-[#167472] font-black text-xs">
                            {(
                              item.actualPrice * item.quantity
                            ).toLocaleString()}{" "}
                            so'm
                          </p>
                        )}
                      </div>

                      {/* Miqdor */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateQty(item._id, -1)}
                          className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-black w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item._id, 1)}
                          className="w-7 h-7 rounded-xl bg-[#167472]/10 border border-[#167472]/20 flex items-center justify-center font-black text-[#167472] hover:bg-[#167472]/20 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* ── Footer (har doim pastda) ── */}
              {basket.length > 0 && (
                <div
                  className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-100 bg-white rounded-b-[2.5rem]"
                  style={{
                    paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Jami summa
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      {totalPrice.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-gray-400">
                        so'm
                      </span>
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPhoneModal(true)}
                    className="w-full bg-[#167472] text-white py-4 rounded-[1.5rem] font-black shadow-lg shadow-[#167472]/25 flex items-center justify-center gap-2 text-sm"
                  >
                    Buyurtma berish <Plus size={16} />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ TELEFON MODALI ══════════════════════════════════════ */}
      <AnimatePresence>
        {showPhoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowPhoneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-8 rounded-[2.5rem] w-full max-w-[380px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#167472]/10 rounded-[1.5rem] flex items-center justify-center mb-5">
                  <Phone className="text-[#167472]" size={28} />
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-1 text-center">
                  Telefon raqamingiz
                </h3>
                <p className="text-gray-400 text-sm text-center mb-6">
                  Buyurtmangizni tasdiqlash uchun
                </p>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  inputMode="numeric"
                  className="w-full bg-gray-50 p-4 rounded-2xl text-center text-2xl font-black outline-none border-2 border-gray-100 focus:border-[#167472]/40 transition-all tracking-widest text-[#167472] mb-4"
                />

                <div className="w-full mb-5">
                  <div className="flex justify-between text-xs text-gray-400 font-bold mb-1.5">
                    <span>+998</span>
                    <span>{phoneNumber.length - 4} / 9</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{
                        width: `${Math.min(100, ((phoneNumber.length - 4) / 9) * 100)}%`,
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{
                        background: isPhoneComplete ? "#167472" : "#f97316",
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {isPhoneComplete && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-xs text-[#167472] font-black mt-2"
                      >
                        ✓ Raqam to'liq
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={sendOrder}
                  disabled={sending || !isPhoneComplete}
                  whileTap={{ scale: isPhoneComplete ? 0.97 : 1 }}
                  className={`w-full py-4 rounded-2xl font-black flex justify-center items-center gap-2 text-white transition-all ${
                    isPhoneComplete
                      ? "bg-[#167472] shadow-lg shadow-[#167472]/25"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Buyurtma yuborish"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MUVAFFAQIYAT EKRANI ══════════════════════════════════ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#167472] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="bg-white/15 backdrop-blur-xl p-10 rounded-[3rem] text-center w-full max-w-[320px] border border-white/20"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-7 shadow-xl"
              >
                <Check className="text-[#167472]" size={36} strokeWidth={3} />
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-2">Ajoyib!</h2>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                Buyurtmangiz qabul qilindi. Tez orada siz bilan bog'lanamiz!
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-white text-[#167472] py-4 rounded-2xl font-black hover:shadow-xl transition-all active:scale-98"
              >
                Tushunarli
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
