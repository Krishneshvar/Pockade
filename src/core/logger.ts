import * as FileSystem from 'expo-file-system/legacy';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_DIR = `${FileSystem.documentDirectory ?? ''}logs/`;
const ACTIVE_LOG_FILE = `${LOG_DIR}pockade.log`;
const ARCHIVE_LOG_FILE = `${LOG_DIR}pockade.1.log`;
const MAX_LOG_BYTES_PER_FILE = 2.5 * 1024 * 1024;

let logQueue = Promise.resolve();

async function ensureLogDirectory() {
  if (!FileSystem.documentDirectory) {
    return false;
  }

  await FileSystem.makeDirectoryAsync(LOG_DIR, { intermediates: true }).catch(() => undefined);
  return true;
}

async function rotateLogsIfNeeded(incomingLine: string) {
  const activeInfo = await FileSystem.getInfoAsync(ACTIVE_LOG_FILE);
  const nextSize = (activeInfo.exists ? activeInfo.size ?? 0 : 0) + incomingLine.length;

  if (nextSize <= MAX_LOG_BYTES_PER_FILE) {
    return;
  }

  const archiveInfo = await FileSystem.getInfoAsync(ARCHIVE_LOG_FILE);
  if (archiveInfo.exists) {
    await FileSystem.deleteAsync(ARCHIVE_LOG_FILE, { idempotent: true }).catch(() => undefined);
  }

  if (activeInfo.exists) {
    await FileSystem.moveAsync({
      from: ACTIVE_LOG_FILE,
      to: ARCHIVE_LOG_FILE,
    }).catch(() => undefined);
  }
}

async function appendLine(line: string) {
  if (!(await ensureLogDirectory())) {
    return;
  }

  await rotateLogsIfNeeded(line);
  await FileSystem.writeAsStringAsync(ACTIVE_LOG_FILE, line, {
    append: true,
    encoding: FileSystem.EncodingType.UTF8,
  });
}

async function getFileContents(path: string) {
  try {
    return await FileSystem.readAsStringAsync(path);
  } catch {
    return '';
  }
}

function enqueue<T>(work: () => Promise<T>) {
  const next = logQueue.then(work, work);
  logQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export const Logger = {
  write(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${
      context ? ` ${JSON.stringify(context)}` : ''
    }\n`;

    return enqueue(async () => {
      await appendLine(line);
    });
  },

  debug(message: string, context?: Record<string, unknown>) {
    return Logger.write('debug', message, context);
  },

  info(message: string, context?: Record<string, unknown>) {
    return Logger.write('info', message, context);
  },

  warn(message: string, context?: Record<string, unknown>) {
    return Logger.write('warn', message, context);
  },

  error(message: string, context?: Record<string, unknown>) {
    return Logger.write('error', message, context);
  },

  async getLogs() {
    const [archive, active] = await Promise.all([
      getFileContents(ARCHIVE_LOG_FILE),
      getFileContents(ACTIVE_LOG_FILE),
    ]);

    return `${archive}${active}`.trim() || 'No logs found.';
  },

  async clear() {
    await Promise.all([
      FileSystem.deleteAsync(ACTIVE_LOG_FILE, { idempotent: true }).catch(() => undefined),
      FileSystem.deleteAsync(ARCHIVE_LOG_FILE, { idempotent: true }).catch(() => undefined),
    ]);
  },

  getPaths() {
    return {
      directory: LOG_DIR,
      active: ACTIVE_LOG_FILE,
      archive: ARCHIVE_LOG_FILE,
    };
  },
};
