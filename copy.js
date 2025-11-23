'use client';
import React from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const OrderTrackingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-8 text-orange-600 text-center">Order Tracking</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
              <span className="font-semibold">Order Received</span>
              <span className="text-xs text-gray-400 ml-auto">Just Now</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
              <span className="font-semibold">Dispatched</span>
              <span className="text-xs text-gray-400 ml-auto">In 2 hours</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">3</div>
              <span className="font-semibold">Shipped</span>
              <span className="text-xs text-gray-400 ml-auto">Tomorrow</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">4</div>
              <span className="font-semibold">Out For Delivery</span>
              <span className="text-xs text-gray-400 ml-auto">2 days</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">5</div>
              <span className="font-semibold">Delivered</span>
              <span className="text-xs text-gray-400 ml-auto">Pending</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
