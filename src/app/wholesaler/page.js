'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';



const WholesalerPage = () => {
  const router = useRouter();
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [items, setItems] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    sellingPrice: '',
    numberOfItems: '',
    category: '',
    image: null,
    imageBase64: "",
  });

  // Same categories as navbar
  const categories = [
    'Electronics',
    'Gaming',
    'Groceries',
    'Fashion',
    'Accessories',
    'Music',
    'Home',
    'Sports',
    'Books',
    'Beauty',
    'Toys',
    'Health'
  ];

  // Quantity options
  const quantityOptions = [100, 300, 500, 1000, 5000];

  // Check authentication and role
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      router.push('/signin');
      return;
    }
    
    const userData = JSON.parse(userStr);
    
    if (userData.role !== 'wholesaler') {
      if (userData.role === 'retailer') {
        router.push('/retailer');
      } else {
        router.push('/');
      }
      return;
    }
    
    setUser(userData);
    setLoading(false);
  }, [router]);


  
  // Fetch all items for this wholesaler
// Fetch all items for this wholesaler
useEffect(() => {
  const fetchItems = async () => {
    try {
      if (!user || !user.id) return;   // prevent wrong fetch
      const res = await fetch(`http://localhost:5000/wprods/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        console.error("Failed to fetch items:", data.message);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  if (user && user.id) {
    fetchItems();
  }
}, [user]);




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData(prev => ({
      ...prev,
      image: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result; // data:image/...;base64,...
      setImagePreview(base64);
      setFormData(prev => ({
        ...prev,
        imageBase64: base64,
      }));
    };
    reader.readAsDataURL(file);
  }
};


  

  const handleSubmit = async (e) => {
    console.log("handleSubmit fired");
  e.preventDefault();
  if (!user) return;

  console.log("Submitting formData:", formData, "user:", user); // 👈

  if (!formData.imageBase64) {
    alert("Please select an image");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/wprods/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wholesalerId: user.id || user._id,  // 👈 ensure correct field
        productName: formData.productName,
        description: formData.description,
        sellingPrice: formData.sellingPrice,
        numberOfItems: formData.numberOfItems,
        category: formData.category,
        base64Image: formData.imageBase64,
      }),
    });
    // ...


    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to add item");
      return;
    }

    // Add the new item to the grid immediately
    setItems((prev) => [data.item, ...prev]);

    setShowAddItemForm(false);
    setFormData({
      productName: "",
      description: "",
      sellingPrice: "",
      numberOfItems: "",
      category: "",
      image: null,
      imageBase64: "",
    });
    setImagePreview(null);
  } catch (err) {
    console.error("Create item error:", err);
    alert("Something went wrong while adding the item");
  }
};



  const closeForm = () => {
    setShowAddItemForm(false);
    setImagePreview(null);
    setFormData({
      productName: '',
      description: '',
      sellingPrice: '',
      numberOfItems: '',
      category: '',
      image: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'wholesaler') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-4">
            OPMart for Wholesalers 💰
          </h1>
          <p className="text-xl text-orange-100">
            Browse your items or add more to sell, start the selling chain!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Items
          </h2>
          <button
            onClick={() => setShowAddItemForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
  <div className="text-center py-20">
    <div className="mb-8">
      <svg
        className="w-24 h-24 mx-auto text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      No Items Yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-8">
      Get started by adding your first item to sell
    </p>
    <button
      onClick={() => setShowAddItemForm(true)}
      className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all duration-300"
    >
      Add Your First Item
    </button>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {items.map((item) => (
      <div
        key={item._id}
        className="bg-[#111827] rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="relative h-56 w-full bg-gray-800">
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="text-lg font-semibold text-white">
            {item.productName}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {item.description}
          </p>

          <p className="text-xs text-orange-400 mt-1">
            Category: {item.category}
          </p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <div>
              <p className="text-orange-400 font-bold text-lg">
                ₹{Number(item.sellingPrice).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                Qty: {Number(item.numberOfItems).toLocaleString()} units
              </p>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

      </div>

      {/* Add Item Modal/Form */}
      {showAddItemForm && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-md z-50"
            onClick={closeForm}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Item
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Describe your product in detail"
                  />
                </div>

                {/* Price and Quantity Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Number of Items (Dropdown) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Quantity (Units) *
                    </label>
                    <select
                      name="numberOfItems"
                      value={formData.numberOfItems}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select quantity</option>
                      {quantityOptions.map(qty => (
                        <option key={qty} value={qty}>
                          {qty.toLocaleString()} units
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Product Image *
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      className="hidden"
                    />
                    
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative w-48 h-48 mx-auto">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <label
                          htmlFor="image-upload"
                          className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors"
                        >
                          Change Image
                        </label>
                      </div>
                    ) : (
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Click to upload product image
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PNG, JPG or WEBP (Max 5MB)
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default WholesalerPage;
