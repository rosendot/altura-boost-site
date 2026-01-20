'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState('/');
  const router = useRouter();

  // Get redirect URL and message from sessionStorage
  useEffect(() => {
    const storedRedirect = sessionStorage.getItem('loginRedirect');
    const storedMessage = sessionStorage.getItem('loginMessage');

    if (storedRedirect) {
      setRedirectUrl(storedRedirect);
    }
    if (storedMessage) {
      setMessage(storedMessage);
      // Clear message after reading so it doesn't persist on refresh
      sessionStorage.removeItem('loginMessage');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Clear redirect from sessionStorage and navigate
      sessionStorage.removeItem('loginRedirect');
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
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
        aria-hidden="true"
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" aria-hidden="true"></div>

      {/* Login Form */}
      <div className="max-w-md w-full bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Login</h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg text-blue-200 text-sm" role="status" aria-live="polite">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
              Email <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
              aria-required="true"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm text-gray-400">
                Password <span className="text-red-500" aria-label="required">*</span>
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-primary-400 hover:text-primary-300 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                Forgot Password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm space-y-2">
          <p className="text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/signup/customer" className="text-primary-400 hover:text-primary-300 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
              Sign Up
            </a>
          </p>
          <p className="text-gray-400">
            Want to become a booster?{" "}
            <a href="/signup/booster" className="text-primary-400 hover:text-primary-300 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
              Apply Here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
