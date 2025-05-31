import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { ModelFile } from '../types';
import ViewControls from './ViewControls';
import ModelInfo from './ModelInfo';

interface ModelViewerProps {
  modelFile?: ModelFile;
  className?: string;
}

// Component to render the parsed 3D model
const Model3D: React.FC<{ geometry: THREE.BufferGeometry }> = ({ geometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current && geometry) {
      // Center the geometry
      geometry.center();
      // Ensure the geometry has proper normals
      if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }
      meshRef.current.geometry = geometry;
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <bufferGeometry attach="geometry" />
      <meshStandardMaterial 
        color="#1E88E5"
        roughness={0.3}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Loading spinner component
const LoadingSpinner = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.4, 16, 100]} />
      <meshStandardMaterial color="#007bff" />
    </mesh>
  );
};

// Placeholder mesh component for when no model is loaded
const PlaceholderMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#e0e0e0" 
        opacity={0.6} 
        transparent 
        wireframe 
      />
    </mesh>
  );
};

// Camera controller component
const CameraController: React.FC<{
  position?: [number, number, number];
  target?: [number, number, number];
  onReady?: (api: any) => void;
}> = ({ position, target, onReady }) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (position && controlsRef.current) {
      camera.position.set(...position);
      if (target) {
        controlsRef.current.target.set(...target);
      }
      controlsRef.current.update();
    }
  }, [position, target, camera]);

  useEffect(() => {
    if (onReady && controlsRef.current) {
      onReady(controlsRef.current);
    }
  }, [onReady]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 1.8}
      minDistance={1}
      maxDistance={100}
      target={target || [0, 0, 0]}
    />
  );
};

const ModelViewer: React.FC<ModelViewerProps> = ({ modelFile, className = '' }) => {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([50, 50, 50]);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [controlsApi, setControlsApi] = useState<any>(null);

  const handleViewChange = (position: [number, number, number], target?: [number, number, number]) => {
    setCameraPosition(position);
    if (target) {
      setCameraTarget(target);
    }
  };

  const handleResetView = () => {
    setCameraPosition([50, 50, 50]);
    setCameraTarget([0, 0, 0]);
  };
  return (
    <div className={`w-full h-80 bg-gray-50 rounded-lg overflow-hidden relative ${className}`}>
      {modelFile && modelFile.parsedModel ? (
        <>
          <Canvas 
            camera={{ position: cameraPosition, fov: 45 }}
            shadows
            gl={{ antialias: true, alpha: false }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {/* Lighting setup */}
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
              />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              {/* Grid and helpers */}
              <Grid 
                infiniteGrid 
                cellSize={5} 
                cellThickness={0.5} 
                sectionSize={25}
                sectionThickness={1}
                fadeDistance={100}
                fadeStrength={1}
                cellColor="#e0e0e0"
                sectionColor="#bdbdbd"
              />
              
              {/* Model display with automatic bounds fitting */}
              <Bounds fit clip observe margin={1.2}>
                <Center>
                  <Model3D geometry={modelFile.parsedModel.geometry} />
                </Center>
              </Bounds>
              
              {/* Camera controls */}
              <CameraController
                position={cameraPosition}
                target={cameraTarget}
                onReady={setControlsApi}
              />
            </Suspense>
          </Canvas>

          {/* Overlay Controls */}
          <ViewControls
            onViewChange={handleViewChange}
            onResetView={handleResetView}
          />

          {/* Model Information */}
          <ModelInfo
            stats={modelFile.parsedModel.stats}
            format={modelFile.parsedModel.metadata.format}
            parseTime={modelFile.parsedModel.metadata.parseTime}
          />
        </>
      ) : modelFile ? (
        // Show loading state while parsing
        <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <LoadingSpinner />
        </Canvas>
      ) : (
        // No model uploaded state
        <div className="w-full h-full flex items-center justify-center text-brisbane-gray">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎨</div>
            <div>
              <h3 className="text-lg font-semibold text-brisbane-dark mb-2">
                3D Model Preview
              </h3>
              <p className="text-brisbane-gray">
                Upload a model to see the 3D preview here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer; 