const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    search: (query) => ipcRenderer.invoke('winget-search', query),
    install: (id) => ipcRenderer.invoke('winget-install', id),
    uninstall: (id) => ipcRenderer.invoke('winget-uninstall', id),
    listInstalled: () => ipcRenderer.invoke('winget-list-installed'),
    checkUpdates: () => ipcRenderer.invoke('winget-check-updates'),
    upgrade: (id) => ipcRenderer.invoke('winget-upgrade', id),
    upgradeAll: () => ipcRenderer.invoke('winget-upgrade-all'),

    // Auto-update API
    checkForAppUpdates: () => ipcRenderer.invoke('app-check-for-updates'),
    downloadAppUpdate: () => ipcRenderer.invoke('app-download-update'),
    installAppUpdate: () => ipcRenderer.invoke('app-install-update'),
    getAppVersion: () => ipcRenderer.invoke('app-get-version'),
    onUpdateStatus: (callback) => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on('update-status', listener);
        // Cleanup function
        return () => ipcRenderer.removeListener('update-status', listener);
    },
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
