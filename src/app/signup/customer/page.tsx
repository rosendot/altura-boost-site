'use client';

import { useState } from 'react';

export default function CustomerSignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Here you would submit the form data to your backend
    console.log('Customer Sign Up Data:', formData);
    alert('Account created successfully! (This is a placeholder)');
  };

  return (
    <main className="fixed inset-0 bg-black flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: "url('/assets/images/login_page_background.webp')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Sign Up Form */}
      <div className="max-w-md w-full bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Create Account</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Sign up as a customer</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-4"
          >
            CREATE ACCOUNT
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
