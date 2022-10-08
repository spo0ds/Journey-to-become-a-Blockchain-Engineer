const grab = require('ps-grab');
const Sentry = require("@sentry/node");
const axios = require('axios');
require('dotenv').config()
const help = require('../help')
const utils = require('../utils')
const { BASE_URI } = require('../config');

/**
 * Creates a server
 */
function createServer(){

    // Display help section if asked to
    if (process.argv[3] == "help") return help.showHelp("create-server");    
    (async() => {
        try {

            // Get credentials
            const apiKey = utils.getApiKey();
            const apiSecret = utils.getApiSecret();

            // Get the server name of the new server
            const serverName = grab('--serverName') || grab('-n') || utils.requireInput(`Enter name of the new server: `);

            // Throw error if invalid input
            if (serverName == undefined || serverName.length ==0){
                throw "Invalid input!";
            }

            // Get region and network for the server
            const region = utils.getSelectedServerRegion();
            const network = utils.getSelectedServerNetwork();
            const providers = JSON.stringify(utils.getSelectedServerProviders(network.value));
         
            try {

                // Trigger creation of the server
                console.log(`Creating server: ${serverName} in ${region.name} on ${network.name}`)
                const params = {
                    name: serverName,
                    region: `${region.id}`,
                    network: network.value,
                    chains: providers
                };
                
                await axios.post(`${BASE_URI}/api/cli/createServer`, {
                    apiKey,
                    apiSecret,
                    parameters : params
                });
                console.log("Triggered Server creation successfully")


                let prevStatus = "";
                let first = true;
                let serverId = 0;

                // Poll creation status
                const serverCheck = setInterval(async () =>{

                    // Get list of servers
                    let servers = await utils.getUserServers();       

                    // Define server variable
                    let server;   

                    // If this is the first call
                    if (first){                 
                        // Set first call to false for the next poll                                                
                        first = false;   

                        // filter out all server who are not being created
                        servers = servers.filter(item => item.status < 6);

                        // Pick the most recently added (if more than one is being created)
                        server = servers[servers.length - 1];

                        // Assign the id of the server
                        serverId = server.id;
                    }else{
                        // If we get here then we have polled the status before so we already know the server id

                        // Get the server
                        server = servers.filter(item => item.id === serverId)[0];
                    }
                    
                    // Check if server is compleatly configured 
                    if (server.status === 6){

                        // If so, display this to the user and stop polling
                        console.log("Server created successfully!")
                        clearInterval(serverCheck);                          
                    } 
                    else{

                        // If we get here then the server is still being configured

                        //Check if we have a new status in the progress
                        if (prevStatus != server.progressCreation){

                            // Display the progress
                            console.log(server.progressCreation);

                            // Set the new progress to the current progress
                            prevStatus = server.progressCreation;
                        }                                
                    }
                }, 5000);

            } catch (e) {
                console.log("Server creation failed")
                console.log(e)
                Sentry.captureException(e);
            }
        } catch (e) {
            console.log("Unexpected error")
            console.log(e)
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    createServer
}