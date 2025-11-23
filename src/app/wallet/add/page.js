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
    <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl shadow-2xl p-10 border-4 border-blue-800 flex flex-col gap-4">
      <h2 className="text-3xl font-bold text-blue-900 mb-1">Add Money to Wallet</h2>
      <span className="text-xs mb-3 block text-blue-400">
        Payment mode: Demo/Test Wallet (no real money processed)
      </span>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Amount</label>
          <input
            type="number"
            min={1}
            className="w-full px-4 py-2 rounded-lg bg-gray-50 text-blue-900 border-2 border-blue-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Payment Method</label>
          <select
            value={method}
            onChange={e => { setMethod(e.target.value); setDetail(''); }}
            className="w-full px-4 py-2 rounded-lg bg-gray-50 text-blue-900 border-2 border-blue-400"
          >
            {paymentMethods.map(pm => <option value={pm.value} key={pm.value}>{pm.label}</option>)}
          </select>
        </div>
        {/* Dynamic fake fields */}
        <div>
          {method === 'UPI' && (
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-50 text-blue-900 border-2 border-blue-500"
              placeholder="Enter UPI ID (e.g. user@okicici)"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              required
            />
          )}
          {method === 'CARD' && (
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-50 text-blue-900 border-2 border-blue-500"
              placeholder="Enter Card Number"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              required
            />
          )}
          {method === 'NETBANKING' && (
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-50 text-blue-900 border-2 border-blue-500"
              placeholder="Enter Bank Name"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              required
            />
          )}
          {method === 'COUPON' && (
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-50 text-blue-900 border-2 border-blue-500"
              placeholder="Enter Coupon Code"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              required
            />
          )}
        </div>
        <button 
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-900 hover:bg-green-700 text-white text-lg font-bold mt-3 transition"
        >
          Add Money
        </button>
      </form>
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-600 text-white' : 'bg-red-700 text-white'} font-semibold`}>
          <div>{result.message}</div>
          {result.success && (
            <div className="text-xs mt-1">New Balance: ₹{result.newBalance}</div>
          )}
        </div>
      )}
    </div>
  );
}
