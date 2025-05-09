export interface Settings {
  contentFilters: {
    enabled: boolean;
    types: string[];
  };
  playback: {
    quality: 'auto' | '1080p' | '720p' | '480p';
    volume: number;
  };
  ai: {
    sensitivity: number;
    bufferSize: number;
  };
}

export class SettingsService {
  private settings: Settings;
  private readonly storageKey = 'safeview-settings';

  constructor() {
    this.settings = {
      contentFilters: {
        enabled: true,
        types: ['violence', 'language', 'nudity']
      },
      playback: {
        quality: 'auto',
        volume: 1.0
      },
      ai: {
        sensitivity: 0.8,
        bufferSize: 10
      }
    };
  }

  async initialize() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async updateSettings(newSettings: Partial<Settings>) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  async resetToDefaults() {
    this.settings = {
      contentFilters: {
        enabled: true,
        types: ['violence', 'language', 'nudity']
      },
      playback: {
        quality: 'auto',
        volume: 1.0
      },
      ai: {
        sensitivity: 0.8,
        bufferSize: 10
      }
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save default settings:', error);
    }
  }
} 