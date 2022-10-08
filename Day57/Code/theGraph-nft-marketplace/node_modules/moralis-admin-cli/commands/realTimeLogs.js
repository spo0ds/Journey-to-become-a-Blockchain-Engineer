const axios = require('axios');
const utils = require('../utils');
const grab = require('ps-grab');
const btoa = require('btoa');
const help = require('../help');
const ora = require('ora');
const Sentry = require("@sentry/node");

/**
 * Get Moralis logs
 * 
 * 
 * @description A script that calls get log API every x amount of seconds.
 *              The script prints new log that come AFTER its activation.
 *              New logs are printed at the bottom.
 * 
 */

async function getLogs() {
    
    if (process.argv[3] == "help") return help.showHelp("get-logs");  

    try {
        // Check if api key and secret are given parameters
        let apiKey = grab("--apiKey") || grab("-k") || process.env.moralisApiKey;
        let apiSecret = grab("--apiSecret") || grab("-s") || process.env.moralisApiSecret;

        if(!apiKey) apiKey = await utils.getApiKey();
        if(!apiSecret) apiSecret = await utils.getApiSecret();

        // Select server
        const server = utils.getSelectedServer((await utils.getUserServers(apiKey, apiSecret)).filter(item => item.updateCloudError === 0 && item.update === 0));
        if(server.length == 0) throw("No server found");

        const subdomain = server.subdomain;
        const masterKey = server.masterKey;
        const applicationId = server.applicationId;

        // Timeout (1 second) by default
        const timeout = 1000;

        // Get 1000 logs per request (safe enough as 1000 logs in 1 second won't probably ever be created)
        const numberOfLogs = 1000;

        const url = `https://${subdomain}:2053/server/scriptlog?n=${numberOfLogs}`;

        // Encode key and appId just once
        const encoded = btoa(`${applicationId}:${masterKey}`);

        // Axios config
        const config = {
            method: 'get',
            url: url,
            headers: { 
                'Authorization': `Basic ${encoded}`
            }
        };

        // Last logs timestamp is set when the script starts.
        let lastLogTimeStamp;
        axios(config)
            .then(function (response) {
                if(response.data.length > 0 && response.data[0].timestamp) {
                    lastLogTimeStamp = response.data[0].timestamp;
                } else {
                    // If not logs, I set an old date so that the script will fetch new logs
                    // Leave the `lastLogTimeStamp` to undefined will not trigger new logs
                    lastLogTimeStamp = new Date('2000-01-01T17:00:00.000Z');
                }
            })
            .catch(function (error) {
                console.log(error);
                Sentry.captureException(error);
            });
        
        console.log("\n");
        const throbber = ora({
            text: "Listening for logs",
            spinner: {
                frames: ['-', '|'],
                interval: 300, // Optional
            },
            }).start();
        
        setInterval( () => {
            axios(config)
            .then(function (response) {
                if (response.data.length > 0 && new Date(lastLogTimeStamp) < new Date(response.data[0].timestamp)) {

                    // Print all logs created after lastLogTimeStamp
                    for(let i = response.data.length - 1; i >= 0; i --) {
                        if(new Date(lastLogTimeStamp) < new Date(response.data[i].timestamp)) {

                            let type = "";
                            let timestamp = "";
                            let message = "";
                            if(response.data[i].level) {
                                type = `${response.data[i].level.toUpperCase()}`
                            }
                            if(response.data[i].message) {
                                message = `${response.data[i].message}`;      
                            }
                            timestamp = `|| ${response.data[i].timestamp} ||`;

                            throbber.stop();

                            // Log to console
                            console.log("\n\n");
                            console.log(`${utils.getColors(response.data[i].level)} `, type,'\x1b[0m', (timestamp.split('.')[0]+"Z").replace("T", " ").replace("Z", " "),  '\n' + message);
                            
                        }
                    }

                    // Set lastLogTimeStamp to most recent timestamp
                    lastLogTimeStamp = response.data[0].timestamp;
                }
            })
            .catch(function (error) {
                //
            });
        
        }, timeout);
        
    } catch (error) {
        console.log(error);
        Sentry.captureException(error);
    }
}

module.exports = { 
    getLogs 
}
