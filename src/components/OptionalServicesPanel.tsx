import React from 'react';
import { OptionalService } from '../types';
import { formatCost } from '../utils/costCalculator';

interface OptionalServicesPanelProps {
  services: OptionalService[];
  onServiceUpdate: (index: number, service: OptionalService) => void;
  className?: string;
}

// Enhanced service definitions with categories and icons
interface ServiceTemplate {
  name: string;
  pricePerHour: number;
  description: string;
  category: 'design' | 'finishing' | 'cleaning';
  icon: string;
  estimatedTime: string;
  popularHours: number[];
}

const AVAILABLE_SERVICES: ServiceTemplate[] = [
  {
    name: 'Modelling',
    pricePerHour: 70,
    description: 'Custom 3D modeling, design optimization, and file preparation',
    category: 'design',
    icon: '🎨',
    estimatedTime: '2-8 hours typical',
    popularHours: [2, 4, 8]
  },
  {
    name: 'Support Removal',
    pricePerHour: 60,
    description: 'Professional support material removal and surface cleaning',
    category: 'finishing',
    icon: '🔧',
    estimatedTime: '0.5-2 hours typical',
    popularHours: [0.5, 1, 1.5]
  },
  {
    name: 'Painting',
    pricePerHour: 60,
    description: 'Custom painting, priming, and professional finishing work',
    category: 'finishing',
    icon: '🎭',
    estimatedTime: '1-4 hours typical',
    popularHours: [1, 2, 3]
  },
  {
    name: 'Cleaning',
    pricePerHour: 60,
    description: 'Professional cleaning, polishing, and final quality inspection',
    category: 'cleaning',
    icon: '✨',
    estimatedTime: '0.5-1 hour typical',
    popularHours: [0.5, 1]
  },
];

