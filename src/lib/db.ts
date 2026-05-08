import Dexie, { Table } from 'dexie';
import { DesignMetadata } from '../types';

export class EmbroideryDB extends Dexie {
  designs!: Table<DesignMetadata>;
  importSources!: Table<{
    id: string;
    name: string;
    path: string;
    type: 'folder' | 'zip';
    fileCount: number;
    createdAt: number;
  }>;

  constructor() {
    super('EmbroideryViewerDB');
    this.version(2).stores({
      designs: '++id, name, format, createdAt, isFavorite, source, sourceId',
      importSources: 'id, name, type, createdAt'
    });
  }
}

export const db = new EmbroideryDB();
