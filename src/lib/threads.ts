/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreadColor, ThreadBrand } from '../types';

export const THREAD_LIBRARIES: Record<ThreadBrand, ThreadColor[]> = {
  [ThreadBrand.MADEIRA]: [
    { code: '1000', name: 'Black', hex: '#000000', brand: ThreadBrand.MADEIRA },
    { code: '1001', name: 'White', hex: '#FFFFFF', brand: ThreadBrand.MADEIRA },
    { code: '1037', name: 'Red', hex: '#E30613', brand: ThreadBrand.MADEIRA },
    { code: '1051', name: 'Christmas Green', hex: '#00873F', brand: ThreadBrand.MADEIRA },
    { code: '1147', name: 'Christmas Red', hex: '#C41230', brand: ThreadBrand.MADEIRA },
    { code: '1002', name: 'Dolphin', hex: '#7D7D7D', brand: ThreadBrand.MADEIRA },
    { code: '1010', name: 'White', hex: '#F0F0F0', brand: ThreadBrand.MADEIRA },
    { code: '1134', name: 'Sapphire', hex: '#004A99', brand: ThreadBrand.MADEIRA },
    { code: '1068', name: 'Lemon', hex: '#FFF44F', brand: ThreadBrand.MADEIRA },
    { code: '1094', name: 'Sky Blue', hex: '#87CEEB', brand: ThreadBrand.MADEIRA },
    { code: '1116', name: 'Pink', hex: '#FFC0CB', brand: ThreadBrand.MADEIRA },
  ],
  [ThreadBrand.BROTHER]: [
    { code: '900', name: 'Black', hex: '#000000', brand: ThreadBrand.BROTHER },
    { code: '001', name: 'White', hex: '#FFFFFF', brand: ThreadBrand.BROTHER },
    { code: '800', name: 'Red', hex: '#FF0000', brand: ThreadBrand.BROTHER },
    { code: '507', name: 'Emerald Green', hex: '#008000', brand: ThreadBrand.BROTHER },
    { code: '017', name: 'Light Blue', hex: '#ADD8E6', brand: ThreadBrand.BROTHER },
    { code: '202', name: 'Lemon Yellow', hex: '#FFF700', brand: ThreadBrand.BROTHER },
  ],
  [ThreadBrand.SULKY]: [
    { code: '1001', name: 'White', hex: '#FFFFFF', brand: ThreadBrand.SULKY },
    { code: '1005', name: 'Black', hex: '#000000', brand: ThreadBrand.SULKY },
    { code: '1039', name: 'Red', hex: '#FF0000', brand: ThreadBrand.SULKY },
  ],
  [ThreadBrand.ROBISON_ANTON]: [
    { code: '2296', name: 'Black', hex: '#000000', brand: ThreadBrand.ROBISON_ANTON },
    { code: '2297', name: 'Snow White', hex: '#FFFFFF', brand: ThreadBrand.ROBISON_ANTON },
  ],
  [ThreadBrand.JANOME]: [
    { code: '101', name: 'Black', hex: '#000000', brand: ThreadBrand.JANOME },
    { code: '102', name: 'White', hex: '#FFFFFF', brand: ThreadBrand.JANOME },
  ],
  [ThreadBrand.CUSTOM]: [],
};

// Helper to find nearest color
export function findNearestThread(hex: string, brand?: ThreadBrand): ThreadColor {
  const targetBrand = brand || ThreadBrand.MADEIRA;
  const library = THREAD_LIBRARIES[targetBrand];
  
  if (!library || library.length === 0) {
     return { code: 'N/A', name: 'Manual', hex: hex, brand: ThreadBrand.CUSTOM };
  }

  let minDistance = Infinity;
  let nearest = library[0];

  const targetRgb = hexToRgb(hex);

  for (const thread of library) {
    const threadRgb = hexToRgb(thread.hex);
    const dist = colorDistance(targetRgb, threadRgb);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = thread;
    }
  }

  return nearest;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function colorDistance(c1: {r: number, g: number, b: number}, c2: {r: number, g: number, b: number}) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

export function isExactMatch(hex1: string, hex2: string): boolean {
  return hex1.toUpperCase() === hex2.toUpperCase();
}

export function isBlackOrVeryDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  // Luminance formula
  const lum = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return lum < 20; // threshold for "too dark"
}
