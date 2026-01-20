'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart from localStorage (matches CartContext key)
    localStorage.removeItem('altura-boost-cart');

    // Simulate order processing delay
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-12" role="status" aria-live="polite">
            <div className="mb-6">
              <svg className="w-16 h-16 text-primary-500 mx-auto animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Processing your payment...</h2>
            <p className="text-gray-400 text-sm">Please wait while we confirm your order</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-green-900/20 border-2 border-green-500 rounded-lg p-12" role="status" aria-live="polite">
          <div className="mb-6">
            <svg className="w-20 h-20 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-green-400 mb-4">Payment Successful!</h1>

          <p className="text-xl text-gray-300 mb-6">
            Thank you for your order. Your payment has been processed successfully.
          </p>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">What happens next?</h2>
            <ul className="text-left space-y-3 text-gray-300 list-none">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>You&apos;ll receive an email confirmation shortly with your order details</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Your order will be assigned to one of our professional boosters</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Track your order progress from your account dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Message your booster directly for updates and coordination</span>
              </li>
            </ul>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-500 mb-6">
              Session ID: {sessionId}
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <Link
              href="/account"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-12" role="status" aria-live="polite">
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </main>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
