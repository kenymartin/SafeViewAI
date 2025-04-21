import { UserPreferences } from '@safeview/shared';

declare global {
  interface Window {
    api: {
      getPreferences: () => Promise<UserPreferences>;
      updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserPreferences>;
      processVideo: (videoPath: string, preferences: UserPreferences) => Promise<any>;
      analyzeVideo: (formData: FormData) => Promise<any>;
      flagContent: (timestamp: number, type: string) => Promise<any>;
      on: (channel: string, callback: (...args: any[]) => void) => void;
      send: (channel: string, data: any) => void;
    };
  }
} 