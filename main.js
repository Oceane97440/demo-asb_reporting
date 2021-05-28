const electron = require('electron');
const app = require('./app');

let window;

function createWindow() {
    /* Créer une fenêtre de 800px par 600px sans bordures */
    window = new electron.BrowserWindow({
        width: 1500,
        height: 700,
        minWidth:1500,
        minHeight:700,
        maxWidth:1500,
        maxHeight:700,
        resizable: true,
        icon: 'logo.png',
        frame: true
    });


    /* Si vous décommentez cette ligne, vous verrez la console de débug Chrome */
    //  window.webContents.openDevTools(); 

    /* Display the homepage of the server */
    window.loadURL('https://reporting-antennesb.herokuapp.com/login');

    /* Lorsque la fenêtre est fermée, on l'indique au système */
    window.on('closed', () => {
        window = null;

    });
}

/* On attend qu'Electron.js soit prêt pour créer la fenêtre */
electron.app.on('ready', function () {

    app.start(function () {
        createWindow();
    });
});

/* Cette fonction arrête totalement l'application 
   lorsque toutes les fenêtres sont fermées */
electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});

/* Fonction utile pour MacOS */
electron.app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});