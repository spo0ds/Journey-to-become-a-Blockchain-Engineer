const path = require('path');
const pjson = require(`${path.join(__dirname, "../")}/package.json`);

function getCliVersion() {
    console.log(`Moralis Admin CLI Version: ${pjson.version}`);
}

module.exports = { getCliVersion };