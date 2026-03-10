const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Full Party - Etiquetas",
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'logo.png'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // AHORA APUNTAMOS AL .EXE DE PYTHON EN LUGAR DEL COMANDO ORIGINAL
  const backendPath = path.join(__dirname, 'dist', 'servidor_etiquetas.exe');
  
  backendProcess = spawn(backendPath);

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  // Le damos 1.5 segundos al .exe para arrancar la base de datos antes de mostrar la ventana
  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill(); // Apaga el servidor al cerrar la ventana
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});