import { BrowserWindow } from 'electron';

export class StreamingManager {
  private window: BrowserWindow | null = null;

  constructor() {
    this.window = null;
  }

  async initialize(window: BrowserWindow) {
    this.window = window;
  }

  async loadContent(url: string) {
    if (!this.window) {
      throw new Error('Window not initialized');
    }
    await this.window.loadURL(url);
  }

  async toggleFullscreen(isFullscreen: boolean) {
    if (!this.window) {
      throw new Error('Window not initialized');
    }
    this.window.setFullScreen(isFullscreen);
  }

  async cleanup() {
    if (this.window) {
      this.window.close();
      this.window = null;
    }
  }
} 