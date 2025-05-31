import React, { useState } from 'react';
import { ModelStats } from '../types';
import { formatWeight } from '../utils/3dFileParser';

interface ModelInfoProps {
  stats: ModelStats;
  format: string;
  parseTime: number;
  className?: string;
}

const ModelInfo: React.FC<ModelInfoProps> = ({ 
  stats, 
  format, 
  parseTime, 
  className = '' 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`absolute top-4 right-4 z-10 ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 max-w-xs">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h4 className="text-sm font-semibold text-brisbane-dark">Model Info</h4>
          <button className="text-brisbane-gray hover:text-brisbane-dark">
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="px-3 pb-3 space-y-3">
            {/* Basic Stats */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-brisbane-gray">Format:</span>
                <span className="font-medium text-brisbane-dark">{format}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-brisbane-gray">Parse Time:</span>
                <span className="font-medium text-brisbane-dark">{parseTime}ms</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-brisbane-gray">Triangles:</span>
                <span className="font-medium text-brisbane-dark">
                  {stats.triangleCount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Dimensions */}
            <div className="border-t border-gray-200 pt-2 space-y-1.5">
              <div className="text-xs font-medium text-brisbane-dark">Dimensions (mm)</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-brisbane-gray">W</div>
                  <div className="font-medium">{stats.dimensions.width.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-brisbane-gray">H</div>
                  <div className="font-medium">{stats.dimensions.height.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-brisbane-gray">D</div>
                  <div className="font-medium">{stats.dimensions.depth.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Volume & Surface Area */}
            <div className="border-t border-gray-200 pt-2 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-brisbane-gray">Volume:</span>
                <span className="font-medium text-brisbane-dark">
                  {stats.volume.toFixed(2)} cm³
                </span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-brisbane-gray">Surface Area:</span>
                <span className="font-medium text-brisbane-dark">
                  {stats.surfaceArea.toFixed(1)} cm²
                </span>
              </div>
            </div>

            {/* Weight Estimates */}
            {stats.estimatedWeight && (
              <div className="border-t border-gray-200 pt-2">
                <div className="text-xs font-medium text-brisbane-dark mb-1.5">
                  Estimated Weight
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(stats.estimatedWeight)
                    .slice(0, 4) // Show top 4 materials
                    .map(([material, weight]) => (
                      <div key={material} className="flex justify-between">
                        <span className="text-brisbane-gray">{material}:</span>
                        <span className="font-medium text-brisbane-dark">
                          {formatWeight(weight)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelInfo; 