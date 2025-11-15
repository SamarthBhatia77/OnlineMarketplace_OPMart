'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ProductPage({ params }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);  // ✅ Added

  // ✅ Fetch product from database
  useEffect(() => {
    async function fetchProduct() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        
        // Fetch from API
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          // Find product by _id (MongoDB ID)
          const foundProduct = data.products.find(p => p._id === id);
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [params]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    router.push('/checkout');
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-slideInRight">
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-700 rounded-lg shadow-2xl p-4 min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-semibold">Added to cart</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-orange-600 hover:text-orange-700"
          >
            Home
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400">{product.badge}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium">{product.title}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain"
              />
              {product.discount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            {product.badge && (
              <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm font-semibold px-4 py-2 rounded-full">
                {product.badge}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {product.subtitle}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {product.rating}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-600">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.price * quantity)}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice * quantity)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                product.stock <= 5 ? 'text-red-600' : 
                product.stock <= 15 ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {product.stock <= 10 
                  ? `Only ${product.stock} left in stock!` 
                  : 'In Stock'}
              </span>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center gap-3 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="font-semibold">FREE delivery {product.deliveryDate}</span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                Quantity:
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold text-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold text-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Animation styles */}
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
