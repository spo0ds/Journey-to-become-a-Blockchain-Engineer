/**
 * Base uri of the CLI API
 */
const BASE_URI = "https://admin.moralis.io";

/**
 * List of valid commands
 */
const valid_scripts = [
    "watch-cloud-file",
    "watch-cloud-folder",
    "connect-local-devchain",
    "update-server",
    "create-server",
    "add-contract",
    "deploy",
    "undeploy",
    "get-logs",
    "version",
    "help"
]

module.exports = {
    BASE_URI,
    valid_scripts
}