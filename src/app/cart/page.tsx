'use client';

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalItems, getSubtotal, getTax, getTotal } = useCart();

  return (
    <main className="min-h-screen bg-black max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">Shopping Cart</h1>

      {/* Cart Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {getTotalItems() === 0 ? (
            /* Empty Cart State */
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-primary-400"
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
              <p className="text-xl text-gray-300 mb-4">Your cart is empty</p>
              <Link
                href="/games/black-ops-7"
                className="inline-block px-6 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-semibold"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-primary-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-white">
                        {item.gameName}
                      </h3>
                      <p className="text-gray-400 mb-2 font-medium">{item.serviceName}</p>
                      <p className="text-sm text-gray-500">
                        Estimated completion: {item.deliveryTime}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-gray-400 text-sm">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold mb-2 text-primary-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500 mb-2">
                          ${item.price.toFixed(2)} each
                        </p>
                      )}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400 text-sm font-medium transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-white">
                  ${getSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax (10%)</span>
                <span className="font-semibold text-white">
                  ${getTax().toFixed(2)}
                </span>
              </div>
              <div className="border-t border-primary-700 pt-2 flex justify-between text-lg">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-primary-400">
                  ${getTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <button
              disabled={getTotalItems() === 0}
              className={`w-full py-3 rounded-lg mb-3 font-semibold transition ${
                getTotalItems() === 0
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "gradient-purple text-white hover:opacity-90"
              }`}
            >
              Checkout
            </button>

            <Link
              href="/"
              className="block text-center text-primary-400 hover:text-primary-300 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
