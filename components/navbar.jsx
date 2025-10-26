'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand/Logo */}
            <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide cursor-pointer transition-colors duration-300 drop-shadow-lg font-poppins">
                OOPMart
            </h1>
            </div>


          {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:flex">
            <div className="relative w-full flex items-center gap-2">
                <input
                type="text"
                className="w-full px-5 py-2.5 rounded-full bg-white text-gray-700 placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300 pr-4"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                aria-label="Search products"
                />
                <button
                onClick={handleSearch}
                className="absolute right-2 h-10 w-10 bg-orange-600 rounded-full text-white hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center shadow-md"
                aria-label="Search"
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                </button>
            </div>
            </div>


          {/* Categories Dropdown - Fixed hover behavior */}
          <div 
            className="relative hidden md:block"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full text-white font-semibold hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5">
              Categories
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            {/* Dropdown stays open when hovering over it */}
            {showCategories && (
              <div 
                className="absolute top-full mt-0 left-0 w-64 bg-white rounded-xl shadow-2xl overflow-hidden animate-slideDown"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                {categories.map((category, index) => (
                  <a
                    key={index}
                    href={`/category/${category.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                    className="block px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:text-orange-500 transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:pl-6"
                  >
                    {category}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleCartClick}
              className="relative p-3 bg-white/20 backdrop-blur-md border-2 h-11 w-11 border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
              aria-label="Shopping cart"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 pr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-l-full bg-white text-gray-700 placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              className="absolute right-0 top-0 h-full px-5 bg-white rounded-r-full text-orange-600 hover:bg-gray-50 transition-colors border-2 border-l-0 border-gray-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Categories */}
          <div className="mt-3">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full text-white font-semibold"
            >
              Categories
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            {showCategories && (
              <div className="mt-2 bg-white rounded-xl shadow-xl overflow-hidden">
                {categories.map((category, index) => (
                  <a
                    key={index}
                    href={`/category/${category.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                    className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-200 border-b border-gray-100 last:border-b-0"
                  >
                    {category}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
