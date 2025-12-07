// Helper functions for Supabase Storage URLs

/**
 * Get the full public URL for a storage object
 * @param path - Storage path (e.g., 'game-images/black_ops_7.webp')
 * @returns Full public URL
 */
export function getStorageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}

/**
 * Get game image URL from database path
 * @param imagePath - Path from games.image_url column
 * @returns Full public URL or placeholder if no path
 */
export function getGameImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return '/images/placeholder-game.webp' // fallback image
  }
  return getStorageUrl(imagePath)
}
