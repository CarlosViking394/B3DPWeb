import React, { useState } from 'react'
import FileUploader from './components/FileUploader'
import ModelViewer from './components/ModelViewer'
import MaterialSelector from './components/MaterialSelector'
import CostEstimator from './components/CostEstimator'
import ETACalculator from './components/ETACalculator'
import BatchModeToggle from './components/BatchModeToggle'
import EstimateSummary from './components/EstimateSummary'
import { ModelFile, MaterialType, OptionalService, CostBreakdown, ETACalculation, MATERIALS } from './types'

function App() {
  const [uploadedFile, setUploadedFile] = useState<ModelFile | undefined>(undefined);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(MATERIALS[0]);
  const [isBatch, setIsBatch] = useState(false);
  const [optionalServices, setOptionalServices] = useState<OptionalService[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [etaEstimate, setEtaEstimate] = useState<ETACalculation | null>(null);

  const handleFileUpload = (result: ModelFile) => {
    setUploadedFile(result);
    // Reset dependent states when file changes
    setCostBreakdown(null);
    setEtaEstimate(null);
  };

  const handleMaterialSelect = (material: MaterialType) => {
    setSelectedMaterial(material);
  };

  const handlePricingModeChange = (batch: boolean) => {
    setIsBatch(batch);
  };

  const handleOptionalServicesChange = (services: OptionalService[]) => {
    setOptionalServices(services);
  };

  const handleCostCalculated = (breakdown: CostBreakdown | null) => {
    setCostBreakdown(breakdown);
  };

  return (
    <div className="min-h-screen bg-brisbane-white font-brisbane">
      {/* Header - Matching Brisbane 3D Printing */}
      <header className="header-brisbane">
        <div className="container-brisbane">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
              Transform Ideas into Reality
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Brisbane 3D Printing offers exceptional 3D printing services, specializing in engineering prototypes, cosplay creations, and more. Get an instant cost estimate for your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-brisbane-secondary">
                📞 Get Expert Quote
              </button>
              <button className="btn-brisbane-accent">
                🎓 Student Discount (10% Off)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-brisbane py-12">
        {/* Introduction Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold heading-gradient mb-6">
            Professional 3D Printing Cost Estimator
          </h2>
          <p className="text-lg text-brisbane-gray max-w-3xl mx-auto mb-8">
            Upload your 3D model, select from our premium materials (PLA, PLA+, PET-G, ASA, ABS, TPU), 
            and get an instant estimate. Choose between regular pricing or batch discounts for larger orders.
          </p>
          
          {/* Service Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card-brisbane text-center">
              <div className="text-3xl mb-3">🖨️</div>
              <h3 className="font-semibold text-brisbane-dark mb-2">3D Printing</h3>
              <p className="text-sm text-brisbane-gray">Advanced technologies and premium materials</p>
            </div>
            <div className="card-brisbane text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-brisbane-dark mb-2">Support Removal</h3>
              <p className="text-sm text-brisbane-gray">Professional finishing for clean results</p>
            </div>
            <div className="card-brisbane text-center">
              <div className="text-3xl mb-3">📐</div>
              <h3 className="font-semibold text-brisbane-dark mb-2">3D Scanning</h3>
              <p className="text-sm text-brisbane-gray">Precise scanning for prototypes</p>
            </div>
            <div className="card-brisbane text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-brisbane-dark mb-2">3D Modeling</h3>
              <p className="text-sm text-brisbane-gray">Expert design assistance</p>
            </div>
          </div>
        </div>

        {/* Cost Estimator Steps */}
        <div className="max-w-6xl mx-auto">
          {/* Step 1: File Upload */}
          <div className="card-brisbane mb-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-brisbane rounded-full flex items-center justify-center text-white font-bold mr-4">
                1
              </div>
              <h3 className="text-2xl font-heading font-bold text-brisbane-dark">
                Upload Your 3D Model
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <div>
                <FileUploader onFileUpload={handleFileUpload} />
                
                {/* File Information */}
                {uploadedFile && (
                  <div className="mt-6 p-4 bg-brisbane-light rounded-lg">
                    <h4 className="font-medium text-brisbane-dark mb-3">📁 File Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brisbane-gray">Filename:</span>
                        <span className="font-medium text-brisbane-dark">{uploadedFile.filename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brisbane-gray">Size:</span>
                        <span className="font-medium text-brisbane-dark">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      {uploadedFile.parsedModel && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-brisbane-gray">Format:</span>
                            <span className="font-medium text-brisbane-dark">{uploadedFile.parsedModel.metadata.format}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-brisbane-gray">Volume:</span>
                            <span className="font-medium text-brisbane-dark">{uploadedFile.parsedModel.stats.volume.toFixed(2)} cm³</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-brisbane-gray">Triangles:</span>
                            <span className="font-medium text-brisbane-dark">{uploadedFile.parsedModel.stats.triangleCount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-brisbane-gray">Dimensions:</span>
                            <span className="font-medium text-brisbane-dark text-xs">
                              {uploadedFile.parsedModel.stats.dimensions.width.toFixed(1)} × {' '}
                              {uploadedFile.parsedModel.stats.dimensions.height.toFixed(1)} × {' '}
                              {uploadedFile.parsedModel.stats.dimensions.depth.toFixed(1)} mm
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 3D Model Preview */}
              <div className="bg-brisbane-light rounded-xl p-6">
                <h4 className="font-medium text-brisbane-dark mb-4">🎮 3D Preview</h4>
                <ModelViewer modelFile={uploadedFile} />
              </div>
            </div>
          </div>

          {/* Step 2: Material Selection */}
          {uploadedFile && (
            <div className="card-brisbane mb-8 animate-fade-in-up">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-brisbane rounded-full flex items-center justify-center text-white font-bold mr-4">
                  2
                </div>
                <h3 className="text-2xl font-heading font-bold text-brisbane-dark">
                  Select Premium Material
                </h3>
              </div>
              <MaterialSelector 
                selectedMaterial={selectedMaterial}
                onMaterialChange={handleMaterialSelect}
                modelVolume={uploadedFile.volume}
              />
            </div>
          )}

          {/* Step 3: Pricing Mode */}
          {selectedMaterial && (
            <div className="card-brisbane mb-8 animate-fade-in-up">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-brisbane rounded-full flex items-center justify-center text-white font-bold mr-4">
                  3
                </div>
                <h3 className="text-2xl font-heading font-bold text-brisbane-dark">
                  Choose Pricing Option
                </h3>
              </div>
              <BatchModeToggle 
                isBatch={isBatch}
                onToggle={handlePricingModeChange}
                selectedMaterial={selectedMaterial}
              />
            </div>
          )}

          {/* Step 4: Cost Calculation */}
          {selectedMaterial && uploadedFile && (
            <div className="card-brisbane mb-8 animate-fade-in-up">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-brisbane rounded-full flex items-center justify-center text-white font-bold mr-4">
                  4
                </div>
                <h3 className="text-2xl font-heading font-bold text-brisbane-dark">
                  Calculate Costs & Timeline
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CostEstimator
                  selectedMaterial={selectedMaterial}
                  onMaterialChange={setSelectedMaterial}
                  isBatch={isBatch}
                  onBatchToggle={setIsBatch}
                  modelFile={uploadedFile}
                  onCostBreakdownChange={handleCostCalculated}
                />
                <ETACalculator
                  costBreakdown={costBreakdown || undefined}
                />
              </div>
            </div>
          )}

          {/* Step 5: Final Summary */}
          {costBreakdown && etaEstimate && (
            <div className="card-brisbane animate-fade-in-up">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-white font-bold mr-4">
                  5
                </div>
                <h3 className="text-2xl font-heading font-bold text-brisbane-dark">
                  Project Summary & Quote
                </h3>
              </div>
              <EstimateSummary
                modelFile={uploadedFile}
                selectedMaterial={selectedMaterial}
                isBatch={isBatch}
                costBreakdown={costBreakdown}
                optionalServices={optionalServices}
                etaCalculation={etaEstimate}
              />
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-16">
          <div className="card-brisbane bg-gradient-brisbane text-white">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Ready to Bring Your Ideas to Life?
            </h3>
            <p className="text-lg mb-8 opacity-90">
              Our expert team uses advanced technologies and premium materials to deliver exceptional results. 
              Contact Brisbane 3D Printing today for personalized assistance with your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-brisbane-secondary bg-white text-brisbane-primary border-white hover:bg-brisbane-light">
                📞 Call (07) XXXX-XXXX
              </button>
              <button className="btn-brisbane-accent">
                ✉️ Request Custom Quote
              </button>
            </div>
          </div>
        </div>

        {/* Student Discount Banner */}
        <div className="mt-8 p-6 bg-gradient-accent rounded-xl text-white text-center">
          <h4 className="text-xl font-bold mb-2">🎓 Student Discount Available!</h4>
          <p className="text-sm opacity-90">
            Get 10% off your 3D printing order with valid student ID. Perfect for engineering prototypes and cosplay projects!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brisbane-dark text-white py-12 mt-16">
        <div className="container-brisbane">
          <div className="text-center">
            <h3 className="text-2xl font-heading font-bold mb-4">Brisbane 3D Printing</h3>
            <p className="text-brisbane-gray mb-6">
              Leading the way in innovative 3D printing solutions. Specializing in engineering prototypes, 
              cosplay creations, and custom designs with premium materials and expert craftsmanship.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-brisbane-accent transition-colors">Print My Model</a>
              <a href="#" className="hover:text-brisbane-accent transition-colors">Prices</a>
              <a href="#" className="hover:text-brisbane-accent transition-colors">Services</a>
              <a href="#" className="hover:text-brisbane-accent transition-colors">Materials</a>
              <a href="#" className="hover:text-brisbane-accent transition-colors">Contact Us</a>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-brisbane-gray">
              © 2024 Brisbane 3D Printing. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App 