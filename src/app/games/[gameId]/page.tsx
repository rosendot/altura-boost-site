import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getGameImageUrl } from "@/lib/supabase/storage";
import type { Metadata } from "next";
import GameDetailClient from "./GameDetailClient";
import { getProductSchema, getBreadcrumbSchema, StructuredData } from "@/lib/structuredData";

interface PricingTier {
  id: string;
  service_id: string;
  min_quantity: number;
  max_quantity: number;
  price_per_unit: number;
  booster_payout_per_unit: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  game_id: string;
  pricing_type: 'fixed' | 'tiered';
  unit_name: string | null;
  max_quantity: number | null;
  batch_size: number | null;
  pricing_tiers?: PricingTier[];
}

interface Game {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  active: boolean;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameId: string }>;
}): Promise<Metadata> {
  const { gameId } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', gameId)
    .eq('active', true)
    .single();

  if (!game) {
    return {
      title: 'Game Not Found',
    };
  }

  const imageUrl = getGameImageUrl(game.image_url);

  return {
    title: `${game.name} Boosting Services`,
    description: `Premium ${game.name} boosting services. Professional rank boosting, coaching, and account services. 100% hand-played, VPN protection, 24/7 updates, and money-back guarantee.`,
    alternates: {
      canonical: `/games/${gameId}`,
    },
    openGraph: {
      title: `${game.name} Boosting Services - Altura Boost`,
      description: `Premium ${game.name} boosting services. Professional rank boosting, coaching, and account services with guaranteed results.`,
      url: `/games/${gameId}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${game.name} Boosting Services`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.name} Boosting Services - Altura Boost`,
      description: `Premium ${game.name} boosting services. Professional rank boosting, coaching, and account services with guaranteed results.`,
      images: [imageUrl],
    },
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createClient();

  // Fetch game by slug
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('slug', gameId)
    .eq('active', true)
    .single();

  if (gameError || !game) {
    notFound();
  }

  // Fetch services for this game with pricing tiers
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select(`
      *,
      pricing_tiers:service_pricing_tiers(*)
    `)
    .eq('game_id', game.id)
    .eq('active', true)
    .order('price', { ascending: true });

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  }

  // Map services to include properly typed pricing_tiers
  const servicesWithTiers: Service[] = (services || []).map((service) => ({
    ...service,
    pricing_tiers: service.pricing_tiers || [],
  }));

  const imageUrl = getGameImageUrl(game.image_url);

  // Hardcoded features for now (can be added to database later)
  const features = [
    "100% Hand-played by professionals",
    "VPN Protection included",
    "24/7 progress updates",
    "Account security guaranteed",
    "Money-back guarantee",
  ];

  // Generate structured data schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Games', url: '/games' },
    { name: game.name, url: `/games/${gameId}` },
  ]);

  // Create Product schema for each service
  const productSchemas = (services || []).map((service) =>
    getProductSchema({
      name: service.name,
      gameName: game.name,
      description: service.description || `Professional ${service.name} service for ${game.name}`,
      price: service.price,
      imageUrl: imageUrl,
      slug: gameId,
    })
  );

  return (
    <main className="min-h-screen bg-black">
      <StructuredData data={[breadcrumbSchema, ...productSchemas]} />
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black" aria-labelledby="game-title">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" aria-hidden="true"></div>
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Games
            </Link>
          </div>

          <div className="text-center md:text-left">
            <h1 id="game-title" className="text-4xl md:text-6xl font-bold text-white mb-4">
              {game.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              Premium boosting services for {game.name}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section - Client Component for Cart Functionality */}
      <GameDetailClient
        game={game as Game}
        services={servicesWithTiers}
        features={features}
      />
    </main>
  );
}
