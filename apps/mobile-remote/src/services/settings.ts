import { AsyncStorage } from 'react-native';
import { EventEmitter } from 'events';
import { WebSocket } from 'ws';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  gestureControls: {
    swipeUp: string;
    swipeDown: string;
    swipeLeft: string;
    swipeRight: string;
    tap: string;
    doubleTap: string;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

export class SettingsService extends EventEmitter {
  private static instance: SettingsService;
  private preferences: UserPreferences;
  private ws: WebSocket | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly STORAGE_KEY = 'user_preferences';

  private constructor() {
    super();
    this.preferences = this.getDefaultPreferences();
    this.initialize();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      gestureControls: {
        swipeUp: 'volumeUp',
        swipeDown: 'volumeDown',
        swipeLeft: 'previous',
        swipeRight: 'next',
        tap: 'playPause',
        doubleTap: 'fullscreen'
      },
      notifications: {
        enabled: true,
        sound: true,
        vibration: true
      }
    };
  }

  private async initialize() {
    try {
      // Load saved preferences
      const savedPrefs = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedPrefs) {
        this.preferences = JSON.parse(savedPrefs);
      }

      // Initialize WebSocket connection
      this.initializeWebSocket();

      // Start sync interval
      this.syncInterval = setInterval(() => this.syncSettings(), this.SYNC_INTERVAL);
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }

  private initializeWebSocket() {
    this.ws = new WebSocket('ws://your-server:8080/settings');

    this.ws.on('open', () => {
      console.log('WebSocket connection established');
      this.syncSettings();
    });

    this.ws.on('message', (data) => {
      try {
        const remotePrefs = JSON.parse(data.toString());
        this.mergePreferences(remotePrefs);
      } catch (error) {
        console.error('Error processing remote settings:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket connection closed');
      setTimeout(() => this.initializeWebSocket(), 5000);
    });
  }

  private async mergePreferences(remotePrefs: UserPreferences) {
    const mergedPrefs = {
      ...this.preferences,
      ...remotePrefs,
      gestureControls: {
        ...this.preferences.gestureControls,
        ...remotePrefs.gestureControls
      },
      notifications: {
        ...this.preferences.notifications,
        ...remotePrefs.notifications
      }
    };

    if (JSON.stringify(mergedPrefs) !== JSON.stringify(this.preferences)) {
      this.preferences = mergedPrefs;
      await this.savePreferences();
      this.emit('preferencesChanged', this.preferences);
    }
  }

  private async syncSettings() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(this.preferences));
      } catch (error) {
        console.error('Error syncing settings:', error);
      }
    }
  }

  private async savePreferences() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public async updatePreferences(newPrefs: Partial<UserPreferences>) {
    this.preferences = {
      ...this.preferences,
      ...newPrefs,
      gestureControls: {
        ...this.preferences.gestureControls,
        ...newPrefs.gestureControls
      },
      notifications: {
        ...this.preferences.notifications,
        ...newPrefs.notifications
      }
    };

    await this.savePreferences();
    this.emit('preferencesChanged', this.preferences);
    this.syncSettings();
  }

  public async resetToDefaults() {
    this.preferences = this.getDefaultPreferences();
    await this.savePreferences();
    this.emit('preferencesChanged', this.preferences);
    this.syncSettings();
  }

  public cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
} 