'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const getCustomerId = () =>
  typeof window !== "undefined" && localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : null;

const BuyPage = () => {
  const [orders, setOrders] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, order: null, stars: 0 });

  const customerId = getCustomerId();

  useEffect(() => {
    if (!customerId) return;
    fetch(`http://localhost:5000/cprods/user/${customerId}`)
      .then(r => r.json()).then(d => setOrders(d.items ?? []));
  }, [customerId]);

  const handleOpenReviewModal = (order) => setReviewModal({ open: true, order, stars: 0 });
  const handleCloseReviewModal = () => setReviewModal({ open: false, order: null, stars: 0 });

  const handleSubmitReview = async () => {
    await fetch(`http://localhost:5000/cprods/${reviewModal.order._id}/rate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review: reviewModal.stars })
    });
    setOrders(orders.map(o => o._id === reviewModal.order._id ? { ...o, review: reviewModal.stars } : o));
    handleCloseReviewModal();
    alert("Thank you for leaving a review, this will enhance our retailer selection");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      <div className="max-w-8xl mx-auto py-12 px-4 w-full flex-1">
        <h2 className="text-4xl font-bold mb-10 text-black dark:text-white">Your Orders</h2>
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900 transition">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="p-5 font-bold text-lg">Image</th>
                <th className="p-5 font-bold text-lg">Title</th>
                <th className="w-[330px] p-5 font-bold text-lg">Description</th>
                <th className="p-5 font-bold text-lg">Qty</th>
                <th className="p-5 font-bold text-lg">Net Cost</th>
                <th className="p-5 font-bold text-lg">Actions</th>
                <th className="p-5 font-bold text-lg">Review</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order =>
                <tr key={order._id} className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition">
                  <td className="p-5">
                    <img src={order.image} className="w-20 h-20 object-contain rounded" alt="" />
                  </td>
                  <td className="p-5 text-black dark:text-white">{order.productName}</td>
                  <td className="p-5 text-gray-700 dark:text-gray-300">{order.description}</td>
                  <td className="p-5 text-black dark:text-white">{order.quantity}</td>
                  <td className="p-5 text-black dark:text-white">₹{order.totalPrice}</td>
                  <td className="p-5 flex flex-col gap-3">
                    <button
                      onClick={() => window.location.href = '/customer'}
                      className="py-2 px-5 bg-gradient-to-r from-orange-500 to-red-600 rounded font-bold text-white hover:from-orange-600 hover:to-red-700 transition"
                    >
                      Buy Again
                    </button>
                    <button
                      onClick={() => handleOpenReviewModal(order)}
                      className="py-2 px-5 border-2 border-orange-400 bg-white dark:bg-gray-900 rounded font-bold text-orange-500 hover:bg-orange-50 hover:dark:bg-gray-800"
                    >
                      Leave Review
                    </button>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(i =>
                        <svg
                          key={i}
                          className={`h-7 w-7 mx-0.5 ${order.review >= i ? 'fill-yellow-400' : 'fill-gray-200 dark:fill-gray-700'} stroke-yellow-500`}
                          viewBox="0 0 20 20"
                        >
                          <polygon points="10,1 13,7 19,7 14.5,11 16,17 10,13.5 4,17 5.5,11 1,7 7,7" />
                        </svg>
                      )}
                      <span className="ml-2 text-gray-700 dark:text-gray-300 font-bold">{order.review || 0}/5</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal */}
{reviewModal.open && (
  <>
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur transition" onClick={handleCloseReviewModal}></div>
    <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-10 flex flex-row items-center gap-10 min-w-[580px] max-w-full w-[620px]">
      {/* Product image/details */}
      <div className="flex flex-col items-center w-1/3">
        <img src={reviewModal.order.image} className="w-32 h-32 object-contain rounded mb-2" alt="" />
        <div className="font-bold text-md text-black dark:text-white mt-2 text-center">{reviewModal.order.productName}</div>
        <div className="text-[14px] text-gray-700 dark:text-gray-200 mb-2 text-center">{reviewModal.order.description}</div>
        <div className="text-sm text-orange-600 font-bold mt-2">₹{reviewModal.order.pricePerItem} each</div>
        <div className="text-sm text-green-500 font-medium">Qty: {reviewModal.order.quantity}</div>
      </div>
      {/* Review UI */}
      <div className="flex flex-col items-center flex-1">
        <div className="text-2xl md:text-2xl font-bold mb-2 text-center text-black dark:text-white">How satisfied are you with this product</div>
        <div className="text-sm text-gray-400 dark:text-gray-300 mb-5 text-center">Leaving a review would help us further improve our services and retailer, wholesaler selection</div>
        <div className="flex items-center mb-2 justify-center">
          {[1, 2, 3, 4, 5].map(i =>
            <svg
              key={i}
              onClick={() => setReviewModal(s => ({ ...s, stars: i }))}
              className={`h-11 w-11 mx-1 cursor-pointer transition ${reviewModal.stars >= i ? 'fill-yellow-400' : 'fill-white dark:fill-gray-700'} stroke-yellow-500`}
              viewBox="0 0 20 20"
            >
              <polygon points="10,1 13,7 19,7 14.5,11 16,17 10,13.5 4,17 5.5,11 1,7 7,7" />
            </svg>
          )}
          <span className="ml-3 text-lg text-black dark:text-white font-bold">{reviewModal.stars}/5</span>
        </div>
        {/* Dynamic label */}
        <div className="mb-6 text-md text-center" style={{ minHeight: 24 }}>
          {reviewModal.stars === 1 && (<span className="text-red-600 font-semibold">Very Dissatisfied</span>)}
          {reviewModal.stars === 2 && (<span className="text-orange-700 font-semibold">Dissatisfied</span>)}
          {reviewModal.stars === 3 && (<span className="text-orange-400 font-semibold">Neutral</span>)}
          {reviewModal.stars === 4 && (<span className="text-green-500 font-semibold">Satisfied</span>)}
          {reviewModal.stars === 5 && (<span className="text-green-700 font-semibold">Very Satisfied</span>)}
        </div>
        <button className="py-3 px-12 rounded bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg mx-auto" onClick={handleSubmitReview}>
          Accept
        </button>
      </div>
    </div>
  </>
)}


      <Footer />
    </div>
  );
};

export default BuyPage;
