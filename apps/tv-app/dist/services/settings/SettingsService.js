"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
class SettingsService {
    constructor() {
        this.storageKey = 'safeview-settings';
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
        }
        catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    async updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        }
        catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    getSettings() {
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
        }
        catch (error) {
            console.error('Failed to save default settings:', error);
        }
    }
}
exports.SettingsService = SettingsService;
//# sourceMappingURL=SettingsService.js.map