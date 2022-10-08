
const grab = require('ps-grab');
const Sentry = require("@sentry/node");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config()
const help = require('../help')
const utils = require('../utils')

/**
 * Deploys static frontend code to be hosted on the server
 */
function deploy(){

    // Display help section if asked to
    if (process.argv[3] == "help") return help.showHelp("deploy");      
    (async() => {

        // Get path of the folder to deploy
        let folderPath = grab('--folderPath') || grab('-p') || '.';
        
        // Make sure the folder ends with a trailing '/'
        if (!folderPath.endsWith("/")) folderPath +="/";
        
        // Make sure the folder contains a index.html
        if (!fs.existsSync(`${folderPath}index.html`)){
            console.log("Destination folder must contain: index.html!");
            return;
        }

        try {

            // get server list
            const servers = await utils.getUserServers();

            // Get selected server
            const server = utils.getSelectedServer(servers.filter(item => item.updateCloudError === 0 && item.update === 0))
            try {

                // Zip the selected folder
                await utils.zipDirectory(folderPath, "../publish.zip");    

                // Check so that the compressed file is less than 50MB
                var stats = fs.statSync("../publish.zip");
                if (stats.size > 52428800)
                {
                    throw (`Size limit on the compessed data is 50MB, Your compressed data takes up ${stats.size / 1000000.0} MB.`)
                }

                // Define request
                const formData = new FormData();
                formData.append('moralisMasterKey', server.masterKey);
                formData.append('publish.zip', fs.createReadStream('../publish.zip'));

                // Call endpoint to deploy with the attached file
                await axios.post(`https://${server.subdomain}:2087/deploy`, formData, {
                    headers: formData.getHeaders()
                });           
                
                // Display confirmation
                console.log("Deployed successfully!");
                console.log(`Site is available at: https://${server.subdomain}`);
            } catch (e) {
                console.log("En error occured when trying to deploy");
                console.log(e)
                Sentry.captureException(e);
            }finally {
                // Clean up
                fs.unlinkSync('../publish.zip');
            }
        } catch (e) {
            console.log("Unexpected error")
            console.log(e)
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    deploy
}