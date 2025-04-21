import { Request, Response } from 'express';
import { UserPreferences, FilterAction } from '@safeview/shared/types/content';
import { promises as fs } from 'fs';
import { join } from 'path';

export class PreferencesController {
  private preferencesPath: string;

  constructor() {
    this.preferencesPath = join(process.cwd(), 'data', 'preferences.json');
    this.initialize();
  }

  private async initialize() {
    try {
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
      try {
        await fs.access(this.preferencesPath);
      } catch {
        // Create default preferences if file doesn't exist
        const defaultPreferences: UserPreferences = {
          violence: true,
          nudity: true,
          profanity: true,
          gore: true,
          drugs: true,
          defaultAction: 'blur',
          sensitivity: 'medium'
        };
        await this.savePreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error initializing preferences:', error);
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const preferences = await this.loadPreferences();
      res.json(preferences);
    } catch (error) {
      console.error('Error getting preferences:', error);
      res.status(500).json({ error: 'Failed to get preferences' });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const newPreferences = req.body as Partial<UserPreferences>;
      
      // Validate preferences
      if (!this.validatePreferences(newPreferences)) {
        return res.status(400).json({ error: 'Invalid preferences format' });
      }

      // Load current preferences
      const currentPreferences = await this.loadPreferences();
      
      // Merge with new preferences
      const updatedPreferences = {
        ...currentPreferences,
        ...newPreferences
      };

      // Save updated preferences
      await this.savePreferences(updatedPreferences);

      res.json(updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }

  private validatePreferences(preferences: Partial<UserPreferences>): boolean {
    // Validate boolean fields
    const booleanFields = ['violence', 'nudity', 'profanity', 'gore', 'drugs'];
    for (const field of booleanFields) {
      if (field in preferences && typeof preferences[field] !== 'boolean') {
        return false;
      }
    }

    // Validate defaultAction
    if ('defaultAction' in preferences) {
      const validActions: FilterAction[] = ['blur', 'mute', 'cut', 'skip'];
      if (!validActions.includes(preferences.defaultAction)) {
        return false;
      }
    }

    // Validate sensitivity
    if ('sensitivity' in preferences) {
      const validSensitivities = ['low', 'medium', 'high'];
      if (!validSensitivities.includes(preferences.sensitivity)) {
        return false;
      }
    }

    return true;
  }

  private async loadPreferences(): Promise<UserPreferences> {
    const data = await fs.readFile(this.preferencesPath, 'utf-8');
    return JSON.parse(data);
  }

  private async savePreferences(preferences: UserPreferences): Promise<void> {
    await fs.writeFile(
      this.preferencesPath,
      JSON.stringify(preferences, null, 2),
      'utf-8'
    );
  }
} 