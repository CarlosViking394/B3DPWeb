import { ETACalculation, UserLocation, BRISBANE_LOCATION } from '../types/index';

// ETA calculation constants
export const ETA_SETTINGS = {
  SHIPPING_SPEED_KM_PER_DAY: 50, // km per day
  PREP_DAYS: 1, // Fixed preparation time
  MIN_QUEUE_DELAY: 0.5, // Minimum queue delay in days
  MAX_QUEUE_DELAY: 1.5, // Maximum queue delay in days
  DEFAULT_SHIPPING_DAYS: 2, // Default shipping if geolocation fails
  GEOLOCATION_TIMEOUT: 10000, // 10 seconds timeout
  MAX_REASONABLE_DISTANCE: 5000, // Maximum reasonable distance in km
} as const;

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using Geolocation API
 */
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: ETA_SETTINGS.GEOLOCATION_TIMEOUT,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          distance: calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            BRISBANE_LOCATION.latitude,
            BRISBANE_LOCATION.longitude
          )
        };

        // Validate reasonable distance
        if (userLocation.distance! > ETA_SETTINGS.MAX_REASONABLE_DISTANCE) {
          reject(new Error('Location appears to be too far from Brisbane'));
          return;
        }

        resolve(userLocation);
      },
      (error) => {
        let errorMessage = 'Location access denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
}

/**
 * Calculate shipping time based on distance
 */
export function calculateShippingTime(distanceKm: number): number {
  return Math.max(0.5, distanceKm / ETA_SETTINGS.SHIPPING_SPEED_KM_PER_DAY);
}

/**
 * Generate random queue delay within specified range
 */
export function calculateQueueDelay(): number {
  return ETA_SETTINGS.MIN_QUEUE_DELAY + 
    Math.random() * (ETA_SETTINGS.MAX_QUEUE_DELAY - ETA_SETTINGS.MIN_QUEUE_DELAY);
}

/**
 * Calculate comprehensive ETA with geolocation
 */
export async function calculateETA(printTimeHours: number): Promise<ETACalculation> {
  let userLocation: UserLocation | null = null;
  let shippingDays: number;
  let locationError: string | null = null;

  // Try to get user location
  try {
    userLocation = await getUserLocation();
    shippingDays = calculateShippingTime(userLocation.distance!);
  } catch (error) {
    console.warn('Geolocation failed:', error);
    locationError = error instanceof Error ? error.message : 'Unknown location error';
    shippingDays = ETA_SETTINGS.DEFAULT_SHIPPING_DAYS;
  }

  // Convert print time to days
  const printTimeDays = printTimeHours / 24;
  
  // Calculate queue delay
  const queueDelayDays = calculateQueueDelay();
  
  // Calculate total days
  const totalDays = printTimeDays + ETA_SETTINGS.PREP_DAYS + queueDelayDays + shippingDays;
  
  // Calculate estimated delivery date
  const today = new Date();
  const estimatedDate = new Date(today.getTime() + totalDays * 24 * 60 * 60 * 1000);

  const etaCalculation: ETACalculation = {
    printTimeHours,
    printTimeDays,
    shippingDays,
    prepDays: ETA_SETTINGS.PREP_DAYS,
    queueDelayDays,
    totalDays,
    estimatedDate,
    userLocation: userLocation || undefined,
    locationError: locationError || undefined,
    isGeolocationUsed: userLocation !== null
  };

  return etaCalculation;
}

/**
 * Calculate ETA without geolocation (fallback method)
 */
export function calculateETAWithoutLocation(printTimeHours: number): ETACalculation {
  const printTimeDays = printTimeHours / 24;
  const queueDelayDays = calculateQueueDelay();
  const shippingDays = ETA_SETTINGS.DEFAULT_SHIPPING_DAYS;
  const totalDays = printTimeDays + ETA_SETTINGS.PREP_DAYS + queueDelayDays + shippingDays;
  
  const today = new Date();
  const estimatedDate = new Date(today.getTime() + totalDays * 24 * 60 * 60 * 1000);

  return {
    printTimeHours,
    printTimeDays,
    shippingDays,
    prepDays: ETA_SETTINGS.PREP_DAYS,
    queueDelayDays,
    totalDays,
    estimatedDate,
    isGeolocationUsed: false
  };
}

/**
 * Format delivery date in user-friendly format
 */
export function formatDeliveryDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) {
    return 'Today';
  } else if (isTomorrow) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days < 7) {
    const wholeDays = Math.floor(days);
    const remainingHours = Math.round((days - wholeDays) * 24);
    
    if (remainingHours === 0) {
      return `${wholeDays} day${wholeDays !== 1 ? 's' : ''}`;
    } else {
      return `${wholeDays} day${wholeDays !== 1 ? 's' : ''} ${remainingHours}h`;
    }
  } else {
    const weeks = Math.floor(days / 7);
    const remainingDays = Math.round(days % 7);
    
    if (remainingDays === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      return `${weeks} week${weeks !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
  }
}

/**
 * Get delivery urgency level
 */
export function getDeliveryUrgency(totalDays: number): {
  level: 'express' | 'standard' | 'extended';
  color: string;
  description: string;
} {
  if (totalDays <= 3) {
    return {
      level: 'express',
      color: 'text-green-600',
      description: 'Express delivery'
    };
  } else if (totalDays <= 7) {
    return {
      level: 'standard',
      color: 'text-blue-600',
      description: 'Standard delivery'
    };
  } else {
    return {
      level: 'extended',
      color: 'text-orange-600',
      description: 'Extended delivery'
    };
  }
} 