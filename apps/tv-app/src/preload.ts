import { contextBridge, ipcRenderer } from 'electron';

// Define UserPreferences interface locally to avoid import issues
interface UserPreferences {
  violence: boolean;
  nudity: boolean;
  profanity: boolean;
  gore: boolean;
  drugs: boolean;
  defaultAction: string;
  sensitivity: 'low' | 'medium' | 'high';
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data: any) => {
    // Whitelist channels
    const validChannels = [
      'app-ready',
      'apply-filter',
      'cancel-filter',
      'video-control'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel: string, callback: (data: any) => void) => {
    // Whitelist channels
    const validChannels = [
      'app-ready-reply',
      'content-warnings',
      'video-state'
    ];
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender`
      ipcRenderer.on(channel, (_event, data) => callback(data));
    }
  },
  removeListener: (channel: string) => {
    // Whitelist channels
    const validChannels = [
      'app-ready-reply',
      'content-warnings',
      'video-state'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
  invoke: async (channel: string, data: any) => {
    // Whitelist channels
    const validChannels = [
      'get-content-warnings',
      'apply-filter',
      'video-control'
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
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
contextBridge.exposeInMainWorld('api', {
  // Preferences
  getPreferences: async (): Promise<UserPreferences> => {
    return ipcRenderer.invoke('get-preferences');
  },
  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    return ipcRenderer.invoke('update-preferences', preferences);
  },
  
  // Video processing
  processVideo: async (videoPath: string, preferences: UserPreferences): Promise<any> => {
    return ipcRenderer.invoke('process-video', { videoPath, preferences });
  },
  analyzeVideo: async (formData: FormData): Promise<any> => {
    return ipcRenderer.invoke('analyze-video', formData);
  },
  
  // Manual flagging
  flagContent: async (timestamp: number, type: string): Promise<any> => {
    return ipcRenderer.invoke('flag-content', { timestamp, type });
  },
  
  // Events
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['app-ready-reply', 'video-processed', 'content-detected'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    }
  },
  
  // Send events to main process
  send: (channel: string, data: any) => {
    const validChannels = ['app-ready'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: async (channel: string, ...args: any[]) => {
      const validChannels = [
        'initialize-service',
        'play-video',
        'get-current-video',
        'enter-fullscreen',
        'exit-fullscreen'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid channel: ${channel}`);
    },
    on: (channel: string, func: Function) => {
      const validChannels = ['viewport-update'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
}); 