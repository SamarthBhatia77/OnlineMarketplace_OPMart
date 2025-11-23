'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
//import products from '../data/products';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Toast Notification Component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slideInRight">
      <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-700 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          {/* Orange Checkmark Circle */}
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-semibold text-base">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ProductCard component
const ProductCard = ({ product, onAddToCart }) => {
  const {
    title,
    subtitle,
    price,
    originalPrice,
    discount,
    rating,
    reviews,
    deliveryDate,
    stock,
    image,
    badge
  } = product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStockColor = () => {
    if (stock <= 5) return 'text-red-600';
    if (stock <= 15) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {badge && (
        <div className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 inline-block">
          {badge}
        </div>
      )}

      <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-orange-600 cursor-pointer transition-colors">
          {title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
          {subtitle}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold text-gray-900 dark:text-white">{rating}</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({reviews.toLocaleString()} reviews)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg 
            className="w-5 h-5 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
            />
          </svg>
          <span className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">FREE delivery</span> {deliveryDate}
          </span>
        </div>

        <div className={`text-sm font-semibold ${getStockColor()}`}>
          {stock <= 10 ? `Only ${stock} left in stock!` : `${stock} in stock`}
        </div>

        <div className="mt-auto pt-2">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [cart, setCart] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    setToastMessage('Added item to cart');
    setShowToast(true);
  };

  const getSortedProducts = () => {
    const productsCopy = [...products];
    
    switch(sortBy) {
      case 'price-low-high':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'rating-low-high':
        return productsCopy.sort((a, b) => a.rating - b.rating);
      case 'rating-high-low':
        return productsCopy.sort((a, b) => b.rating - a.rating);
      case 'stock-low-high':
        return productsCopy.sort((a, b) => a.stock - b.stock);
      case 'stock-high-low':
        return productsCopy.sort((a, b) => b.stock - a.stock);
      default:
        return productsCopy;
    }
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar/>
      
      {/* Toast Notification */}
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-4">
            Welcome to OPMart!
          </h1>
          <p className="text-xl text-orange-100">
            Product dekhlo kahin se, kharidoge yahin se
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Featured Products
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              {products.length} items
            </span>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-600 rounded-lg text-gray-700 dark:text-gray-200 font-semibold cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 transition-all duration-300"
              >
                <option value="default">Sort By</option>
                <optgroup label="Price">
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </optgroup>
                <optgroup label="Rating">
                  <option value="rating-low-high">Rating: Low to High</option>
                  <option value="rating-high-low">Rating: High to Low</option>
                </optgroup>
                <optgroup label="Stock">
                  <option value="stock-low-high">Stock: Low to High</option>
                  <option value="stock-high-low">Stock: High to Low</option>
                </optgroup>
              </select>
              <svg 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 dark:text-orange-400 pointer-events-none" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {cart.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl z-50">
          <div className="text-center">
            <span className="text-2xl font-bold">{cart.length}</span>
            <p className="text-xs">items</p>
          </div>
        </div>
      )}
      <Footer/>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
