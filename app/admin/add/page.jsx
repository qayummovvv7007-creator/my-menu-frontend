"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

 function AddProduct() {
  const [form, setForm] = useState({ nomi: "", title: "", narxi: "", category: "", rasmi: "" });
  const [categories, setCategories] = useState([]); // Bazadan keladigan kategoriyalar
  const router = useRouter();

  // Sahifa yuklanganda kategoriyalarni bazadan olamiz
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Kategoriyalarni yuklashda xato:", err));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    router.push("/admin");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg mt-5 mb-20">
      <h2 className="text-xl font-bold mb-5 text-slate-800">Yangi Mahsulot</h2>
      <form onSubmit={handleAdd} className="space-y-4 text-sm">
        <input placeholder="Nomi" className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500" 
          onChange={(e) => setForm({...form, nomi: e.target.value})} required />
        
        <input placeholder="Qisqacha title" className="w-full border p-3 rounded-xl outline-none" 
          onChange={(e) => setForm({...form, title: e.target.value})} required />

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Narxi" className="border p-3 rounded-xl outline-none" 
            onChange={(e) => setForm({...form, narxi: e.target.value})} required />
          
          {/* DINAMIK SELECT */}
          <select 
            className="border p-3 rounded-xl outline-none bg-white" 
            value={form.category}
            onChange={(e) => setForm({...form, category: e.target.value})} 
            required
          >
            <option value="">Kategoriya tanlang</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.nomi}>
                {cat.nomi}
              </option>
            ))}
          </select>
        </div>

        <input placeholder="Rasm URL" className="w-full border p-3 rounded-xl outline-none" 
          onChange={(e) => setForm({...form, rasmi: e.target.value})} required />

        <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl active:scale-95 transition">
          Saqlash
        </button>
      </form>
    </div>
  );
}

export default AddProduct