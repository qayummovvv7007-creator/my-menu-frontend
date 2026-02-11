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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [productForm, setProductForm] = useState({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
  const [newCatName, setNewCatName] = useState("");

  // 📥 MA'LUMOTLARNI YUKLASH VA ARXIVGA SAQLASH
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
      
      // 🔥 STATISTIKA O'CHIB KETMASLIGI UCHUN ARXIVLASH
      if (freshOrders.length > 0) {
        const existingArchive = JSON.parse(localStorage.getItem('orders_archive') || '[]');
        // Faqat yangi (id si arxivda yo'q) zakazlarni qo'shamiz
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

  // 📊 STATISTIKANI ARXIVDAN HISOBLASH (O'CHSA HAM QOLADI)
  const processedStats = useMemo(() => {
    const report = {
      kunlik: { summa: 0, count: 0, trend: [], items: {}, sorted: [] },
      haftalik: { summa: 0, count: 0, trend: [], items: {}, sorted: [] },
      oylik: { summa: 0, count: 0, trend: [], items: {}, sorted: [] }
    };

    // Ekrandagi zakazlardan emas, xotiradagi arxivdan olamiz
    const archive = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('orders_archive') || '[]') : [];
    
    const now = new Date();
    const getLocalISO = (d) => {
      const target = new Date(d);
      target.setMinutes(target.getMinutes() - target.getTimezoneOffset());
      return target.toISOString().split('T')[0];
    };
    const todayStr = getLocalISO(now);

    const setupTrend = (period, days) => {
      report[period].trend = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date(); d.setDate(now.getDate() - i);
        const key = getLocalISO(d);
        report[period].trend.push({ key, label: `${d.getDate()}/${d.getMonth()+1}`, total: 0 });
      }
    };

    setupTrend('kunlik', 6);
    setupTrend('haftalik', 7);
    setupTrend('oylik', 29);

    if (archive.length === 0) return report;

    archive.forEach(order => {
      let price = Number(order.totalPrice || order.summa || order.total || 0);
      const orderItems = order.items || order.products || [];

      if (price === 0 && orderItems.length > 0) {
        price = orderItems.reduce((acc, it) => acc + (Number(it.narxi || it.price || 0) * Number(it.soni || it.quantity || 1)), 0);
      }

      const rawDate = order.date || order.createdAt || order.timestamp;
      let oDate = new Date(rawDate);
      const oKey = getLocalISO(isNaN(oDate.getTime()) ? new Date() : oDate);
      const diffDays = Math.round((new Date(todayStr).getTime() - new Date(oKey).getTime()) / (1000 * 60 * 60 * 24));

      const addToPeriod = (period) => {
        report[period].summa += price;
        report[period].count++;
        const point = report[period].trend.find(t => t.key === oKey);
        if (point) point.total += price;
        orderItems.forEach(it => {
          const name = it.nomi || it.name || it.title || "Mahsulot";
          report[period].items[name] = (report[period].items[name] || 0) + Number(it.soni || it.quantity || 1);
        });
      };

      if (oKey === todayStr) addToPeriod('kunlik');
      if (diffDays >= 0 && diffDays <= 7) addToPeriod('haftalik');
      if (diffDays >= 0 && diffDays <= 30) addToPeriod('oylik');
    });

    ['kunlik', 'haftalik', 'oylik'].forEach(p => {
      report[p].sorted = Object.entries(report[p].items)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty).slice(0, 10);
    });

    return report;
  }, [orders]); // orders o'zgarganda (yuklanganda) statistika yangilanadi

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
              <Sparkles size={14} className="text-emerald-500"/> {activeTab.replace('-', ' ')}
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
                  data={processedStats[statsSubTab]} 
                  subTab={statsSubTab} setSubTab={setStatsSubTab}
                  onDetailClick={() => setActiveTab('detailed-stats')} 
                />
              </motion.div>
            )}

            {activeTab === 'detailed-stats' && (
              <DetailedStats 
                data={processedStats[statsSubTab]} 
                subTab={statsSubTab} setSubTab={setStatsSubTab} 
                onBack={() => setActiveTab('stats')} 
              />
            )}

            {activeTab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                {products.map(p => <ProductCard key={p._id || p.id} item={p} onDelete={(id) => deleteItem(id, 'products')} />)}
              </div>
            )}

            {activeTab === 'orders' && <OrdersView orders={orders} onDelete={(id) => deleteItem(id, 'orders')} />}

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