const { contextBridge, ipcRenderer } = require('electron');

console.log('preload.js chargé');

contextBridge.exposeInMainWorld('electronAPI', {
  sendPrintLabels: (htmlContent) => {
    console.log('Appel de sendPrintLabels depuis preload.js');
    ipcRenderer.send('print-labels', htmlContent);
  },
  sendSavePDF: (data) => {
    console.log('Appel de sendSavePDF depuis preload.js');
    ipcRenderer.send('save-pdf', data);
  },
});