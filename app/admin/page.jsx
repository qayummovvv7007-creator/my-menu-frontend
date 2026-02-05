"use client";
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, PlusCircle, Layers, Trash2, Loader2, ChevronDown, ChevronUp, Phone, Image as ImageIcon, Tag, DollarSign, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  // Boshlang'ich qiymat doim bo'sh massiv [] bo'lishi shart
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [productForm, setProductForm] = useState({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
  const [newCatName, setNewCatName] = useState("");

  const loadData = async (isSilent = false) => {
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

      // MUHIM: Kelgan ma'lumot massiv ekanligini tekshirib keyin set qilamiz
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
      setOrders(Array.isArray(oData) ? oData : []);

    } catch (err) { 
      console.error("Xato:", err);
      // Xato bo'lsa massivlarni bo'shatib qo'yamiz, toki .map xato bermasin
      setProducts([]);
      setCategories([]);
      setOrders([]);
    }
    if (!isSilent) setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 10000);
    return () => clearInterval(interval);
  }, []);

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

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      const res = await fetch("https://my-menu-backend-1.onrender.com/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomi: newCatName })
      });
      if (res.ok) {
        setNewCatName("");
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetch(`https://my-menu-backend-1.onrender.com/api/${type}/${id}`, { method: "DELETE" });
      loadData(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      
      <header className="bg-white px-6 py-5 sticky top-0 z-[100] border-b border-slate-200 flex justify-between items-center shadow-sm backdrop-blur-md bg-white/80">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight">ADMIN PANEL</h1>
           <p className="text-[10px] text-[#167472] font-bold uppercase tracking-widest">Boshqaruv markazi</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <Loader2 className="animate-spin text-[#167472]" size={18} />}
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <Package size={20} className="text-[#167472]" />
          </div>
        </div>
      </header>

      <main className="p-4 overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800">Mahsulotlar <span className="text-[#167472]">({products.length})</span></h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {/* .map ishlatishdan oldin yana bir bor tekshiruv */}
                {Array.isArray(products) && products.length > 0 ? (
                  products.map(item => (
                    <div key={item._id} className="bg-white p-3 rounded-[2rem] shadow-sm flex items-center gap-4 border border-slate-100 hover:shadow-md transition-shadow">
                      <img src={item.rasmi} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-inner" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#167472] font-black uppercase tracking-tighter mb-1">{item.category}</p>
                        <h4 className="font-bold text-sm text-slate-800 truncate">{item.nomi}</h4>
                        <p className="text-sm font-black text-slate-900 mt-1">{Number(item.narxi).toLocaleString()} so'm</p>
                      </div>
                      <button className="mr-2 p-3 text-red-500 bg-red-50 rounded-2xl active:scale-90 transition-transform" onClick={() => deleteItem(item._id, 'products')}><Trash2 size={18}/></button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-10 text-sm italic">Mahsulotlar topilmadi...</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-black text-slate-800">Buyurtmalar <span className="text-orange-500">({orders.length})</span></h2>
              <div className="grid grid-cols-1 gap-4">
                {Array.isArray(orders) && [...orders].reverse().map((order) => (
                  <div key={order._id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                           <Phone size={20} className="text-[#167472]" />
                        </div>
                        <div className="flex-1 ml-4">
                          <h4 className="font-black text-slate-800 text-lg leading-none mb-1">{order.phone || "Raqamsiz"}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-[#167472] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Yangi</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Jami summa:</span>
                        <span className="font-black text-[#167472] text-lg">{order.totalPrice?.toLocaleString()} so'm</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="w-full py-3 bg-slate-50/50 flex items-center justify-center gap-2 text-[11px] font-black text-slate-500 border-t border-slate-100 uppercase tracking-widest"
                    >
                      {expandedOrder === order._id ? <><ChevronUp size={16}/> Yopish</> : <><ChevronDown size={16}/> Tarkibini ko'rish</>}
                    </button>

                    <AnimatePresence>
                      {expandedOrder === order._id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-white px-4 pb-5 overflow-hidden">
                          <div className="space-y-2 pt-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-white">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-[#167472] border border-slate-100">{item.soni}x</div>
                                <div className="flex-1">
                                  <p className="text-[13px] font-bold text-slate-800">{item.nomi}</p>
                                  <p className="text-[10px] text-slate-500">{item.narxi?.toLocaleString()} so'm</p>
                                </div>
                                <p className="text-xs font-black text-slate-900">{(item.soni * item.narxi).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => deleteItem(order._id, 'orders')} className="w-full mt-4 text-red-500 text-[11px] font-black flex justify-center items-center gap-2 bg-red-50 py-3 rounded-2xl active:scale-95 transition-transform uppercase tracking-widest"><Trash2 size={14}/> Buyurtmani o'chirish</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'add-product' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
              <h2 className="text-xl font-black text-slate-800 mb-2">Yangi mahsulot</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required placeholder="Nomi" className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#167472] transition-all" value={productForm.nomi} onChange={(e) => setProductForm({...productForm, nomi: e.target.value})} />
                </div>

                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required placeholder="Tavsif" className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#167472] transition-all" value={productForm.title} onChange={(e) => setProductForm({...productForm, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="number" placeholder="Narxi" className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#167472]" value={productForm.narxi} onChange={(e) => setProductForm({...productForm, narxi: e.target.value})} />
                  </div>
                  <select required className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#167472]" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} >
                    <option value="">Bo'lim</option>
                    {Array.isArray(categories) && categories.map(c => <option key={c._id} value={c.nomi}>{c.nomi}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required placeholder="Rasm URL" className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#167472]" value={productForm.rasmi} onChange={(e) => setProductForm({...productForm, rasmi: e.target.value})} />
                </div>
              </div>

              <button onClick={handleAddProduct} className="w-full bg-[#167472] text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-[#167472]/30 active:scale-95 transition-all text-lg tracking-tight">SAQLASH</button>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-xs">Yangi Bo'lim Qo'shish</h3>
                <div className="flex gap-2">
                  <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Masalan: Ichimliklar" className="flex-1 bg-slate-50 border-none p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#167472]" />
                  <button onClick={handleAddCategory} className="bg-[#167472] text-white px-6 rounded-2xl font-black active:scale-90 transition-all shadow-lg shadow-[#167472]/20"><PlusCircle size={24}/></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(categories) && categories.map(c => (
                  <div key={c._id} className="bg-white p-4 rounded-3xl flex justify-between items-center border border-slate-100 shadow-sm">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{c.nomi}</span>
                    <button onClick={() => deleteItem(c._id, 'categories')} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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