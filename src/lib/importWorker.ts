import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

// Simple polyfill for uuid if needed in worker, but usually imports work
const generateId = () => typeof uuidv4 === 'function' ? uuidv4() : Math.random().toString(36).substring(2);

self.onmessage = async (e) => {
  const { type, files, zipFile, sourceId } = e.data;

  if (type === 'scanFolder') {
    await performFolderScan(files, sourceId);
  } else if (type === 'scanZip') {
    await performZipScan(zipFile, sourceId);
  }
};

async function performFolderScan(files, sourceId) {
  const validExtensions = new Set(['DST', 'PES', 'JEF', 'VP3', 'EXP', 'HUS', 'XXX']);
  const total = files.length;
  let processed = 0;
  let batch = [];
  const BATCH_SIZE = 500;

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toUpperCase();
    if (ext && validExtensions.has(ext)) {
      batch.push({
        id: generateId(),
        name: file.name,
        path: file.webkitRelativePath || file.name,
        format: ext,
        width: 0,
        height: 0,
        totalStitches: 0,
        colorCount: 0,
        colors: [],
        tags: ['Imported'],
        isFavorite: false,
        createdAt: Date.now(),
        sourceId,
        metadata: {
          source: 'folder',
          lastModified: file.lastModified
        }
      });
    }

    processed++;
    if (processed % BATCH_SIZE === 0 || processed === total) {
      self.postMessage({
        type: 'progress',
        progress: { total, processed, currentFile: file.name },
        batch: batch.length > 0 ? batch : null
      });
      batch = [];
      // Small delay to allow main thread to breathe if needed, though worker is separate
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  self.postMessage({ type: 'complete' });
}

async function performZipScan(zipFile, sourceId) {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);
  const validExtensions = new Set(['DST', 'PES', 'JEF', 'VP3', 'EXP', 'HUS', 'XXX']);
  
  const entries = Object.keys(loadedZip.files);
  const total = entries.length;
  let processed = 0;
  let batch = [];
  const BATCH_SIZE = 500;

  for (const name of entries) {
    const entry = loadedZip.files[name];
    if (entry.dir) {
      processed++;
      continue;
    }

    const ext = name.split('.').pop()?.toUpperCase();
    if (ext && validExtensions.has(ext)) {
      batch.push({
        id: generateId(),
        name: name.split('/').pop() || name,
        path: name,
        format: ext,
        width: 0,
        height: 0,
        totalStitches: 0,
        colorCount: 0,
        colors: [],
        tags: ['ZIP', zipFile.name],
        isFavorite: false,
        createdAt: Date.now(),
        sourceId,
        metadata: {
          source: 'zip',
          zipName: zipFile.name
        }
      });
    }

    processed++;
    if (processed % BATCH_SIZE === 0 || processed === total) {
      self.postMessage({
        type: 'progress',
        progress: { total, processed, currentFile: name },
        batch: batch.length > 0 ? batch : null
      });
      batch = [];
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  self.postMessage({ type: 'complete' });
}
