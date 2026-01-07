'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const supabase = createClient();

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 bg-black flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: "url('/login_page_background.webp')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-primary-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-900/30 border border-green-500 rounded-lg p-4">
              <p className="text-green-400 text-sm text-center">
                Password reset email sent! Check your inbox and click the link to reset your password.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                placeholder="Enter your email"
                disabled={loading || success}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : success ? 'Email Sent!' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary-400 hover:text-primary-300 transition"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
