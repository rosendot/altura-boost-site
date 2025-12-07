import Link from "next/link";
import GameCarousel from "@/components/GameCarousel";

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

      {/* Featured Game Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <GameCarousel />
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
