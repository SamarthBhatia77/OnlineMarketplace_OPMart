'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { filterItemsBySearch } from 'src/lib/searchFilter';

const isDevPreview=true;

const RetailerPage = () => {
  const router = useRouter();

  // UI state
  const [mode, setMode] = useState('buy'); // 'buy' | 'sell'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [wholesaleLoading, setWholesaleLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalItem, setBuyModalItem] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [buySellingPrice, setBuySellingPrice] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // wholesale items (from backend)
  const [wholesaleItems, setWholesaleItems] = useState([]);

  // retailer inventory (localStorage key: 'retailer_inventory')
  const [inventory, setInventory] = useState([]);

  // modal / form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    sellingPrice: '',
    numberOfItems: '',
    category: '',
    imageFile: null
  });

  const [profitEarned, setProfitEarned] = useState(0);

  useEffect(() => {
    const fetchProfit = async () => {
      if (!user?.id || mode !== "sell") return;
      try {
        const resp = await fetch(`http://localhost:5000/cprods/retailer/${user.id}/profit`);
        if (!resp.ok) throw new Error("Could not fetch profit");
        const data = await resp.json();
        setProfitEarned(data.profit || 0);
      } catch (e) {
        setProfitEarned(0);
      }
    };
    fetchProfit();
  }, [user, mode]);

  // search/filter
  const [searchQuery, setSearchQuery] = useState('');

  // categories (same as wholesaler)
  const categories = [
    'Electronics','Gaming','Groceries','Fashion','Accessories','Music',
    'Home','Sports','Books','Beauty','Toys','Health'
  ];

  // 1. First useEffect — sets user when page loads (already exists)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/signin');
      return;
    }

    const userData = JSON.parse(userStr);

    if (userData.role !== 'retailer') {
      if (userData.role === 'wholesaler') {
        router.push('/wholesaler');
      } else {
        router.push('/');
      }
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  // --- THEME / DARK MODE (real)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }
    } catch (e) {
      // ignore for SSR safety
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  // --- USER CHECK (same pattern as wholesaler)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/signin');
      return;
    }
    const u = JSON.parse(userStr);
    if (u.role === 'wholesaler') {
      router.push('/wholesaler');
      return;
    }
    setUser(u);
    setLoading(false);
  }, [router]);

  // --- load retailer inventory from backend
  useEffect(() => {
    const fetchRetailerInventory = async () => {
      setInventoryLoading(true); // Start loader
      if (!user || !user.id) {
        setInventoryLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/rprods/retailer/${user.id}`);
        if (!res.ok) {
          console.warn('Failed to fetch retailer inventory');
          setInventory([]);
          setInventoryLoading(false);
          return;
        }
        const data = await res.json();
        setInventory(data.items || []);
      } catch (err) {
        console.error('Error fetching retailer inventory:', err);
        setInventory([]);
      } finally {
        setInventoryLoading(false); // End loader
      }
    };

    if (user) fetchRetailerInventory();
  }, [user]);

  // --- fetch wholesale items (show all wholesalers' items)
  useEffect(() => {
    const fetchAll = async () => {
      setWholesaleLoading(true); // Start loading
      try {
        const res = await fetch('http://localhost:5000/wprods');
        if (!res.ok) {
          console.warn('wprods fetch failed with status', res.status);
          setWholesaleItems([]);
          return;
        }
        const data = await res.json();
        setWholesaleItems(data.items || data || []);
      } catch (err) {
        console.error('Error fetching wholesale items:', err);
        setWholesaleItems([]);
      } finally {
        setWholesaleLoading(false); // Stop loading
      }
    };
    if (!loading) {
      fetchAll();
    }
  }, [loading]);

  useEffect(() => {
    const handleSearchChange = (event) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener('searchQueryChanged', handleSearchChange);
    return () => window.removeEventListener('searchQueryChanged', handleSearchChange);
  }, []);

  // --- handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFormData(prev => ({ ...prev, imageFile: f }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setImagePreview(null);
    setFormData({
      productName: '',
      description: '',
      sellingPrice: '',
      numberOfItems: '',
      category: '',
      imageFile: null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.sellingPrice || !formData.numberOfItems) {
      alert('Please fill product name, selling price and quantity.');
      return;
    }
    const newItem = {
      _id: `local-${Date.now()}`,
      productName: formData.productName,
      description: formData.description,
      sellingPrice: Number(formData.sellingPrice),
      numberOfItems: Number(formData.numberOfItems),
      category: formData.category || 'General',
      image: imagePreview || null,
      purchasePrice: 0,
      createdAt: new Date().toISOString()
    };
    setInventory(prev => [newItem, ...prev]);
    closeForm();
  };

  const handleBuy = (item) => {
    setBuyModalItem(item);
    setBuyQty(1);
    setBuySellingPrice('');
    setBuyModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this item permanently from your inventory?')) return;
    setInventory(prev => prev.filter(i => i._id !== id));
  };

  const handleEdit = (it) => {
    setFormData({
      productName: it.productName || '',
      description: it.description || '',
      sellingPrice: it.sellingPrice || '',
      numberOfItems: it.numberOfItems || '',
      category: it.category || '',
      imageFile: null
    });
    setImagePreview(it.image || null);
    setInventory(prev => prev.filter(p => p._id !== it._id));
    setShowAddForm(true);
  };

  const confirmBuy = async () => {
    if (!buyQty || !buySellingPrice || !buyModalItem) return;
    const qty = Number(buyQty);
    if (isNaN(qty) || qty <= 0 || qty > Number(buyModalItem.numberOfItems)) {
      alert('Invalid quantity');
      return;
    }
    setModalLoading(true);
    try {
      const resp = await fetch('http://localhost:5000/rprods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: user.id,
          wholesalerProdId: buyModalItem._id,
          productName: buyModalItem.productName,
          description: buyModalItem.description,
          category: buyModalItem.category,
          image: buyModalItem.image,
          marketPrice: buyModalItem.sellingPrice,
          numberOfItems: qty,
          sellingPrice: Number(buySellingPrice)
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data.message || 'Failed to buy');
        setModalLoading(false);
        return;
      }
      const invRes = await fetch(`http://localhost:5000/rprods/retailer/${user.id}`);
      const invData = await invRes.json();
      setInventory(invData.items || []);
      await fetch(`http://localhost:5000/wprods/${buyModalItem._id}/reduce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty })
      });
      setWholesaleItems(prev => prev.map(w =>
        w._id === buyModalItem._id
          ? { ...w, numberOfItems: w.numberOfItems - qty }
          : w
      ));
      setBuyModalOpen(false);
      setModalLoading(false);
      alert('Item bought and added to Sell Inventory!');
    } catch (err) {
      setModalLoading(false);
      alert('Error: ' + (err.message || err));
    }
  };

  // Stats
  const totalUnits = inventory.reduce((s, it) => s + Number(it.numberOfItems || 0), 0);
  const invValue = inventory.reduce((s, it) => s + (Number(it.sellingPrice || 0) * Number(it.numberOfItems || 0)), 0);

  // Filtered lists
  const filteredWholesale = searchQuery.trim() 
    ? filterItemsBySearch(wholesaleItems, searchQuery)
    : wholesaleItems;

  const filteredInventory = searchQuery.trim()
    ? filterItemsBySearch(inventory, searchQuery)
    : inventory;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-4">OPMart for Retailers 💵</h1>
          <p className="text-xl text-orange-100">Buy from wholesalers and manage your sell inventory</p>
        </div>
      </section>

      {/* Controls + Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Tabs */}
          <div className="inline-flex items-center rounded-full bg-white/90 dark:bg-gray-800/80 p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('buy')}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${mode === 'buy' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow' : 'text-gray-700 dark:text-gray-200'}`}
            >
              Buy from Wholesalers
            </button>
            <button
              onClick={() => setMode('sell')}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${mode === 'sell' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow' : 'text-gray-700 dark:text-gray-200'}`}
            >
              Sell Inventory
            </button>
          </div>
          <div className="flex items-center gap-3">
            {searchQuery.trim() && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {mode === 'buy' ? filteredWholesale.length : filteredInventory.length} results
              </span>
            )}
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={mode === 'buy' ? 'Search wholesalers...' : 'Search your inventory...'}
                className="px-4 py-2 rounded-lg border border-[#f34100] dark:border-[#f34100] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 w-72 focus:outline-none focus:ring-1 focus:ring-[#f34100]"
              />
            </div>
          </div>
        </div>

        {/* Dashboard stats (only shown in Sell mode) */}
        {mode === 'sell' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="text-sm text-gray-500 dark:text-gray-300">Total Units</div>
              <div className="text-3xl font-bold mt-2">{totalUnits.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-3">{inventory.length} unique products</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="text-sm text-gray-500 dark:text-gray-300">Inventory Value</div>
              <div className="text-3xl font-bold mt-2">₹{Math.round(invValue).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-3">At current selling prices</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="text-sm text-gray-500 dark:text-gray-300 ">Profit Earned</div>
              <div className="text-3xl font-bold text-green-500 mt-2">₹{Math.round(profitEarned).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-3">From completed sales</div>
            </div>
          </div>
        )}

        {/* Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mode === 'buy' ? (
            wholesaleLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Loading wholesale items...</p>
              </div>
            ) : filteredWholesale.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <svg 
                  className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  {searchQuery.trim() ? 'No items found' : 'No wholesaler items available'}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery.trim() 
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : 'Check back later for new items.'}
                </p>
              </div>
            ) : (
              filteredWholesale.map((it) => (
                <div key={it._id || it.id || it.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  <div className="relative h-56 bg-gray-100 dark:bg-gray-700">
                    {it.image || it.thumbnail ? (
                      <Image src={it.image || it.thumbnail} alt={it.productName || it.title} fill className="object-contain p-4" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {it.productName || it.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{it.description || it.subtitle}</p>
                    <p className="text-xs text-orange-400 mt-1">Category: {it.category || it.badge || 'General'}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div>
                        <p className="text-orange-400 font-bold text-lg">₹{Number(it.sellingPrice ?? it.price ?? 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Qty: {Number(it.numberOfItems ?? it.stock ?? 0).toLocaleString()} units</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleBuy(it)} className="px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold text-sm">Buy</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            inventoryLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Loading inventory...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <svg 
                  className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {searchQuery.trim() ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  )}
                </svg>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  {searchQuery.trim() ? 'No items found' : 'No inventory yet'}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery.trim() 
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : 'Buy items from wholesalers to populate inventory.'}
                </p>
              </div>
            ) : (
              filteredInventory.map((it) => (
                <div key={it._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                  <div className="relative h-56 bg-gray-100 dark:bg-gray-700">
                    {it.image ? (
                      <Image src={it.image} alt={it.productName} fill className="object-contain p-4" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{it.productName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{it.description}</p>
                    <p className="text-xs text-orange-400 mt-1">Category: {it.category}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div>
                        <p className="text-orange-400 font-bold text-lg">₹{Number(it.sellingPrice).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Qty: {Number(it.numberOfItems).toLocaleString()} units</p>
                      </div>
                      <div className="flex flex-col gap-2">
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md z-50" onClick={closeForm} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.productName ? 'Edit Listing' : 'Add Listing'}</h3>
                <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* ...form fields as before... */}
              </form>
            </div>
          </div>
        </>
      )}

      {buyModalOpen && buyModalItem && (
        <>
          {/* Proper blur on the background */}
          <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 transition-all duration-200" onClick={() => setBuyModalOpen(false)} />

          {/* Horizontal modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border-2 border-orange-500 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden pointer-events-auto">
              {/* ...modal code as before... */}
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default RetailerPage;
