import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getGameImageUrl } from "@/lib/supabase/storage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Our Games',
  description: 'Browse our premium game boosting services. Professional boosting for Call of Duty, rank advancement, coaching, and more. Choose your game and unlock your potential.',
  alternates: {
    canonical: '/games',
  },
  openGraph: {
    title: 'Our Games - Altura Boost',
    description: 'Browse our premium game boosting services. Professional boosting for Call of Duty, rank advancement, coaching, and more.',
    url: '/games',
  },
  twitter: {
    title: 'Our Games - Altura Boost',
    description: 'Browse our premium game boosting services. Professional boosting for Call of Duty, rank advancement, coaching, and more.',
  },
};

export default async function GamesPage() {
  const supabase = await createClient();

  // Fetch active games from database
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
  }
  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-8" aria-labelledby="games-heading">
        <div className="text-center space-y-4">
          <h1 id="games-heading" className="text-5xl md:text-6xl font-bold text-white">
            Our Games
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your game and explore our premium boosting services
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20" aria-label="Available games">
        {!games || games.length === 0 ? (
          <div className="text-center py-12" role="status">
            <p className="text-gray-400">No games available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const imageUrl = getGameImageUrl(game.image_url);
              return (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-800 hover:border-primary-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {/* Game Image Background */}
                  <div className="absolute inset-0">
                    <Image
                      src={imageUrl}
                      alt={game.name}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10" aria-hidden="true">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 2px 2px, rgb(139, 92, 246) 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                      }}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 flex flex-col justify-end min-h-[300px]">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {game.name}
                    </h2>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 text-primary-400 font-semibold text-sm group-hover:gap-3 transition-all">
                      View Services
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-400/10"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
