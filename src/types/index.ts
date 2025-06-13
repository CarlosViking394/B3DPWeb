// Types for the Brisbane 3D Printing Cost Estimator

export interface MaterialType {
  name: string;
  pricePerKg: number;
  isExotic?: boolean;
}

export interface PrintSettings {
  material: MaterialType;
  isBatch: boolean;
  printSpeed: number; // mm/s
  layerHeight: number; // mm
}

export interface OptionalService {
  name: string;
  pricePerHour: number;
  hours: number;
}

export interface ModelFile {
  file: File;
  filename: string;
  size: number;
  volume?: number; // cm³
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };
  parsedModel?: ParsedModel; // Add parsed model data
}

export interface ParsedModel {
  geometry: any; // THREE.BufferGeometry - using any to avoid Three.js dependency in types
  stats: ModelStats;
  metadata: {
    format: 'STL_ASCII' | 'STL_BINARY' | '3MF';
    fileSize: number;
    parseTime: number;
  };
}

export interface ModelStats {
  volume: number; // in cm³
  dimensions: {
    width: number;  // in mm
    height: number; // in mm
    depth: number;  // in mm
  };
  triangleCount: number;
  surfaceArea: number; // in cm²
  boundingBox: {
    min: any; // THREE.Vector3
    max: any; // THREE.Vector3
  };
  estimatedWeight?: {
    [materialName: string]: number; // weight in grams for each material
  };
}

export interface CostBreakdown {
  materialCost: number;
  printingCost: number;
  supportCost?: number;
  totalCost: number;
  printTimeHours: number;
  weightGrams: number;
  breakdown: {
    materialWeight: number;
    materialPrice: number;
    printTime: number;
    hourlyRate?: number;
    tier?: string;
    minimumApplied: boolean;
  };
}

export interface ETACalculation {
  printTimeHours: number;
  printTimeDays: number;
  shippingDays: number;
  prepDays: number;
  queueDelayDays: number;
  totalDays: number;
  estimatedDate: Date;
  userLocation?: UserLocation;
  locationError?: string;
  isGeolocationUsed: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  distance?: number; // km from Brisbane
}

// Brisbane 3D Printing center location
export const BRISBANE_LOCATION = {
  latitude: -27.4698,
  longitude: 153.0251,
} as const;

// Material definitions
export const MATERIALS: MaterialType[] = [
  { name: 'PLA', pricePerKg: 25, isExotic: false },
  { name: 'ABS', pricePerKg: 30, isExotic: false },
  { name: 'PETG', pricePerKg: 35, isExotic: false },
  { name: 'TPU', pricePerKg: 45, isExotic: true },
];

// Pricing constants
export const PRICING = {
  BATCH_HOURLY_NORMAL: 7,
  BATCH_HOURLY_EXOTIC: 10,
  NON_BATCH_TIERS: [
    { maxHours: 1, minPrice: 10, maxPrice: 15 },
    { maxHours: 3, minPrice: 30, maxPrice: 45 },
    { maxHours: 6, minPrice: 60, maxPrice: 90 },
    { maxHours: Infinity, minPrice: 100, maxPrice: 150 },
  ],
  MINIMUM_PRICE: 30,
  PRINT_SPEED: 60, // mm/s
  LAYER_HEIGHT: 0.2, // mm
  SHIPPING_SPEED: 50, // km/day
} as const; 