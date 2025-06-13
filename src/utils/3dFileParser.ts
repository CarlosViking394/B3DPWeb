import * as THREE from 'three';

// Dynamic import for jszip to handle module resolution issues
let JSZip: any = null;
const loadJSZip = async () => {
  if (!JSZip) {
    try {
      const jszipModule = await import('jszip');
      JSZip = jszipModule.default || jszipModule;
    } catch (error) {
      throw new Error('JSZip library not available. Unable to parse 3MF files.');
    }
  }
  return JSZip;
};

// Note: Using custom volume calculation instead of three-mesh-bvh for better compatibility

// Enhanced types for 3D model data
export interface ModelStats {
  volume: number; // in cm³
  dimensions: {
    width: number;  // in mm
    height: number; // in mm
    depth: number;  // in mm
  };
  triangleCount: number;
  surfaceArea: number; // in cm²
  boundingBox: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
  estimatedWeight?: {
    [materialName: string]: number; // weight in grams for each material
  };
}

export interface ParsedModel {
  geometry: THREE.BufferGeometry;
  stats: ModelStats;
  metadata: {
    format: 'STL_ASCII' | 'STL_BINARY' | '3MF';
    fileSize: number;
    parseTime: number;
  };
}

/**
 * Parse 3MF file (ZIP archive containing XML model data)
 */
