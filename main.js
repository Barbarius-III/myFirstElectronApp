// require('update-electron-app').updateElectronApp();
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const { autoUpdater } = require('electron-updater')

autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
	preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
	    createWindow()
    }
  })
})

autoUpdater.on('update-available', () => {
  // Optionnel : Tu peux envoyer un message à ton interface pour dire "Téléchargement en cours..."
  console.log('Une mise à jour est disponible. Téléchargement lancé...')
})

autoUpdater.on('update-downloaded', () => {
  // La mise à jour est téléchargée en tâche de fond, on propose l'installation
  dialog.showMessageBox({
    type: 'info',
    title: 'Mise à jour prête',
    message: 'Une nouvelle version a été téléchargée. Voulez-vous redémarrer l\'application pour l\'installer maintenant ?',
    buttons: ['Redémarrer et Installer', 'Plus tard']
  }).then((result) => {
    if (result.response === 0) {
      // Ferme l'application et lance l'installation de la nouvelle version
      autoUpdater.quitAndInstall()
    }
  })
})

autoUpdater.on('error', (err) => {
  console.error('Erreur lors de la mise à jour :', err)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
