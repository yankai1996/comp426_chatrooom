const prodConfig = './config-prod.js';
const testConfig = './config-test.js';

var config = null;

if (process.env.NODE_ENV === 'test') {
    console.log(`Load ${testConfig}...`);
    config = require(testConfig);
} else {
    console.log(`Load ${prodConfig}...`);
    config = require(prodConfig);
}

module.exports = config;