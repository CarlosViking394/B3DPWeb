import React from 'react';

interface ViewControlsProps {
  onViewChange: (position: [number, number, number], target?: [number, number, number]) => void;
  onResetView: () => void;
  className?: string;
}

const ViewControls: React.FC<ViewControlsProps> = ({ 
  onViewChange, 
  onResetView, 
  className = '' 
}) => {
  const presetViews = [
    { name: 'Top', position: [0, 50, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    { name: 'Front', position: [0, 0, 50] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    { name: 'Right', position: [50, 0, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    { name: 'ISO', position: [35, 35, 35] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  ];

  return (
    <div className={`absolute top-4 left-4 z-10 space-y-2 ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-brisbane-dark mb-2">View Controls</h4>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          {presetViews.map((view) => (
            <button
              key={view.name}
              onClick={() => onViewChange(view.position, view.target)}
              className="px-3 py-1.5 text-xs font-medium text-brisbane-gray hover:text-brisbane-blue 
                         bg-gray-50 hover:bg-brisbane-blue/10 rounded border border-gray-200 
                         hover:border-brisbane-blue/30 transition-all"
            >
              {view.name}
            </button>
          ))}
        </div>

        <button
          onClick={onResetView}
          className="w-full px-3 py-1.5 text-xs font-medium text-white bg-brisbane-blue 
                     hover:bg-brisbane-blue/80 rounded border border-brisbane-blue 
                     transition-all"
        >
          Reset View
        </button>
      </div>
    </div>
  );
};

export default ViewControls; 