import { MaterialType, CostBreakdown } from '../types/index';

// Print time calculation parameters
export interface PrintTimeParams {
  volume: number; // in cubic cm
  hasSupport: boolean;
  infillPercentage?: number; // default 20%
  layerHeight?: number; // default 0.2mm
  printSpeed?: number; // default 60 mm/s
}

// Cost calculation parameters
export interface CostCalculationParams {
  volume: number; // in cubic cm
  material: MaterialType;
  isBatch: boolean;
  hasSupport: boolean;
  infillPercentage?: number;
  layerHeight?: number;
  printSpeed?: number;
}

// Material density constants (g/cm³)
export const MATERIAL_DENSITIES: Record<string, number> = {
  'PLA': 1.25,
  'ABS': 1.04,
  'PETG': 1.27,
  'TPU': 1.20,
  'ASA': 1.07,
  'Wood-fill': 1.30,
  'Metal-fill': 2.50,
  'Carbon Fiber': 1.40,
};

// Print settings constants
export const PRINT_SETTINGS = {
  DEFAULT_LAYER_HEIGHT: 0.2, // mm
  DEFAULT_PRINT_SPEED: 60, // mm/s
  DEFAULT_INFILL: 20, // percentage
  NOZZLE_DIAMETER: 0.4, // mm
  FILAMENT_DIAMETER: 1.75, // mm
  MINIMUM_COST: 30, // AUD
  SUPPORT_TIME_MULTIPLIER: 1.3, // 30% extra time
  SUPPORT_MATERIAL_MULTIPLIER: 1.15, // 15% extra material
};

// Batch mode hourly rates
export const BATCH_HOURLY_RATES = {
  STANDARD: 7, // AUD per hour for standard materials
  EXOTIC: 10, // AUD per hour for exotic materials
};

// Tiered pricing structure
export const PRICING_TIERS = [
  { maxHours: 1, basePrice: 10, additionalRate: 5 }, // $10-$15
  { maxHours: 3, basePrice: 30, additionalRate: 7.5 }, // $30-$45
  { maxHours: 6, basePrice: 60, additionalRate: 10 }, // $60-$90
  { maxHours: Infinity, basePrice: 100, additionalRate: 10 }, // $100-$150+
];

/**
 * Calculate print time based on model volume and print parameters
 */
export function calculatePrintTime(params: PrintTimeParams): number {
  const {
    volume,
    hasSupport,
    infillPercentage = PRINT_SETTINGS.DEFAULT_INFILL,
    layerHeight = PRINT_SETTINGS.DEFAULT_LAYER_HEIGHT,
    printSpeed = PRINT_SETTINGS.DEFAULT_PRINT_SPEED
  } = params;

  // Convert volume from cm³ to mm³
  const volumeMm3 = volume * 1000;

  // Calculate effective volume accounting for infill
  const infillFactor = Math.max(0.1, infillPercentage / 100); // Minimum 10% for shells
  const effectiveVolume = volumeMm3 * infillFactor;

  // Calculate filament cross-sectional area (mm²)
  const filamentRadius = PRINT_SETTINGS.FILAMENT_DIAMETER / 2;
  const filamentCrossSection = Math.PI * Math.pow(filamentRadius, 2);

  // Estimate total filament length needed (mm)
  const filamentLength = effectiveVolume / filamentCrossSection;

  // Calculate base print time (hours)
  // This is a simplified model - real slicers use much more complex calculations
  const printSpeedMmPerHour = printSpeed * 60 * 60; // Convert mm/s to mm/hour
  let printTimeHours = filamentLength / printSpeedMmPerHour;

  // Add time for non-printing activities (layer changes, travels, etc.)
  printTimeHours *= 1.2; // 20% overhead

  // Add extra time for support material
  if (hasSupport) {
    printTimeHours *= PRINT_SETTINGS.SUPPORT_TIME_MULTIPLIER;
  }

  // Minimum print time of 10 minutes for very small objects
  return Math.max(printTimeHours, 10 / 60);
}

/**
 * Calculate material weight in grams
 */
export function calculateMaterialWeight(
  volume: number, // in cm³
  materialName: string,
  hasSupport: boolean = false,
  infillPercentage: number = PRINT_SETTINGS.DEFAULT_INFILL
): number {
  const density = MATERIAL_DENSITIES[materialName] || MATERIAL_DENSITIES['PLA'];
  
  // Calculate base weight accounting for infill
  const infillFactor = Math.max(0.1, infillPercentage / 100);
  let weight = volume * density * infillFactor;

  // Add weight for support material
  if (hasSupport) {
    weight *= PRINT_SETTINGS.SUPPORT_MATERIAL_MULTIPLIER;
  }

  return weight;
}

