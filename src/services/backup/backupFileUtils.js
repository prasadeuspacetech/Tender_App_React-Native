// Shared file-system helpers for backup export/import.

import { Directory, File, Paths } from 'expo-file-system';

import { getAppDocumentsDirectory } from './backupPathUtils';

export const ensureDirectory = (directory) => {
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
};

export const ensureParentDirectory = (file) => {
  const parent = file.parentDirectory;
  if (!parent.exists) {
    parent.create({ intermediates: true, idempotent: true });
  }
};

export const writeTextFile = (directory, fileName, contents) => {
  const file = new File(directory, fileName);
  if (file.exists) {
    file.delete();
  }
  file.write(contents);
};

export const cleanupDirectory = (directory) => {
  if (!directory?.exists) return;

  try {
    directory.delete();
  } catch {
    // Best-effort cleanup.
  }
};

export const copyDirectoryContents = (sourceDir, destinationDir) => {
  if (!sourceDir?.exists) return;

  ensureDirectory(destinationDir);

  sourceDir.list().forEach((node) => {
    if (node instanceof Directory) {
      const destinationChild = new Directory(destinationDir, node.name);
      copyDirectoryContents(node, destinationChild);
      return;
    }

    if (node instanceof File) {
      const destinationFile = new File(destinationDir, node.name);
      ensureParentDirectory(destinationFile);
      if (destinationFile.exists) {
        destinationFile.delete();
      }
      node.copy(destinationFile);
    }
  });
};

/** Copy app_documents/ to cache for rollback before restore. */
export const snapshotAppDocumentsDirectory = () => {
  const source = getAppDocumentsDirectory();
  if (!source.exists) return null;

  const snapshotDir = new Directory(Paths.cache, `backup_rollback_docs_${Date.now()}`);
  ensureDirectory(snapshotDir);
  copyDirectoryContents(source, snapshotDir);
  return snapshotDir;
};

export const restoreAppDocumentsDirectory = (snapshotDir) => {
  const destination = getAppDocumentsDirectory();
  if (destination.exists) {
    destination.delete();
  }

  ensureDirectory(destination);

  if (snapshotDir?.exists) {
    copyDirectoryContents(snapshotDir, destination);
  }
};

/** Replace app_documents/ with staged backup files/ tree. */
export const replaceAppDocumentsFromBackupFiles = (backupFilesDir) => {
  const destination = getAppDocumentsDirectory();
  if (destination.exists) {
    destination.delete();
  }

  ensureDirectory(destination);

  if (backupFilesDir?.exists) {
    copyDirectoryContents(backupFilesDir, destination);
  }
};
