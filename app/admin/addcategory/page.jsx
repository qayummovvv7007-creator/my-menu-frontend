const loadData = async () => {
  setLoading(true);
  try {
    // localhost:5000 ni Render-dagi linkingizga almashtiring
    const [prodRes, catRes] = await Promise.all([
      fetch("https://my-menu-backend-1.onrender.com/api/products"),
      fetch("https://my-menu-backend-1.onrender.com/api/categories")
    ]);

    if (!prodRes.ok || !catRes.ok) {
      throw new Error(`API xatosi: ${prodRes.status} yoki ${catRes.status}`);
    }

    const prodData = await prodRes.json();
    const catData = await catRes.json();

    // Ma'lumot massiv ekanligini tekshirib olish (xavfsizlik uchun)
    setProducts(Array.isArray(prodData) ? prodData : []);
    setCategories(Array.isArray(catData) ? catData : []);
    
  } catch (err) {
    console.error("Ma'lumot yuklashda xato bo'ldi:", err.message);
    setProducts([]); // Xato bo'lsa bo'sh massiv qaytaramiz
  } finally {
    setLoading(false);
  }
};