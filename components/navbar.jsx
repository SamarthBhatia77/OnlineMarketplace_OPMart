'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

const Navbar = () => {
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user from localStorage and fetch balance + cart count
  useEffect(() => {
    const getUserFromStorage = () => {
      if (typeof window === 'undefined') return null;
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    };

    const userData = getUserFromStorage();
    setUser(userData);

    if (userData?.id) {
      fetchWalletBalance(userData.id);
      fetchCartCount(userData.id);
    }
  }, []);

  // Listen for wallet updates
  useEffect(() => {
    const handleWalletUpdate = () => {
      if (user?.id) {
        fetchWalletBalance(user.id);
      }
    };

    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, [user]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user?.id) {
        fetchCartCount(user.id);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user]);

  const fetchWalletBalance = async (userId) => {
    if (!userId || userId === 'undefined') {
      console.log('No valid userId, skipping balance fetch');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.accountBalance || 0);
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  const fetchCartCount = async (userId) => {
    if (!userId || userId === 'undefined') return;

    try {
      const res = await fetch(`http://localhost:5000/cart/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const totalItems = (data.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const categories = [
    'Electronics',
    'Gaming',
    'Groceries',
    'Fashion',
    'Accessories',
    'Music',
    'Home',
    'Sports',
    'Books',
    'Beauty',
    'Toys',
    'Health'
  ];

  const handleCategoryClick = (category) => {
    setShowCategories(false);
    setSearchQuery(''); // Clear search when category is selected
    
    // Determine current page and navigate accordingly
    if (pathname === '/cart') {
      router.push(`/cart?category=${category}`);
    } else {
      router.push(`/customer?category=${category}`);
    }
  };

  const handleAllCategoriesClick = () => {
    setShowCategories(false);
    setSearchQuery(''); // Clear search
    
    // Navigate to appropriate page without category filter
    if (pathname === '/cart') {
      router.push('/cart');
    } else {
      router.push('/customer');
    }
  };

  // Real-time search - triggers as user types
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Dispatch custom event that pages will listen to
    window.dispatchEvent(new CustomEvent('searchQueryChanged', { 
      detail: { query } 
    }));
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleChangeAccount = () => {
    router.push('/');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    router.push('/signin');
    setShowUserMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/customer')}>
            <span className="text-white text-2xl font-bold tracking-tight hover:scale-105 transition-transform duration-200">
              OPMart 🎯
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-6 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              aria-label="Search products"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Categories Dropdown */}
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
              
              {showCategories && (
                <div className="absolute top-full mt-0 left-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-slideDown">
                  {/* "All Categories" option */}
                  <button
                    onClick={handleAllCategoriesClick}
                    className="w-full text-left px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:text-orange-500 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 hover:pl-6 font-semibold"
                  >
                    All Categories
                  </button>
                  
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full text-left px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:text-orange-500 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:pl-6"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account Dropdown */}
            <div 
              className="relative hidden md:block flex-shrink-0"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <button
                className="relative p-3 bg-white/20 backdrop-blur-md border-2 h-11 w-11 border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
                aria-label="User menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-slideDown">
                  <button
                    onClick={handleChangeAccount}
                    className="w-full text-left px-5 py-3 text-gray-700 dark:text-gray-200 hover:text-[#ff681c] transition-all duration-200 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Change Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-gray-700 dark:text-white hover:text-[#e03f3f] transition-all duration-200 flex items-center gap-3"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          
            {/* Dark Mode Toggle Button */}
            {mounted && (
              <div className="flex-shrink-0">
                <button
                  onClick={toggleTheme}
                  className="relative p-3 bg-white/20 backdrop-blur-md border-2 h-11 w-11 border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Wallet Balance + Add Money Button */}
            <button
              onClick={() => router.push('/wallet/add')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200 font-semibold"
              aria-label="Wallet"
            >
              <span>₹{walletBalance}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            {/* Cart Button with badge */}
            <button
              onClick={handleCartClick}
              className="relative flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200"
              aria-label="Shopping cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden pb-3">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full text-white font-semibold"
          >
            Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCategories && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2">
              {/* Mobile "All Categories" */}
              <button
                onClick={handleAllCategoriesClick}
                className="w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-orange-100 dark:hover:bg-gray-700 font-semibold"
              >
                All Categories
              </button>
              
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-orange-100 dark:hover:bg-gray-700"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
