import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameImageUrl } from "@/lib/supabase/storage";
import GameDetailClient from "./GameDetailClient";

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

  // Fetch services for this game
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('game_id', game.id)
    .eq('active', true)
    .order('price', { ascending: true });

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  }

  const imageUrl = getGameImageUrl(game.image_url);

  return <GameDetailClient game={game} services={services || []} imageUrl={imageUrl} />;
}
