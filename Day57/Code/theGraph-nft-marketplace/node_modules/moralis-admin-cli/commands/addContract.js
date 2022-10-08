const grab = require('ps-grab');
const Sentry = require("@sentry/node");
const axios = require('axios');
const fs = require('fs');
require('dotenv').config()
const help = require('../help')
const utils = require('../utils')
const { BASE_URI } = require('../config');
const { restartServer } = require('./common');
const prompt = require('prompt-sync')({sigint: true});

/**
 * Configures the events to subscribe to on a smart contract based on the abi file
 */
function addContract(){
    // Show help section if the user asked for it
    if (process.argv[3] == "help") return help.showHelp("add-contract");

    // Get the path to the abi json file
    const abiPath = grab('--abiPath') || grab('-p') || process.env.abiPath || utils.getFilePath("Specify path to abi json file: ");
    (async() => {
        try {
            // Get credentials
            const apiKey = utils.getApiKey();
            const apiSecret = utils.getApiSecret();

            // Load servers
            const servers = await utils.getUserServers();
            if (servers.length == 0) {
                console.log("No servers found!");
                return;
            }
            // Get the server to apply the event syncs to
            const server = utils.getSelectedServer(servers.filter(item => item.updateCloudError === 0 && item.update === 0 && item.enabledEvms));

            // read the abi
            fs.readFile(abiPath, "utf8", async function read(err, data) {

                // Check for errors
                if (err) {
                    console.log(`Error reading file from disk: ${err}`);
                    return;
                }

                // get the events from the abi
                const abiEvents = JSON.parse(data).abi.filter(item => item.type == "event");
                if (!abiEvents){
                    console.log("Could not read ABI");
                }

                // Function for fixing datatypes
                const fixType = (type) => type == "uint" ? "uint256" : type;

                // function for getting the topic
                const getTopic = (item) =>  `${item.name}(${item.inputs.reduce((a,o) => (a.push(fixType(o.type)),a), []).join()})`;

                // Get a list of all the available events to choose from
                const eventNames = abiEvents.reduce((a,o,i) => (a.push(`\n(${i}) ${o.name}`),a), []).join('');

                // Display available events to subscribe to
                console.log(`\nAvailable events are: ${eventNames}`);

                // Get chosen events
                const selection = utils. requireInput(`Select events to sync (separate with ','): `);

                // Throw if no events were chosen
                if (selection == undefined || selection.length === 0){
                    throw "No events selected!";
                }

                // Get the current plugins of the server
                const plugins = JSON.parse(server.plugins) || [];

                // Get the indexes of the events to sync
                const selectedEvents = selection.split(',').reduce((a,o,i) => (a.push(parseInt(o)),a), []);

                // Loop through the selected events
                for (let i = 0; i < selectedEvents.length; i++) {

                    // Get the current event
                    const event = abiEvents[selectedEvents[i]];

                    // ASk user for information about decription, address and table name
                    console.log(`\nConfiguration for event ${event.name}:\n`)
                    const description = utils.requireInput(`Specify description: `);
                    const contractAddress = utils.requireInput(`Specify contractAddress: `);
                    const tableName = utils.requireInput(`Specify table name: `);
                    const syncHistorical = utils.requireInput(`Do you need to sync historical events? (y/n): `,["y","n","Y","N"]).toLowerCase() == "y";
                    const provider = utils.getSelectedServerProvider(JSON.parse(server.enabledEvms))
                    // Calculate the topic
                    const topic = getTopic(event);

                    // Define the new plugin
                    const plugin = {
                        id: 1,
                        path: "./evm/events",
                        order: 5,
                        options: {
                            description: description,
                            abi: event,
                            topic: topic,
                            address: contractAddress,
                            sync_historical: syncHistorical,
                            tableName: tableName,
                            chainId: provider
                        }
                    };

                    // Push the plugin to the list
                    plugins.push(plugin);
                }

                // Post updated plugins to the api
                console.log("\nPushing contract events to moralis server...")
                await axios.post(`${BASE_URI}/api/cli/updateServerPlugins`, {
                    apiKey,
                    apiSecret,
                    parameters :
                    {
                        serverId: server.id,
                        plugins: JSON.stringify(plugins)
                    }
                });
                console.log("Successfully saved the contract events!");

                // Restart server to apply sync
                await restartServer(apiKey, apiSecret, server);
                console.log("Events are now subscribed to!");
            });
        } catch (e) {
            console.log("Unexpected error")
            console.log(e)
            Sentry.captureException(e);
        }
    })()
}

module.exports = {
    addContract
}
