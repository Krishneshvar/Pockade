import { open, type DB } from '@op-engineering/op-sqlite';
import { SecurityManager, EncryptedBackupPayload } from '../managers/security';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const DB_NAME = 'pockade.sqlite';
const SHELL_SCHEMA_VERSION = 2;

let dbConnection: DB | null = null;
type QueryValue = string | number | boolean | null | ArrayBuffer | ArrayBufferView;

export interface PersistedGameSession {
  gameId: string;
  seed: number;
  algorithmVersion: number;
  stateJson: string;
  checksum: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id?: number;
  gameId: string;
  score: number;
  payload: string;
  checksum: string;
  createdAt: string;
}

const migrations: string[][] = [
  [
    'CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS saved_games (game_id TEXT PRIMARY KEY NOT NULL, seed INTEGER NOT NULL, algorithm_version INTEGER NOT NULL, state_json TEXT NOT NULL, checksum TEXT NOT NULL, updated_at TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS seed_history (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL, seed INTEGER NOT NULL, algorithm_version INTEGER NOT NULL, created_at TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS leaderboard_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL, score INTEGER NOT NULL, payload TEXT NOT NULL, checksum TEXT NOT NULL, created_at TEXT NOT NULL)',
  ],
  [
    'CREATE TABLE IF NOT EXISTS shell_health (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, details TEXT, timestamp TEXT NOT NULL)',
  ]
];

function getDatabase(): DB {
  if (!dbConnection) {
    dbConnection = open({ name: DB_NAME });
  }
  return dbConnection;
}

async function execute(query: string, params?: QueryValue[]) {
  return getDatabase().execute(query, params);
}

async function getMetaValue(key: string) {
  const result = await execute('SELECT value FROM meta WHERE key = ?', [key]);
  return (result.rows[0]?.value as string | undefined) ?? null;
}

async function setMetaValue(key: string, value: string) {
  await execute('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [key, value]);
}

async function runMigrations() {
  const currentVersion = Number((await getMetaValue('shell_schema_version')) ?? 0);

  for (let version = currentVersion; version < migrations.length; version += 1) {
    const statements = migrations[version];
    await getDatabase().transaction(async (tx) => {
      for (const statement of statements) {
        await tx.execute(statement);
      }
      await tx.execute('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [
        'shell_schema_version',
        String(version + 1),
      ]);
    });
    
    await recordHealthEvent('migration_applied', `Applied migration to version ${version + 1}`);
  }

  await setMetaValue('shell_schema_target', String(SHELL_SCHEMA_VERSION));
}

export async function recordHealthEvent(eventType: string, details: string = '') {
  try {
    await execute('INSERT INTO shell_health (event_type, details, timestamp) VALUES (?, ?, ?)', [
      eventType,
      details,
      new Date().toISOString(),
    ]);
  } catch (error) {
    console.error('Failed to record health event:', error);
  }
}

export async function initializeDatabase() {
  await execute('PRAGMA foreign_keys = ON');
  await execute('PRAGMA journal_mode = WAL');
  await execute('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)');
  await runMigrations();
  await recordHealthEvent('app_boot', 'Database initialized successfully.');
}

export async function closeDatabase() {
  if (!dbConnection) return;

  const current = dbConnection;
  dbConnection = null;
  await current.closeAsync();
}

export function getDatabasePath() {
  return getDatabase().getDbPath();
}

export async function saveGameSession(session: Omit<PersistedGameSession, 'checksum' | 'updatedAt'>) {
  const updatedAt = new Date().toISOString();
  const checksum = await SecurityManager.generateChecksum(
    `${session.gameId}:${session.seed}:${session.algorithmVersion}:${session.stateJson}`,
    'saved_game'
  );

  await execute(
    'INSERT OR REPLACE INTO saved_games (game_id, seed, algorithm_version, state_json, checksum, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [session.gameId, session.seed, session.algorithmVersion, session.stateJson, checksum, updatedAt]
  );

  return { ...session, checksum, updatedAt };
}

export async function getGameSession(gameId: string) {
  const result = await execute(
    'SELECT game_id, seed, algorithm_version, state_json, checksum, updated_at FROM saved_games WHERE game_id = ?',
    [gameId]
  );

  const row = result.rows[0];
  if (!row) return null;

  const session: PersistedGameSession = {
    gameId: String(row.game_id),
    seed: Number(row.seed),
    algorithmVersion: Number(row.algorithm_version),
    stateJson: String(row.state_json),
    checksum: String(row.checksum),
    updatedAt: String(row.updated_at),
  };

  const isValid = await SecurityManager.verifyChecksum(
    `${session.gameId}:${session.seed}:${session.algorithmVersion}:${session.stateJson}`,
    session.checksum,
    'saved_game'
  );

  return isValid ? session : null;
}

export async function deleteGameSession(gameId: string) {
  await execute('DELETE FROM saved_games WHERE game_id = ?', [gameId]);
}

