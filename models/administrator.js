const model = require('./model-sequelize/model.js');
const User = model.User;

class Administrator {
    constructor(){

    }
}

Administrator.prototype.usernameExist = async (username) => {
    const result = await User.findOne({
        where: {
            username: username
        }
    });
    return result != null;
}

Administrator.prototype.createUser = async function(data) {
    if (await this.usernameExist(data.username)) {
        return false;
    }
    console.log("creating...")
    return await User.create({
        username: data.username,
        nickname: data.nickname,
        password: data.password,
        online: false
    }).then(result => {
        return true;
    }).catch(error => {
        console.log(error);
        return false;
    });
}

Administrator.prototype.loginUser = async function(data) {
    const result = await User.update({
        online: true
    }, {
        where: {
            username: data.username,
            password: data.password,
            online: false
        },
        returning: true,
        plain: true
    });
    console.log(result);
    return result[1] == 1;
}

Administrator.prototype.logoutUser = async function(username) {
    const result = await User.update({
        online: false
    }, {
        where: {
            username: username,
            online: true
        },
        returning: true,
        plain: true
    });
    return result[1] == 1;
}

module.exports = Administrator;