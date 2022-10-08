const axios = require('axios');
const Sentry = require("@sentry/node");
require('dotenv').config()
const utils = require('../utils')
const { BASE_URI } = require('../config');

/**
 * Restarts and updates the provided server
 * @param {String} apiKey
 * @param {String} apiSecret
 * @param {Object} server
 */
restartServer = async (apiKey, apiSecret,server) => {
    try {

        // Trigger the restart
        console.log(`Updating / Restarting server: ${server.name}`)
        await axios.post(`${BASE_URI}/api/cli/updateServer`, {
            apiKey,
            apiSecret,
            parameters : {
                serverId: server.id,
            }
        });
        console.log("Triggered Server update / restart successfully")

        // Poll restart progress
        const serverCheck = setInterval(async () =>{

            // Get all servers
            let servers = await utils.getUserServers();

            // Check if the server has completed the restart / update
            if (servers.filter(item => item.id === server.id)[0].update === 0){

                // If so cancel the polling and return
                console.log("Server updated / restarted successfully")
                clearInterval(serverCheck);                          
            } 
            else{
                // Display progress
                console.log("Updating...")
            }
        }, 2500);
    } catch (e) {
        console.log("Server update/restart failed")
        console.log(e.response.data)
        Sentry.captureException(e);
    }
}

module.exports = {
    restartServer
}