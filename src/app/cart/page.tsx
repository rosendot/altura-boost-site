'use client';

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalItems, getSubtotal, getTax, getTotal } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // Prepare cart items for API
      const cartItems = items.map((item) => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">Shopping Cart</h1>

      {/* Cart Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <section className="lg:col-span-2" aria-labelledby="cart-items-heading">
          <h2 id="cart-items-heading" className="sr-only">Cart Items</h2>
          {getTotalItems() === 0 ? (
            /* Empty Cart State */
            <div className="bg-gray-900 border border-primary-700 rounded-lg p-8 text-center" role="status">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                className="inline-block px-6 py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <span id={`quantity-label-${item.id}`} className="text-gray-400 text-sm">Quantity:</span>
                        <div className="flex items-center gap-2" role="group" aria-labelledby={`quantity-label-${item.id}`}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.serviceName}`}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold text-white" aria-live="polite" aria-atomic="true">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.serviceName}`}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        aria-label={`Remove ${item.serviceName} from cart`}
                        className="text-red-500 hover:text-red-400 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order Summary */}
        <section className="lg:col-span-1" aria-labelledby="order-summary-heading">
          <div className="bg-gray-900 border border-primary-700 rounded-lg p-6 sticky top-4">
            <h2 id="order-summary-heading" className="text-2xl font-bold mb-4 text-white">Order Summary</h2>

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
              onClick={handleCheckout}
              disabled={getTotalItems() === 0 || checkoutLoading}
              aria-disabled={getTotalItems() === 0 || checkoutLoading}
              className={`w-full py-3 rounded-lg mb-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                getTotalItems() === 0 || checkoutLoading
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "gradient-purple text-white hover:opacity-90"
              }`}
            >
              {checkoutLoading ? 'Redirecting to Checkout...' : 'Checkout'}
            </button>

            <Link
              href="/"
              className="block text-center text-primary-400 hover:text-primary-300 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
