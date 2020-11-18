const db = require('./db');

module.exports = db.defineModel('user', {
    username: {
        type: db.STRING(64),
        unique: true
    },
    password: db.STRING(128),
    nickname: db.STRING(32),
    profile: {
        type: db.STRING(135),
        defaultValue: 'default.png'
    },
    online: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
