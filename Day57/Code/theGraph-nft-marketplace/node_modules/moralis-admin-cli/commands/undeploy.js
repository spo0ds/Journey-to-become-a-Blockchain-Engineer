const axios = require('axios');
const Sentry = require("@sentry/node");
require('dotenv').config()
const help = require('../help')
const utils = require('../utils')

/**
 * Clears the published frontend of the selected server
 */
function undeploy(){

    // Display help section if user is asking for help
    if (process.argv[3] == "help") return help.showHelp("undeploy");      

    (async() => {       
        try {
    
            // Get servers of user
            const servers = await utils.getUserServers();

            // Get the server to undeploy
            const server = utils.getSelectedServer(servers.filter(item => item.updateCloudError === 0 && item.update === 0))

            // Trigger undeploy in the api
            console.log(`Triggering undeployment of server: ${server.name}`)
            await axios.post(`https://${server.subdomain}:2087/undeploy`,{
                moralisMasterKey: server.masterKey,
            });     
            console.log("Site successfully undeployed!");
        } catch (e) {
            console.log("Unexpected error")
            console.log(e)
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    undeploy
}