export const parse3MFFile = async (file: File): Promise<ParsedModel> => {
  const startTime = performance.now();
  
  try {
    const JSZipLib = await loadJSZip();
    const zip = new JSZipLib();
    
    // Load the 3MF file as a ZIP archive
    const zipData = await zip.loadAsync(file.arrayBuffer());
    
    // Find the 3D model file (usually 3D/3dmodel.model)
    const modelFile = zipData.file('3D/3dmodel.model') || zipData.file('3dmodel.model');
    if (!modelFile) {
      throw new Error('No 3D model file found in 3MF archive');
    }
    
    // Extract and parse the XML content
    const xmlContent = await modelFile.async('text');
    const geometry = parse3MFGeometry(xmlContent);
    
    // Calculate stats
    const stats = calculateModelStats(geometry);
    
    const parseTime = performance.now() - startTime;
    
    return {
      geometry,
      stats,
      metadata: {
        format: '3MF',
        fileSize: file.size,
        parseTime: Math.round(parseTime * 100) / 100,
      },
    };
  } catch (error) {
    console.error('Error parsing 3MF file:', error);
    throw new Error(`Failed to parse 3MF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Parse STL file (supports both ASCII and binary formats)
 */
export const parseSTLFile = async (file: File): Promise<ParsedModel> => {
  const startTime = performance.now();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Detect STL format (ASCII vs Binary)
    const isASCII = detectSTLFormat(uint8Array);
    
    let geometry: THREE.BufferGeometry;
    
    if (isASCII) {
      geometry = parseSTLASCII(arrayBuffer);
    } else {
      geometry = parseSTLBinary(arrayBuffer);
    }
    
    // Calculate stats
    const stats = calculateModelStats(geometry);
    
    const parseTime = performance.now() - startTime;
    
    return {
      geometry,
      stats,
      metadata: {
        format: isASCII ? 'STL_ASCII' : 'STL_BINARY',
        fileSize: file.size,
        parseTime: Math.round(parseTime * 100) / 100, // Round to 2 decimal places
      },
    };
  } catch (error) {
    console.error('Error parsing STL file:', error);
    throw new Error(`Failed to parse STL file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Detect if STL file is ASCII or Binary format
 */
const detectSTLFormat = (uint8Array: Uint8Array): boolean => {
  // Check if file starts with 'solid' (ASCII format)
  const header = new TextDecoder().decode(uint8Array.slice(0, 5));
  if (header.toLowerCase() === 'solid') {
    // Further validation: ASCII STL should contain 'facet normal' 
    const sample = new TextDecoder().decode(uint8Array.slice(0, Math.min(1000, uint8Array.length)));
    return sample.includes('facet normal') && sample.includes('vertex');
  }
  return false;
};

/**
 * Parse ASCII STL format
 */
const parseSTLASCII = (arrayBuffer: ArrayBuffer): THREE.BufferGeometry => {
  const text = new TextDecoder().decode(arrayBuffer);
  const lines = text.split('\n').map(line => line.trim());
  
  const vertices: number[] = [];
  const normals: number[] = [];
  
  let currentNormal: THREE.Vector3 | null = null;
  
  for (const line of lines) {
    if (line.startsWith('facet normal')) {
      const parts = line.split(/\s+/);
      currentNormal = new THREE.Vector3(
        parseFloat(parts[2]),
        parseFloat(parts[3]),
        parseFloat(parts[4])
      );
    } else if (line.startsWith('vertex')) {
      const parts = line.split(/\s+/);
      vertices.push(
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      );
      
      // Add the current normal for this vertex
      if (currentNormal) {
        normals.push(currentNormal.x, currentNormal.y, currentNormal.z);
      }
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  
  return geometry;
};

/**
 * Parse 3MF XML geometry data
 */
const parse3MFGeometry = (xmlContent: string): THREE.BufferGeometry => {
  // Parse XML content
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  // Check for parsing errors
  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('Invalid XML content in 3MF file');
  }
  
  const vertices: number[] = [];
  const normals: number[] = [];
  
  // Find all mesh objects
  const meshElements = xmlDoc.getElementsByTagName('mesh');
  
  for (let meshIndex = 0; meshIndex < meshElements.length; meshIndex++) {
    const mesh = meshElements[meshIndex];
    
    // Get vertices
    const verticesElement = mesh.getElementsByTagName('vertices')[0];
    const vertexElements = verticesElement?.getElementsByTagName('vertex') || [];
    
    const meshVertices: THREE.Vector3[] = [];
    for (let i = 0; i < vertexElements.length; i++) {
      const vertex = vertexElements[i];
      const x = parseFloat(vertex.getAttribute('x') || '0');
      const y = parseFloat(vertex.getAttribute('y') || '0');
      const z = parseFloat(vertex.getAttribute('z') || '0');
      meshVertices.push(new THREE.Vector3(x, y, z));
    }
    
    // Get triangles
    const trianglesElement = mesh.getElementsByTagName('triangles')[0];
    const triangleElements = trianglesElement?.getElementsByTagName('triangle') || [];
    
    for (let i = 0; i < triangleElements.length; i++) {
      const triangle = triangleElements[i];
      const v1Index = parseInt(triangle.getAttribute('v1') || '0');
      const v2Index = parseInt(triangle.getAttribute('v2') || '0');
      const v3Index = parseInt(triangle.getAttribute('v3') || '0');
      
      if (v1Index < meshVertices.length && v2Index < meshVertices.length && v3Index < meshVertices.length) {
        const v1 = meshVertices[v1Index];
        const v2 = meshVertices[v2Index];
        const v3 = meshVertices[v3Index];
        
        // Add vertices
        vertices.push(v1.x, v1.y, v1.z);
        vertices.push(v2.x, v2.y, v2.z);
        vertices.push(v3.x, v3.y, v3.z);
        
        // Calculate normal for this triangle
        const edge1 = v2.clone().sub(v1);
        const edge2 = v3.clone().sub(v1);
        const normal = edge1.cross(edge2).normalize();
        
        // Add the same normal for all three vertices of the triangle
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
      }
    }
  }
  
  if (vertices.length === 0) {
    throw new Error('No valid triangles found in 3MF file');
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  
  return geometry;
};

/**
 * Parse Binary STL format
 */
const parseSTLBinary = (arrayBuffer: ArrayBuffer): THREE.BufferGeometry => {
  const dataView = new DataView(arrayBuffer);
  
  // Skip 80-byte header
  let offset = 80;
  
  // Read number of triangles (4 bytes, little-endian)
  const triangleCount = dataView.getUint32(offset, true);
  offset += 4;
  
  const vertices: number[] = [];
  const normals: number[] = [];
  
  // Each triangle is 50 bytes:
  // - Normal vector: 3 * 4 bytes (12 bytes)
  // - Vertex 1: 3 * 4 bytes (12 bytes)
  // - Vertex 2: 3 * 4 bytes (12 bytes)
  // - Vertex 3: 3 * 4 bytes (12 bytes)
  // - Attribute byte count: 2 bytes
  
  for (let i = 0; i < triangleCount; i++) {
    // Read normal vector
    const normalX = dataView.getFloat32(offset, true);
    const normalY = dataView.getFloat32(offset + 4, true);
    const normalZ = dataView.getFloat32(offset + 8, true);
    offset += 12;
    
    // Read three vertices
    for (let j = 0; j < 3; j++) {
      vertices.push(
        dataView.getFloat32(offset, true),     // x
        dataView.getFloat32(offset + 4, true), // y
        dataView.getFloat32(offset + 8, true)  // z
      );
      offset += 12;
      
      // Add normal for each vertex
      normals.push(normalX, normalY, normalZ);
    }
    
    // Skip attribute byte count
    offset += 2;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  
  return geometry;
};

/**
 * Calculate volume of a mesh using the divergence theorem
 */
const calculateMeshVolume = (geometry: THREE.BufferGeometry): number => {
  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute) return 0;
  
  const positions = positionAttribute.array;
  let volume = 0;
  
  // Calculate volume using the divergence theorem
  // Volume = (1/6) * Σ(x_i * (y_j * z_k - y_k * z_j))
  // For each triangle face
  for (let i = 0; i < positions.length; i += 9) {
    const x1 = positions[i], y1 = positions[i + 1], z1 = positions[i + 2];
    const x2 = positions[i + 3], y2 = positions[i + 4], z2 = positions[i + 5];
    const x3 = positions[i + 6], y3 = positions[i + 7], z3 = positions[i + 8];
    
    // Calculate signed volume of tetrahedron formed by origin and triangle
    const v321 = x3 * y2 * z1;
    const v231 = x2 * y3 * z1;
    const v312 = x3 * y1 * z2;
    const v132 = x1 * y3 * z2;
    const v213 = x2 * y1 * z3;
    const v123 = x1 * y2 * z3;
    
    volume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6;
  }
  
  return Math.abs(volume); // Return absolute value
};

/**
 * Calculate comprehensive model statistics
 */
const calculateModelStats = (geometry: THREE.BufferGeometry): ModelStats => {
  // Ensure geometry has computed bounding box
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  
  if (!geometry.boundingBox) {
    throw new Error('Failed to compute bounding box for geometry');
  }
  
  const boundingBox = geometry.boundingBox;
  
  // Calculate dimensions in mm
  const dimensions = {
    width: (boundingBox.max.x - boundingBox.min.x),
    height: (boundingBox.max.y - boundingBox.min.y),
    depth: (boundingBox.max.z - boundingBox.min.z),
  };
  
  // Calculate volume using custom mesh volume calculation
  const volume = calculateMeshVolume(geometry) / 1000; // Convert mm³ to cm³
  
  // Calculate triangle count
  const positionAttribute = geometry.getAttribute('position');
  const triangleCount = positionAttribute ? positionAttribute.count / 3 : 0;
  
  // Calculate surface area (rough estimation)
  const surfaceArea = calculateSurfaceArea(geometry);
  
  // Calculate weight estimates for all materials
  const estimatedWeight = calculateAllMaterialWeights(Math.max(volume, 0.01));

  return {
    volume: Math.max(volume, 0.01), // Ensure minimum volume
    dimensions,
    triangleCount,
    surfaceArea,
    boundingBox: {
      min: boundingBox.min.clone(),
      max: boundingBox.max.clone(),
    },
    estimatedWeight,
  };
};

/**
 * Calculate surface area of the geometry
 */
const calculateSurfaceArea = (geometry: THREE.BufferGeometry): number => {
  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute) return 0;
  
  const positions = positionAttribute.array;
  let totalArea = 0;
  
  // Calculate area of each triangle
  for (let i = 0; i < positions.length; i += 9) {
    const v1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    const v2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
    const v3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);
    
    // Calculate triangle area using cross product
    const edge1 = v2.clone().sub(v1);
    const edge2 = v3.clone().sub(v1);
    const crossProduct = edge1.cross(edge2);
    const triangleArea = crossProduct.length() / 2;
    
    totalArea += triangleArea;
  }
  
  // Convert from mm² to cm²
  return totalArea / 100;
};

/**
 * Validate STL file before parsing
 */
export const validateSTLFile = (file: File): { valid: boolean; error?: string } => {
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.stl')) {
    return { valid: false, error: 'File must have .stl extension' };
  }
  
  // Check file size (max 100MB for STL files)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 100MB limit' };
  }
  
  // Check minimum file size (STL files should be at least 84 bytes for binary format)
  if (file.size < 84) {
    return { valid: false, error: 'File too small to be a valid STL file' };
  }
  
  return { valid: true };
};

/**
 * Validate 3MF file before parsing
 */
export const validate3MFFile = (file: File): { valid: boolean; error?: string } => {
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.3mf')) {
    return { valid: false, error: 'File must have .3mf extension' };
  }
  
  // Check file size (max 200MB for 3MF files, as they can contain more data)
  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 200MB limit' };
  }
  
  // Check minimum file size (3MF files should be at least a few KB as they're ZIP archives)
  if (file.size < 1024) {
    return { valid: false, error: 'File too small to be a valid 3MF file' };
  }
  
  return { valid: true };
};

