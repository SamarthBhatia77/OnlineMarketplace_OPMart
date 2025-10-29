'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const categories = [
    'Electronics',
    'Gaming',
    'Groceries',
    'Fashion & Clothing',
    'Accessories',
    'Music & Instruments',
    'Home & Kitchen',
    'Sports & Outdoors',
    'Books & Stationery',
    'Beauty & Personal Care',
    'Toys & Games',
    'Automotive'
  ];

  return (
    <footer className="bg-black text-white mt-auto border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Left Section - Brand */}
          <div className="space-y-6">
            <div>
              <h2 className="text-5xl md:text-8xl mb-4 font-bold font-poppins leading-none bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                OP
              </h2>
              <h2 className="text-5xl md:text-8xl font-bold font-poppins leading-none bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                MART
              </h2>
            </div>
            <p className="text-gray-400 text-[40px] italic font-light">
           "Tu haan kar ya na kar, mai hu teri FAVORITE shopping mart"
            </p>
          </div>

          {/* Middle Section - Options */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white relative inline-block">
              Options
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-600"></span>
            </h3>
            <ul className="space-y-4 mt-8">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-orange-500 transition-all duration-300 flex items-center group text-lg"
                >
                  <svg 
                    className="w-5 h-5 mr-3 text-orange-500 transform group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/cart" 
                  className="text-gray-300 hover:text-orange-500 transition-all duration-300 flex items-center group text-lg"
                >
                  <svg 
                    className="w-5 h-5 mr-3 text-orange-500 transform group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Cart
                </Link>
              </li>
              <li>
                <Link 
                  href="/signout" 
                  className="text-gray-300 hover:text-orange-500 transition-all duration-300 flex items-center group text-lg"
                >
                  <svg 
                    className="w-5 h-5 mr-3 text-orange-500 transform group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Sign Out
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - Categories */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white relative inline-block">
              All Categories
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-600"></span>
            </h3>
            <div className="mt-8 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-3">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      href={`/category/${category.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                      className="text-gray-300 hover:text-orange-500 transition-colors duration-200 block hover:translate-x-2 transform"
                    >
                      • {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span className="text-orange-500">©</span> 
            <span className="font-semibold">OPMART</span> 
            2025 - All rights reserved
          </p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ea580c, #dc2626);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fb923c, #ef4444);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
