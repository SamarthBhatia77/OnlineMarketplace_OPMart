'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';

const getCustomerId = () =>
  localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : 'demo-id';

const CustomerPage = () => {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProd, setModalProd] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/rprods')
      .then(r => r.json())
      .then(d => {
        setProducts(d.items || []);
        setLoading(false);
      });
  }, []);

  const openModal = (prod) => {
    setModalProd(prod); setModalQty(1); setModalOpen(true);
  };

  const addToCart = async (prod, qty = 1) => {
    const customerId = getCustomerId();
    if (!customerId) { alert('Not logged in!'); return; }
    const resp = await fetch('http://localhost:5000/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, rprodId: prod._id, quantity: qty })
    });
    const data = await resp.json();
    if (resp.ok) alert("Item successfully added to cart!");
    else alert(data.message || "Failed to add to cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-4 tracking-wide">OPMart for Customers 🛒</h1>
          <p className="text-xl text-orange-100">Discover & buy from retailers on OPMart!</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-300">No retailer items found.</div>
          ) : products.map(prod => (
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
    minHeight: 400,
    position: "relative"
  }}
  onClick={() => openModal(prod)}
>
  {/* Image Section with Badge overlay */}
  <div className="relative rounded-t-3xl flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6" style={{ minHeight: 150 }}>
    {/* Badge */}
    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-4 py-1 rounded-full shadow z-10">
      {prod.category || 'General'}
    </span>
    {prod.image ? (
      <Image
        src={prod.image}
        alt={prod.productName}
        width={240}
        height={240}
        className="object-contain rounded-2xl"
      />
    ) : (
      <div className="w-24 h-24 flex items-center justify-center text-gray-300 bg-gray-700 rounded-xl">
        No image
      </div>
    )}
  </div>
  {/* Card Body */}
  <div className="flex flex-col flex-1 px-6 pb-0 bg-white dark:bg-gray-800 rounded-b-3xl">
    <h3 className="mt-4 mb-2 text-lg font-semibold text-black dark:text-white break-words leading-tight">{prod.productName}</h3>
    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{prod.description}</p>
    <div className="text-[22px] font-bold text-orange-300 mb-1">₹{prod.sellingPrice}</div>
    <div className="mb-7 text-[15px] text-green-400 font-bold">In Stock: {prod.numberOfItems ?? 0} units</div>
    <div className="flex-1" />
    <div className="w-full pb-4 flex justify-center">
      <button
        onClick={e => { e.stopPropagation(); addToCart(prod, 1); }}
        className="w-full cursor-pointer py-2 rounded-xl text-md font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white"
        style={{ boxShadow: 'none', border: 'none' }}
      >
        Add to Cart
      </button>
    </div>
  </div>
</div>


          ))}
        </div>
      </div>
      {/* Modal */}
      
      
      <Footer />
    </div>
  );
};

export default CustomerPage;
