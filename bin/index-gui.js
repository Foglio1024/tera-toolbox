const { app, BrowserWindow } = require('electron');
const path = require('path');

// Boot
if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
}

if (app.isReady())
    main();
else
    app.on('ready', () => main());

// Main function
async function updateSelf(outputConsole) {
    delete require.cache[require.resolve('./update-self')];
    const autoUpdateSelf = require("./update-self");
    let result = await autoUpdateSelf(outputConsole);
    if (result)
        return updateSelf(outputConsole);
    else
        return true;
}

function main() {
    // Show splash screen
    let SplashScreen;
    try {
        app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

        const guiRoot = path.join(__dirname, 'gui');
        const guiIcon = path.join(guiRoot, 'icon.png');
        SplashScreen = new BrowserWindow({
            title: 'Caali\'s Tera Proxy',
            width: 960,
            height: 540,
            icon: guiIcon,
            frame: false,
            backgroundColor: '#292F33',
            resizable: false,
            webPreferences: {
                devTools: false
            }
        });

        SplashScreen.loadFile(path.join(guiRoot, 'splash.html'));
        SplashScreen.show();
    } catch (e) {
        // Ignore any error resulting from splash screen
        SplashScreen = null;
    }

    // Perform self-update
    updateSelf(console).then(result => {
        if (result) {
            require('./loader-gui');

            if (SplashScreen) {
                SplashScreen.close();
                SplashScreen = null;
            }
        } else {
            const { dialog } = require('electron');

            dialog.showMessageBox({
                type: 'error',
                title: 'Self-update error!',
                message: `Tera-Proxy was unable to update itself. Please ask in https://discord.gg/659YbNY for help!\n\nIt will now be terminated.`
            });

            app.quit();
        }
    }).catch(e => {
        const { dialog } = require('electron');

        dialog.showMessageBox({
            type: 'error',
            title: 'Self-update error!',
            message: `Tera-Proxy was unable to update itself. Please ask in https://discord.gg/659YbNY for help!\n\nThe full error message is:\n${e}\n\nProxy will now be terminated.`
        });

        app.quit();
    });
}
