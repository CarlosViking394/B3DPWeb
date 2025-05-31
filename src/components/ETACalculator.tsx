import React, { useState, useEffect } from 'react';
import { ETACalculation, CostBreakdown } from '../types';
import { 
  calculateETA, 
  calculateETAWithoutLocation, 
  formatDeliveryDate, 
  formatDuration,
  getDeliveryUrgency 
} from '../utils/etaCalculator';

interface ETACalculatorProps {
  costBreakdown?: CostBreakdown;
  className?: string;
}

const ETACalculator: React.FC<ETACalculatorProps> = ({
  costBreakdown,
  className = ''
}) => {
  const [etaCalculation, setEtaCalculation] = useState<ETACalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  // Calculate ETA when print time changes
  useEffect(() => {
    if (costBreakdown?.printTimeHours) {
      calculateETAEstimate();
    } else {
      setEtaCalculation(null);
    }
  }, [costBreakdown?.printTimeHours]);

  const calculateETAEstimate = async () => {
    if (!costBreakdown?.printTimeHours) return;

    setIsCalculating(true);
    
    try {
      // Check geolocation permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
      }

      // Calculate ETA with geolocation
      const eta = await calculateETA(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } catch (error) {
      console.warn('ETA calculation failed:', error);
      // Fallback to calculation without geolocation
      const eta = calculateETAWithoutLocation(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLocationRequest = async () => {
    if (!costBreakdown?.printTimeHours) return;

    setIsCalculating(true);
    try {
      const eta = await calculateETA(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
      setLocationPermission('granted');
    } catch (error) {
      console.warn('Location request failed:', error);
      setLocationPermission('denied');
      const eta = calculateETAWithoutLocation(costBreakdown.printTimeHours);
      setEtaCalculation(eta);
    } finally {
      setIsCalculating(false);
    }
  };

  const urgency = etaCalculation ? getDeliveryUrgency(etaCalculation.totalDays) : null;

  return (
    <div className={`bg-white rounded-lg p-6 shadow-brisbane ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-brisbane-dark">Delivery Estimate</h3>
        {etaCalculation && urgency && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgency.color} bg-current/10`}>
            {urgency.description}
          </span>
        )}
      </div>

      {isCalculating ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-brisbane-blue/20 border-t-brisbane-blue rounded-full animate-spin mb-3"></div>
          <p className="text-brisbane-gray">Calculating delivery estimate...</p>
        </div>
      ) : etaCalculation ? (
        <div className="space-y-6">
          {/* Main Delivery Date */}
          <div className="text-center bg-brisbane-light rounded-xl p-6">
            <div className="text-sm font-medium text-brisbane-gray mb-2">Estimated Delivery</div>
            <div className="text-2xl font-bold text-brisbane-dark mb-1">
              {formatDeliveryDate(etaCalculation.estimatedDate)}
            </div>
            <div className="text-sm text-brisbane-gray">
              {etaCalculation.estimatedDate.toLocaleDateString('en-AU', { 
                timeZone: 'Australia/Brisbane' 
              })}
            </div>
            <div className="text-sm text-brisbane-blue mt-2">
              {formatDuration(etaCalculation.totalDays)} total time
            </div>
          </div>

          {/* Location Status */}
          {etaCalculation.isGeolocationUsed ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Location-based estimate</span>
              </div>
              {etaCalculation.userLocation && (
                <button
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  {showLocationDetails ? 'Hide details' : 'View details'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">
                  {etaCalculation.locationError || 'Using standard estimate'}
                </span>
              </div>
              {locationPermission !== 'denied' && (
                <button
                  onClick={handleLocationRequest}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
                >
                  Enable Location
                </button>
              )}
            </div>
          )}

          {/* Location Details */}
          {showLocationDetails && etaCalculation.userLocation && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Distance to Brisbane: {etaCalculation.userLocation.distance?.toFixed(1)} km</div>
                <div>Shipping time: {formatDuration(etaCalculation.shippingDays)}</div>
              </div>
            </div>
          )}

          {/* ETA Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-brisbane-dark">Delivery Timeline</h4>
            
            <div className="space-y-2">
              {/* Print Time */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-brisbane-dark">3D Printing</span>
                </div>
                <span className="text-sm text-brisbane-gray">
                  {formatDuration(etaCalculation.printTimeDays)}
                </span>
              </div>

              {/* Prep Time */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-brisbane-dark">Preparation & QC</span>
                </div>
                <span className="text-sm text-brisbane-gray">
                  {formatDuration(etaCalculation.prepDays)}
                </span>
              </div>

              {/* Queue Delay */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-brisbane-dark">Production Queue</span>
                </div>
                <span className="text-sm text-brisbane-gray">
                  {formatDuration(etaCalculation.queueDelayDays)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-brisbane-dark">
                    Shipping {etaCalculation.isGeolocationUsed ? '(to your location)' : '(standard)'}
                  </span>
                </div>
                <span className="text-sm text-brisbane-gray">
                  {formatDuration(etaCalculation.shippingDays)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-800">
              <div className="font-semibold mb-1">📦 Delivery Information:</div>
              <div className="space-y-1">
                <div>• All items are shipped from Brisbane, Australia</div>
                <div>• Delivery times include production and shipping</div>
                <div>• {etaCalculation.isGeolocationUsed ? 'Location-based' : 'Standard'} shipping estimate</div>
                <div>• Actual delivery may vary based on current workload</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-brisbane-gray py-8">
          <div className="text-4xl mb-3">🚚</div>
          <div>
            <h4 className="font-semibold mb-1">Upload a Model</h4>
            <p className="text-sm">Get delivery estimates based on your location and print time</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETACalculator; 