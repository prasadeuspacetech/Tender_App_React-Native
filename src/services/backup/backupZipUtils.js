// ZIP helpers for backup bundles (fflate — pure JS, Expo-compatible).

import { Directory, File } from 'expo-file-system';
import { unzipSync, zipSync } from 'fflate';

import { ensureDirectory, ensureParentDirectory } from './backupFileUtils';

const collectZipEntriesFromDirectory = (directory, prefix = '') => {
  /** @type {Record<string, Uint8Array>} */
  const entries = {};

  directory.list().forEach((node) => {
    const entryName = prefix ? `${prefix}/${node.name}` : node.name;

    if (node instanceof Directory) {
      Object.assign(entries, collectZipEntriesFromDirectory(node, entryName));
      return;
    }

    if (node instanceof File) {
      entries[entryName] = node.bytesSync();
    }
  });

  return entries;
};

/** Build a ZIP archive from a staged backup folder (manifest + database + files/). */
export const zipDirectoryToBytes = (directory) => {
  const entries = collectZipEntriesFromDirectory(directory);
  return zipSync(entries);
};

/** Extract a ZIP archive into a directory (manifest + database + files/). */
export const unzipBytesToDirectory = (zipBytes, targetDirectory) => {
  ensureDirectory(targetDirectory);
  const entries = unzipSync(zipBytes);

  Object.entries(entries).forEach(([rawPath, data]) => {
    const normalizedPath = String(rawPath).replace(/\\/g, '/');
    if (!normalizedPath || normalizedPath.endsWith('/')) return;

    const segments = normalizedPath.split('/').filter(Boolean);
    if (!segments.length) return;

    const file = new File(targetDirectory, ...segments);
    ensureParentDirectory(file);

    if (file.exists) {
      file.delete();
    }

    file.write(data);
  });
};

export const unzipFileToDirectory = (zipFile, targetDirectory) => {
  const bytes = zipFile.bytesSync();
  unzipBytesToDirectory(bytes, targetDirectory);
};
