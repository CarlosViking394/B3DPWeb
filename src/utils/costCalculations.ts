import { 
  MaterialType, 
  OptionalService, 
  CostBreakdown, 
  ETACalculation, 
  UserLocation,
  PRICING 
} from '../types/index';

/**
 * Calculate volume from STL file data
 * This is a placeholder implementation - will be enhanced in future tasks
 */
export const calculateVolumeFromFile = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    // Placeholder calculation - in reality, we'd parse the STL/3MF file
    // For now, estimate based on file size (rough approximation)
    const estimatedVolume = file.size / 1000000 * 50; // Very rough estimate
    setTimeout(() => resolve(Math.max(estimatedVolume, 1)), 500);
  });
};

/**
 * Calculate print time based on volume and print settings
 */
export const calculatePrintTime = (
  volume: number, // in cm³
  printSpeed: number = PRICING.PRINT_SPEED, // mm/s
  layerHeight: number = PRICING.LAYER_HEIGHT // mm
): number => {
  // Convert volume to mm³
  const volumeMm3 = volume * 1000;
  
  // Estimate print time based on volume and speed
  // This is a simplified calculation - real slicer software would be more accurate
  const estimatedTimeMinutes = (volumeMm3 / (printSpeed * layerHeight * 60)) * 2.5;
  
  return Math.max(estimatedTimeMinutes / 60, 0.1); // Return hours, minimum 0.1 hours
};

/**
 * Material density mapping for accurate cost calculation
 */
const MATERIAL_DENSITY_MAP: Record<string, number> = {
  'PLA': 1.25,
  'ABS': 1.04,
  'PETG': 1.27,
  'TPU': 1.20,
};

/**
 * Calculate material cost based on volume and material type
 */
export const calculateMaterialCost = (
  volume: number, // in cm³
  material: MaterialType
): number => {
  // Get material-specific density or use default
  const density = MATERIAL_DENSITY_MAP[material.name] || 1.25; // g/cm³
  const weightGrams = volume * density;
  const weightKg = weightGrams / 1000;
  
  return weightKg * material.pricePerKg;
};

/**
 * Get estimated weight for a specific material
 */
export const getEstimatedWeight = (
  volume: number, // in cm³
  material: MaterialType
): number => {
  const density = MATERIAL_DENSITY_MAP[material.name] || 1.25; // g/cm³
  return volume * density; // Returns weight in grams
};

/**
 * Calculate print time cost based on batch mode and material type
 */
export const calculatePrintTimeCost = (
  printTimeHours: number,
  isBatch: boolean,
  material: MaterialType
): number => {
  if (isBatch) {
    // Batch mode: hourly rate
    const hourlyRate = material.isExotic 
      ? PRICING.BATCH_HOURLY_EXOTIC 
      : PRICING.BATCH_HOURLY_NORMAL;
    return printTimeHours * hourlyRate;
  } else {
    // Non-batch mode: tiered pricing
    for (const tier of PRICING.NON_BATCH_TIERS) {
      if (printTimeHours <= tier.maxHours) {
        // Linear interpolation within the tier
        const ratio = printTimeHours / tier.maxHours;
        return tier.minPrice + (tier.maxPrice - tier.minPrice) * ratio;
      }
    }
    
    // If we get here, use the highest tier
    const lastTier = PRICING.NON_BATCH_TIERS[PRICING.NON_BATCH_TIERS.length - 1];
    return lastTier.maxPrice;
  }
};

/**
 * Calculate total optional services cost
 */
export const calculateOptionalServicesCost = (services: OptionalService[]): number => {
  return services.reduce((total, service) => {
    return total + (service.hours * service.pricePerHour);
  }, 0);
};

/**
 * Calculate complete cost breakdown
 */
export const calculateCostBreakdown = (
  volume: number,
  material: MaterialType,
  isBatch: boolean,
  services: OptionalService[],
  printTimeHours?: number
): CostBreakdown => {
  const calculatedPrintTime = printTimeHours || calculatePrintTime(volume);
  
  const materialCost = calculateMaterialCost(volume, material);
  const printTimeCost = calculatePrintTimeCost(calculatedPrintTime, isBatch, material);
  const optionalServicesCost = calculateOptionalServicesCost(services);
  
  const subtotal = materialCost + printTimeCost + optionalServicesCost;
  const totalCost = Math.max(subtotal, PRICING.MINIMUM_PRICE);
  
  return {
    materialCost,
    printTimeCost,
    optionalServicesCost,
    totalCost,
    minimumPrice: PRICING.MINIMUM_PRICE,
  };
};

/**
 * Calculate ETA based on print time and user location
 */
export const calculateETA = (
  printTimeHours: number,
  userLocation?: UserLocation
): ETACalculation => {
  const printTimeDays = printTimeHours / 24;
  const prepDays = 1; // Fixed preparation time
  
  // Calculate shipping days based on distance
  let shippingDays = 1; // Default local shipping
  if (userLocation && userLocation.distance) {
    shippingDays = Math.ceil(userLocation.distance / PRICING.SHIPPING_SPEED);
  }
  
  // Add random queue delay (0.5 to 1.5 days)
  const queueDelayDays = 0.5 + Math.random();
  
  const totalDays = Math.ceil(printTimeDays + prepDays + shippingDays + queueDelayDays);
  
  // Calculate estimated delivery date
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + totalDays);
  
  return {
    printTimeHours,
    printTimeDays,
    prepDays,
    shippingDays,
    queueDelayDays,
    totalDays,
    estimatedDate,
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File): boolean => {
  const validExtensions = ['.stl', '.3mf'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * Validate file size (max 50MB)
 */
export const isValidFileSize = (file: File): boolean => {
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB
  return file.size <= maxSizeBytes;
}; 