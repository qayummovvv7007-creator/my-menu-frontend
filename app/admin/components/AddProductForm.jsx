import React, { useState, useRef } from "react";
import { AlignLeft, DollarSign, Tag, UploadCloud, X } from "lucide-react";

const FormInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <div className="flex-1 space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest block">
      {label}
    </label>
    <div className="relative">
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
        size={17}
      />
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 py-4 px-4 pl-12 rounded-2xl font-semibold text-sm outline-none border-2 border-transparent focus:border-emerald-400 transition-all"
      />
    </div>
  </div>
);

export const AddProductForm = ({ form, setForm, categories, onSubmit }) => {
  const fileRef = useRef();
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setForm({ ...form, rasmi: url, _file: file });
  };

  const clearImage = () => {
    setPreviewUrl("");
    setForm({ ...form, rasmi: "", _file: null });
    fileRef.current.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 pb-20 px-4">
      {/* ── FORMA ── */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 italic mb-8">
          Yangi Taom <span className="text-emerald-500">Yaratish</span>
        </h2>

        <div className="space-y-6">
          {/* Nomi + Narxi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput
              label="Nomi"
              icon={AlignLeft}
              value={form.nomi}
              placeholder="Masalan: Osh, Lagman..."
              onChange={(v) => setForm({ ...form, nomi: v })}
            />
            <FormInput
              label="Narxi (UZS)"
              icon={DollarSign}
              type="number"
              placeholder="50000"
              value={form.narxi}
              onChange={(v) => setForm({ ...form, narxi: v })}
            />
          </div>

          {/* Kategoriya */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest block">
              Kategoriya
            </label>
            <select
              className="w-full bg-slate-50 py-4 px-4 rounded-2xl font-semibold text-sm outline-none border-2 border-transparent focus:border-emerald-400 transition-all appearance-none cursor-pointer"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Tanlang...</option>
              {categories.map((c) => (
                <option key={c._id} value={c.nomi}>
                  {c.nomi}
                </option>
              ))}
            </select>
          </div>

          {/* Tavsif */}
          <FormInput
            label="Tavsif"
            icon={Tag}
            value={form.title}
            placeholder="Qisqacha tavsif..."
            onChange={(v) => setForm({ ...form, title: v })}
          />

          {/* Rasm yuklash */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest block">
              Rasm yuklash
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden h-52">
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md hover:bg-red-50 transition-all"
                >
                  <X size={16} className="text-red-500" />
                </button>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
                  Rasm tanlandi ✓
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50 rounded-2xl h-44 flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-200 rounded-2xl flex items-center justify-center transition-all">
                  <UploadCloud size={26} className="text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">
                    Rasm tanlash uchun bosing
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    JPG, PNG, WEBP • Maks 5MB
                  </p>
                </div>
              </button>
            )}
          </div>

          <button
            onClick={onSubmit}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-600 transition-all active:scale-95 tracking-widest uppercase"
          >
            Taomni Qo'shish
          </button>
        </div>
      </div>

      {/* ── PREVIEW ── */}
      <div className="lg:sticky lg:top-28 h-fit">
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
          <div className="h-56 bg-slate-100 relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UploadCloud size={48} className="text-slate-200" />
              </div>
            )}
          </div>
          <div className="p-6">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
              {form.category || "Bo'lim"}
            </p>
            <h4 className="text-xl font-black text-slate-900 italic mb-1">
              {form.nomi || "Taom nomi"}
            </h4>
            <p className="text-slate-700 font-black">
              {Number(form.narxi || 0).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-400">so'm</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
