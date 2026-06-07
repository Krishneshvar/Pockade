import { initializeDatabase } from './database';
import { Logger } from './logger';
import { NotificationsManager } from '../managers/notifications';
import { OrientationManager } from '../managers/orientation';
import { SecurityManager } from '../managers/security';

export interface BootstrapResult {
  startedAt: string;
  finishedAt: string;
}

export async function bootstrapShell(): Promise<BootstrapResult> {
  const startedAt = new Date().toISOString();

  await Logger.info('Shell bootstrap started');
  await SecurityManager.initializeKeyStore();
  await initializeDatabase();
  await OrientationManager.resetToShellDefault();
  await NotificationsManager.initialize();
  await Logger.info('Shell bootstrap complete');

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}
