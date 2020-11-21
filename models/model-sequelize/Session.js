const db = require('./db');

module.exports = db.defineModel('session', {
    token: db.STRING(64),
    user_id: {
        type: db.ID_TYPE,
        references: {
            model: 'user',
            key: 'id'
        }
    }
});
