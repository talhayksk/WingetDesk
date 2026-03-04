const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#ffffff',
            height: 30
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// ─── Auto-Updater Setup ─────────────────────────────
function setupAutoUpdater() {
    // Dev ortamında da test edebilmek için
    autoUpdater.autoDownload = false; // Kullanıcı onaylasın
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        sendUpdateStatus('checking');
    });

    autoUpdater.on('update-available', (info) => {
        sendUpdateStatus('available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
        sendUpdateStatus('not-available', info);
    });

    autoUpdater.on('download-progress', (progress) => {
        sendUpdateStatus('downloading', progress);
    });

    autoUpdater.on('update-downloaded', (info) => {
        sendUpdateStatus('downloaded', info);
    });

    autoUpdater.on('error', (err) => {
        sendUpdateStatus('error', err?.message || err?.toString());
    });
}

function sendUpdateStatus(status, data = null) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-status', { status, data });
    }
}

// IPC: Kullanıcı manuel güncelleme kontrolü
ipcMain.handle('app-check-for-updates', async () => {
    try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, data: result?.updateInfo };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC: Güncellemeyi indir
ipcMain.handle('app-download-update', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC: Güncellemeyi kur ve uygulamayı yeniden başlat
ipcMain.handle('app-install-update', () => {
    autoUpdater.quitAndInstall(false, true);
});

// IPC: Mevcut versiyon bilgisi
ipcMain.handle('app-get-version', () => {
    return app.getVersion();
});

// IPC: Dış linkleri sistem tarayıcısında aç
ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
});

app.whenReady().then(() => {
    createWindow();
    setupAutoUpdater();

    // Uygulama açıldığında otomatik kontrol et (sadece paketlenmiş build'de)
    if (app.isPackaged) {
        setTimeout(() => {
            autoUpdater.checkForUpdates();
        }, 3000); // 3 saniye sonra kontrol et
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('winget-search', async (event, query) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget search "${query}" --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error && !stdout) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
});

ipcMain.handle('winget-install', async (event, id) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget install --id "${id}" --accept-package-agreements --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
});

ipcMain.handle('winget-check-updates', async (event) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget upgrade --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error && error.code !== 1 && !stdout) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
});

ipcMain.handle('winget-upgrade', async (event, id) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget upgrade --id "${id}" --accept-package-agreements --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
});

ipcMain.handle('winget-upgrade-all', async (event) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget upgrade --all --accept-package-agreements --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
});

ipcMain.handle('winget-list-installed', async (event, ids) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget list --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error && !stdout) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            // Return the raw output so the renderer can parse it
            resolve(stdout);
        });
    });
});

ipcMain.handle('winget-uninstall', async (event, id) => {
    return new Promise((resolve, reject) => {
        const command = `chcp 65001 >nul & winget uninstall --id "${id}" --accept-source-agreements`;
        console.log(`Executing: ${command}`);

        exec(command, { encoding: 'utf8', env: { ...process.env, COLUMNS: '4096' } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
});
