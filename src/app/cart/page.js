'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const getCustomerId = () => typeof window !== "undefined" && localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user')).id
  : null;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
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

  // Modal open
  const openModal = (item) => {
    setModalItem(item);
    setModalQty(item.quantity || 1);
    setModalOpen(true);
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
    }

    // Success! Remove from cart and refresh
    await fetch(`http://localhost:5000/cart/${item._id}`, { method: 'DELETE' });
    
    // Refresh cart items
    fetchCartItems();
    
    setLoading(false);
    
    alert(
      `✅ Purchase Successful!\n\n` +
      `Item purchased from retailer\n` +
      `New Balance: ₹${data.newBalance?.toLocaleString()}`
    );

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
          <p className="text-lg text-orange-100">Buy items from your cart</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* View Purchases Button */}
        <div className="flex justify-end mb-6">
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
          ) : cartItems.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-300">
              Your cart is empty.
            </div>
          ) : cartItems.map(item => (
            <div
              key={item._id}
              className={`
                bg-white dark:bg-gray-800 rounded-3xl flex flex-col shadow-xl p-0 
                transition-colors duration-200 border border-transparent
                hover:border-orange-400
                hover:bg-gray-50 dark:hover:bg-gray-900
                hover:shadow-[0_0_0_3px_rgba(255,133,0,0.14)]
                max-w-xs
                mx-auto
                cursor-pointer
              `}
              style={{
                minHeight: 470,
                border: "none",
                position: "relative",
                boxShadow: "0 8px 32px 0 rgba(31,38,135,0.07)"
              }}
              onClick={() => openModal(item)}
            >
              {/* Category sticker */}
              <span className="absolute top-5 left-5 bg-orange-500 text-white text-xs px-4 py-1 rounded-full shadow z-10">
                {item.rprodId.category || 'General'}
              </span>
              {/* Image section */}
              <div className="rounded-t-3xl flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6" style={{ minHeight: 220 }}>
                {item.rprodId.image ? (
                  <Image
                    src={item.rprodId.image}
                    alt={item.rprodId.productName}
                    width={240}
                    height={240}
                    className="object-contain rounded-2xl"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-gray-300 bg-gray-700 rounded-xl">
                    No image
                  </div>
                )}
              </div>
              {/* Card Body */}
              <div className="flex flex-col flex-1 px-8 pb-0 bg-white dark:bg-gray-800 rounded-b-3xl">
                <h3 className="mt-6 mb-5 text-2xl font-semibold text-black dark:text-white break-words leading-tight">
                  {item.rprodId.productName}
                </h3>
                <p className="text-md text-gray-700 dark:text-blue-100 mb-4">{item.rprodId.description}</p>
                <p className="mb-2 text-[20px]  text-orange-400">
                  Category: {item.rprodId.category || 'General'}
                </p>
                <div className="text-[30px] font-bold text-orange-300 mb-2">₹{item.rprodId.sellingPrice}</div>
                <div className="mb-2 text-[15px] text-green-400 font-medium">
                  In Stock: {item.rprodId.numberOfItems ?? 0} units
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-7">
                  Qty in cart: {item.quantity}
                </div>
                {/* Button at bottom */}
                <div className="flex-1"></div>
                <div className="w-full pb-5 flex justify-center">
                  <button
                    style={{ border: 'none', boxShadow: 'none' }}
                    className="w-full py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    onClick={e => { e.stopPropagation(); openModal(item); }}
                  >
                    Buy Now!
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && modalItem && modalItem.rprodId && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="fixed z-60 top-0 left-0 w-full h-full flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-400 max-w-3xl w-full flex flex-col md:flex-row overflow-hidden pointer-events-auto">
              <div className="md:w-1/2 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <div className="relative w-full h-72 md:h-96 flex items-center justify-center">
                  <Image src={modalItem.rprodId.image} alt={modalItem.rprodId.productName} fill className="object-contain rounded-xl" />
                </div>
              </div>
              <div className="md:w-1/2 w-full p-8 flex flex-col justify-center bg-white dark:bg-gray-900">
                <span className="bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full mb-5">
                  {modalItem.rprodId.category || 'General'}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{modalItem.rprodId.productName}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{modalItem.rprodId.description}</p>
                <p className="mb-3 text-[30px] text-orange-500 font-semibold">Price: ₹{modalItem.rprodId.sellingPrice}</p>
                <p className="mb-1 text-xs text-gray-400 mb-6">Stock: {modalItem.rprodId.numberOfItems} units</p>
                <div className="mb-4 flex items-center gap-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-200 mr-6">Quantity: </label>
                  <input type="number" min={1} max={modalItem.rprodId.numberOfItems}
                    value={modalQty} onChange={e => setModalQty(Number(e.target.value))}
                    className="px-4 py-2 rounded border-2 border-orange-400 w-24 bg-gray-100 dark:bg-gray-800 text-lg font-bold text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-7 mt-4">
                  <button onClick={() => setModalOpen(false)}
                          className="px-4 py-2 bg-red-700 dark:bg-red-700 text-white rounded">
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

      <Footer />
    </div>
  );
};

export default CartPage;
