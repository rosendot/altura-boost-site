'use client';

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { getTotalItems } = useCart();
  return (
    <nav className="fixed top-0 left-0 right-0 w-full py-4 px-6 border-b border-primary-900/20 bg-black/90 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        {/* Left side - Logo and Primary Actions */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-2xl text-white hover:text-primary-400 transition-colors duration-200">
            Altura Boost
          </Link>

          <div className="relative group">
            <Link href="/games" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Games
            </Link>

            {/* Mega Menu Dropdown */}
            <div className="absolute left-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-gray-900 border border-primary-700/50 rounded-lg shadow-2xl p-4 min-w-[200px]">
                {/* Game Item */}
                <Link
                  href="/games/black-ops-7"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-700/30 transition-colors duration-200 group/item"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="text-white text-sm font-medium group-hover/item:text-primary-400">
                    Black Ops 7
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Testing Links - For Development Only */}
          <Link href="/booster/hub" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-200 font-semibold text-xs tracking-wide">
            BOOSTER HUB
          </Link>
          <Link href="/booster/jobs" className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all duration-200 font-semibold text-xs tracking-wide">
            MY JOBS
          </Link>
          <Link href="/customer/orders" className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all duration-200 font-semibold text-xs tracking-wide">
            MY ORDERS
          </Link>
        </div>

        {/* Right side - Info Links, Login, Cart */}
        <div className="flex items-center gap-6">
          {/* Info Links */}
          <div className="flex items-center gap-6">
            <Link href="/work-with-us" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Work with us
            </Link>
            <Link href="/faq" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              FAQ
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Terms of Service
            </Link>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700"></div>

          {/* Login Button */}
          <Link href="/login" className="px-5 py-2.5 bg-gray-800/50 text-white border border-primary-600/50 rounded-md hover:bg-primary-600/20 hover:border-primary-600 transition-all duration-200 font-semibold text-sm tracking-wide">
            LOGIN
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group">
            <svg className="w-6 h-6 text-gray-300 group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