export async function listGameSessions() {
  const result = await execute(
    'SELECT game_id, seed, algorithm_version, state_json, checksum, updated_at FROM saved_games ORDER BY updated_at DESC'
  );

  const sessions = await Promise.all(
    result.rows.map(async (row) => {
      const session: PersistedGameSession = {
        gameId: String(row.game_id),
        seed: Number(row.seed),
        algorithmVersion: Number(row.algorithm_version),
        stateJson: String(row.state_json),
        checksum: String(row.checksum),
        updatedAt: String(row.updated_at),
      };

      const isValid = await SecurityManager.verifyChecksum(
        `${session.gameId}:${session.seed}:${session.algorithmVersion}:${session.stateJson}`,
        session.checksum,
        'saved_game'
      );

      return isValid ? session : null;
    })
  );

  return sessions.filter((session): session is PersistedGameSession => session !== null);
}

export async function recordSeedHistory(gameId: string, seed: number, algorithmVersion: number) {
  await execute(
    'INSERT INTO seed_history (game_id, seed, algorithm_version, created_at) VALUES (?, ?, ?, ?)',
    [gameId, seed, algorithmVersion, new Date().toISOString()]
  );
}

export async function listSeedHistory(gameId?: string) {
  const result = gameId
    ? await execute(
        'SELECT game_id, seed, algorithm_version, created_at FROM seed_history WHERE game_id = ? ORDER BY created_at DESC',
        [gameId]
      )
    : await execute(
        'SELECT game_id, seed, algorithm_version, created_at FROM seed_history ORDER BY created_at DESC'
      );

  return result.rows.map((row) => ({
    gameId: String(row.game_id),
    seed: Number(row.seed),
    algorithmVersion: Number(row.algorithm_version),
    createdAt: String(row.created_at),
  }));
}

export async function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'checksum' | 'createdAt' | 'id'>) {
  const createdAt = new Date().toISOString();
  const checksum = await SecurityManager.generateChecksum(
    `${entry.gameId}:${entry.score}:${entry.payload}`,
    'leaderboard_entry'
  );

  const result = await execute(
    'INSERT INTO leaderboard_entries (game_id, score, payload, checksum, created_at) VALUES (?, ?, ?, ?, ?)',
    [entry.gameId, entry.score, entry.payload, checksum, createdAt]
  );

  return { ...entry, id: result.insertId, checksum, createdAt };
}

export async function listLeaderboardEntries(gameId: string) {
  const result = await execute(
    'SELECT id, game_id, score, payload, checksum, created_at FROM leaderboard_entries WHERE game_id = ? ORDER BY score DESC, created_at ASC',
    [gameId]
  );

  const entries = await Promise.all(
    result.rows.map(async (row) => {
      const entry: LeaderboardEntry = {
        id: Number(row.id),
        gameId: String(row.game_id),
        score: Number(row.score),
        payload: String(row.payload),
        checksum: String(row.checksum),
        createdAt: String(row.created_at),
      };

      const isValid = await SecurityManager.verifyChecksum(
        `${entry.gameId}:${entry.score}:${entry.payload}`,
        entry.checksum,
        'leaderboard_entry'
      );

      return isValid ? entry : null;
    })
  );

  return entries.filter((entry): entry is LeaderboardEntry => entry !== null);
}

// --------------------------------------------------------------------------------
// Export / Import Backup Affordances
// --------------------------------------------------------------------------------

export async function exportDatabaseBackup() {
  await execute('PRAGMA wal_checkpoint(TRUNCATE)');
  
  const dbPath = getDatabasePath();
  const base64Content = await FileSystem.readAsStringAsync(dbPath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    schemaVersion: SHELL_SCHEMA_VERSION,
    data: base64Content,
  });

  const encryptedBackup = await SecurityManager.encryptBackupPayload(payload);
  const backupFileUri = `${FileSystem.documentDirectory}pockade_backup.pock`;

  await FileSystem.writeAsStringAsync(backupFileUri, JSON.stringify(encryptedBackup), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(backupFileUri, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Export Pockade Backup',
    });
    await recordHealthEvent('backup_exported', 'User exported a database backup');
  }
}

export async function importDatabaseBackup() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false; // User cancelled
    }

    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const encryptedBackup: EncryptedBackupPayload = JSON.parse(fileContent);
    const decryptedJson = await SecurityManager.decryptBackupPayload(encryptedBackup);
    const backupData = JSON.parse(decryptedJson);

    if (!backupData.data) {
      throw new Error('Invalid backup file format.');
    }

    // Close existing DB to safely overwrite
    await closeDatabase();

    // Overwrite DB file
    const dbPath = FileSystem.documentDirectory + 'SQLite/' + DB_NAME; 
    // OP-SQLite stores in SQLite/ directory
    await FileSystem.writeAsStringAsync(dbPath, backupData.data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Reinitialize DB
    dbConnection = open({ name: DB_NAME });
    await initializeDatabase();
    
    await recordHealthEvent('backup_imported', 'User successfully restored a backup');
    return true;
  } catch (error) {
    console.error('Backup Import Failed:', error);
    await recordHealthEvent('backup_import_failed', String(error));
    
    // Reopen DB if it crashed midway
    if (!dbConnection) {
      dbConnection = open({ name: DB_NAME });
    }
    throw error;
  }
}
