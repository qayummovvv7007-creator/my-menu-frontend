const loadData = async () => {
  setLoading(true);
  try {
    const [prodRes, catRes] = await Promise.all([
      fetch("http://localhost:5000/api/products"),
      fetch("http://localhost:5000/api/categories")
    ]);

    // Agar resurs topilmasa, xatoni JSON qilmasdan oldin ko'ramiz
    if (!prodRes.ok || !catRes.ok) {
      throw new Error(`API xatosi: ${prodRes.status} yoki ${catRes.status}`);
    }

    const prodData = await prodRes.json();
    const catData = await catRes.json();

    setProducts(prodData);
    setCategories(catData);
  } catch (err) {
    console.error("Ma'lumot yuklashda xato bo'ldi:", err.message);
  } finally {
    setLoading(false);
  }
};