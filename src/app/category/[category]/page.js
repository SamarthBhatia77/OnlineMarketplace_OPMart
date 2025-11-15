'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Toast Component
const Toast = ({ message, isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose();
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ease-out ${
        isAnimating 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-700 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-semibold text-base">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => {
                setShouldRender(false);
                onClose();
              }, 300);
            }}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ProductCard Component
const ProductCard = ({ product, onAddToCart }) => {
  const router = useRouter();
  
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

  const handleCardClick = () => {
    router.push(`/product/${product._id}`);  // ✅ Changed to _id
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
    >
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
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
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

export default function CategoryPage({ params }) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);  // ✅ Added

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        const resolvedParams = await params;
        const category = resolvedParams.category;
        
        // Convert URL slug to proper format
        const formattedCategory = category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        setCategoryName(formattedCategory);
        
        // ✅ Fetch from API instead of filtering local array
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          // Filter products by category
          const filtered = data.products.filter(product => 
            product.badge.toLowerCase() === formattedCategory.toLowerCase()
          );
          setCategoryProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategoryProducts();
  }, [params]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    setToastMessage('Added item to cart');
    setShowToast(true);
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (categoryProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            No products found in this category yet.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Go Back Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold font-poppins mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-orange-100">
            Explore our {categoryName.toLowerCase()} collection
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {categoryProducts.length} Products
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product._id}  // ✅ Changed to _id
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
      <Footer />
    </div>
  );
}
