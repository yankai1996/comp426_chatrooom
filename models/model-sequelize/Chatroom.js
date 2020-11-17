const db = require('./db.js');

module.exports = db.defineModel('membership', {
    room_name: db.STRING(64),
    owner: {
        type: db.ID_TYPE,
        references: {
            model: 'user',
            key: 'id'
        }
    }
});
