const fs = require('fs');
const db = require('./db');

let files = fs.readdirSync(__dirname);

let js_files = files.filter((f)=>{
    return f.endsWith('.js') && f != 'db.js' && f != 'model.js';
}, files);

module.exports = {};

for (let f of js_files) {
    console.log(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require(`${__dirname}/${f}`);
}

db.sync();