/**
 * Calculate tiered pricing based on print time
 */
export function calculateTieredPricing(printTimeHours: number): {
  cost: number;
  tier: string;
  basePrice: number;
  additionalCost: number;
} {
  let cumulativeHours = 0;
  let totalCost = 0;
  let currentTier = '';

  for (const tier of PRICING_TIERS) {
    const tierHours = Math.min(printTimeHours - cumulativeHours, tier.maxHours - cumulativeHours);
    
    if (tierHours <= 0) break;

    if (cumulativeHours === 0) {
      // First tier - use base price
      totalCost = tier.basePrice;
      currentTier = `Tier 1 (${tier.maxHours === Infinity ? '6+' : `0-${tier.maxHours}`}h)`;
    } else {
      // Additional tiers - add incremental cost
      totalCost += tierHours * tier.additionalRate;
      currentTier = `Tier ${PRICING_TIERS.indexOf(tier) + 1} (${tier.maxHours === Infinity ? '6+' : `${cumulativeHours}-${tier.maxHours}`}h)`;
    }

    cumulativeHours += tierHours;

    if (cumulativeHours >= printTimeHours) break;
  }

  return {
    cost: totalCost,
    tier: currentTier,
    basePrice: PRICING_TIERS[0].basePrice,
    additionalCost: totalCost - PRICING_TIERS[0].basePrice
  };
}

/**
 * Calculate batch mode pricing
 */
export function calculateBatchPricing(
  printTimeHours: number,
  isExoticMaterial: boolean
): { cost: number; hourlyRate: number } {
  const hourlyRate = isExoticMaterial ? BATCH_HOURLY_RATES.EXOTIC : BATCH_HOURLY_RATES.STANDARD;
  return {
    cost: printTimeHours * hourlyRate,
    hourlyRate
  };
}

/**
 * Main cost calculation function
 */
export function calculateCost(params: CostCalculationParams): CostBreakdown {
  const {
    volume,
    material,
    isBatch,
    hasSupport,
    infillPercentage = PRINT_SETTINGS.DEFAULT_INFILL,
    layerHeight = PRINT_SETTINGS.DEFAULT_LAYER_HEIGHT,
    printSpeed = PRINT_SETTINGS.DEFAULT_PRINT_SPEED
  } = params;

  // Calculate print time
  const printTimeHours = calculatePrintTime({
    volume,
    hasSupport,
    infillPercentage,
    layerHeight,
    printSpeed
  });

  // Calculate material weight and cost
  const weightGrams = calculateMaterialWeight(volume, material.name, hasSupport, infillPercentage);
  const weightKg = weightGrams / 1000;
  const materialCost = weightKg * material.pricePerKg;

  // Calculate printing cost based on mode
  let printingCost: number;
  let hourlyRate: number | undefined;
  let tier: string | undefined;

  if (isBatch) {
    const batchPricing = calculateBatchPricing(printTimeHours, material.isExotic);
    printingCost = batchPricing.cost;
    hourlyRate = batchPricing.hourlyRate;
  } else {
    const tieredPricing = calculateTieredPricing(printTimeHours);
    printingCost = tieredPricing.cost;
    tier = tieredPricing.tier;
  }

  // Calculate support cost if applicable
  let supportCost: number | undefined;
  if (hasSupport) {
    supportCost = (printingCost + materialCost) * 0.15; // 15% additional for support
  }

  // Calculate total cost
  let totalCost = materialCost + printingCost + (supportCost || 0);

  // Apply minimum cost
  const minimumApplied = totalCost < PRINT_SETTINGS.MINIMUM_COST;
  totalCost = Math.max(totalCost, PRINT_SETTINGS.MINIMUM_COST);

  return {
    materialCost: Math.round(materialCost * 100) / 100,
    printingCost: Math.round(printingCost * 100) / 100,
    supportCost: supportCost ? Math.round(supportCost * 100) / 100 : undefined,
    totalCost: Math.round(totalCost * 100) / 100,
    printTimeHours: Math.round(printTimeHours * 100) / 100,
    weightGrams: Math.round(weightGrams * 10) / 10,
    breakdown: {
      materialWeight: weightKg,
      materialPrice: material.pricePerKg,
      printTime: printTimeHours,
      hourlyRate,
      tier,
      minimumApplied
    }
  };
}

/**
 * Format print time in human-readable format
 */
export function formatPrintTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minutes`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  }
}

/**
 * Format cost in AUD currency
 */
export function formatCost(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2
  }).format(amount);
} 