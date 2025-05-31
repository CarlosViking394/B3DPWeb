import React, { useState } from 'react';
import { ENHANCED_MATERIALS, EnhancedMaterial } from './MaterialSelector';
import { formatWeight } from '../utils/3dFileParser';

interface MaterialComparisonProps {
  modelVolume?: number;
  onMaterialSelect: (material: EnhancedMaterial) => void;
  selectedMaterial?: string;
  className?: string;
}

const MaterialComparison: React.FC<MaterialComparisonProps> = ({
  modelVolume,
  onMaterialSelect,
  selectedMaterial,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPropertyIcon = (value: string): string => {
    switch (value) {
      case 'Low':
      case 'Easy':
        return '●';
      case 'Medium':
      case 'Semi-Flexible':
        return '●●';
      case 'High':
      case 'Advanced':
      case 'Flexible':
        return '●●●';
      default:
        return '○';
    }
  };

  const getPropertyColor = (value: string): string => {
    switch (value) {
      case 'Low':
      case 'Easy':
      case 'Rigid':
        return 'text-green-600';
      case 'Medium':
      case 'Semi-Flexible':
        return 'text-orange-600';
      case 'High':
      case 'Advanced':
      case 'Flexible':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isVisible) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setIsVisible(true)}
          className="text-sm text-brisbane-blue hover:text-brisbane-dark underline"
        >
          Compare Materials Side by Side
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-xl shadow-brisbane border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-brisbane-light border-b border-gray-200">
          <h3 className="text-lg font-semibold text-brisbane-dark">Material Comparison</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-brisbane-gray hover:text-brisbane-dark"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Material
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Strength
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Flexibility
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Difficulty
                </th>
                {modelVolume && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                    Est. Weight
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Best For
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-brisbane-gray uppercase tracking-wider">
                  Select
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ENHANCED_MATERIALS.map((material) => {
                const isSelected = selectedMaterial === material.name;
                const estimatedWeight = modelVolume ? 
                  modelVolume * (material.name === 'PLA' ? 1.25 : 
                                material.name === 'ABS' ? 1.04 : 
                                material.name === 'PETG' ? 1.27 : 1.20) : null;

                return (
                  <tr 
                    key={material.id}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-brisbane-blue/5' : ''}`}
                  >
                    {/* Material Name */}
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: material.color }}
                        />
                        <div>
                          <div className={`font-medium ${isSelected ? 'text-brisbane-blue' : 'text-brisbane-dark'}`}>
                            {material.name}
                          </div>
                          {material.isExotic && (
                            <span className="inline-block px-1 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded">
                              Exotic
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-brisbane-dark">
                        ${material.pricePerKg}
                      </div>
                      <div className="text-xs text-brisbane-gray">per kg</div>
                    </td>

                    {/* Strength */}
                    <td className="px-4 py-4">
                      <span className={`text-sm ${getPropertyColor(material.properties.strength)}`}>
                        {getPropertyIcon(material.properties.strength)} {material.properties.strength}
                      </span>
                    </td>

                    {/* Flexibility */}
                    <td className="px-4 py-4">
                      <span className={`text-sm ${getPropertyColor(material.properties.flexibility)}`}>
                        {getPropertyIcon(material.properties.flexibility)} {material.properties.flexibility}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-4">
                      <span className={`text-sm ${getPropertyColor(material.properties.difficulty)}`}>
                        {getPropertyIcon(material.properties.difficulty)} {material.properties.difficulty}
                      </span>
                    </td>

                    {/* Weight (if model volume available) */}
                    {modelVolume && (
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-brisbane-dark">
                          {estimatedWeight ? formatWeight(estimatedWeight) : 'N/A'}
                        </span>
                      </td>
                    )}

                    {/* Use Cases */}
                    <td className="px-4 py-4">
                      <div className="text-xs text-brisbane-gray">
                        {material.useCases.slice(0, 2).join(', ')}
                        {material.useCases.length > 2 && '...'}
                      </div>
                    </td>

                    {/* Select Button */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onMaterialSelect(material)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                          isSelected
                            ? 'bg-brisbane-blue text-white'
                            : 'bg-gray-100 text-brisbane-gray hover:bg-brisbane-blue hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-brisbane-gray">
            <strong>Property Scale:</strong> ● Low/Easy, ●● Medium, ●●● High/Advanced/Flexible
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialComparison; 