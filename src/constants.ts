/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const HOOP_SIZES = [
  { name: 'Small (100x100)', width: 100, height: 100 },
  { name: 'Medium (130x180)', width: 130, height: 180 },
  { name: 'Large (200x200)', width: 200, height: 200 },
  { name: 'Extra Large (260x360)', width: 260, height: 360 },
];

export const EMBROIDERY_FORMATS = [
  'DST', 'PES', 'JEF', 'EXP', 'VP3', 'HUS', 'XXX', 'PCS', 'PEC',
  'SEW', 'ART', 'CSD', 'EMB', 'EMD', 'DSZ', 'TAP', 'VIP', 'PHC',
  'PHD', 'SHV', 'JAN', 'PCM'
];

export const DEFAULT_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
  '#808080', // Gray
  '#FFC0CB', // Pink
  '#FFD700', // Gold
  '#C0C0C0', // Silver
];

export const APP_THEME = {
  accent: '#0067c0', // Windows-like blue
  sidebar: '#ffffff',
  background: '#f3f3f3',
  border: '#e0e0e0',
  text: {
    primary: '#1a1a1a',
    secondary: '#5d5d5d',
    muted: '#808080',
  }
};
