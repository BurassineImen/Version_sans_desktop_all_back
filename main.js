const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { jsPDF } = require('jspdf');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      enableRemoteModule: false,
    },
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'build', 'index.html')}`;
  console.log('Chargement de l\'URL :', url);
  mainWindow.loadURL(url);
  mainWindow.on('closed', () => (mainWindow = null));
}

// Handle print request with PDF preview
ipcMain.on('print-labels', async (event, htmlContent) => {
  console.log('Received HTML content for printing:', htmlContent.substring(0, 100) + '...');

  try {
    const tempDir = app.getPath('temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
      },
    });

    const pdfTimeout = setTimeout(() => {
      tempWindow.close();
      event.reply('print-error', 'Délai dépassé lors de la génération du PDF');
    }, 10000);

    await tempWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`);

    tempWindow.webContents.on('did-finish-load', async () => {
      try {
        const pdfData = await tempWindow.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          landscape: false,
        });
        clearTimeout(pdfTimeout);
        tempWindow.close();

        const pdfPath = path.join(tempDir, `preview_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
        fs.writeFileSync(pdfPath, pdfData);

        const previewWindow = new BrowserWindow({
          width: 1000,
          height: 800,
          title: 'Aperçu du PDF avant impression',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
          },
          show: true,
        });

        await previewWindow.loadURL(`file://${pdfPath}`);

        previewWindow.webContents.on('did-finish-load', () => {
          previewWindow.webContents.executeJavaScript(`
            const buttonContainer = document.createElement('div');
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.top = '10px';
            buttonContainer.style.right = '10px';
            buttonContainer.style.zIndex = '1000';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.backgroundColor = 'rgba(255,255,255,0.9)';
            buttonContainer.style.padding = '10px';
            buttonContainer.style.borderRadius = '5px';
            buttonContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

            const printButton = document.createElement('button');
            printButton.innerText = 'Confirmer et Imprimer';
            printButton.style.padding = '10px 20px';
            printButton.style.fontSize = '16px';
            printButton.style.backgroundColor = '#28a745';
            printButton.style.color = 'white';
            printButton.style.border = 'none';
            printButton.style.borderRadius = '4px';
            printButton.style.cursor = 'pointer';
            printButton.onclick = () => {
              window.print();
            };
            buttonContainer.appendChild(printButton);

            const cancelButton = document.createElement('button');
            cancelButton.innerText = 'Annuler';
            cancelButton.style.padding = '10px 20px';
            cancelButton.style.fontSize = '16px';
            cancelButton.style.backgroundColor = '#dc3545';
            cancelButton.style.color = 'white';
            cancelButton.style.border = 'none';
            cancelButton.style.borderRadius = '4px';
            cancelButton.style.cursor = 'pointer';
            cancelButton.onclick = () => {
              window.close();
            };
            buttonContainer.appendChild(cancelButton);

            document.body.appendChild(buttonContainer);
            document.body.style.overflow = 'auto';
            document.body.style.padding = '20px';
            document.body.style.margin = '0';
          `).catch((err) => {
            console.error('Error executing JavaScript in preview window:', err);
            event.reply('print-error', 'Erreur lors de la configuration de l\'aperçu');
          });
        });

        previewWindow.on('closed', () => {
          try {
            if (fs.existsSync(pdfPath)) {
              fs.unlinkSync(pdfPath);
            }
          } catch (err) {
            console.error('Error deleting temp PDF file:', err);
          }
        });
      } catch (error) {
        clearTimeout(pdfTimeout);
        console.error('Error generating PDF:', error);
        tempWindow.close();
        event.reply('print-error', 'Erreur lors de la génération du PDF');
      }
    });

    tempWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      clearTimeout(pdfTimeout);
      console.error('Failed to load content in temp window:', errorDescription);
      tempWindow.close();
      event.reply('print-error', 'Erreur lors du chargement du contenu');
    });
  } catch (error) {
    console.error('Error in print-labels handler:', error);
    event.reply('print-error', 'Erreur lors de l\'ouverture de la fenêtre d\'aperçu');
  }
});

// Handle PDF save request from renderer
ipcMain.on('save-pdf', async (event, { imgData, canvasWidth, canvasHeight, today }) => {
  console.log('Received image data for PDF:', imgData.substring(0, 50) + '...');

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWidth = 210;
    const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    const { filePath } = await dialog.showSaveDialog({
      title: 'Enregistrer le PDF',
      defaultPath: `CBC_Etiquettes_${today}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (filePath) {
      try {
        fs.writeFileSync(filePath, pdf.output('arraybuffer'));
        console.log('PDF saved successfully:', filePath);
        event.reply('pdf-saved', 'PDF sauvegardé avec succès');
      } catch (error) {
        console.error('Error saving PDF:', error);
        event.reply('pdf-save-error', 'Erreur lors de la sauvegarde du PDF');
      }
    }
  } catch (error) {
    console.error('Error in save-pdf handler:', error);
    event.reply('pdf-save-error', 'Erreur lors de la génération du PDF');
  }
});

app.on('ready', async () => {
  const dbSource = path.join(
    isDev ? __dirname : process.resourcesPath,
    'app',
    'tunvitaBack-main',
    'db',
    'database.sqlite'
  );
  const dbDest = path.join(process.resourcesPath, 'tunvitaBack-main', 'database.sqlite');

  if (!fs.existsSync(dbDest) && fs.existsSync(dbSource)) {
    try {
      const destDir = path.dirname(dbDest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(dbSource, dbDest);
      console.log('Database copied to userData:', dbDest);
    } catch (error) {
      console.error('Error copying database:', error);
    }
  }

  let serverPath;
  if (app.isPackaged) {
    serverPath = path.join(process.resourcesPath, 'server.js');
  } else {
    serverPath = path.join(__dirname, 'tunvitaBack-main', 'server.js');
  }

  if (fs.existsSync(serverPath)) {
    backendProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        NODE_ENV: isDev ? 'development' : 'production',
        PATH: process.env.PATH,
        DB_PATH: dbDest,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
      if (data.toString().includes('Serveur backend : http://localhost:5000')) {
        createWindow();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend error: ${data}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Backend process error:', err);
      dialog.showErrorBox('Erreur', 'Impossible de démarrer le serveur backend.');
      app.quit();
    });

    backendProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Backend process exited with code ${code}`);
        dialog.showErrorBox('Erreur', 'Le serveur backend s\'est arrêté inopinément.');
        app.quit();
      }
    });

    setTimeout(() => {
      if (!mainWindow) {
        console.warn('Backend timeout, creating window anyway...');
        createWindow();
      }
    }, 10000);
  } else {
    console.error('Server file not found:', serverPath);
    createWindow();
  }
});

function shutdownBackend() {
  if (backendProcess && !backendProcess.killed) {
    // Attempt a graceful shutdown by sending a custom message (e.g., via stdin)
    backendProcess.stdin.write('shutdown\n', (err) => {
      if (err) {
        console.error('Error sending shutdown signal:', err);
      }
      // Wait briefly for shutdown, then force kill if still running
      setTimeout(() => {
        if (!backendProcess.killed) {
          backendProcess.kill('SIGTERM');
        }
      }, 2000); // 2-second grace period
    });
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    shutdownBackend();
    app.quit();
  }
});

app.on('before-quit', (event) => {
  shutdownBackend();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});