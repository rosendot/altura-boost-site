import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black/90 border-t border-primary-900/20 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-xl text-white">Altura Boost</h3>
            <p className="text-gray-400 text-sm">
              Premium gaming boosting services for competitive players.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/work-with-us" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Work with us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@alturaboost.com" className="text-gray-400 hover:text-primary-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Email: support@alturaboost.com
                </a>
              </li>
              <li className="text-gray-400 text-sm">Discord: Altura Boost</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-primary-900/20">
          <div className="flex justify-center items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Altura Boost. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
