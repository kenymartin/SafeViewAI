"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
function setupIpcHandlers() {
    // Get user preferences
    electron_1.ipcMain.handle('get-preferences', async () => {
        try {
            const response = await axios_1.default.get(`${API_BASE_URL}/preferences`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get preferences:', error);
            throw new Error('Failed to get preferences');
        }
    });
    // Update user preferences
    electron_1.ipcMain.handle('update-preferences', async (_, preferences) => {
        try {
            const response = await axios_1.default.put(`${API_BASE_URL}/preferences`, preferences);
            return response.data;
        }
        catch (error) {
            console.error('Failed to update preferences:', error);
            throw new Error('Failed to update preferences');
        }
    });
    // Process video
    electron_1.ipcMain.handle('process-video', async (_, { videoPath, preferences }) => {
        try {
            const response = await axios_1.default.post(`${API_BASE_URL}/video/process`, {
                videoPath,
                preferences
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to process video:', error);
            throw new Error('Failed to process video');
        }
    });
    // Analyze video
    electron_1.ipcMain.handle('analyze-video', async (_, formData) => {
        try {
            const response = await axios_1.default.post(`${API_BASE_URL}/video/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to analyze video:', error);
            throw new Error('Failed to analyze video');
        }
    });
    // Manual flag content
    electron_1.ipcMain.handle('flag-content', async (_, { timestamp, type }) => {
        console.log(`Manually flagged content at ${timestamp}s as ${type}`);
        // This would typically send data to the backend
        // For now, we'll just return a success message
        return {
            success: true,
            message: `Content flagged at ${timestamp}s`
        };
    });
}
//# sourceMappingURL=handlers.js.map