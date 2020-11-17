const db = require('./db.js');

module.exports = db.defineModel('membership', {
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
    }
});
