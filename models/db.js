const Sequelize = require('sequelize');
const config = require('../config').dbConfig;

const sequelize = new Sequelize(
    config.database, 
    config.username, 
    config.password, 
    {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            idle: 30000
        }
    }
);

var User = sequelize.define('user', {
    id: {
        type: Sequelize.STRING(4),
        allowNull: false,
        primaryKey: true
    },
    password: {
        type: Sequelize.STRING(160),
        allowNull: false
    }, 
    online: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

const init = () => {
    User.sync();
}
if (config.init) {
    init();
}

exports.User = User;
