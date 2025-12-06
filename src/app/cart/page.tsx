import Link from "next/link";

export default function CartPage() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {/* Cart Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {/* Empty Cart State */}
          <div className="border rounded-lg p-8 text-center">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-300"
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
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/games/black-ops-7"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Services
            </Link>
          </div>

          {/* Sample Cart Item (for reference when implementing) */}
          {/*
          <div className="border rounded-lg p-6 mb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Black Ops 7 - Weapon Leveling</h3>
                <p className="text-gray-600 mb-2">5 Weapons to Max Level</p>
                <p className="text-sm text-gray-500">Estimated completion: 2-3 days</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold mb-2">$49.99</p>
                <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
              </div>
            </div>
          </div>
          */}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold">$0.00</span>
              </div>
            </div>

            <button
              disabled
              className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed mb-3"
            >
              Checkout
            </button>

            <Link
              href="/"
              className="block text-center text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
