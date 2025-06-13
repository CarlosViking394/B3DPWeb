import React from 'react';
import { MaterialType } from '../types';
import { formatCost } from '../utils/costCalculator';

interface BatchModeToggleProps {
  isBatch: boolean;
  onToggle: (isBatch: boolean) => void;
  selectedMaterial?: MaterialType;
  className?: string;
}

const TIERED_PRICING_STRUCTURE = [
  { timeRange: 'Less than 1 hour', minPrice: 10, maxPrice: 15, description: 'Quick prints and prototypes' },
  { timeRange: '1-3 hours', minPrice: 30, maxPrice: 45, description: 'Standard complexity models' },
  { timeRange: '3-6 hours', minPrice: 60, maxPrice: 90, description: 'Detailed and complex prints' },
  { timeRange: '6+ hours', minPrice: 100, maxPrice: 150, description: 'Large and intricate projects' },
];

const BatchModeToggle: React.FC<BatchModeToggleProps> = ({
  isBatch,
  onToggle,
  selectedMaterial,
  className = ''
}) => {
  const batchHourlyRate = selectedMaterial?.isExotic ? 10 : 7;

  return (
    <div className={`bg-white rounded-lg p-6 shadow-brisbane ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-brisbane-dark">Pricing Mode</h3>
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium transition-colors ${!isBatch ? 'text-brisbane-blue' : 'text-brisbane-gray'}`}>
            Regular
          </span>
          <button
            onClick={() => onToggle(!isBatch)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brisbane-blue focus:ring-offset-2 ${
              isBatch ? 'bg-brisbane-blue' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isBatch ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isBatch ? 'text-brisbane-blue' : 'text-brisbane-gray'}`}>
            Batch
          </span>
        </div>
      </div>

      {/* Mode Description */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">
            {isBatch ? '📦' : '⚡'}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-brisbane-dark mb-1">
              {isBatch ? 'Batch Mode Pricing' : 'Regular Mode Pricing'}
            </h4>
            <p className="text-sm text-brisbane-gray leading-relaxed">
              {isBatch 
                ? 'Economical hourly rates perfect for larger prints and bulk orders. Your item will be printed when we have optimal printer utilization.'
                : 'Tiered pricing based on print time complexity. Your item will be prioritized for the fastest possible completion.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-4">
        {isBatch ? (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brisbane-dark">Hourly Rates</h4>
            
            <div className="grid gap-3">
              {/* Standard Materials Rate */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-blue-900">Standard Materials</div>
                    <div className="text-sm text-blue-700">PLA, ABS, PETG</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {formatCost(7)}/hour
                </div>
              </div>

              {/* Exotic Materials Rate */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-orange-900">Exotic Materials</div>
                    <div className="text-sm text-orange-700">TPU, specialty filaments</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-orange-900">
                  {formatCost(10)}/hour
                </div>
              </div>

              {/* Current Selection */}
              {selectedMaterial && (
                <div className="p-3 bg-brisbane-light rounded-lg border border-brisbane-blue">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-brisbane-blue rounded-full"></div>
                      <div>
                        <div className="font-medium text-brisbane-dark">Your Selection: {selectedMaterial.name}</div>
                        <div className="text-sm text-brisbane-gray">
                          {selectedMaterial.isExotic ? 'Exotic material' : 'Standard material'}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-brisbane-blue">
                      {formatCost(batchHourlyRate)}/hour
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Batch Mode Benefits */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                <div className="font-semibold mb-1">💡 Batch Mode Benefits:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Most economical pricing for longer prints</li>
                  <li>• Transparent hourly billing</li>
                  <li>• Perfect for bulk orders and large models</li>
                  <li>• Environmentally efficient printer utilization</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brisbane-dark">Tiered Pricing Structure</h4>
            
            <div className="space-y-3">
              {TIERED_PRICING_STRUCTURE.map((tier, index) => (
                <div key={tier.timeRange} className="p-4 border border-gray-200 rounded-lg hover:border-brisbane-blue/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-brisbane-dark">{tier.timeRange}</div>
                        <div className="text-sm text-brisbane-gray">{tier.description}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-brisbane-dark">
                      {formatCost(tier.minPrice)} - {formatCost(tier.maxPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Regular Mode Benefits */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <div className="font-semibold mb-1">⚡ Regular Mode Benefits:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Fastest possible completion time</li>
                  <li>• Priority queue placement</li>
                  <li>• Optimized pricing for each complexity tier</li>
                  <li>• Perfect for urgent and prototype prints</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selection Tip */}
      <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-sm text-yellow-800">
          <div className="font-semibold mb-1">🎯 Which Mode Should I Choose?</div>
          <div className="text-xs space-y-1">
            <div>• <strong>Choose Batch Mode</strong> for: Large prints (6+ hours), bulk orders, cost optimization</div>
            <div>• <strong>Choose Regular Mode</strong> for: Quick turnaround, prototypes, time-sensitive projects</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchModeToggle; 