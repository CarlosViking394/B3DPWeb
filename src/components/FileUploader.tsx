import React, { useRef, useState } from 'react';
import { ModelFile } from '../types';
import { parse3DFile, formatModelStats } from '../utils/3dFileParser';

interface FileUploaderProps {
  onFileUpload: (file: ModelFile) => void;
  isLoading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setParsing(true);
    
    try {
      // Parse 3D file (auto-detects STL or 3MF format)
      const parsedModel = await parse3DFile(file);
      
      const modelFile: ModelFile = {
        file,
        filename: file.name,
        size: file.size,
        volume: parsedModel.stats.volume,
        dimensions: {
          x: parsedModel.stats.dimensions.width,
          y: parsedModel.stats.dimensions.height,
          z: parsedModel.stats.dimensions.depth,
        },
        parsedModel,
      };
      
      onFileUpload(modelFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse file';
      setError(errorMessage);
      console.error('File upload error:', error);
    } finally {
      setParsing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.stl') || file.name.endsWith('.3mf'))) {
      handleFileSelect(file);
    } else if (file) {
      setError('Please upload a valid STL or 3MF file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragOver 
            ? 'border-brisbane-blue bg-brisbane-blue/5' 
            : error 
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-brisbane-blue'
          }
          ${isLoading || parsing ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !parsing && !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.3mf"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading || parsing}
        />
        
        <div className="space-y-4">
          {parsing ? (
            <>
              <div className="text-6xl">⏳</div>
              <div>
                <h3 className="text-lg font-semibold text-brisbane-dark mb-2">
                  Parsing 3D Model...
                </h3>
                <p className="text-brisbane-gray">
                  Please wait while we analyze your file
                </p>
              </div>
            </>
          ) : error ? (
            <>
              <div className="text-6xl text-red-500">❌</div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Upload Error
                </h3>
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-brisbane-blue hover:text-brisbane-dark"
                >
                  Try again
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl text-brisbane-gray">📁</div>
              <div>
                <h3 className="text-lg font-semibold text-brisbane-dark mb-2">
                  Upload Your 3D Model
                </h3>
                <p className="text-brisbane-gray">
                  Drag and drop your STL or 3MF file here, or click to browse
                </p>
              </div>
              <div className="text-sm text-brisbane-gray">
                Supported formats: .stl, .3mf (Max size: 100MB)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader; 