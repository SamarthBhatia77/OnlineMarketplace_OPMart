'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';




/*
  Retailer Page - single-file (similar style & structure to your Wholesaler page)
  - Default view: Buy (shows all wholesaler products fetched from backend)
  - Sell view: shows retailer inventory stored in localStorage (persisted)
  - Dark mode: real toggle persisted in localStorage (applies 'dark' class to <html>)
  - Buy action: prompts for quantity, simulates purchase and adds to retailer inventory
  - Add listing: retailer can add items to their sell inventory via modal (image preview)
  - Search + quick stats (total units, inventory value, potential profit)
  - Styling aims to match OPMart hero + dark background + orange gradient
*/

const isDevPreview=true;

const RetailerPage = () => {
  const router = useRouter();

  // UI state
  const [mode, setMode] = useState('buy'); // 'buy' | 'sell'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // prefer OS setting if no saved value
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
  // If someone else logged in (wholesaler), route them accordingly
  if (u.role === 'wholesaler') {
    router.push('/wholesaler');
    return;
  }
  setUser(u);
  setLoading(false);
}, [router]);


  // --- load retailer inventory from localStorage
  useEffect(() => {
    const inv = localStorage.getItem('retailer_inventory');
    if (inv) {
      try {
        setInventory(JSON.parse(inv));
      } catch (e) {
        setInventory([]);
      }
    } else {
      setInventory([]);
    }
  }, []);

  // persist inventory whenever it changes
  useEffect(() => {
    localStorage.setItem('retailer_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // --- fetch wholesale items (show all wholesalers' items)
  // Backend endpoint used: http://localhost:5000/wprods   (if your server uses different path, adapt)
  useEffect(() => {
  const fetchAll = async () => {
    try {
      const res = await fetch('http://localhost:5000/wprods'); // expected to return { items: [...] }
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
    }
  };
  if (!loading) {
    fetchAll();
  }
}, [loading]);



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

  // Add listing to retailer inventory (manual Sell listing)
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

  // Quick buy from wholesale items: prompt qty and simulate purchase
  const handleBuy = (item) => {
  setBuyModalItem(item);
  setBuyQty(1);
  setBuySellingPrice('');
  setBuyModalOpen(true);
};


  // Delete from inventory
  const handleDelete = (id) => {
    if (!confirm('Delete this item permanently from your inventory?')) return;
    setInventory(prev => prev.filter(i => i._id !== id));
  };

  // Edit inventory item (opens modal with values)
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
    // remove old item, then open form — save will push updated
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
    // Update rprods in backend
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

    // Update frontend inventory (optimistic UI)
    const newEntry = {
      ...buyModalItem,
      _id: data.retailerProdId || `rprod-${Date.now()}`,
      numberOfItems: qty,
      sellingPrice: Number(buySellingPrice),
      purchasePrice: Number(buyModalItem.sellingPrice),
      sourceWholesalerId: buyModalItem.wholesalerId,
      purchasedAt: new Date().toISOString()
    };
    setInventory(prev => [newEntry, ...prev]);

    // Update the stock in wprods on backend
    await fetch(`http://localhost:5000/wprods/${buyModalItem._id}/reduce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty })
    });

    // Update UI for wholesaler items
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
  const profit = inventory.reduce((s, it) => s + ((Number(it.sellingPrice || 0) - Number(it.purchasePrice || 0)) * Number(it.numberOfItems || 0)), 0);

  // Filtered lists by search
  const filteredWholesale = wholesaleItems.filter(it => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (it.productName || it.title || '').toLowerCase().includes(q) ||
      (it.description || it.subtitle || '').toLowerCase().includes(q);
  });

  const filteredInventory = inventory.filter(it => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (it.productName || '').toLowerCase().includes(q) ||
      (it.description || '').toLowerCase().includes(q);
  });

  // loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // if user role mismatch or not logged in already handled in useEffect redirect
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
              <div className="text-xs text-gray-400">{inventory.length} unique products</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="text-sm text-gray-500 dark:text-gray-300">Inventory Value</div>
              <div className="text-3xl font-bold mt-2">₹{Math.round(invValue).toLocaleString()}</div>
              <div className="text-xs text-gray-400">At current selling prices</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="text-sm text-gray-500 dark:text-gray-300">Potential Profit</div>
              <div className="text-3xl font-bold text-green-500 mt-2">₹{Math.round(profit).toLocaleString()}</div>
              <div className="text-xs text-gray-400">If all items sold</div>
            </div>
          </div>
        )}

        {/* Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mode === 'buy' ? (
            filteredWholesale.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-300">No wholesaler items found.</div>
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
            filteredInventory.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-300">No inventory yet - buy items from other wholesalers to populate inventory.</div>
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
                        <p className="text-xs text-gray-400">Purchase: ₹{Number(it.purchasePrice || 0).toLocaleString()}</p>
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
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Product Name *</label>
                  <input name="productName" value={formData.productName} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Enter product name"/>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" placeholder="Describe your product"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Selling Price (₹) *</label>
                    <input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0.00"/>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Quantity *</label>
                    <input name="numberOfItems" type="number" value={formData.numberOfItems} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Units"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full mt-2" />
                  {imagePreview && (
                    <div className="mt-3">
                      <div className="relative w-40 h-40">
                        <Image src={imagePreview} alt="preview" fill className="object-contain rounded" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeForm} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded">Save</button>
                </div>
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
        {/* Left: Image */}
        <div className="md:w-1/2 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-4 md:py-8">
          <div className="relative w-full h-72 md:h-96 flex items-center justify-center">
            <Image
              src={buyModalItem.image || buyModalItem.thumbnail || ''}
              alt={buyModalItem.productName || ''}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
        {/* Right: Details + Actions */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-6 bg-white dark:bg-gray-900">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1">{buyModalItem.productName}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{buyModalItem.description}</p>
          <p className="text-orange-500 font-semibold mb-1">Market Price: ₹{buyModalItem.sellingPrice}</p>
          <p className="text-xs text-gray-400 mb-4">Available: {buyModalItem.numberOfItems} units</p>
          <form onSubmit={async (e) => { e.preventDefault(); await confirmBuy(); }}>
            <div className="mb-2">
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Buy Quantity</label>
              <input
                type="number"
                min="1"
                max={buyModalItem.numberOfItems}
                value={buyQty}
                onChange={e => setBuyQty(e.target.value)}
                className="w-full px-3 py-2 rounded border-2 border-orange-400 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Your Selling Price (per unit)</label>
              <input
                type="number"
                min="1"
                value={buySellingPrice}
                onChange={e => setBuySellingPrice(e.target.value)}
                className="w-full px-3 py-2 rounded border-2 border-orange-400 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setBuyModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium">Cancel</button>
              <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold">
                {modalLoading ? 'Buying...' : 'Buy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </>

)}

      <Footer />
    </div>
  );
};

export default RetailerPage;
