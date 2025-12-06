import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full p-4 border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and Game Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Altura Boost
          </Link>

          {/* Game Selector Dropdown */}
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition">
              Choose Your Game ▾
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <Link href="/games/black-ops-7" className="block px-4 py-2 hover:bg-gray-100">
                Black Ops 7
              </Link>
            </div>
          </div>

          {/* Booster Hub Link (visible to boosters only) */}
          <Link href="/booster/hub" className="text-blue-600 hover:underline">
            Booster Hub
          </Link>
        </div>

        {/* Right side - Info buttons, Login, Cart */}
        <div className="flex items-center gap-4">
          <Link href="/work-with-us" className="text-gray-700 hover:text-gray-900">
            Work with us
          </Link>
          <Link href="/faq" className="text-gray-700 hover:text-gray-900">
            FAQ
          </Link>
          <Link href="/terms" className="text-gray-700 hover:text-gray-900">
            Terms of Service
          </Link>

          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Login
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="relative">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
