"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsView } from './components/StatsView';
import { ProductCard } from './components/ProductCard';
import { LoginScreen } from './components/LoginScreen';
import { OrdersView } from './components/OrdersView';
import { AddProductForm } from './components/AddProductForm';
import { CategoryManager } from './components/CategoryManager';
import { DetailedStats } from './components/DetailedStats';

import { Loader2, Menu, Sparkles, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [statsSubTab, setStatsSubTab] = useState('kunlik');

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  }));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
  const [newCatName, setNewCatName] = useState("");

  const loadData = useCallback(async (isSilent = false) => {
    if (typeof window === 'undefined') return;
    const auth = localStorage.getItem("is_admin_authenticated");
    if (auth !== "true") return;
    if (!isSilent) setLoading(true);
    try {
      const [oRes, pRes, cRes] = await Promise.all([
        fetch("https://my-menu-backend-1.onrender.com/api/orders").then(r => r.json()),
        fetch("https://my-menu-backend-1.onrender.com/api/products").then(r => r.json()),
        fetch("https://my-menu-backend-1.onrender.com/api/categories").then(r => r.json())
      ]);
      const freshOrders = Array.isArray(oRes) ? oRes : (oRes.orders || oRes.data?.orders || []);
      if (freshOrders.length > 0) {
        const existingArchive = JSON.parse(localStorage.getItem('orders_archive') || '[]');
        const newToArchive = freshOrders.filter(fo =>
          !existingArchive.some(ao => (ao._id || ao.id) === (fo._id || fo.id))
        );
        if (newToArchive.length > 0) {
          localStorage.setItem('orders_archive', JSON.stringify([...existingArchive, ...newToArchive]));
        }
      }
      setOrders(freshOrders);
      setProducts(Array.isArray(pRes) ? pRes : (pRes.products || []));
      setCategories(Array.isArray(cRes) ? cRes : (cRes.categories || []));
    } catch (err) {
      console.error("Yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("is_admin_authenticated") === "true") setIsAdmin(true);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
      const interval = setInterval(() => loadData(true), 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, loadData]);

  // ✅ Toshkent vaqtiga moslashtrilgan
  const getLocalISO = (d) => {
    return new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tashkent' });
  };

  // ✅ Buyurtma sanasini olish: createdAt yo'q bo'lsa _id dan olamiz
  const getOrderDate = (order) => {
    const raw = order.createdAt || order.date || order.timestamp;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }
    // MongoDB _id ning birinchi 8 hex belgisi = Unix timestamp (sekund)
    const id = order._id || order.id || '';
    if (typeof id === 'string' && id.length >= 8) {
      return new Date(parseInt(id.substring(0, 8), 16) * 1000);
    }
    return new Date();
  };

  // 📊 KUNLIK STATISTIKA
  const kunlikStats = useMemo(() => {
    const archive = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('orders_archive') || '[]')
      : [];

    const targetKey = getLocalISO(selectedDate);
    let summa = 0;
    let count = 0;
    const items = {};

    archive.forEach(order => {
      // ✅ _id dan sana olamiz
      const oDate = getOrderDate(order);
      const oKey = getLocalISO(oDate);
      if (oKey !== targetKey) return;

      let price = Number(order.totalPrice || order.summa || order.total || 0);
      const orderItems = order.items || order.products || [];
      if (price === 0 && orderItems.length > 0) {
        price = orderItems.reduce(
          (acc, it) => acc + (Number(it.narxi || it.price || 0) * Number(it.soni || it.quantity || 1)), 0
        );
      }
      summa += price;
      count++;
      orderItems.forEach(it => {
        const name = it.nomi || it.name || it.title || "Mahsulot";
        items[name] = (items[name] || 0) + Number(it.soni || it.quantity || 1);
      });
    });

    const sorted = Object.entries(items)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    return { summa, count, sorted, selectedKey: targetKey };
  }, [orders, selectedDate]);

  // 📊 OYLIK STATISTIKA
  const oylikStats = useMemo(() => {
    const archive = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('orders_archive') || '[]')
      : [];

    const { year, month } = selectedMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateObj = new Date(year, month, day);
      return {
        key: getLocalISO(dateObj),
        day,
        label: `${day}/${month + 1}`,
        total: 0,
        count: 0,
        items: {},
        sorted: []
      };
    });

    let totalSumma = 0;
    let totalCount = 0;
    const allItems = {};

    archive.forEach(order => {
      // ✅ _id dan sana olamiz
      const oDate = getOrderDate(order);
      const oKey = getLocalISO(oDate);

      // Toshkent vaqtida yil/oy tekshiruvi
      const oYear = Number(oKey.split('-')[0]);
      const oMonth = Number(oKey.split('-')[1]) - 1;
      if (oYear !== year || oMonth !== month) return;

      let price = Number(order.totalPrice || order.summa || order.total || 0);
      const orderItems = order.items || order.products || [];
      if (price === 0 && orderItems.length > 0) {
        price = orderItems.reduce(
          (acc, it) => acc + (Number(it.narxi || it.price || 0) * Number(it.soni || it.quantity || 1)), 0
        );
      }

      totalSumma += price;
      totalCount++;

      const dayPoint = days.find(d => d.key === oKey);
      if (dayPoint) {
        dayPoint.total += price;
        dayPoint.count++;
        orderItems.forEach(it => {
          const name = it.nomi || it.name || it.title || "Mahsulot";
          dayPoint.items[name] = (dayPoint.items[name] || 0) + Number(it.soni || it.quantity || 1);
        });
      }

      orderItems.forEach(it => {
        const name = it.nomi || it.name || it.title || "Mahsulot";
        allItems[name] = (allItems[name] || 0) + Number(it.soni || it.quantity || 1);
      });
    });

    days.forEach(d => {
      d.sorted = Object.entries(d.items)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty);
    });

    const sorted = Object.entries(allItems)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return { summa: totalSumma, count: totalCount, sorted, days, year, month };
  }, [orders, selectedMonth]);

  const currentStats = statsSubTab === 'kunlik' ? kunlikStats : oylikStats;

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!productForm.nomi || !productForm.narxi) return alert("Nom va narx majburiy!");
    setLoading(true);
    try {
      const res = await fetch("https://my-menu-backend-1.onrender.com/api/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        setProductForm({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
        setActiveTab('products');
        loadData(true);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://my-menu-backend-1.onrender.com/api/categories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomi: newCatName })
      });
      if (res.ok) { setNewCatName(""); loadData(true); }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm("O'chirilsinmi?")) return;
    try {
      const res = await fetch(`https://my-menu-backend-1.onrender.com/api/${type}/${id}`, { method: "DELETE" });
      if (res.ok) loadData(true);
    } catch (err) { console.error(err); }
  };

  if (!isAdmin) return <LoginScreen setIsAdmin={setIsAdmin} />;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
            <h1 className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2 italic">
              <Sparkles size={14} className="text-emerald-500" /> {activeTab.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {loading && <Loader2 className="animate-spin text-emerald-500" size={16} />}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <BellRing size={12} className="text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-700 uppercase italic">Live Active</span>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">

            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <StatsView
                  data={currentStats}
                  subTab={statsSubTab}
                  setSubTab={setStatsSubTab}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  onDetailClick={() => setActiveTab('detailed-stats')}
                />
              </motion.div>
            )}

            {activeTab === 'detailed-stats' && (
              <DetailedStats
                data={currentStats}
                subTab={statsSubTab}
                setSubTab={setStatsSubTab}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onBack={() => setActiveTab('stats')}
              />
            )}

            {activeTab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                {products.map(p => (
                  <ProductCard key={p._id || p.id} item={p} onDelete={(id) => deleteItem(id, 'products')} />
                ))}
              </div>
            )}

            {activeTab === 'orders' && (
              <OrdersView orders={orders} onDelete={(id) => deleteItem(id, 'orders')} />
            )}

            {activeTab === 'add-product' && (
              <AddProductForm form={productForm} setForm={setProductForm} categories={categories} onSubmit={handleAddProduct} />
            )}

            {activeTab === 'categories' && (
              <CategoryManager
                categories={categories} onAdd={handleAddCategory}
                onDelete={(id) => deleteItem(id, 'categories')}
                newCat={newCatName} setNewCat={setNewCatName}
              />
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}