const CATEGORY_INFO = {
  design: { name: 'Design Services', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  finishing: { name: 'Finishing Services', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  cleaning: { name: 'Cleaning Services', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
};

const OptionalServicesPanel: React.FC<OptionalServicesPanelProps> = ({
  services,
  onServiceUpdate,
  className = ''
}) => {
  const handleHoursChange = (index: number, hours: number) => {
    const service = services[index];
    if (service) {
      onServiceUpdate(index, { ...service, hours: Math.max(0, hours) });
    }
  };

  const toggleService = (serviceTemplate: ServiceTemplate) => {
    const existingIndex = services.findIndex(s => s.name === serviceTemplate.name);
    
    if (existingIndex >= 0) {
      // Remove service (set hours to 0)
      onServiceUpdate(existingIndex, { ...services[existingIndex], hours: 0 });
    } else {
      // Add service with default hours
      const defaultHours = serviceTemplate.popularHours[0];
      const newService: OptionalService = {
        name: serviceTemplate.name,
        pricePerHour: serviceTemplate.pricePerHour,
        hours: defaultHours
      };
      onServiceUpdate(services.length, newService);
    }
  };

  const setQuickHours = (serviceTemplate: ServiceTemplate, hours: number) => {
    const existingIndex = services.findIndex(s => s.name === serviceTemplate.name);
    if (existingIndex >= 0) {
      handleHoursChange(existingIndex, hours);
    } else {
      // Add service with specified hours
      const newService: OptionalService = {
        name: serviceTemplate.name,
        pricePerHour: serviceTemplate.pricePerHour,
        hours: hours
      };
      onServiceUpdate(services.length, newService);
    }
  };

  const isServiceActive = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    return service && service.hours > 0;
  };

  const getServiceHours = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    return service?.hours || 0;
  };

  const getServiceIndex = (serviceName: string) => {
    return services.findIndex(s => s.name === serviceName);
  };

  // Calculate total optional services cost
  const totalServicesCost = services
    .filter(s => s.hours > 0)
    .reduce((total, service) => total + (service.hours * service.pricePerHour), 0);

  // Group services by category
  const servicesByCategory = AVAILABLE_SERVICES.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceTemplate[]>);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-brisbane ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-brisbane-dark">Optional Services</h3>
        {totalServicesCost > 0 && (
          <div className="text-lg font-bold text-brisbane-blue">
            {formatCost(totalServicesCost)}
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
          const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
          const categoryTotal = categoryServices
            .filter(st => isServiceActive(st.name))
            .reduce((sum, st) => sum + (getServiceHours(st.name) * st.pricePerHour), 0);

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-semibold ${categoryInfo.color}`}>
                  {categoryInfo.name}
                </h4>
                {categoryTotal > 0 && (
                  <span className={`text-sm font-medium ${categoryInfo.color}`}>
                    {formatCost(categoryTotal)}
                  </span>
                )}
              </div>

              {/* Services in Category */}
              <div className="space-y-3">
                {categoryServices.map((serviceTemplate) => {
                  const isActive = isServiceActive(serviceTemplate.name);
                  const hours = getServiceHours(serviceTemplate.name);
                  const serviceIndex = getServiceIndex(serviceTemplate.name);
                  const serviceCost = hours * serviceTemplate.pricePerHour;

                  return (
                    <div
                      key={serviceTemplate.name}
                      className={`border rounded-xl p-4 transition-all ${
                        isActive 
                          ? `${categoryInfo.borderColor} ${categoryInfo.bgColor}` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl">{serviceTemplate.icon}</div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-brisbane-dark flex items-center">
                              {serviceTemplate.name}
                              <span className="ml-2 text-sm font-normal text-brisbane-blue">
                                {formatCost(serviceTemplate.pricePerHour)}/hour
                              </span>
                            </h5>
                            <p className="text-sm text-brisbane-gray leading-relaxed">
                              {serviceTemplate.description}
                            </p>
                            <p className="text-xs text-brisbane-gray mt-1">
                              {serviceTemplate.estimatedTime}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleService(serviceTemplate)}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                            isActive
                              ? 'bg-brisbane-blue text-white hover:bg-brisbane-blue/90'
                              : 'bg-gray-100 text-brisbane-gray hover:bg-gray-200'
                          }`}
                        >
                          {isActive ? 'Remove' : 'Add'}
                        </button>
                      </div>

                      {isActive && (
                        <div className="space-y-3">
                          {/* Quick Hour Selection */}
                          <div>
                            <div className="text-xs font-medium text-brisbane-gray mb-2">Quick Select:</div>
                            <div className="flex items-center space-x-2">
                              {serviceTemplate.popularHours.map((quickHours) => (
                                <button
                                  key={quickHours}
                                  onClick={() => setQuickHours(serviceTemplate, quickHours)}
                                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                    hours === quickHours
                                      ? `${categoryInfo.color} bg-white border-current`
                                      : 'text-brisbane-gray border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {quickHours}h
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Hour Input */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <label className="text-sm font-medium text-brisbane-dark">Custom Hours:</label>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleHoursChange(serviceIndex, hours - 0.5)}
                                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-brisbane-dark transition-colors"
                                >
                                  −
                                </button>
                                
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={hours}
                                  onChange={(e) => handleHoursChange(serviceIndex, parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:border-brisbane-blue focus:outline-none"
                                />
                                
                                <button
                                  onClick={() => handleHoursChange(serviceIndex, hours + 0.5)}
                                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-brisbane-dark transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-lg font-bold text-brisbane-blue">
                              {formatCost(serviceCost)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      {services.filter(s => s.hours > 0).length === 0 ? (
        <div className="text-center text-brisbane-gray py-8 border-t border-gray-200 mt-6">
          <div className="text-4xl mb-3">🛠️</div>
          <div>
            <h4 className="font-semibold mb-1">No Services Selected</h4>
            <p className="text-sm">Add professional services to enhance your 3D print</p>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-brisbane-dark">Selected Services Summary</h4>
            {services.filter(s => s.hours > 0).map((service) => (
              <div key={service.name} className="flex justify-between text-sm">
                <span className="text-brisbane-gray">
                  {service.name} ({service.hours}h × {formatCost(service.pricePerHour)}/h)
                </span>
                <span className="font-medium text-brisbane-dark">
                  {formatCost(service.hours * service.pricePerHour)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span className="text-brisbane-dark">Total Services Cost</span>
              <span className="text-brisbane-blue text-lg">{formatCost(totalServicesCost)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Service Info */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-800">
          <div className="font-semibold mb-1">💡 Service Information:</div>
          <div>All services are performed by experienced professionals. Times may vary based on complexity and model requirements. Contact us for custom service estimates.</div>
        </div>
      </div>
    </div>
  );
};

export default OptionalServicesPanel; 