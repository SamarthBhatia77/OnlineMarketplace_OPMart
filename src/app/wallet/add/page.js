'use client';
import React, { useState } from 'react';

const paymentMethods = [
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Credit/Debit Card' },
  { value: 'NETBANKING', label: 'Netbanking' },
  { value: 'COUPON', label: 'Cashback Coupon' }
];

export default function AddMoneyPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [detail, setDetail] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get userId from localStorage
    const getUserId = () => {
      if (typeof window === 'undefined') return '';
      const userStr = localStorage.getItem('user');
      if (!userStr) return '';
      try {
        const user = JSON.parse(userStr);
        return user._id || user.id || '';
      } catch {
        return '';
      }
    };

    const userId = getUserId();

    if (!userId) {
      setResult({ success: false, message: 'User not logged in or userId missing.' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/wallet-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      });
      
      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message, newBalance: data.newBalance });
        
        // Fire event to update navbar balance
        window.dispatchEvent(new CustomEvent('walletUpdated'));
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch {
      setResult({ success: false, message: 'Network or server error.' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      {/* Animated Background Stripes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(249, 115, 22, 0.4) 35px,
              rgba(249, 115, 22, 0.4) 70px
            )`,
            backgroundSize: '100px 100px',
            animation: 'slide 20s linear infinite'
          }}
        ></div>
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 50px,
              rgba(255, 230, 0, 0.3) 50px,
              rgba(234, 88, 12, 0.3) 100px
            )`,
            backgroundSize: '140px 140px',
            animation: 'slide 15s linear infinite reverse'
          }}
        ></div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes slide {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100px 100px;
          }
        }
      `}</style>

      {/* Card */}
      <div className="relative max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 border-2 border-orange-500">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-orange-500 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-orange-500 rounded-br-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Add Money to Wallet
          </h2>
          <p className="text-sm text-orange-600 dark:text-orange-400 text-center mb-8">
            Payment mode: Demo/Test Wallet (no real money processed)
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Field */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                Amount
              </label>
              <input
                type="number"
                min={1}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all duration-200"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Payment Method Dropdown */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                Payment Method
              </label>
              <select
                value={method}
                onChange={e => { setMethod(e.target.value); setDetail(''); }}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all"
              >
                {paymentMethods.map(pm => (
                  <option value={pm.value} key={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Payment Details */}
            <div>
              {method === 'UPI' && (
                <input
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all"
                  placeholder="Enter UPI ID (e.g. user@okicici)"
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  required
                />
              )}
              {method === 'CARD' && (
                <input
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all"
                  placeholder="Enter Card Number"
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  required
                />
              )}
              {method === 'NETBANKING' && (
                <input
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all"
                  placeholder="Enter Bank Name"
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  required
                />
              )}
              {method === 'COUPON' && (
                <input
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all"
                  placeholder="Enter Coupon Code"
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Add Money
            </button>
          </form>

          {/* Result Message */}
          {result && (
            <div 
              className={`mt-6 p-4 rounded-xl font-semibold shadow-lg ${
                result.success 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{result.message}</span>
              </div>
              {result.success && (
                <div className="text-sm mt-2 pl-7">
                  New Balance: ₹{result.newBalance}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
