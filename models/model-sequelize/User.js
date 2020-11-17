const db = require('./db.js');

module.exports = db.defineModel('user', {
    username: {
        type: db.STRING(64),
        unique: true
    },
    password: db.STRING(128),
    nickname: db.STRING(32),
    online: {
        type: db.BOOLEAN,
        default: true
    }
});
