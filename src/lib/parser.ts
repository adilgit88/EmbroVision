/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stitch, StitchType, DesignWithStitches } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simplified DST (Tajima) Parser
 */
export async function parseEmbroideryFile(file: File): Promise<DesignWithStitches> {
  try {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const format = file.name.split('.').pop()?.toUpperCase() || 'DST';
    
    // Safety check for empty files
    if (data.length === 0) throw new Error("Empty file");

    if (format === 'DST' && data.length > 512) {
      return parseDST(data, file.name);
    } else {
      return generateMockDesign(file.name, format);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Parser Error:", error);
    // Return a dummy design with a "Corrupted" tag instead of crashing
    return createErrorDesign(file.name, errorMessage);
  }
}

function createErrorDesign(filename: string, error?: string): DesignWithStitches {
  return {
    id: uuidv4(),
    name: filename,
    path: `C:\\Users\\Main\\DesignLib\\${filename}`,
    format: filename.split('.').pop()?.toUpperCase() || 'ERR',
    width: 0,
    height: 0,
    totalStitches: 0,
    colorCount: 0,
    colors: ['#ef4444'],
    tags: ['Corrupted', 'Action Needed'],
    isFavorite: false,
    stitches: [],
    createdAt: Date.now(),
    error: error || "Unknown parsing error",
  };
}

function parseDST(data: Uint8Array, filename: string): DesignWithStitches {
  // DST Header is 512 bytes (ASCII)
  // Example: LA:My Design\rST:5000\r...
  const header = new TextDecoder().decode(data.slice(0, 512));
  
  const stitches: Stitch[] = [];
  let x = 0;
  let y = 0;
  let colorIndex = 0;
  
  // Stitches start at offset 512
  for (let i = 512; i < data.length - 2; i += 3) {
    const b1 = data[i];
    const b2 = data[i+1];
    const b3 = data[i+2];
    
    // Tajima DST byte decoding (Simplified representation of the bit tri-mask)
    // This is a complex bitwise operation in real DST.
    // We'll use a simplified delta calculation here for the demo.
    
    let dx = 0;
    let dy = 0;
    
    if (b1 & 0x01) dx += 1;
    if (b1 & 0x02) dx -= 1;
    if (b1 & 0x04) dx += 9;
    if (b1 & 0x08) dx -= 9;
    if (b1 & 0x80) dy += 1;
    if (b1 & 0x40) dy -= 1;
    if (b1 & 0x20) dy += 9;
    if (b1 & 0x10) dy -= 9;
    
    if (b2 & 0x01) dx += 3;
    if (b2 & 0x02) dx -= 3;
    if (b2 & 0x04) dx += 27;
    if (b2 & 0x08) dx -= 27;
    if (b2 & 0x80) dy += 3;
    if (b2 & 0x40) dy -= 3;
    if (b2 & 0x20) dy += 27;
    if (b2 & 0x10) dy -= 27;
    
    if (b3 & 0x04) dx += 81;
    if (b3 & 0x08) dx -= 81;
    if (b3 & 0x20) dy += 81;
    if (b3 & 0x10) dy -= 81;
    
    x += dx;
    y += dy;
    
    let type = StitchType.STITCH;
    if ((b3 & 0b11110011) === 0b11110011) {
      type = StitchType.STOP;
      colorIndex++;
    } else if (b3 & 0x80) {
      type = StitchType.JUMP;
    }
    
    stitches.push({ x, y, type, colorIndex });
  }
  
  // Calculate bounds
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  stitches.forEach(s => {
    minX = Math.min(minX, s.x);
    maxX = Math.max(maxX, s.x);
    minY = Math.min(minY, s.y);
    maxY = Math.max(maxY, s.y);
  });

  return {
    id: uuidv4(),
    name: filename.replace(/\.[^/.]+$/, ""),
    path: filename,
    format: 'DST',
    width: (maxX - minX) / 10,
    height: (maxY - minY) / 10,
    totalStitches: stitches.length,
    colorCount: colorIndex + 1,
    colors: generateRandomColors(colorIndex + 1),
    tags: ['Imported'],
    isFavorite: false,
    stitches,
    createdAt: Date.now(),
  };
}

function generateMockDesign(filename: string, format: string): DesignWithStitches {
  const stitches: Stitch[] = [];
  const colorCount = Math.floor(Math.random() * 5) + 2;
  const radius = 1000;
  const points = 5 + Math.floor(Math.random() * 10);
  
  // Generate a multi-layered floral/geometric pattern
  for (let layer = 0; layer < colorCount; layer++) {
    const layerRadius = radius * (1 - layer / colorCount);
    const layerRotation = (layer * Math.PI) / 8;
    
    for (let i = 0; i < 360; i += 2) {
      const angle = (i * Math.PI) / 180 + layerRotation;
      // Spirograph-like equation
      const r = layerRadius * (0.8 + 0.2 * Math.cos(points * angle));
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      
      stitches.push({
        x: Math.round(x),
        y: Math.round(y),
        type: i === 0 ? StitchType.JUMP : StitchType.STITCH,
        colorIndex: layer
      });
    }
    // Add a stop at the end of layer
    stitches[stitches.length-1].type = StitchType.STOP;
  }
  
  stitches.push({ x: 0, y: 0, type: StitchType.END, colorIndex: colorCount - 1 });

  return {
    id: uuidv4(),
    name: filename.replace(/\.[^/.]+$/, ""),
    path: filename,
    format,
    width: 200,
    height: 200,
    totalStitches: stitches.length,
    colorCount,
    colors: generateRandomColors(colorCount),
    tags: ['Sample'],
    isFavorite: Math.random() > 0.5,
    stitches,
    createdAt: Date.now(),
  };
}

function generateRandomColors(count: number): string[] {
  const palette = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', 
    '#8B5CF6', '#EC4899', '#6B7280', '#D97706', '#059669'
  ];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

export function generateThumbnail(design: DesignWithStitches): string {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, 200, 200);

  // Find bounds for scaling
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  design.stitches.forEach(s => {
    minX = Math.min(minX, s.x);
    maxX = Math.max(maxX, s.x);
    minY = Math.min(minY, s.y);
    maxY = Math.max(maxY, s.y);
  });

  const dX = maxX - minX;
  const dY = maxY - minY;
  const scale = 160 / Math.max(dX, dY);
  
  const offsetX = 100 - (minX + dX / 2) * scale;
  const offsetY = 100 - (minY + dY / 2) * scale;

  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let lastX = design.stitches[0].x * scale + offsetX;
  let lastY = design.stitches[0].y * scale + offsetY;

  design.stitches.forEach((s) => {
    const px = s.x * scale + offsetX;
    const py = s.y * scale + offsetY;

    if (s.type === StitchType.STITCH) {
      ctx.beginPath();
      ctx.strokeStyle = design.colors[s.colorIndex % design.colors.length];
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    
    lastX = px;
    lastY = py;
  });

  return canvas.toDataURL();
}
