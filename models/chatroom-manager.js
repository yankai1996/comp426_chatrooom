// const buffer = require('buffer');
const path = require('path');
const fs = require('fs');
const sequelize = require('sequelize');
const model = require('./model-sequelize/model.js');

const User = model.User
    , Chatroom = model.Chatroom
    , Membership = model.Membership
    , Message = model.Message
;

class ChatroomManager {
    constructor() {
        this.userDict = {};
        this.roster = {};
    }
}

ChatroomManager.prototype.findUserBy = async function (constraint) {
    const user = await User.findOne({where: constraint});
    if (user && !(user.username in this.userDict)) {
        this.userDict[user.username] = user.id;
        this.roster[user.id] = {
            username: user.username,
            nickname: user.nickname
        };
    }
    return user;
}

ChatroomManager.prototype.getUserId = async function (username) {
    if (username in this.userDict) return this.userDict[username];
    const user = await this.findUserBy({username: username});
    return user.id;
}

ChatroomManager.prototype.getNicknameById = async function (userId) {
    if (userId in this.roster) return this.roster[userId].nickname;
    const user = await this.findUserBy({id: userId});
    return user.nickname;
}

ChatroomManager.prototype.getUsernameById = async function (userId) {
    if (userId in this.roster) return this.roster[userId].username;
    const user = await this.findUserBy({id: userId});
    return user.username;
}

const saveBase64Profile = (base64str, subdir) => {
    let buf = Buffer.from(base64str, 'base64');
    fs.writeFile(path.join(__dirname, `../public/image/${subdir}/${base64str}.jpg`), buf, (error) => {
        if (error) console.log(error);
        else return true;
    });
}

ChatroomManager.prototype.saveUserProfile = (base64str) => {
    saveBase64Profile(base64str, 'user');
}

ChatroomManager.prototype.saveRoomProfile = (base64str) => {
    saveBase64Profile(base64str, 'room');
}

ChatroomManager.prototype.create = async function (username, data) {
    const userId = await this.getUserId(username);

    let attributes = {room_name: data.room_name};
    if (data.profile) {
        this.saveRoomProfile(data.profile);
        attributes.profile = data.profile;
    }

    const roomId = await Chatroom.create(attributes).then(result => {
        return result.id;
    }).catch(error => {
        console.log(error);
        return null;
    });

    if (roomId) {
        await Membership.create({
            room_id: roomId,
            user_id: userId
        });
    }

    return roomId;
}

ChatroomManager.prototype.leave = async function (username, room_id) {
    const userId = await this.getUserId(username);
    return await Membership.destroy({
        where: {
            room_id: room_id,
            user_id: userId
        }
    }).then(result => {
        return result == 1;
    }).catch(error => {
        return false;
    });
}

ChatroomManager.prototype.search = async function (keyword) {
    keyword = keyword.toLowerCase();
    return await Chatroom.findAll({
        where: {
            room_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('room_name')), 'LIKE', `%${keyword}%`)
        },
        raw: true
    }).then(rooms => {
        return rooms.map(room => {
            return {
                room_id: room.id,
                room_name: room.room_name,
                profile: room.profile
            }
        });
    }).catch(error => {
        console.log(error);
        return [];
    });
}

ChatroomManager.prototype.join = async function (username, roomId) {
    const userId = await this.getUserId(username);
    
    let success = await Membership.create({
        room_id: roomId,
        user_id: userId
    }).then(result => {
        return result != null;
    });
    if (!success) return false;

    return await this.getUsersInRoom(roomId);
}

ChatroomManager.prototype.getUsersInRoom = async function (roomId) {
    const userIds = await Membership.findAll({
        where: {room_id: roomId}
    }).then(result => {
        return result.map(r => r.user_id);
    });
    const users = await User.findAll({
        where: {id: userIds},
        raw: true
    }).catch(error => {
        return false;
    });

    if (users === false) return false;

    for (let user of users) {
        if (!(user.username in this.userDict)) {
            this.userDict[user.username] = user.userId;
            this.roster[user.userId] = {
                username: user.username,
                nickname: user.nickname
            };
        }
    }

    return users.map(user => {
        return {
            username: user.username,
            nickname: user.nickname,
            status: user.online,
            profile: user.profile
        };
    });
}

ChatroomManager.prototype.getRoomHistory = async function (roomId, limit=10, startDate=null) {
    let constraints = {
        room_id: roomId
    };
    if (startDate) constraints.created_at = {$lte: startDate};

    return await Message.findAll({
        where: constraints,
        order: [['created_at', 'DESC']],
        limit: limit,
        raw: true
    }).then(result => {
        return result.map(m => {
            return {
                username: this.getUsernameById(m.user_id),
                nickname: this.getNicknameById(m.user_id),
                timestamp: m.created_at,
                text: m.text
            };
        });
    });
}

ChatroomManager.prototype.getRoomInfo = async function (roomId) {
    let users = await this.getUsersInRoom(roomId);
    let messages = await this.getRoomHistory(roomId);
    return {
        users: users,
        messages: messages
    };
}

ChatroomManager.prototype.getRoomsOfUser = async function (username) {
    const userId = await this.getUserId(username);

    const roomIds = await Membership.findAll({
        where: {user_id: userId},
        attributes: ['room_id'],
        raw: true
    }).then(result => {
        return result.map(r => r.room_id);
    });

    let rooms = await Chatroom.findAll({
        where: {id: roomIds}
    }).catch(error => {
        return false;
    });

    if (rooms === false) return false;

    let promises = rooms.map(async (r) => {
        const last_message = (await this.getRoomHistory(r.id, limit=1))[0]
        return {
            room_id: r.id,
            room_name: r.room_name,
            profile: r.profile,
            last_message: last_message
        };
    });
    return await Promise.all(promises);
}

module.exports = ChatroomManager;