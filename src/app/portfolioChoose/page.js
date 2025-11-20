'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PortfolioChoosePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear any existing login when landing on this page
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('selectedPortfolio');
  }, []);

  const portfolios = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Browse and shop from thousands of products',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      gradient: 'from-orange-400 to-red-500'
    },
    {
      id: 'retailer',
      title: 'Retailer',
      description: 'Sell your products to customers directly',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'wholesaler',
      title: 'Wholesaler',
      description: 'Supply products in bulk to retailers',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-red-500 to-orange-600'
    }
  ];

  const handlePortfolioSelect = (portfolioId) => {
    if (loading) return;
    
    // Store selected role
    sessionStorage.setItem('selectedPortfolio', portfolioId);
    
    // Navigate to sign in page
    router.push('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
      
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-12">
        
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-poppins mb-4">
            OOPMart
          </h1>
          <p className="text-gray-600 text-sm mb-2">Everyone's favorite shopping destination!</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-8">
            Please Choose Your Portfolio
          </h2>
        </div>

        {/* Portfolio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              onClick={() => handlePortfolioSelect(portfolio.id)}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-orange-100 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-3xl group"
            >
              {/* Icon */}
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${portfolio.gradient} flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-300`}>
                {portfolio.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                {portfolio.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center text-sm mb-6">
                {portfolio.description}
              </p>

              {/* Select Button */}
              <button className={`w-full bg-gradient-to-r ${portfolio.gradient} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}>
                Select {portfolio.title}
              </button>
            </div>
          ))}
        </div>

        {/* Back to home link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-orange-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, -80px) scale(1.15);
          }
          50% {
            transform: translate(-60px, 70px) scale(0.85);
          }
          75% {
            transform: translate(80px, 60px) scale(1.1);
          }
        }
        
        .animate-blob {
          animation: blob 15s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-4000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

export default PortfolioChoosePage;
