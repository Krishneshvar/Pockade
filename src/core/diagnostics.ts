import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Logger } from './logger';

export const BugReportExporter = {
  generateReport: async (): Promise<string> => {
    const logs = await Logger.getLogs();
    
    return `
# Pockade Bug Report

## Device Specs
- OS: ${Device.osName} ${Device.osVersion}
- Model: ${Device.modelName}
- Brand: ${Device.brand}
- Memory: ${Device.totalMemory ? Math.round(Device.totalMemory / 1024 / 1024) + 'MB' : 'Unknown'}

## App Version
- Version: ${Application.nativeApplicationVersion}
- Build: ${Application.nativeBuildVersion}

## Local Logs
\`\`\`
${logs}
\`\`\`
    `.trim();
  }
};
