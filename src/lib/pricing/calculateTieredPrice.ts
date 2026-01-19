/**
 * Tiered Pricing Calculator
 *
 * Calculates prices and booster payouts using cumulative tier logic.
 * Each tier applies to a range of quantities, and larger orders get
 * progressively better rates.
 */

export interface PricingTier {
  min_quantity: number;
  max_quantity: number;
  price_per_unit: number;
  booster_payout_per_unit: number;
}

export interface TierBreakdown {
  tierRange: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  payoutPerUnit: number;
  payoutSubtotal: number;
}

export interface PriceCalculation {
  totalPrice: number;
  totalPayout: number;
  breakdown: TierBreakdown[];
}

/**
 * Calculate total price and payout for a given quantity using flat rate tiers.
 *
 * Uses flat rate tier logic: the quantity determines which tier's rate applies to ALL units.
 * Example: 30 weapons with tiers [1-5: $9, 6-10: $8, 11-20: $7, 21-29: $6.50, 30: $6]
 * - 30 weapons falls in the "30" tier → 30 × $6 = $180
 */
export function calculateTieredPrice(
  quantity: number,
  tiers: PricingTier[]
): PriceCalculation {
  if (quantity <= 0) {
    return { totalPrice: 0, totalPayout: 0, breakdown: [] };
  }

  // Sort tiers by min_quantity to ensure correct order
  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);

  // Find the tier that matches this quantity
  const applicableTier = sortedTiers.find(
    tier => quantity >= tier.min_quantity && quantity <= tier.max_quantity
  );

  if (!applicableTier) {
    // If no tier matches, use the highest tier (for quantities above max)
    const highestTier = sortedTiers[sortedTiers.length - 1];
    if (highestTier && quantity > highestTier.max_quantity) {
      const totalPrice = quantity * highestTier.price_per_unit;
      const totalPayout = quantity * highestTier.booster_payout_per_unit;
      return {
        totalPrice: Math.round(totalPrice * 100) / 100,
        totalPayout: Math.round(totalPayout * 100) / 100,
        breakdown: [{
          tierRange: `1-${quantity}`,
          quantity,
          pricePerUnit: highestTier.price_per_unit,
          subtotal: totalPrice,
          payoutPerUnit: highestTier.booster_payout_per_unit,
          payoutSubtotal: totalPayout,
        }],
      };
    }
    return { totalPrice: 0, totalPayout: 0, breakdown: [] };
  }

  const totalPrice = quantity * applicableTier.price_per_unit;
  const totalPayout = quantity * applicableTier.booster_payout_per_unit;

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalPayout: Math.round(totalPayout * 100) / 100,
    breakdown: [{
      tierRange: `1-${quantity}`,
      quantity,
      pricePerUnit: applicableTier.price_per_unit,
      subtotal: totalPrice,
      payoutPerUnit: applicableTier.booster_payout_per_unit,
      payoutSubtotal: totalPayout,
    }],
  };
}

/**
 * Calculate payout for a specific batch within an order.
 * Used when splitting orders into jobs.
 *
 * With flat rate pricing, all weapons in the order get the same rate based on total quantity.
 * This function calculates the payout for a batch of weapons at that rate.
 *
 * Example: 30 weapon order split into batches of 10
 * - Total order is 30, so rate is $6/weapon, payout $4/weapon
 * - Batch 1 (10 weapons): payout = 10 × $4 = $40
 * - Batch 2 (10 weapons): payout = 10 × $4 = $40
 * - Batch 3 (10 weapons): payout = 10 × $4 = $40
 */
export function calculateBatchPayout(
  batchUnitCount: number,
  totalOrderQuantity: number,
  tiers: PricingTier[]
): { price: number; payout: number } {
  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);

  // Find the tier based on total order quantity (flat rate)
  const applicableTier = sortedTiers.find(
    tier => totalOrderQuantity >= tier.min_quantity && totalOrderQuantity <= tier.max_quantity
  ) || sortedTiers[sortedTiers.length - 1]; // Fall back to highest tier

  if (!applicableTier) {
    return { price: 0, payout: 0 };
  }

  const totalPrice = batchUnitCount * applicableTier.price_per_unit;
  const totalPayout = batchUnitCount * applicableTier.booster_payout_per_unit;

  return {
    price: Math.round(totalPrice * 100) / 100,
    payout: Math.round(totalPayout * 100) / 100,
  };
}

/**
 * Split an order into batches and calculate payout for each.
 *
 * With flat rate pricing, all batches use the same per-weapon rate based on total order quantity.
 *
 * Example: 30 weapons, batch_size=10, rate=$6/weapon, payout=$4/weapon
 * Returns: [
 *   { batchNumber: 1, startUnit: 1, endUnit: 10, unitCount: 10, payout: 40.00 },
 *   { batchNumber: 2, startUnit: 11, endUnit: 20, unitCount: 10, payout: 40.00 },
 *   { batchNumber: 3, startUnit: 21, endUnit: 30, unitCount: 10, payout: 40.00 }
 * ]
 */
export interface BatchInfo {
  batchNumber: number;
  startUnit: number;
  endUnit: number;
  unitCount: number;
  price: number;
  payout: number;
}

export function calculateBatches(
  totalQuantity: number,
  batchSize: number,
  tiers: PricingTier[]
): BatchInfo[] {
  if (totalQuantity <= 0 || batchSize <= 0) {
    return [];
  }

  const batches: BatchInfo[] = [];
  let currentUnit = 1;
  let batchNumber = 1;

  while (currentUnit <= totalQuantity) {
    const endUnit = Math.min(currentUnit + batchSize - 1, totalQuantity);
    const unitCount = endUnit - currentUnit + 1;
    // Pass total order quantity for flat rate calculation
    const { price, payout } = calculateBatchPayout(unitCount, totalQuantity, tiers);

    batches.push({
      batchNumber,
      startUnit: currentUnit,
      endUnit,
      unitCount,
      price,
      payout,
    });

    currentUnit = endUnit + 1;
    batchNumber++;
  }

  return batches;
}

/**
 * Get the display price for a tiered service (starting price).
 * Shows "From $X" based on the first tier's price.
 */
export function getStartingPrice(tiers: PricingTier[]): number {
  if (tiers.length === 0) return 0;
  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  return sortedTiers[0].price_per_unit;
}
