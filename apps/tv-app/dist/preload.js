"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // Whitelist channels
        const validChannels = [
            'app-ready',
            'apply-filter',
            'cancel-filter',
            'video-control'
        ];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    on: (channel, callback) => {
        // Whitelist channels
        const validChannels = [
            'app-ready-reply',
            'content-warnings',
            'video-state'
        ];
        if (validChannels.includes(channel)) {
            // Strip event as it includes `sender`
            electron_1.ipcRenderer.on(channel, (_event, data) => callback(data));
        }
    },
    removeListener: (channel) => {
        // Whitelist channels
        const validChannels = [
            'app-ready-reply',
            'content-warnings',
            'video-state'
        ];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.removeAllListeners(channel);
        }
    },
    invoke: async (channel, data) => {
        // Whitelist channels
        const validChannels = [
            'get-content-warnings',
            'apply-filter',
            'video-control'
        ];
        if (validChannels.includes(channel)) {
            return await electron_1.ipcRenderer.invoke(channel, data);
        }
    }
});
// Disable autofill when the window loads
window.addEventListener('DOMContentLoaded', () => {
    // Disable autofill for all input fields
    const disableAutofill = () => {
        document.querySelectorAll('input, textarea').forEach(el => {
            el.setAttribute('autocomplete', 'off');
            el.setAttribute('autocorrect', 'off');
            el.setAttribute('autocapitalize', 'off');
            el.setAttribute('spellcheck', 'false');
        });
    };
    // Initial disable
    disableAutofill();
    // Watch for new elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                disableAutofill();
            }
        });
    });
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
// Expose protected methods that allow the renderer process to use IPC
electron_1.contextBridge.exposeInMainWorld('api', {
    // Preferences
    getPreferences: async () => {
        return electron_1.ipcRenderer.invoke('get-preferences');
    },
    updatePreferences: async (preferences) => {
        return electron_1.ipcRenderer.invoke('update-preferences', preferences);
    },
    // Video processing
    processVideo: async (videoPath, preferences) => {
        return electron_1.ipcRenderer.invoke('process-video', { videoPath, preferences });
    },
    analyzeVideo: async (formData) => {
        return electron_1.ipcRenderer.invoke('analyze-video', formData);
    },
    // Manual flagging
    flagContent: async (timestamp, type) => {
        return electron_1.ipcRenderer.invoke('flag-content', { timestamp, type });
    },
    // Events
    on: (channel, callback) => {
        const validChannels = ['app-ready-reply', 'video-processed', 'content-detected'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, (_, ...args) => callback(...args));
        }
    },
    // Send events to main process
    send: (channel, data) => {
        const validChannels = ['app-ready'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    }
});
electron_1.contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: async (channel, ...args) => {
            const validChannels = [
                'initialize-service',
                'play-video',
                'get-current-video',
                'enter-fullscreen',
                'exit-fullscreen'
            ];
            if (validChannels.includes(channel)) {
                return electron_1.ipcRenderer.invoke(channel, ...args);
            }
            throw new Error(`Invalid channel: ${channel}`);
        },
        on: (channel, func) => {
            const validChannels = ['viewport-update'];
            if (validChannels.includes(channel)) {
                electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
});
//# sourceMappingURL=preload.js.map