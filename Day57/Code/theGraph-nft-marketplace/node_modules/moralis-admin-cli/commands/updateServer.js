const help = require('../help')
const Sentry = require("@sentry/node");
const utils = require('../utils')
const {restartServer} = require('./common')

/**
 * Updates or restarts a server
 */
function updateServer(){

    // Display help section if asked to
    if (process.argv[3] == "help") return help.showHelp("update-server");      
    (async() => {
        try {
            // Get credentials
            const apiKey = utils.getApiKey();
            const apiSecret = utils.getApiSecret();

            // Get server to restart
            const server = utils.getSelectedServer((await utils.getUserServers()).filter(item => item.updateCloudError === 0 && item.update === 0));

            // Trigger restart
            await restartServer(apiKey, apiSecret, server)
        } catch (e) {
            console.log("Unexpected error");
            console.log(e)
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    updateServer
}