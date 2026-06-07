import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system/legacy';
import { Logger } from './logger';

const REPORTS_DIR = `${FileSystem.documentDirectory ?? ''}reports/`;

async function ensureReportsDirectory() {
  if (!FileSystem.documentDirectory) {
    return false;
  }

  await FileSystem.makeDirectoryAsync(REPORTS_DIR, { intermediates: true }).catch(() => undefined);
  return true;
}

async function getMemoryBudget() {
  try {
    if (typeof Device.getMaxMemoryAsync === 'function') {
      return await Device.getMaxMemoryAsync();
    }
  } catch {
    return null;
  }

  return Device.totalMemory ?? null;
}

export const BugReportExporter = {
  async generateReport() {
    const logs = await Logger.getLogs();
    const memoryBudget = await getMemoryBudget();

    return [
      '# Pockade Bug Report',
      '',
      '## Device Specs',
      `- OS: ${Device.osName ?? 'Unknown'} ${Device.osVersion ?? ''}`.trim(),
      `- Model: ${Device.modelName ?? 'Unknown'}`,
      `- Brand: ${Device.brand ?? 'Unknown'}`,
      `- Memory Budget: ${
        memoryBudget ? `${Math.round(memoryBudget / 1024 / 1024)}MB` : 'Unknown'
      }`,
      '',
      '## App Version',
      `- Version: ${Application.nativeApplicationVersion ?? 'Unknown'}`,
      `- Build: ${Application.nativeBuildVersion ?? 'Unknown'}`,
      '',
      '## Local Logs',
      '```',
      logs,
      '```',
    ].join('\n');
  },

  async exportReportFile() {
    const report = await BugReportExporter.generateReport();
    if (!(await ensureReportsDirectory())) {
      return null;
    }

    const path = `${REPORTS_DIR}pockade-bug-report-${Date.now()}.md`;
    await FileSystem.writeAsStringAsync(path, report, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Logger.info('Bug report exported', { path });
    return path;
  },
};
