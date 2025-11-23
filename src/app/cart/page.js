'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { filterItemsBySearch } from 'src/lib/searchFilter';

const getCustomerId = () =>
  typeof window !== 'undefined' && localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : null;

const CartPage = () => {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  
  const [cartItems, setCartItems] = useState([]);
  const [filteredCartItems, setFilteredCartItems] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch cart for logged-in user
  useEffect(() => {
    const customerId = getCustomerId();
    if (!customerId) return;
    fetch(`http://localhost:5000/cart/${customerId}`)
      .then(r => r.json())
      .then(d => {
        setCartItems((d.items || []).filter(i => i.rprodId));
        setLoading(false);
      });
  }, []);

  // Fetch ratings for all cart items
  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      for (const item of cartItems) {
        if (item.rprodId?._id) {
          try {
            const res = await fetch(`http://localhost:5000/api/product-rating/${item.rprodId._id}`);
            if (res.ok) {
              const data = await res.json();
              ratings[item.rprodId._id] = data.averageRating;
            }
          } catch (err) {
            console.error(`Error fetching rating for ${item.rprodId._id}:`, err);
          }
        }
      }
      setProductRatings(ratings);
    };

    if (cartItems.length > 0) {
      fetchRatings();
    }
  }, [cartItems]);

  // Listen for search query changes from Navbar
  useEffect(() => {
    const handleSearchChange = (event) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener('searchQueryChanged', handleSearchChange);
    return () => window.removeEventListener('searchQueryChanged', handleSearchChange);
  }, []);

  // Filter cart items by category AND search query
  useEffect(() => {
    let filtered = cartItems;

    // First filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        item => item.rprodId?.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Then filter by search query (search in the rprodId object)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const productName = item.rprodId?.productName?.toLowerCase() || '';
        const description = item.rprodId?.description?.toLowerCase() || '';
        const category = item.rprodId?.category?.toLowerCase() || '';
        
        return productName.includes(query) || 
               description.includes(query) || 
               category.includes(query);
      });
    }

    setFilteredCartItems(filtered);
  }, [selectedCategory, cartItems, searchQuery]);

  // Modal open
  const openModal = (item) => {
    setModalItem(item);
    setModalQty(item.quantity || 1);
    setModalOpen(true);
  };

  // Register purchase in cprods
  const handlePurchase = async () => {
    if (!modalItem || !modalItem.rprodId || !modalQty) return;

    const customerId = getCustomerId();
    const rprod = modalItem.rprodId;
    const body = {
      customerId,
      productId: rprod._id,
      productName: rprod.productName,
      description: rprod.description,
      image: rprod.image,
      category: rprod.category,
      quantity: Number(modalQty),
      pricePerItem: rprod.sellingPrice,
      totalPrice: Number(modalQty) * rprod.sellingPrice,
      review: 0
    };
    const resp = await fetch('http://localhost:5000/cprods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (resp.ok) {
      alert('Purchased successfully!');
      setModalOpen(false);
    } else {
      alert('There was an error processing the purchase.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-2">Your Cart 🛒</h1>
          <p className="text-lg text-orange-100">
            {selectedCategory 
              ? `${selectedCategory} items in your cart` 
              : 'Buy items from your cart'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* View Purchases Button and Category/Search Filter */}
        <div className="flex justify-between items-center mb-6">
          {/* Show active filter or search status */}
          <div>
            {selectedCategory ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Showing: {selectedCategory}
                </span>
                <button
                  onClick={() => window.location.href = '/cart'}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Show All Items
                </button>
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Search results: "{searchQuery}"
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredCartItems.length} {filteredCartItems.length === 1 ? 'item' : 'items'})
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          
          <button
            onClick={() => router.push('/buy')}
            className="px-6 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold shadow transition cursor-pointer"
          >
            View Your Orders
          </button>
        </div>

        {/* Cart items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredCartItems.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <svg 
                className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                {searchQuery.trim() ? 'No items found' : 'Your cart is empty'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery.trim() 
                  ? `No cart items match "${searchQuery}". Try different keywords.`
                  : selectedCategory 
                    ? `No ${selectedCategory} items in your cart.`
                    : 'Add some products to get started!'}
              </p>
            </div>
          ) : (
            filteredCartItems.map(item => (
              <div
                key={item._id}
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
                onClick={() => openModal(item)}
              >
                {/* Category sticker */}
                <div
                  className="relative rounded-t-3xl flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6"
                  style={{ minHeight: 180, maxHeight: 180 }}
                >
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-4 py-1 rounded-full shadow z-10">
                    {item.rprodId.category || 'General'}
                  </span>
                  {item.rprodId.image ? (
                    <Image
                      src={item.rprodId.image}
                      alt={item.rprodId.productName}
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
                    {item.rprodId.productName}
                  </h3>

                  {/* Description - Fixed height with line clamp */}
                  <p
                    className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2"
                    style={{ minHeight: '2.5rem' }}
                  >
                    {item.rprodId.description}
                  </p>

                  {/* Rating */}
                  {productRatings[item.rprodId._id] !== undefined && productRatings[item.rprodId._id] > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500 font-bold text-lg">
                        {productRatings[item.rprodId._id].toFixed(1)}
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
                    ₹{item.rprodId.sellingPrice}
                  </div>

                  {/* Stock */}
                  <div className="mb-2 text-[15px] text-green-400 font-bold">
                    In Stock: {item.rprodId.numberOfItems ?? 0} units
                  </div>

                  {/* Qty in cart */}
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-4">
                    Qty in cart: {item.quantity}
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1" />

                  {/* Button at bottom */}
                  <div className="w-full flex justify-center">
                    <button
                      style={{ border: 'none', boxShadow: 'none' }}
                      className="w-full cursor-pointer py-2 rounded-xl text-md font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition"
                      onClick={e => {
                        e.stopPropagation();
                        openModal(item);
                      }}
                    >
                      Buy Now!
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && modalItem && modalItem.rprodId && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="fixed z-60 top-0 left-0 w-full h-full flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-400 max-w-3xl w-full flex flex-col md:flex-row overflow-hidden pointer-events-auto">
              <div className="md:w-1/2 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <div className="relative w-full h-72 md:h-96 flex items-center justify-center">
                  <Image
                    src={modalItem.rprodId.image}
                    alt={modalItem.rprodId.productName}
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              </div>
              <div className="md:w-1/2 w-full p-8 flex flex-col justify-center bg-white dark:bg-gray-900">
                <span className="bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full mb-5">
                  {modalItem.rprodId.category || 'General'}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {modalItem.rprodId.productName}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {modalItem.rprodId.description}
                </p>

                {/* Rating in modal */}
                {productRatings[modalItem.rprodId._id] !== undefined && productRatings[modalItem.rprodId._id] > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500 font-bold text-lg">
                      {productRatings[modalItem.rprodId._id].toFixed(1)}
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

                <p className="mb-3 text-[30px] text-orange-500 font-semibold">
                  Price: ₹{modalItem.rprodId.sellingPrice}
                </p>
                <p className="mb-1 text-xs text-gray-400 mb-6">
                  Stock: {modalItem.rprodId.numberOfItems} units
                </p>
                <div className="mb-4 flex items-center gap-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-200 mr-6">
                    Quantity:{' '}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={modalItem.rprodId.numberOfItems}
                    value={modalQty}
                    onChange={e => setModalQty(Number(e.target.value))}
                    className="px-4 py-2 rounded border-2 border-orange-400 w-24 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-7 mt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-red-700 dark:bg-red-700 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded font-semibold"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default CartPage;
