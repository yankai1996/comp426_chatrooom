const db = require('./db');

module.exports = db.defineModel('message', {
    room_id: {
        type: db.ID_TYPE,
        references: {
            model: 'chatroom',
            key: 'id'
        }
    }, 
    user_id: {
        type: db.ID_TYPE,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    text: db.TEXT
});
