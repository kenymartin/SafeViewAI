import { ipcMain } from 'electron';
import axios from 'axios';

// Define interfaces locally to avoid import issues
interface UserPreferences {
  violence: boolean;
  nudity: boolean;
  profanity: boolean;
  gore: boolean;
  drugs: boolean;
  defaultAction: string;
  sensitivity: 'low' | 'medium' | 'high';
}

interface ContentSegment {
  startTime: number;
  endTime: number;
  type: string;
  confidence: number;
  action: string;
}

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

export function setupIpcHandlers() {
  // Get user preferences
  ipcMain.handle('get-preferences', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/preferences`);
      return response.data;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      throw new Error('Failed to get preferences');
    }
  });

  // Update user preferences
  ipcMain.handle('update-preferences', async (_, preferences: Partial<UserPreferences>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('Failed to update preferences');
    }
  });

  // Process video
  ipcMain.handle('process-video', async (_, { videoPath, preferences }: { videoPath: string, preferences: UserPreferences }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/video/process`, {
        videoPath,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Failed to process video:', error);
      throw new Error('Failed to process video');
    }
  });

  // Analyze video
  ipcMain.handle('analyze-video', async (_, formData: FormData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/video/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze video:', error);
      throw new Error('Failed to analyze video');
    }
  });

  // Manual flag content
  ipcMain.handle('flag-content', async (_, { timestamp, type }: { timestamp: number, type: string }) => {
    console.log(`Manually flagged content at ${timestamp}s as ${type}`);
    // This would typically send data to the backend
    // For now, we'll just return a success message
    return {
      success: true,
      message: `Content flagged at ${timestamp}s`
    };
  });
} 