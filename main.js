require('update-electron-app').updateElectronApp();
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')

const myPackage = require('./package.json')

async function checkAppUpdate() {
  // On ne vérifie pas en mode dev (lancé via npm start)
  if (!app.isPackaged) return 

  try {
    // 1. Appeler l'API GitHub de ton dépôt public
    const response = await fetch('https://api.github.com/repos/Barbarius-III/myFirstElectronApp/releases/latest')
    const latestRelease = await response.json()
    
    // GitHub renvoie le tag de version (ex: "v2.0.0" ou "2.0.0")
    const latestVersion = latestRelease.tag_name.replace('v', '')
    const currentVersion = myPackage.version

    // 2. Comparer les versions
    if (latestVersion !== currentVersion) {
      const { response: buttonIndex } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Télécharger la mise à jour', 'Plus tard'],
        title: 'Mise à jour disponible',
        message: `Une nouvelle version (${latestVersion}) est disponible !`,
        detail: 'Souhaitez-vous ouvrir la page de téléchargement ?'
      })

      // 3. Rediriger l'utilisateur vers ta page de Release GitHub
      if (buttonIndex === 0) {
        await shell.openExternal('https://github.com/Barbarius-III/myFirstElectronApp/releases/latest')
      }
    }
  } catch (error) {
    console.error('Impossible de vérifier les mises à jour', error)
  }
}

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

  checkAppUpdate()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
	createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
