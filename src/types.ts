/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum StitchType {
  STITCH = 'STITCH',
  JUMP = 'JUMP',
  STOP = 'STOP',
  END = 'END',
}

export enum ThreadBrand {
  MADEIRA = 'Madeira Rayon',
  ROBISON_ANTON = 'Robison-Anton',
  SULKY = 'Sulky Rayon',
  BROTHER = 'Brother',
  JANOME = 'Janome',
  CUSTOM = 'Custom',
}

export interface ThreadColor {
  code: string;
  name: string;
  hex: string;
  brand: ThreadBrand;
}

export interface Stitch {
  x: number;
  y: number;
  type: StitchType;
  colorIndex: number;
}

export interface DesignMetadata {
  id: string;
  name: string;
  path: string;
  format: string;
  width: number; // in mm
  height: number; // in mm
  totalStitches: number;
  colorCount: number;
  colors: string[]; // Hex strings
  threadInfo?: (ThreadColor | null)[];
  tags: string[];
  isFavorite: boolean;
  notes?: string;
  customer?: string;
  dueDate?: string;
  status?: 'pending' | 'completed' | 'urgent';
  thumbnail?: string; // Data URL
  createdAt: number;
  error?: string;
}

export interface DesignWithStitches extends DesignMetadata {
  stitches: Stitch[];
}
