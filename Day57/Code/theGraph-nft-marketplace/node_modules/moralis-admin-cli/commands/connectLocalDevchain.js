const help = require('../help')
const Sentry = require("@sentry/node");
const utils = require('../utils')
require('dotenv').config()
const grab = require('ps-grab');
const { exec } = require('child_process');

/**
 * Connects one of the users servers to a local devchain
 */
function connectLocalDevchain() {

    // Display help section if asked to
    if (process.argv[3] == "help") return help.showHelp("connect-local-devchain");
    (async () => {
        try {

            // Get path to the frpc executable
            let frpcPath = grab('--frpcPath') || grab('-p') || process.env.frpcPath || utils.getFilePath("Specify filepath to frpc executable: ")

            // Make sure the path is wrapped in quotes
            if (!frpcPath.includes('"') && !frpcPath.includes("'")) frpcPath = `"${frpcPath}"`;
            // Get the server to connect to
            const server = utils.getSelectedServer((await utils.getUserServers()).filter((item) => item.network == "ganache"));

            // Get the local devchain to use
            const devchain = utils.getGetLocalDevchain();
            console.log(`Starting connection to ${devchain.name}`);

            // Start frpc
            exec(`${frpcPath} http -s ${server.subdomain}:7000 -t ${server.frpPassword} -l ${devchain.port} -d ${server.subdomain}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
            });
        } catch (e) {
            console.log("Unexpected error")
            console.log(e)
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    connectLocalDevchain
}

