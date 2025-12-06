import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-white">Elevate Your Game.</span>
            <br />
            <span className="bg-clip-text gradient-purple">Unlock Your Potential.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Premium boosting services for Call of Duty Black Ops 7
          </p>
          <div className="pt-4">
            <Link
              href="/games/black-ops-7"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105"
            >
              Browse Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Service Card */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/games/black-ops-7"
            className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-primary-700/50 hover:border-primary-500 transition-all duration-500"
          >
            <div className="relative p-8 md:p-12">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(139, 92, 246) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-sm font-bold mb-4">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    TRENDING NOW
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    Call of Duty
                  </h2>
                  <h3 className="text-5xl md:text-6xl font-bold bg-clip-text gradient-purple mb-4">
                    Black Ops 7
                  </h3>
                  <p className="text-gray-400 text-lg mb-6">
                    Weapon camos, rank boosts, challenges & more
                  </p>
                  <div className="inline-flex items-center gap-2 text-primary-400 font-semibold group-hover:gap-3 transition-all">
                    View All Services
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Icon/Visual Element */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full gradient-purple opacity-20 blur-2xl absolute -top-8 -right-8"></div>
                  <div className="relative w-24 h-24 rounded-2xl gradient-purple flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-400/10"></div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">100% Secure</h3>
                <p className="text-gray-400 text-sm">Safe & protected service</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Fast Delivery</h3>
                <p className="text-gray-400 text-sm">Quick turnaround time</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Satisfaction Guaranteed</h3>
                <p className="text-gray-400 text-sm">Or your money back</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple Process</h2>
          <p className="text-gray-400 text-lg">Get started in three easy steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-primary-700 transition-all hover:transform hover:scale-105">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl gradient-purple text-white text-2xl font-bold shadow-lg">
                  01
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Choose Your Boost</h3>
              <p className="text-gray-400">Select the service that fits your needs</p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-primary-700 transition-all hover:transform hover:scale-105">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl gradient-purple text-white text-2xl font-bold shadow-lg">
                  02
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Checkout</h3>
              <p className="text-gray-400">Complete your order safely and quickly</p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-primary-700 transition-all hover:transform hover:scale-105">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl gradient-purple text-white text-2xl font-bold shadow-lg">
                  03
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enjoy Results</h3>
              <p className="text-gray-400">Track progress and see your boost completed</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
