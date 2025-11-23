'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { filterItemsBySearch } from 'src/lib/searchFilter';

const getCustomerId = () => typeof window !== "undefined" && localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user')).id
  : null;

const CartPage = () => {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  
  const [cartItems, setCartItems] = useState([]);
  const [filteredCartItems, setFilteredCartItems] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Buy modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  
  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch cart for logged-in user
  const fetchCartItems = async () => {
  const customerId = getCustomerId();
  if (!customerId) return;
  setLoading(true); // show loading state
  const response = await fetch(`http://localhost:5000/cart/${customerId}`);
  const data = await response.json();
  setCartItems((data.items || []).filter(i => i.rprodId));
  setLoading(false);
};
  useEffect(() => {
  fetchCartItems();
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

    // Then filter by search query
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

  // Modal open (Buy)
  const openModal = (item) => {
    setModalItem(item);
    setModalQty(item.quantity || 1);
    setModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (item, e) => {
    e.stopPropagation();
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  // Handle delete from cart
  const handleDeleteFromCart = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`http://localhost:5000/cart/${deleteItem._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Remove from UI
        setCartItems(prev => prev.filter(item => item._id !== deleteItem._id));
        setDeleteModalOpen(false);
        setDeleteItem(null);
        alert('Item removed from cart!');
      } else {
        alert('Failed to remove item from cart.');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Error removing item from cart.');
    }
  };

  // Register purchase in cprods
  const handlePurchase = async (item, quantity) => {

    console.log('DEBUG:', quantity, item, item.rprodId?.numberOfItems);

  if (!quantity || quantity <= 0 || quantity > item.rprodId.numberOfItems) {
    alert('Invalid quantity');
    return;
  }

  setLoading(true);

  try {
    const resp = await fetch('http://localhost:5000/cprods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: getCustomerId(),
        retailerProdId: item.rprodId._id,  // RProd _id
        productName: item.rprodId.productName,
        description: item.rprodId.description,
        image: item.rprodId.image,
        category: item.rprodId.category,
        quantity: Number(quantity),
        pricePerItem: item.rprodId.sellingPrice,  // Retailer's selling price
        review: 0
      })
    });

    const data = await resp.json();

    // Handle errors (including insufficient balance)
    if (!resp.ok) {
      if (data.message === "Insufficient balance") {
        alert(
          `❌ Insufficient Balance!\n\n` +
          `Required: ₹${data.required?.toLocaleString()}\n` +
          `Available: ₹${data.available?.toLocaleString()}\n\n` +
          `Please add money to your wallet.`
        );
      } else {
        alert(data.message || 'Purchase failed');
      }
      setLoading(false);
      return;

    // Success! Remove from cart and refresh
    await fetch(`http://localhost:5000/cart/${item._id}`, { method: 'DELETE' });
    
    // Refresh cart items
    fetchCartItems();
    
    setLoading(false);
    if(resp.ok) {
    alert(
      `✅ Purchase Successful!\n\n` +
      `Item purchased from retailer\n` +
      `New Balance: ₹${data.newBalance?.toLocaleString()}`
    );
      setModalOpen(false);
    }

  } catch (err) {
    setLoading(false);
    console.error('Purchase error:', err);
    alert('Error: ' + (err.message || 'Purchase failed'));
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
                {/* Delete Icon - Top Right */}
                <button
                  onClick={(e) => openDeleteModal(item, e)}
                  className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all shadow-lg hover:shadow-xl"
                  title="Remove from cart"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

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
                  {/* Title */}
                  <h3
                    className="mt-4 mb-2 text-lg font-semibold text-black dark:text-white break-words leading-tight line-clamp-2"
                    style={{ minHeight: '3.5rem' }}
                  >
                    {item.rprodId.productName}
                  </h3>

                  {/* Description */}
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

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Button */}
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

      {/* Buy Modal */}
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
                <span className="bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full mb-5 inline-block w-fit">
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
                  onClick={() => handlePurchase(modalItem, modalQty)}
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deleteItem && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteModalOpen(false)}
          ></div>
          <div className="fixed z-60 top-0 left-0 w-full h-full flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-500 p-8 max-w-md w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-red-600 dark:text-red-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Remove Item?
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to remove <span className="font-semibold">{deleteItem.rprodId?.productName}</span> from your cart?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFromCart}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Remove
                </button>
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
