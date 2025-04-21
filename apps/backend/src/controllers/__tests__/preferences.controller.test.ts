import { PreferencesController } from '../preferences.controller';
import { UserPreferences } from '@safeview/shared/types/content';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Request, Response } from 'express';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('PreferencesController', () => {
  let controller: PreferencesController;
  const dataDir = join(process.cwd(), 'data');
  const preferencesPath = join(dataDir, 'preferences.json');

  beforeEach(() => {
    controller = new PreferencesController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should return current preferences', async () => {
      const mockPreferences: UserPreferences = {
        violence: true,
        nudity: true,
        profanity: true,
        gore: true,
        drugs: true,
        defaultAction: 'blur',
        sensitivity: 'medium'
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockPreferences));

      const req = {} as Request;
      const res = {
        json: jest.fn()
      } as unknown as Response;

      await controller.getPreferences(req, res);

      expect(res.json).toHaveBeenCalledWith(mockPreferences);
    });

    it('should handle errors gracefully', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const req = {} as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      } as unknown as Response;

      await controller.getPreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to get preferences'
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const currentPreferences: UserPreferences = {
        violence: true,
        nudity: true,
        profanity: true,
        gore: true,
        drugs: true,
        defaultAction: 'blur',
        sensitivity: 'medium'
      };

      const newPreferences: Partial<UserPreferences> = {
        violence: false,
        defaultAction: 'mute'
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(currentPreferences));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const req = {
        body: newPreferences
      } as Request;

      const res = {
        json: jest.fn()
      } as unknown as Response;

      await controller.updatePreferences(req, res);

      expect(res.json).toHaveBeenCalledWith({
        ...currentPreferences,
        ...newPreferences
      });
    });

    it('should validate preferences before updating', async () => {
      const invalidPreferences = {
        violence: 'not-a-boolean',
        defaultAction: 'invalid-action'
      };

      const req = {
        body: invalidPreferences
      } as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      } as unknown as Response;

      await controller.updatePreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid preferences format'
      });
    });

    it('should handle errors during update', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const req = {
        body: { violence: false }
      } as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      } as unknown as Response;

      await controller.updatePreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to update preferences'
      });
    });
  });
}); 