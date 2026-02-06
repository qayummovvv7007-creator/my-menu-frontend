"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Package, ShoppingCart, PlusCircle, Layers, Trash2, Loader2, ChevronDown, ChevronUp, Phone, Image as ImageIcon, Tag, DollarSign, AlignLeft, Lock, User, LogOut, Settings, BarChart3, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false); // User menyusi uchun
  const menuRef = useRef(null); // Tashqariga bosilganda yopish uchun

  // --- ADMIN PAROLI ---
  const ADMIN_PASSWORD = "lorem_7007"; 

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [productForm, setProductForm] = useState({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
  const [newCatName, setNewCatName] = useState("");

  // Tashqariga bosilganda menyuni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem("is_admin_authenticated");
    if (authStatus === "true") setIsAdmin(true);
  }, []);

  const loadData = async (isSilent = false) => {
    if (!isAdmin) return;
    if (!isSilent) setLoading(true);
    try {
      const [prodRes, catRes, orderRes] = await Promise.all([
        fetch("https://my-menu-backend-1.onrender.com/api/products"),
        fetch("https://my-menu-backend-1.onrender.com/api/categories"),
        fetch("https://my-menu-backend-1.onrender.com/api/orders")
      ]);
      const pData = await prodRes.json();
      const cData = await catRes.json();
      const oData = await orderRes.json();

      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (err) { console.error(err); }
    if (!isSilent) setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
      const interval = setInterval(() => loadData(true), 10000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("is_admin_authenticated", "true");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("is_admin_authenticated");
    setShowUserMenu(false);
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetch(`https://my-menu-backend-1.onrender.com/api/${type}/${id}`, { method: "DELETE" });
      loadData(true);
    } catch (err) { console.error(err); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://my-menu-backend-1.onrender.com/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        setProductForm({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
        setActiveTab('products');
        loadData();
      }
    } catch (err) { alert("Xatolik!"); }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-black">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-[420px] text-center border border-slate-100">
          <div className="w-20 h-20 bg-[#167472]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#167472]" size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">Admin Panel</h1>
          <p className="text-slate-400 text-sm mb-8">Boshqaruv uchun parolni kiriting</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" className="w-full bg-slate-50 border-none p-5 rounded-2xl text-center text-2xl font-black outline-none focus:ring-2 ring-[#167472] transition-all" />
            <button className="w-full bg-[#167472] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#167472]/30 active:scale-95 transition-all">KIRISH</button>
            {error && <p className="text-red-500 font-bold text-xs">Parol noto'g'ri!</p>}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      
      {/* HEADER WITH USER MENU */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-5 sticky top-0 z-[150] border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight italic">MY<span className="text-[#167472]">MENU</span></h1>
           <p className="text-[10px] text-[#167472] font-bold uppercase tracking-widest">Administrator</p>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all hover:border-[#167472]/30"
          >
            <User size={24} className={showUserMenu ? "text-[#167472]" : ""} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tizim</p>
                  <p className="text-sm font-bold text-slate-800">Bosh Admin</p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <BarChart3 size={18} className="text-[#167472]" /> Statistika
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <Bell size={18} className="text-orange-500" /> Bildirishnomalar
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50">
                  <Settings size={18} className="text-slate-400" /> Sozlamalar
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                >
                  <LogOut size={18} /> Chiqish
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="p-4 overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {/* TOVARLAR TAB */}
          {activeTab === 'products' && (
            <motion.div key="prod" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800">Mahsulotlar <span className="text-[#167472]">({products.length})</span></h2>
                {loading && <Loader2 className="animate-spin text-[#167472]" size={18} />}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {products.map(item => (
                  <div key={item._id} className="bg-white p-3 rounded-[2rem] shadow-sm flex items-center gap-4 border border-slate-100 hover:shadow-md transition-shadow">
                    <img src={item.rasmi} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-inner" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#167472] font-black uppercase mb-1">{item.category}</p>
                      <h4 className="font-bold text-sm text-slate-800 truncate">{item.nomi}</h4>
                      <p className="text-sm font-black text-slate-900 mt-1">{Number(item.narxi).toLocaleString()} so'm</p>
                    </div>
                    <button className="mr-2 p-3 text-red-500 bg-red-50 rounded-2xl active:scale-90 transition-transform" onClick={() => deleteItem(item._id, 'products')}><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BUYURTMALAR TAB */}
          {activeTab === 'orders' && (
            <motion.div key="ord" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-black text-slate-800">Buyurtmalar <span className="text-orange-500">({orders.length})</span></h2>
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <ShoppingCart className="mx-auto text-slate-200 mb-2" size={48} />
                  <p className="text-slate-400 font-bold">Hozircha buyurtmalar yo'q</p>
                </div>
              ) : (
                [...orders].reverse().map((order) => (
                  <div key={order._id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-2xl"><Phone size={20} className="text-[#167472]" /></div>
                        <div className="flex-1 ml-4 text-black">
                          <h4 className="font-black text-lg leading-none mb-1">{order.phone}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{order.date}</p>
                        </div>
                        <span className="bg-[#167472] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">Yangi</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Jami:</span>
                        <span className="font-black text-[#167472] text-lg">{order.totalPrice?.toLocaleString()} so'm</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)} className="w-full py-4 bg-slate-50/50 flex justify-center items-center gap-2 text-[10px] font-black uppercase text-slate-500 border-t tracking-widest">
                      {expandedOrder === order._id ? "Yopish" : "Tarkibini ko'rish"}
                    </button>
                    <AnimatePresence>
                      {expandedOrder === order._id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-white px-5 pb-5 space-y-2 border-t pt-3 overflow-hidden">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-white">
                              <span className="text-black font-bold italic">{item.soni}x {item.nomi}</span>
                              <span className="font-black text-slate-900">{(item.soni * item.narxi).toLocaleString()} so'm</span>
                            </div>
                          ))}
                          <button onClick={() => deleteItem(order._id, 'orders')} className="w-full mt-4 bg-red-50 text-red-500 py-3 rounded-2xl font-black text-[10px] uppercase flex justify-center items-center gap-2 active:scale-95 transition-all">
                            <Trash2 size={14} /> Buyurtmani o'chirish
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* QO'SHISH TAB */}
          {activeTab === 'add-product' && (
            <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
              <h2 className="text-xl font-black text-slate-800">Yangi mahsulot</h2>
              <div className="space-y-4">
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input placeholder="Nomi" className="w-full bg-slate-50 p-4 pl-12 rounded-2xl text-black font-bold outline-none ring-[#167472] focus:ring-2" value={productForm.nomi} onChange={(e)=>setProductForm({...productForm, nomi: e.target.value})} />
                </div>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input placeholder="Tavsif" className="w-full bg-slate-50 p-4 pl-12 rounded-2xl text-black font-bold outline-none ring-[#167472] focus:ring-2" value={productForm.title} onChange={(e)=>setProductForm({...productForm, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="number" placeholder="Narxi" className="w-full bg-slate-50 p-4 pl-12 rounded-2xl text-black font-bold outline-none ring-[#167472] focus:ring-2" value={productForm.narxi} onChange={(e)=>setProductForm({...productForm, narxi: e.target.value})} />
                  </div>
                  <select className="w-full bg-slate-50 p-4 rounded-2xl text-black font-bold outline-none ring-[#167472] focus:ring-2" value={productForm.category} onChange={(e)=>setProductForm({...productForm, category: e.target.value})}>
                    <option value="">Bo'lim</option>
                    {categories.map(c => <option key={c._id} value={c.nomi}>{c.nomi}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input placeholder="Rasm URL" className="w-full bg-slate-50 p-4 pl-12 rounded-2xl text-black font-bold outline-none ring-[#167472] focus:ring-2" value={productForm.rasmi} onChange={(e)=>setProductForm({...productForm, rasmi: e.target.value})} />
                </div>
                <button onClick={handleAddProduct} className="w-full bg-[#167472] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-[#167472]/20 active:scale-95 transition-all">SAQLASH</button>
              </div>
            </motion.div>
          )}

          {/* BO'LIMLAR TAB */}
          {activeTab === 'categories' && (
            <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-black">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-xs uppercase tracking-widest mb-4">Yangi Bo'lim Qo'shish</h3>
                <div className="flex gap-2">
                  <input value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} placeholder="Masalan: Ichimliklar" className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none ring-[#167472] focus:ring-2 font-bold" />
                  <button onClick={async () => {
                    if(!newCatName) return;
                    await fetch("https://my-menu-backend-1.onrender.com/api/categories", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({nomi: newCatName}) });
                    setNewCatName(""); loadData();
                  }} className="bg-[#167472] text-white px-6 rounded-2xl font-black shadow-lg shadow-[#167472]/20 active:scale-90 transition-all">+</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(c => (
                  <div key={c._id} className="bg-white p-4 rounded-3xl flex justify-between items-center border border-slate-100 shadow-sm">
                    <span className="text-xs font-black uppercase tracking-tighter">{c.nomi}</span>
                    <button onClick={() => deleteItem(c._id, 'categories')} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 py-3 flex justify-around items-center z-[200] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={24}/>} label="Tovarlar" activeColor="text-[#167472] bg-green-50" />
        <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={24}/>} label="Zakazlar" activeColor="text-orange-500 bg-orange-50" />
        <NavButton active={activeTab === 'add-product'} onClick={() => setActiveTab('add-product')} icon={<PlusCircle size={24}/>} label="Yangi" activeColor="text-[#167472] bg-green-50" />
        <NavButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Layers size={24}/>} label="Bo'limlar" activeColor="text-[#167472] bg-green-50" />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, activeColor }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${active ? `${activeColor} scale-105` : 'text-slate-400'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default AdminPanel;