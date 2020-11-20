const crypto = require('crypto');
const ChatroomManager = require('./chatroom-manager');
const model = require('./model-sequelize/model');
const User = model.User;
const chatroomManager = new ChatroomManager();

class Administrator {
    constructor(){

    }
}

const usernameExist = async (username) => {
    const result = await User.findOne({
        where: {username: username}
    });
    return result != null;
}

const hashedPassword = (password) => {
    return password;
    // return crypto.createHash('md5').update(password).digest('hex');
}

Administrator.prototype.createUser = async function(data) {
    if (await usernameExist(data.username)) {
        return false;
    }

    let attributes = {
        username: data.username,
        nickname: data.nickname,
        password: hashedPassword(data.password)
    }

    if (data.profile) {
        chatroomManager.saveUserProfile(data.profile);
        attributes.profile = data.profile;
    }

    return await User.create(attributes).then(result => {
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
            password: hashedPassword(data.password),
            online: false
        },
        returning: true,
        plain: true
    });
    if (result[1] != 1) return false;

    return await User.findOne({
        where: {username: data.username}
    }).then(result => {
        return result.id;
    }).catch(error => {
        return false;
    });
}

Administrator.prototype.logoutUser = async function(userId) {
    const result = await User.update({
        online: false
    }, {
        where: {
            id: userId,
            online: true
        },
        returning: true,
        plain: true
    });
    return result[1] == 1;
}

module.exports = Administrator;