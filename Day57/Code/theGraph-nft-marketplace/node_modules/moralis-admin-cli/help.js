const { valid_scripts } = require('./config');

/**
 * Displays general help about the Moralis Admin CLI
 */
function generalHelp() {
    console.log("The Moralis Admin CLI currently supports the following commands:");
    valid_scripts.forEach(element => {
        console.log(element);
    });
    console.log("\nTo learn more about each command run moralis-admin-cli commandName help.")
    console.log("Example:");
    console.log(`moralis-admin-cli ${valid_scripts[0]} help`);
}

/**
 * Shows the help for the given command
 */
function showHelp(command) {
    switch(command){
        case "watch-cloud-file":
            return showWatchCloudFileHelp();
        case "watch-cloud-folder":
            return showWatchCloudFolderHelp();
        case "connect-local-devchain":
            return showConnectLocalDevchainHelp();
        case "update-server":
            return showUpdateServerHelp();
        case "create-server":
            return showCreateServerHelp();
        case "add-contract":
            return showAddContractHelp();
        case "deploy":
            return showDeployHelp();
        case "undeploy":
            return showUndeployHelp();
        case "get-logs": 
            return showLogsHelp();
        default:
            break;
    }
}

/**
 * Shows help for the watch-cloud-file command
 */
showWatchCloudFileHelp = () => {
    console.log("The watch-cloud-file command allows you to work locally \nwith your cloud functions in your prefered IDE \ninstead of writing it in the Admin Panel.\n");
    console.log("The command requires 4 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("--moralisSubdomain / -d");
    console.log("The Moralis server you want to link your cloud functions\n");
    console.log("If left out, you will get to choose from a list.\n");
    console.log("You can find all three of these (apiKey, apiSecret and subdomain) \nin the Admin panel by clicking on view details \non the server you are working with.\n");
    console.log("--moralisCloudfile / -p");
    console.log("The path to the javascript file on your local machine that \ncontains the cloud functions that should be synced with moralis.\nIf left out you will be asked.\n\n");
    showEnvironmentVariableInfo("watch-cloud-file");
}

/**
 * Shows help for the watch-cloud-file command
 */
showWatchCloudFolderHelp = () => {
    console.log("The watch-cloud-folder command allows you to work locally \nwith your cloud functions in your prefered IDE \ninstead of writing it in the Admin Panel.\n");
    console.log("The command requires 5 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("--moralisSubdomain / -d");
    console.log("The Moralis server you want to link your cloud functions\n");
    console.log("If left out, you will get to choose from a list.\n");
    console.log("You can find all three of these (apiKey, apiSecret and subdomain) \nin the Admin panel by clicking on view details \non the server you are working with.\n");
    console.log("--autoSave / -s");
    console.log("The saving mode (0 manual mode) (1 auto-save mode)" );
    console.log("Manual mode: save and upload to Moralis each time a .JS file is saved or deleted. \nAuto-save mode: Manually save the changes and upload to Moralis by typing `s` and clicking `enter`\n");
    console.log("--moralisCloudfolder / -p");
    console.log("The path to the folder on your local machine that \ncontains the .JS files with the cloud functions that should be synced with Moralis.\nIf left out you will be asked.\n\n");
    showEnvironmentVariableInfo("watch-cloud-folder");
}

/**
 * Shows help for the connect-local-devchain command
 */
showConnectLocalDevchainHelp = () => {
    console.log("The connect-local-devchain command allows you to automatically \nconfigure and run local devchains against your moralis server\n");
    console.log("The command requires 5 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("--moralisSubdomain / -d");
    console.log("The Moralis server you want to link your cloud functions\n");
    console.log("If left out, you will get to choose from a list.\n");
    console.log("You can find all three of these (apiKey, apiSecret and subdomain) \nin the Admin panel by clicking on view details \non the server you are working with.\n");
    console.log("--frpcPath / -p");
    console.log("The path to the frpc executable on your machine.");
    console.log("--chain / -c");    
    console.log("The local devchain to use (options: 'ganache', 'hardhat')");
    console.log("If left out, you will get to choose from a list.\n");

    console.log('Example: \nmoralis-admin-cli connect-local-devchain --frpcPath "C:\\Program Files\\frpc\\frpc.exe"\n\n')
    showEnvironmentVariableInfo("connect-local-devchain");
}

/**
 * Shows help for the update-server command
 */
showUpdateServerHelp = () => {
    console.log("The update-server command allows you to \nrestart and update Moralis servers from the terminal\n");
    console.log("The command requires 3 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("--moralisSubdomain / -d (optional)");
    console.log("The Moralis server you want to restart. \nIf left out, you will get to choose from a list.\n");
    console.log("You can find all three of these (apiKey, apiSecret and subdomain) \nin the Admin panel by clicking on view details \non the server you are working with.\n");
    showEnvironmentVariableInfo("update-server");
}

/**
 * Shows help for the create-server command
 */
showCreateServerHelp = () => {
    console.log("The create-server command allows you to spin up a new Moralis server \nfrom the command line instead of doing it in the Admin Panel.\n");
    console.log("The command requires 5 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("You can find both of them (apiKey and apiSecret) in the Admin panel \nby clicking on view details on the server you are working with.\n");
    console.log("--serverName / -n");
    console.log("The name of the new server.\nIf left out you will be asked.");
    console.log("--region / -r");
    console.log("The region in which the server will be hosted.");
    console.log("Options:\n'san franchisco'\n'new york'\n'toronto'\n'london'\n'amsterdam'\n'frankfurt'\n'bangalore'\n'singapore'\nIf left out you will be asked.")
    console.log("--network / -c");
    console.log("The network to run the server on.");
    console.log("Options:\n'mainnet'\n'testnet'\n'local devchain'\nIf left out you will be asked.")
    console.log("--evmProviders / -e");
    console.log("The the EVM providers to use. At least one is required. \nIf multiple, separate with ','. \nYou can only select the ones that match the network you have selected. \nI.e You can not select a mainnet chain on a testnet server.");
    console.log("Options:\n'0x1 (ETH Mainnet)'\n'0x3 (ETH Ropten testnet)'\n'0x539 (local devchain)'\n'0x38 (BSC Mainnet)'\n'0x61 (BSC Testnet)'\nIf left out you will be asked.")
    showEnvironmentVariableInfo("create-server");
}

/**
 * Shows help for the add-contract command
 */
showAddContractHelp = () => {
    console.log("The add-contract command allows you to subscribe to events emitted \nby smart contracts from the command line instead of doing it in the Admin Panel.\n");
    console.log("The command requires 3 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("You can find both of them (apiKey and apiSecret) in the Admin panel \nby clicking on view details on the server you are working with.\n");
    console.log("--abiPath / -p");
    console.log("The path to the json file containging the abi of the smart contract.\nIf left out you will be asked.\n");
    console.log('Example: \nmoralis-admin-cli add-contract --abiPath ".\\MySmartContract.json"\n\n')
    showEnvironmentVariableInfo("add-contract");
}

/**
 * Shows help for the deploy command
 */
showDeployHelp = () => {
    console.log("The deploy command allows you to publish you dapp to you Moralis server.\n");
    console.log("The command requires 3 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("--moralisSubdomain / -d");
    console.log("The Moralis server you want to deploy to\n");
    console.log("If left out, you will get to choose from a list.\n");
    console.log("You can find all three of these (apiKey, apiSecret and subdomain) \nin the Admin panel by clicking on view details \non the server you are working with.\n");
    console.log("--folderPath / -p (optional)");
    console.log("The path to the folder where your dapp is located.\n (Default is the folder the command is executed from.)");    
    showEnvironmentVariableInfo("deploy");
}

/**
 * Shows help for the undeploy command
 */
showUndeployHelp = () => {
    console.log("The undeploy command removes any published dapp from the server.\n");
    console.log("The command requires 2 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
    console.log("--moralisSubdomain / -d");
    console.log("The Moralis server you want to undeploy.");
    console.log("If left out, you will get to choose from a list.\n");
    console.log("You can find all three of these (apiKey, apiSecret and subdomain) \nin the Admin panel by clicking on view details \non the server you are working with.\n");
    showEnvironmentVariableInfo("undeploy");
}

/**
 * Shows help about how to provide the api key
 */
showApiKeyInfo = () => {
    console.log("--moralisApiKey / -k");
    console.log("This is the API key that lets you authenticate with Moralis via the CLI\n")
}

/**
 * Shows help about how to provide the api secret
 */
showApiSecretInfo = () => {
    console.log("--moralisApiSecret / -s");
    console.log("This is the API secret that lets you authenticate with Moralis via the CLI\n")
}

/**
 * Shows help about how to use .env files and environment variables
 */
showEnvironmentVariableInfo = (command) => {
    console.log("You can provide these variables in a combination of three ways:\n");
    console.log(`1. Provide them as arguments to the command \nExample: \nmoralis-admin-cli ${command} --moralisApiKey d4djh56kjhgkj535\n`);
    console.log(`2. Specify the arguments in a .env file located in the same \ndirectory when running the command.`);
    console.log(`Example: \nmoralisApiKey=d4djh56kjhgkj535\n`);
    console.log(`3. Store the variables as environment variables on the machine.`);
}

/**
 * Show help about how to get logs from Moralis
 */
 showLogsHelp = () => {
    console.log("The get-logs command allows you to get logs in real time from Moralis");
    console.log("The command requires 2 parameters:\n");
    showApiKeyInfo();
    showApiSecretInfo();
}


module.exports = {
    generalHelp,
    showHelp
}