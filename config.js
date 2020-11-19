const prodConfig = './config-override.js';
const testConfig = './config-test.js';

var config = null;

if (process.env.NODE_ENV === 'test') {
    console.log(`Load ${testConfig}...`);
    config = require(testConfig);
} else {
    console.log(`Load ${testConfig}...`);
    config = require(prodConfig);
}

module.exports = config;