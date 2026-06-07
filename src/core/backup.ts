import * as FileSystem from 'expo-file-system/legacy';
import {
  closeDatabase,
  getDatabasePath,
  initializeDatabase,
} from './database';
import { Logger } from './logger';
import { SecurityManager, type EncryptedBackupPayload } from '../managers/security';

const BACKUP_DIR = `${FileSystem.documentDirectory ?? ''}backups/`;

async function ensureBackupDirectory() {
  if (!FileSystem.documentDirectory) {
    return false;
  }

  await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true }).catch(() => undefined);
  return true;
}

export interface BackupEnvelope {
  version: number;
  createdAt: string;
  databaseName: string;
  payload: EncryptedBackupPayload;
}

export const BackupManager = {
  async exportBackup() {
    if (!(await ensureBackupDirectory())) {
      return null;
    }

    const databasePath = getDatabasePath();
    const encodedDatabase = await FileSystem.readAsStringAsync(databasePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const payload = await SecurityManager.encryptBackupPayload(encodedDatabase);
    const backupPath = `${BACKUP_DIR}pockade-backup-${Date.now()}.pockade`;
    const envelope: BackupEnvelope = {
      version: 1,
      createdAt: new Date().toISOString(),
      databaseName: 'pockade.sqlite',
      payload,
    };

    await FileSystem.writeAsStringAsync(backupPath, JSON.stringify(envelope, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Logger.info('Backup exported', { backupPath });
    return backupPath;
  },

  async restoreBackup(path: string) {
    const raw = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const envelope = JSON.parse(raw) as BackupEnvelope;
    const encodedDatabase = await SecurityManager.decryptBackupPayload(envelope.payload);
    const databasePath = getDatabasePath();

    await closeDatabase();
    await FileSystem.writeAsStringAsync(databasePath, encodedDatabase, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await initializeDatabase();
    await Logger.info('Backup restored', { path });
  },
};
