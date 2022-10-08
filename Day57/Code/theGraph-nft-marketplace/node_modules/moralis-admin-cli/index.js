#!/usr/bin/env node
require('dotenv').config()
const Sentry = require("@sentry/node");
const help = require('./help')
const {watchCloudFile} = require('./commands/watchCloudFile')
const {watchCloudFolder} = require('./commands/watchCloudFolder')
const {updateServer} = require('./commands/updateServer')
const {createServer} = require('./commands/createServer')
const {connectLocalDevchain} = require('./commands/connectLocalDevchain')
const {addContract} = require('./commands/addContract')
const {deploy} = require('./commands/deploy')
const {undeploy} = require('./commands/undeploy')
const {getLogs} = require('./commands/realTimeLogs')
const {getCliVersion} = require('./commands/getCliVersion')
const {valid_scripts} = require('./config');
const packageJson = require('./package.json');
Sentry.init({
    dsn: "https://a08026675af849c895a4c1e9bc9759bf@o625814.ingest.sentry.io/5755128",
    release: packageJson.version,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

// Get chosen action
const action = process.argv[2];

// Run selected command
switch(action){
    case "watch-cloud-folder": return watchCloudFolder();
    case "watch-cloud-file": return watchCloudFile();
    case "connect-local-devchain": return connectLocalDevchain();
    case "update-server": return updateServer();
    case "create-server": return createServer();
    case "add-contract": return addContract();
    case "deploy": return deploy();
    case "undeploy": return undeploy();
    case "get-logs": return getLogs();
    case "version": return getCliVersion();
    case "help": return help.generalHelp();
    default :
        console.log(`Invalid script ${action}`);
        console.log(`The following are valid scripts:`);
        for (const valid_script of valid_scripts){
            console.log(valid_script);
        }
        return;
}