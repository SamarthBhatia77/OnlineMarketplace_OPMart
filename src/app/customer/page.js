'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { filterItemsBySearch } from 'src/lib/searchFilter';

const getCustomerId = () =>
  localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : 'demo-id';

const CustomerPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProd, setModalProd] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch all products
  useEffect(() => {
    fetch('http://localhost:5000/rprods')
      .then(r => r.json())
      .then(d => {
        setProducts(d.items || []);
        setLoading(false);
      });
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      const customerId = getCustomerId();
      if (!customerId || customerId === 'demo-id') return;

      try {
        const res = await fetch(`http://localhost:5000/cart/${customerId}`);
        if (res.ok) {
          const data = await res.json();
          const totalItems = (data.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
          setCartCount(totalItems);
        }
      } catch (err) {
        console.error('Error fetching cart count:', err);
      }
    };

    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Fetch ratings for all products
  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      for (const prod of products) {
        try {
          const res = await fetch(`http://localhost:5000/api/product-rating/${prod._id}`);
          if (res.ok) {
            const data = await res.json();
            ratings[prod._id] = data.averageRating;
          }
        } catch (err) {
          console.error(`Error fetching rating for ${prod._id}:`, err);
        }
      }
      setProductRatings(ratings);
    };

    if (products.length > 0) {
      fetchRatings();
    }
  }, [products]);

  // Listen for search query changes from Navbar
  useEffect(() => {
    const handleSearchChange = (event) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener('searchQueryChanged', handleSearchChange);
    return () => window.removeEventListener('searchQueryChanged', handleSearchChange);
  }, []);

  // Filter products by category AND search query
  useEffect(() => {
    let filtered = products;

    // First filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        prod => prod.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      filtered = filterItemsBySearch(filtered, searchQuery);
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, products, searchQuery]);

  const openModal = (prod) => {
    setModalProd(prod);
    setModalQty(1);
    setModalOpen(true);
  };

  const addToCart = async (prod, qty = 1) => {
    const customerId = getCustomerId();
    if (!customerId) {
      alert('Not logged in!');
      return;
    }
    const resp = await fetch('http://localhost:5000/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, rprodId: prod._id, quantity: qty })
    });
    const data = await resp.json();
    if (resp.ok) {
      alert('Item successfully added to cart!');
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      alert(data.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-4 tracking-wide">
            OPMart for Customers 🛒
          </h1>
          <p className="text-xl text-orange-100">
            {selectedCategory 
              ? `Discover ${selectedCategory} products` 
              : 'Discover & buy from handpicked retailers on OPMart!'}
          </p>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter and Cart Button Row */}
        <div className="mb-6 flex justify-between items-center">
          {/* Show active filter or search status */}
          <div>
            {selectedCategory ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Showing: {selectedCategory}
                </span>
                <button
                  onClick={() => window.location.href = '/customer'}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Clear Filter
                </button>
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Search results for: "{searchQuery}"
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* View Your Cart Button */}
          <button
            onClick={() => router.push('/cart')}
            className="px-6 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold shadow transition cursor-pointer flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            View Your Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <svg 
                className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">No products found</p>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery.trim() 
                  ? `No results for "${searchQuery}". Try different keywords.`
                  : selectedCategory 
                    ? `No ${selectedCategory} products available.`
                    : 'No products available at the moment.'}
              </p>
            </div>
          ) : (
            filteredProducts.map(prod => (
              <div
                key={prod._id}
                className={`
                  bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col
                  p-0
                  transition-colors duration-200
                  border border-transparent group
                  hover:border-orange-400
                  hover:bg-gray-50 dark:hover:bg-gray-900
                  hover:shadow-[0_0_0_3px_rgba(255,133,0,0.21)]
                  cursor-pointer
                `}
                style={{
                  minWidth: 275,
                  maxWidth: 340,
                  minHeight: 450,
                  position: 'relative'
                }}
                onClick={() => openModal(prod)}
              >
                {/* Image Section with Badge overlay */}
                <div
                  className="relative rounded-t-3xl flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6"
                  style={{ minHeight: 180, maxHeight: 180 }}
                >
                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-4 py-1 rounded-full shadow z-10">
                    {prod.category || 'General'}
                  </span>
                  {prod.image ? (
                    <Image
                      src={prod.image}
                      alt={prod.productName}
                      width={160}
                      height={160}
                      className="object-contain rounded-2xl"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-gray-300 bg-gray-700 rounded-xl">
                      No image
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-1 px-6 pb-4 bg-white dark:bg-gray-800 rounded-b-3xl">
                  {/* Title - Fixed height with line clamp */}
                  <h3
                    className="mt-4 mb-2 text-lg font-semibold text-black dark:text-white break-words leading-tight line-clamp-2"
                    style={{ minHeight: '3.5rem' }}
                  >
                    {prod.productName}
                  </h3>

                  {/* Description - Fixed height with line clamp */}
                  <p
                    className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2"
                    style={{ minHeight: '2.5rem' }}
                  >
                    {prod.description}
                  </p>

                  {/* Rating */}
                  {productRatings[prod._id] !== undefined && productRatings[prod._id] >= 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500 font-bold text-lg">
                        {productRatings[prod._id].toFixed(1)}
                      </span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-yellow-500" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-[22px] font-bold text-orange-300 mb-2">
                    ₹{prod.sellingPrice}
                  </div>

                  {/* Stock */}
                  <div className="mb-4 text-[15px] text-green-400 font-bold">
                    In Stock: {prod.numberOfItems ?? 0} units
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1" />

                  {/* Button at bottom */}
                  <div className="w-full flex justify-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        addToCart(prod, 1);
                      }}
                      className="w-full cursor-pointer py-2 rounded-xl text-md font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition"
                      style={{ boxShadow: 'none', border: 'none' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerPage;
