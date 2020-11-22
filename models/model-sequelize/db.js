const Sequelize = require("sequelize");
const config = require("./../../config").dbConfig;

console.log('init sequelize...');

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

const ID_TYPE = Sequelize.INTEGER;
const defineModel = (name, attributes) => {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.id = {
        type: ID_TYPE,
        autoIncrement: true,
        primaryKey: true
    };
    attrs.created_at = {
        type: Sequelize.DATE,
        allowNull: false
    };
    attrs.updated_at = {
        type: Sequelize.DATE,
        allowNull: false
    };

    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    if (!obj.created_at) obj.created_at = now;
                    obj.updated_at = now;
                } else {
                    obj.updated_at = Date.now();
                }
            }
        }
    });
}

const sync = () => {
    if (process.env.NODE_ENV !== 'production') {
        return sequelize.sync();
    } 
}

module.exports = {
    BOOLEAN: Sequelize.BOOLEAN,
    STRING: Sequelize.STRING,
    TEXT: Sequelize.TEXT,
    ID_TYPE: ID_TYPE,
    defineModel: defineModel,
    sync: sync
}