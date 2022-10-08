const chokidar = require('chokidar');
const Sentry = require("@sentry/node");
const fsPromises = require('fs').promises;
const fs = require('fs');
const axios = require('axios');
const help = require('../help')
const utils = require('../utils')
const { BASE_URI } = require('../config');
const check = require('syntax-error');
const grab = require('ps-grab');

require('dotenv').config()
/**
 * Syncs the changes of a local javascript file to the cloud functions of a server
 */
function watchCloudFile(){

    // Display help section if asked for it
    if (process.argv[3] == "help") return help.showHelp("watch-cloud-file");    

    // Get credentials
    const apiKey = utils.getApiKey();
    const apiSecret = utils.getApiSecret();

    // Get path to the javascript file
    const filePath = grab('--moralisCloudFile') || grab('-p') || process.env.moralisCloudFile || utils.getFilePath("Specify path to cloud functions javascript file: ");

    // Get server to use
    let subdomain = grab('--moralisSubdomain') || grab('-d') || process.env.moralisSubdomain;
    (async() => {
        // If no server was provided or it was provided in a invalid promat
        if(subdomain == undefined || subdomain.length !== 23){

            // get all user severs and let the user chose which one to use
            const servers = await utils.getUserServers(apiKey, apiSecret);
            const server = utils.getSelectedServer(servers);
            subdomain = server.subdomain;
        }

        try {
            // Look up the file
            const stat = await fsPromises.lstat(filePath);
            if (stat.isFile()) {

                // Watch to file changes
                chokidar.watch(filePath).on('all', (event, path) => {
                    if(event === "add" || event === "change") {
                        // Read the file when changed
                        fs.readFile(filePath, "utf8", async function read(err, data) {
                            try {
                                // Check for syntax error
                                const syntaxError = check(data, filePath);
                                if(syntaxError) { 
                                    console.log(syntaxError);
                                    throw(syntaxError);                          
                                }
                                // Post changes to endpoint
                                await axios.post(`${BASE_URI}/api/cli/savecloud`, {
                                    apiKey,
                                    apiSecret,
                                    parameters : {
                                        subdomain,
                                        cloud: data
                                    }
                                });
                                console.log("File Uploaded Correctly")
                            } catch (e) {
                                console.log("File Uploaded Failed")
                                Sentry.captureException(e);
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.log("Invalid file")
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    watchCloudFile
}
