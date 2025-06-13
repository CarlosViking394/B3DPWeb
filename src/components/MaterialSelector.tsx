import React from 'react';
import { MaterialType } from '../types';
import { getWeightForMaterial, formatWeight } from '../utils/3dFileParser';
import MaterialComparison from './MaterialComparison';

// Enhanced material data with descriptions and properties
export interface EnhancedMaterial extends MaterialType {
  id: string;
  description: string;
  properties: {
    strength: 'Low' | 'Medium' | 'High';
    flexibility: 'Rigid' | 'Semi-Flexible' | 'Flexible';
    difficulty: 'Easy' | 'Medium' | 'Advanced';
  };
  color: string; // Visual color representation
  useCases: string[];
}

export const ENHANCED_MATERIALS: EnhancedMaterial[] = [
  {
    id: 'pla',
    name: 'PLA',
    pricePerKg: 25,
    isExotic: false,
    description: 'Biodegradable, easy to print, perfect for beginners',
    properties: {
      strength: 'Medium',
      flexibility: 'Rigid',
      difficulty: 'Easy'
    },
    color: '#4CAF50',
    useCases: ['Prototypes', 'Decorative items', 'Educational models', 'Indoor use']
  },
  {
    id: 'abs',
    name: 'ABS',
    pricePerKg: 30,
    isExotic: false,
    description: 'Strong, impact-resistant, suitable for functional parts',
    properties: {
      strength: 'High',
      flexibility: 'Semi-Flexible',
      difficulty: 'Medium'
    },
    color: '#2196F3',
    useCases: ['Functional parts', 'Automotive', 'Electronics cases', 'Tools']
  },
  {
    id: 'petg',
    name: 'PETG',
    pricePerKg: 35,
    isExotic: false,
    description: 'Chemical resistant, clear printing, food-safe',
    properties: {
      strength: 'High',
      flexibility: 'Semi-Flexible',
      difficulty: 'Medium'
    },
    color: '#FF9800',
    useCases: ['Food containers', 'Medical devices', 'Transparent parts', 'Chemical storage']
  },
  {
    id: 'tpu',
    name: 'TPU',
    pricePerKg: 45,
    isExotic: true,
    description: 'Flexible, rubber-like material for specialized applications',
    properties: {
      strength: 'Medium',
      flexibility: 'Flexible',
      difficulty: 'Advanced'
    },
    color: '#9C27B0',
    useCases: ['Phone cases', 'Gaskets', 'Flexible hinges', 'Wearables']
  }
];

interface MaterialSelectorProps {
  selectedMaterial: MaterialType;
  onMaterialChange: (material: MaterialType) => void;
  modelVolume?: number; // For weight calculation
  className?: string;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
  modelVolume,
  className = ''
}) => {
  const handleMaterialSelect = (enhancedMaterial: EnhancedMaterial) => {
    const materialType: MaterialType = {
      name: enhancedMaterial.name,
      pricePerKg: enhancedMaterial.pricePerKg,
      isExotic: enhancedMaterial.isExotic
    };
    onMaterialChange(materialType);
  };

  const getPropertyColor = (property: string, value: string): string => {
    switch (value) {
      case 'Low':
      case 'Easy':
      case 'Rigid':
        return 'text-green-600 bg-green-50';
      case 'Medium':
      case 'Semi-Flexible':
        return 'text-orange-600 bg-orange-50';
      case 'High':
      case 'Advanced':
      case 'Flexible':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brisbane-dark">Select Material</h3>
        <div className="text-sm text-brisbane-gray">
          {ENHANCED_MATERIALS.filter(m => !m.isExotic).length} Standard • {ENHANCED_MATERIALS.filter(m => m.isExotic).length} Exotic
        </div>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENHANCED_MATERIALS.map((material) => {
          const isSelected = selectedMaterial.name === material.name;
          const estimatedWeight = modelVolume ? getWeightForMaterial(modelVolume, material.name) : null;

          return (
            <div
              key={material.id}
              onClick={() => handleMaterialSelect(material)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'border-brisbane-blue bg-brisbane-blue/5 shadow-md'
                  : 'border-gray-200 hover:border-brisbane-blue/50 bg-white'
              }`}
            >
              {/* Material Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Color indicator */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: material.color }}
                  />
                  <div>
                    <h4 className={`font-semibold ${isSelected ? 'text-brisbane-blue' : 'text-brisbane-dark'}`}>
                      {material.name}
                    </h4>
                    {material.isExotic && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                        Exotic
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${isSelected ? 'text-brisbane-blue' : 'text-brisbane-dark'}`}>
                    ${material.pricePerKg}
                  </div>
                  <div className="text-xs text-brisbane-gray">per kg</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-brisbane-gray mb-3 leading-relaxed">
                {material.description}
              </p>

              {/* Properties */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brisbane-gray">Strength:</span>
                  <span className={`px-2 py-1 rounded-full font-medium ${getPropertyColor('strength', material.properties.strength)}`}>
                    {material.properties.strength}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brisbane-gray">Flexibility:</span>
                  <span className={`px-2 py-1 rounded-full font-medium ${getPropertyColor('flexibility', material.properties.flexibility)}`}>
                    {material.properties.flexibility}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brisbane-gray">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full font-medium ${getPropertyColor('difficulty', material.properties.difficulty)}`}>
                    {material.properties.difficulty}
                  </span>
                </div>
              </div>

              {/* Weight Estimate (if model volume available) */}
              {estimatedWeight && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brisbane-gray">Estimated Weight:</span>
                    <span className="font-medium text-brisbane-dark">
                      {formatWeight(estimatedWeight)}
                    </span>
                  </div>
                </div>
              )}

              {/* Use Cases */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="text-xs text-brisbane-gray mb-1">Best for:</div>
                <div className="flex flex-wrap gap-1">
                  {material.useCases.slice(0, 3).map((useCase) => (
                    <span 
                      key={useCase}
                      className="px-2 py-1 text-xs text-brisbane-gray bg-gray-100 rounded-full"
                    >
                      {useCase}
                    </span>
                  ))}
                  {material.useCases.length > 3 && (
                    <span className="px-2 py-1 text-xs text-brisbane-gray bg-gray-100 rounded-full">
                      +{material.useCases.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-brisbane-blue rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick comparison */}
      <div className="bg-brisbane-light rounded-lg p-4">
        <h4 className="text-sm font-semibold text-brisbane-dark mb-2">Quick Material Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-brisbane-gray">
          <div>• <strong>PLA:</strong> Easiest to print, biodegradable</div>
          <div>• <strong>ABS:</strong> Strong, heat resistant</div>
          <div>• <strong>PETG:</strong> Chemical resistant, clear</div>
          <div>• <strong>TPU:</strong> Flexible, rubber-like</div>
        </div>
      </div>

      {/* Material Comparison Table */}
      <MaterialComparison
        modelVolume={modelVolume}
        onMaterialSelect={handleMaterialSelect}
        selectedMaterial={selectedMaterial.name}
      />
    </div>
  );
};

export default MaterialSelector; 