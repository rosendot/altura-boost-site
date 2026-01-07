'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CustomerSignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Sign up user with client-side Supabase - automatically creates session
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.username,
            role: 'customer',
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error('Account creation failed');
      }

      // User is now automatically logged in with session
      // Redirect to account page
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
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

      {/* Sign Up Form */}
      <div className="max-w-md w-full bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Create Account</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Sign up as a customer</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="username" className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Email</label>
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
            <label htmlFor="password" className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-primary-400 hover:text-primary-300 transition font-semibold">
              Login
            </a>
          </p>
          <p className="text-gray-400 mt-2">
            Want to become a booster?{' '}
            <a href="/signup/booster" className="text-primary-400 hover:text-primary-300 transition font-semibold">
              Apply Here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