/**
 * Auto-detect and parse 3D model file (STL or 3MF)
 */
export const parse3DFile = async (file: File): Promise<ParsedModel> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.stl')) {
    const validation = validateSTLFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return parseSTLFile(file);
  } else if (fileName.endsWith('.3mf')) {
    const validation = validate3MFFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return parse3MFFile(file);
  } else {
    throw new Error('Unsupported file format. Please use .stl or .3mf files.');
  }
};

/**
 * Format model stats for display
 */
export const formatModelStats = (stats: ModelStats): string => {
  return `
Volume: ${stats.volume.toFixed(2)} cm³
Dimensions: ${stats.dimensions.width.toFixed(1)} × ${stats.dimensions.height.toFixed(1)} × ${stats.dimensions.depth.toFixed(1)} mm
Triangles: ${stats.triangleCount.toLocaleString()}
Surface Area: ${stats.surfaceArea.toFixed(2)} cm²
  `.trim();
};

/**
 * Material density constants (g/cm³)
 */
export const MATERIAL_DENSITIES = {
  PLA: 1.25,
  ABS: 1.04,
  PETG: 1.27,
  TPU: 1.20,
  ASA: 1.07,
  WOOD_FILL: 1.28,
  METAL_FILL: 4.0,
  CARBON_FIBER: 1.15,
} as const;

