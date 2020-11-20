const db = require('./db');

module.exports = db.defineModel('chatroom', {
    room_name: db.STRING(64),
    profile: {
        type: db.STRING(40),
        defaultValue: 'default.png'
    }
});
