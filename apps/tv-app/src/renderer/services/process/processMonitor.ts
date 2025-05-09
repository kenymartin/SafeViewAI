import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ProcessMonitor {
  private static instance: ProcessMonitor;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ProcessMonitor {
    if (!ProcessMonitor.instance) {
      ProcessMonitor.instance = new ProcessMonitor();
    }
    return ProcessMonitor.instance;
  }

  async isProcessRunning(processName: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq ${processName}"`);
      return stdout.toLowerCase().includes(processName.toLowerCase());
    } catch (error) {
      console.error('Error checking process:', error);
      return false;
    }
  }

  startMonitoring(processName: string, callback: (isRunning: boolean) => void, interval = 5000): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    this.checkInterval = setInterval(async () => {
      const isRunning = await this.isProcessRunning(processName);
      callback(isRunning);
    }, interval);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const processMonitor = ProcessMonitor.getInstance(); 