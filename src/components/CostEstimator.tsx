import React, { useState, useEffect } from 'react';
import { CostBreakdown, MaterialType, ModelFile } from '../types';
import { calculateCost, formatCost, formatPrintTime, PRINT_SETTINGS } from '../utils/costCalculator';

interface CostEstimatorProps {
  selectedMaterial: MaterialType;
  onMaterialChange: (material: MaterialType) => void;
  isBatch: boolean;
  onBatchToggle: (isBatch: boolean) => void;
  modelFile?: ModelFile;
  onCostBreakdownChange?: (costBreakdown: CostBreakdown | null) => void;
  className?: string;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({
  selectedMaterial,
  onMaterialChange,
  isBatch,
  onBatchToggle,
  modelFile,
  onCostBreakdownChange,
  className = ''
}) => {
  // Print settings state
  const [hasSupport, setHasSupport] = useState(false);
  const [infillPercentage, setInfillPercentage] = useState(PRINT_SETTINGS.DEFAULT_INFILL);
  const [layerHeight, setLayerHeight] = useState(PRINT_SETTINGS.DEFAULT_LAYER_HEIGHT);
  const [printSpeed, setPrintSpeed] = useState(PRINT_SETTINGS.DEFAULT_PRINT_SPEED);
  
  // Cost calculation state
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

  // Calculate cost when parameters change
  useEffect(() => {
    if (modelFile?.parsedModel?.stats?.volume) {
      const breakdown = calculateCost({
        volume: modelFile.parsedModel.stats.volume,
        material: selectedMaterial,
        isBatch,
        hasSupport,
        infillPercentage,
        layerHeight,
        printSpeed
      });
      setCostBreakdown(breakdown);
      onCostBreakdownChange?.(breakdown);
    } else {
      setCostBreakdown(null);
      onCostBreakdownChange?.(null);
    }
  }, [modelFile, selectedMaterial, isBatch, hasSupport, infillPercentage, layerHeight, printSpeed, onCostBreakdownChange]);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-brisbane ${className}`}>
      <h3 className="text-xl font-semibold text-brisbane-dark mb-6">Cost Estimate</h3>
      
      {/* Selected Material Display */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-brisbane-dark mb-3">Selected Material</h4>
        <div className="p-3 rounded-lg border-2 border-brisbane-blue bg-brisbane-blue/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-brisbane-blue">{selectedMaterial.name}</div>
              <div className="text-sm text-brisbane-gray">
                {formatCost(selectedMaterial.pricePerKg)}/kg
                {selectedMaterial.isExotic && <span className="ml-1 text-orange-500">(Exotic)</span>}
              </div>
            </div>
            <div className="text-right text-xs text-brisbane-gray">
              Selected
            </div>
          </div>
        </div>
      </div>

      {/* Print Settings */}
      {modelFile?.parsedModel && (
        <div className="mb-6 space-y-4">
          <h4 className="text-sm font-semibold text-brisbane-dark">Print Settings</h4>
          
          {/* Support Material Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-brisbane-dark">Support Material</div>
              <div className="text-xs text-brisbane-gray">Adds 30% time, 15% material</div>
            </div>
            <button
              onClick={() => setHasSupport(!hasSupport)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hasSupport ? 'bg-brisbane-blue' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasSupport ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Infill Percentage */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-brisbane-dark">Infill Density</div>
              <div className="text-sm font-medium text-brisbane-blue">{infillPercentage}%</div>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={infillPercentage}
              onChange={(e) => setInfillPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-brisbane-gray mt-1">
              <span>10% (Draft)</span>
              <span>50% (Standard)</span>
              <span>100% (Solid)</span>
            </div>
          </div>

          {/* Layer Height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-brisbane-dark mb-2">Layer Height</div>
              <select
                value={layerHeight}
                onChange={(e) => setLayerHeight(parseFloat(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              >
                <option value={0.1}>0.1mm (High Quality)</option>
                <option value={0.2}>0.2mm (Standard)</option>
                <option value={0.3}>0.3mm (Fast)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-brisbane-dark mb-2">Print Speed</div>
              <select
                value={printSpeed}
                onChange={(e) => setPrintSpeed(parseInt(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              >
                <option value={40}>40 mm/s (High Quality)</option>
                <option value={60}>60 mm/s (Standard)</option>
                <option value={80}>80 mm/s (Fast)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Batch Mode Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-semibold text-brisbane-dark">Batch Mode</h4>
            <p className="text-xs text-brisbane-gray">
              {isBatch ? `$${selectedMaterial.isExotic ? '10' : '7'}/hour pricing` : 'Tiered pricing structure'}
            </p>
          </div>
          <button
            onClick={() => onBatchToggle(!isBatch)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isBatch ? 'bg-brisbane-blue' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isBatch ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cost Breakdown */}
      {costBreakdown ? (
        <div className="space-y-4">
          {/* Print Time Display */}
          <div className="bg-brisbane-light rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-brisbane-dark">Estimated Print Time</div>
              <div className="text-lg font-bold text-brisbane-blue">
                {formatPrintTime(costBreakdown.printTimeHours)}
              </div>
            </div>
            <div className="text-xs text-brisbane-gray mt-1">
              Weight: {costBreakdown.weightGrams}g • Volume: {modelFile?.parsedModel?.stats?.volume.toFixed(1)}cm³
            </div>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-brisbane-dark mb-3">Cost Breakdown</h4>
            
            <div className="space-y-3">
              {/* Material Cost */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-brisbane-dark">Material Cost</div>
                  <div className="text-xs text-brisbane-gray">
                    {(costBreakdown.breakdown.materialWeight * 1000).toFixed(1)}g × {formatCost(costBreakdown.breakdown.materialPrice)}/kg
                  </div>
                </div>
                <div className="text-sm font-semibold text-brisbane-dark">
                  {formatCost(costBreakdown.materialCost)}
                </div>
              </div>
              
              {/* Printing Cost */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-brisbane-dark">Printing Cost</div>
                  <div className="text-xs text-brisbane-gray">
                    {isBatch 
                      ? `${formatPrintTime(costBreakdown.printTimeHours)} × ${formatCost(costBreakdown.breakdown.hourlyRate!)}/hour`
                      : costBreakdown.breakdown.tier
                    }
                  </div>
                </div>
                <div className="text-sm font-semibold text-brisbane-dark">
                  {formatCost(costBreakdown.printingCost)}
                </div>
              </div>
              
              {/* Support Cost */}
              {costBreakdown.supportCost && (
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="text-sm font-medium text-orange-800">Support Material</div>
                    <div className="text-xs text-orange-600">15% additional cost</div>
                  </div>
                  <div className="text-sm font-semibold text-orange-800">
                    {formatCost(costBreakdown.supportCost)}
                  </div>
                </div>
              )}
            </div>

            {/* Total Cost */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-brisbane-dark">Total Cost</div>
                  {costBreakdown.breakdown.minimumApplied && (
                    <div className="text-xs text-orange-600">Minimum ${PRINT_SETTINGS.MINIMUM_COST} applied</div>
                  )}
                </div>
                <div className="text-2xl font-bold text-brisbane-blue">
                  {formatCost(costBreakdown.totalCost)}
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-800">
                <div className="font-semibold mb-1">💡 Pricing Tips:</div>
                {isBatch ? (
                  <div>Batch mode: Fixed hourly rate, ideal for multiple items or commercial orders.</div>
                ) : (
                  <div>Tiered pricing: Optimized rates for different print durations. Longer prints are more cost-effective per hour.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4 text-center text-brisbane-gray">
          <div className="text-4xl mb-2">💰</div>
          <div>
            <h4 className="font-semibold mb-1">Upload a 3D Model</h4>
            <p className="text-sm">Get instant cost estimates with detailed breakdowns</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostEstimator; 