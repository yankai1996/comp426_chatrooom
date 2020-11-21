const crypto = require('crypto');
const ChatroomManager = require('./chatroom-manager');
const model = require('./model-sequelize/model');

const User = model.User
    , Session = model.Session
;
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
    return crypto.createHash('md5').update(password).digest('hex');
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
    }).catch(error => {
        return null;
    });
    if (result[1] != 1) return null;

    const token = crypto.randomBytes(32).toString('hex');
    
    const userId = await User.findOne({
        where: {username: data.username}
    }).then(result => {
        return result.id;
    }).catch(error => {
        return null;
    });

    return await Session.create({
        token: token,
        user_id: userId
    }).then(result => {
        return result.token;
    }).catch(error => {
        return null;
    });
}

Administrator.prototype.getUserId = async function (token) {
    return await Session.findOne({
        where: {token: token}
    }).then(result => {
        return result.user_id;
    }).catch(error => {
        return null;
    });
}

Administrator.prototype.logoutUser = async function (userId) {
    let success = await User.update({
        online: false
    }, {
        where: {
            id: userId,
            online: true
        },
        returning: true,
        plain: true
    }).then(result => {
        return result[1] == 1;
    }).catch(error => {
        return false
    });

    if (success) {
        await Session.destroy({
            where: {user_id: userId}
        });
    }

    return success;
}

module.exports = Administrator;