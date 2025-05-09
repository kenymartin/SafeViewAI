"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingManager = void 0;
class StreamingManager {
    constructor() {
        this.window = null;
        this.window = null;
    }
    async initialize(window) {
        this.window = window;
    }
    async loadContent(url) {
        if (!this.window) {
            throw new Error('Window not initialized');
        }
        await this.window.loadURL(url);
    }
    async toggleFullscreen(isFullscreen) {
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
exports.StreamingManager = StreamingManager;
//# sourceMappingURL=StreamingManager.js.map