/**
 * Get material weight estimate for a specific material
 */
export const calculateWeight = (volume: number, materialDensity: number = MATERIAL_DENSITIES.PLA): number => {
  // volume in cm³, density in g/cm³
  return volume * materialDensity; // Returns weight in grams
};

/**
 * Calculate weight estimates for all common materials
 */
export const calculateAllMaterialWeights = (volume: number): { [materialName: string]: number } => {
  const weights: { [materialName: string]: number } = {};
  
  Object.entries(MATERIAL_DENSITIES).forEach(([material, density]) => {
    weights[material] = Math.round(calculateWeight(volume, density) * 100) / 100; // Round to 2 decimal places
  });
  
  return weights;
};

/**
 * Get weight for a specific material by name
 */
export const getWeightForMaterial = (volume: number, materialName: string): number => {
  const density = MATERIAL_DENSITIES[materialName as keyof typeof MATERIAL_DENSITIES] || MATERIAL_DENSITIES.PLA;
  return Math.round(calculateWeight(volume, density) * 100) / 100;
};

/**
 * Convert weight to different units
 */
export const convertWeight = (weightInGrams: number, unit: 'g' | 'kg' | 'oz' | 'lb'): number => {
  switch (unit) {
    case 'g':
      return weightInGrams;
    case 'kg':
      return weightInGrams / 1000;
    case 'oz':
      return weightInGrams * 0.035274; // grams to ounces
    case 'lb':
      return weightInGrams * 0.00220462; // grams to pounds
    default:
      return weightInGrams;
  }
};

/**
 * Format weight for display with appropriate unit
 */
export const formatWeight = (weightInGrams: number): string => {
  if (weightInGrams < 1000) {
    return `${weightInGrams.toFixed(1)}g`;
  } else {
    return `${(weightInGrams / 1000).toFixed(2)}kg`;
  }
}; 