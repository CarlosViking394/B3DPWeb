import React from 'react';
import { ModelFile, MaterialType, OptionalService, CostBreakdown, ETACalculation } from '../types';
import { formatCost, formatPrintTime } from '../utils/costCalculator';
import { formatDeliveryDate, formatDuration } from '../utils/etaCalculator';

interface EstimateSummaryProps {
  modelFile?: ModelFile;
  selectedMaterial: MaterialType;
  isBatch: boolean;
  costBreakdown?: CostBreakdown;
  optionalServices: OptionalService[];
  etaCalculation?: ETACalculation;
  className?: string;
}

const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  modelFile,
  selectedMaterial,
  isBatch,
  costBreakdown,
  optionalServices,
  etaCalculation,
  className = ''
}) => {
  // Calculate optional services total
  const optionalServicesTotal = optionalServices
    .filter(service => service.hours > 0)
    .reduce((total, service) => total + (service.hours * service.pricePerHour), 0);

  // Calculate grand total
  const grandTotal = (costBreakdown?.totalCost || 0) + optionalServicesTotal;

  // Check if we have enough data for a complete estimate
  const hasCompleteEstimate = modelFile?.parsedModel && costBreakdown;

  if (!hasCompleteEstimate) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-brisbane ${className}`}>
        <div className="text-center py-8 text-brisbane-gray">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-brisbane-dark mb-2">Project Summary</h3>
          <p className="text-sm">Upload a 3D model to see your complete cost estimate</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-brisbane overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-brisbane-blue to-blue-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">📋 Project Estimate Summary</h3>
        <p className="text-blue-100 text-sm">
          Complete cost breakdown for your 3D printing project
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-brisbane-dark text-sm border-b border-gray-200 pb-1">
              Project Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brisbane-gray">File:</span>
                <span className="font-medium text-brisbane-dark">
                  {modelFile.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Volume:</span>
                <span className="font-medium text-brisbane-dark">
                  {modelFile.parsedModel!.stats.volume.toFixed(2)} cm³
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Material:</span>
                <span className="font-medium text-brisbane-dark">
                  {selectedMaterial.name}
                  {selectedMaterial.isExotic && (
                    <span className="ml-1 text-xs text-orange-600">(Exotic)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Pricing Mode:</span>
                <span className="font-medium text-brisbane-dark">
                  {isBatch ? '📦 Batch Mode' : '⚡ Regular Mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-brisbane-dark text-sm border-b border-gray-200 pb-1">
              Dimensions & Weight
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Size:</span>
                <span className="font-medium text-brisbane-dark text-xs">
                  {modelFile.parsedModel!.stats.dimensions.width.toFixed(1)} × {' '}
                  {modelFile.parsedModel!.stats.dimensions.height.toFixed(1)} × {' '}
                  {modelFile.parsedModel!.stats.dimensions.depth.toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Weight:</span>
                <span className="font-medium text-brisbane-dark">
                  {costBreakdown.weightGrams < 1000 
                    ? `${costBreakdown.weightGrams.toFixed(1)}g`
                    : `${(costBreakdown.weightGrams / 1000).toFixed(2)}kg`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Triangles:</span>
                <span className="font-medium text-brisbane-dark">
                  {modelFile.parsedModel!.stats.triangleCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brisbane-gray">Surface Area:</span>
                <span className="font-medium text-brisbane-dark">
                  {modelFile.parsedModel!.stats.surfaceArea.toFixed(1)} cm²
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Print Timeline */}
        {costBreakdown && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="text-lg mr-2">⏱️</span>
              Print Timeline
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Estimated Print Time:</span>
              <span className="font-bold text-blue-900 text-lg">
                {formatPrintTime(costBreakdown.printTimeHours)}
              </span>
            </div>
            {etaCalculation && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-blue-700">Estimated Delivery:</span>
                <span className="font-medium text-blue-900">
                  {formatDeliveryDate(etaCalculation.estimatedDate)}
                  <span className="text-xs ml-1">
                    ({formatDuration(etaCalculation.totalDays)})
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-brisbane-dark border-b border-gray-200 pb-2">
            💰 Cost Breakdown
          </h4>

          {/* 3D Printing Costs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-brisbane-dark mb-3">3D Printing Costs</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brisbane-gray">Material Cost:</span>
                <span className="font-medium">{formatCost(costBreakdown.materialCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brisbane-gray">
                  Printing Cost {isBatch ? '(Hourly)' : '(Tiered)'}:
                </span>
                <span className="font-medium">{formatCost(costBreakdown.printingCost)}</span>
              </div>
              {costBreakdown.supportCost && (
                <div className="flex justify-between text-sm">
                  <span className="text-brisbane-gray">Support Material:</span>
                  <span className="font-medium">{formatCost(costBreakdown.supportCost)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between font-medium">
                <span className="text-brisbane-dark">Printing Subtotal:</span>
                <span className="text-brisbane-blue">{formatCost(costBreakdown.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Optional Services */}
          {optionalServices.filter(s => s.hours > 0).length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-3">Optional Services</h5>
              <div className="space-y-2">
                {optionalServices
                  .filter(service => service.hours > 0)
                  .map((service) => (
                    <div key={service.name} className="flex justify-between text-sm">
                      <span className="text-purple-700">
                        {service.name} ({service.hours}h × {formatCost(service.pricePerHour)}/h):
                      </span>
                      <span className="font-medium">
                        {formatCost(service.hours * service.pricePerHour)}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-purple-300 pt-2 flex justify-between font-medium">
                  <span className="text-purple-900">Services Subtotal:</span>
                  <span className="text-purple-700">{formatCost(optionalServicesTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div className="bg-gradient-to-r from-brisbane-blue to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">Project Total</div>
                <div className="text-blue-100 text-sm">
                  All costs included
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {formatCost(grandTotal)}
                </div>
                {costBreakdown.breakdown.minimumApplied && (
                  <div className="text-xs text-blue-200">
                    *Minimum ${costBreakdown.totalCost} applied
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-sm text-yellow-800">
            <div className="font-semibold mb-2">ℹ️ Estimate Information:</div>
            <ul className="space-y-1 text-xs">
              <li>• Prices include material costs and professional printing services</li>
              <li>• {isBatch ? 'Batch mode provides economical hourly rates' : 'Regular mode ensures fastest completion'}</li>
              <li>• Delivery times include production, preparation, and shipping</li>
              <li>• Final quote may vary based on file complexity and current queue</li>
              <li>• All prices are in Australian Dollars (AUD)</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
          <h5 className="font-semibold text-green-900 mb-2">Ready to Print? 🚀</h5>
          <p className="text-sm text-green-700 mb-3">
            Contact Brisbane 3D Printing to confirm your quote and start your project
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              📧 Request Quote
            </button>
            <button className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
              📞 Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateSummary; 