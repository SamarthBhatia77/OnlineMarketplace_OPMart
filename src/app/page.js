'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import products from '../data/products';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
// ProductCard component defined in the same file
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
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

      <div className="p-4 space-y-3">
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
  );
};

export default function Home() {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.title} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar/>
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Featured Products
          </h2>
          <span className="text-gray-600 dark:text-gray-400">
            {products.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {cart.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl">
          <div className="text-center">
            <span className="text-2xl font-bold">{cart.length}</span>
            <p className="text-xs">items</p>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}
