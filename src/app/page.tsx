import Link from "next/link";
import GameCarousel from "@/components/GameCarousel";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Fetch active games from database
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto p-4">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-white">Elevate Your Game.</span>
            <br />
            <span className="bg-clip-text gradient-purple">Unlock Your Potential.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Premium boosting services for Call of Duty Black Ops 7
          </p>
          <Link
            href="/games"
            className="inline-flex items-center p-2 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105"
          >
            Browse Services
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">100% Secure</h3>
                <p className="text-gray-400 text-sm">Safe & protected service</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Fast Delivery</h3>
                <p className="text-gray-400 text-sm">Quick turnaround time</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Satisfaction Guaranteed</h3>
                <p className="text-gray-400 text-sm">Or your money back</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Game Cards */}
      <section className="max-w-7xl mx-auto p-2">
        <GameCarousel games={games || []} />
      </section>
    </main>
  );
}
