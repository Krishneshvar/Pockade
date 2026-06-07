import * as FileSystem from 'expo-file-system/legacy';
import { BackupManager } from '../../src/core/backup';

describe('BackupManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('ZmFrZS1kYg==');
  });

  it('exports an encrypted backup envelope', async () => {
    const path = await BackupManager.exportBackup();

    expect(path).toContain('pockade-backup-');
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
  });
});
