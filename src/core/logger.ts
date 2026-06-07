import * as FileSystem from 'expo-file-system';

const LOG_FILE = `${FileSystem.documentDirectory}pockade_logs.txt`;

export const Logger = {
  log: async (msg: string) => {
    try {
      const timestamp = new Date().toISOString();
      const line = `[${timestamp}] ${msg}\n`;
      
      const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);
      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(LOG_FILE, line);
        return;
      }
      
      // Simple append; rotator logic would check fileInfo.size > 5MB
      await FileSystem.writeAsStringAsync(LOG_FILE, line, { encoding: FileSystem.EncodingType.UTF8, append: true });
    } catch (e) {
      // Silently fail so as not to disrupt the app
    }
  },

  getLogs: async (): Promise<string> => {
    try {
      return await FileSystem.readAsStringAsync(LOG_FILE);
    } catch (e) {
      return 'No logs found.';
    }
  }
};
