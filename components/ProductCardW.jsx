'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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

// ProductCardW Component - for wholesaler products from wprods collection
const ProductCardW = ({ product }) => {
  const {
    productName,
    description,
    sellingPrice,
    numberOfItems,
    category,
    base64Image,
  } = product;

  // Local state for modal visibility
  const [modalOpen, setModalOpen] = useState(false);

  // Format price function same as original
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
      >
        <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <Image
            src={base64Image || '/placeholder.png'}
            alt={productName}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute left-2 top-2 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white">
            {category}
          </div>
        </div>

        <div className="p-4 space-y-3 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-orange-600 transition-colors">
            {productName}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>

          <div className="mt-auto pt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(Number(sellingPrice))}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Qty: {numberOfItems} units
            </p>
          </div>
        </div>
      </div>

      {/* Modal for details */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full overflow-auto max-h-[90vh] p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white text-3xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-1/2 h-72 md:h-auto rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                <Image
                  src={base64Image || '/placeholder.png'}
                  alt={productName}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col flex-grow">
                <h2 className="text-3xl font-bold mb-2 dark:text-white">
                  {productName}
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {description}
                </p>

                <p className="text-2xl font-semibold mb-2 dark:text-white">
                  {formatPrice(Number(sellingPrice))}
                </p>
                <p className="mb-4 dark:text-gray-300">
                  <span className="font-semibold">Category:</span> {category}
                </p>
                <p className="mb-4 dark:text-gray-300">
                  <span className="font-semibold">Available quantity:</span> {numberOfItems} units
                </p>

                {/* Additional wholesaler-specific data or actions can go here */}
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
};

export default ProductCardW;
