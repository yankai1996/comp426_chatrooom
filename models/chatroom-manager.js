// const buffer = require('buffer');
const path = require('path');
const fs = require('fs');
const sequelize = require('sequelize');
const model = require('./model-sequelize/model.js');
const Op = require('sequelize').Op;

const User = model.User
    , Chatroom = model.Chatroom
    , Membership = model.Membership
    , Message = model.Message
;

class ChatroomManager {
    constructor() {

    }
}

ChatroomManager.prototype.getUser = async function (userId) {
    return await User.findOne({
        where: {id: userId}
    });
}

ChatroomManager.prototype.getRoom = async function (roomId) {
    return await Chatroom.findOne({
        where: {id: roomId}
    });
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

ChatroomManager.prototype.create = async function (userId, data) {
    let attributes = {room_name: data.room_name};
    if (data.profile) {
        this.saveRoomProfile(data.profile);
        attributes.profile = data.profile;
    }

    const room = await Chatroom.create(attributes).then(result => {
        return {
            room_id: result.id,
            room_name: result.room_name,
            profile: result.profile
        };
    }).catch(error => {
        console.log(error);
        return null;
    });

    if (room != null) {
        await Membership.create({
            room_id: room.room_id,
            user_id: userId
        });
    }

    return room;
}

ChatroomManager.prototype.leave = async function (userId, roomId) {
    return await Membership.destroy({
        where: {
            room_id: roomId,
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

ChatroomManager.prototype.join = async function (userId, roomId) {
    let success = await Membership.create({
        room_id: roomId,
        user_id: userId
    }).then(result => {
        return result != null;
    });
    if (!success) return false;

    let room = await this.getRoom(roomId).then(room => {
        return {
            room_id: room.id,
            room_name: room.room_name,
            profile: room.profile
        }
    });

    let users =  await this.getUsersInRoom(roomId);
    
    return {
        room: room,
        users: users
    };
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
        where: {room_id: roomId},
        order: [['created_at', 'DESC']],
        raw: true
    };
    if (startDate) constraints.where.created_at = {[Op.gte]: startDate};
    if (limit) constraints.limit = limit;

    let messages = await Message.findAll(constraints);
    let promises = messages.map(async (m) => {
        let user = await this.getUser(m.user_id);
        return {
            username: user.username,
            nickname: user.nickname,
            timestamp: m.created_at,
            text: m.text
        };
    });
    return await Promise.all(promises);
}

ChatroomManager.prototype.getRoomInfo = async function (userId, roomId) {
    let users = await this.getUsersInRoom(roomId);
    let membership = await Membership.findOne({
        where: {
            user_id: userId,
            room_id: roomId
        }
    });
    if (membership == null) return false;

    let joinedAt = membership.created_at;
    let messages = await this.getRoomHistory(roomId, limit=null, startDate=joinedAt);
    messages.reverse();
    return {
        users: users,
        messages: messages
    };
}

ChatroomManager.prototype.getRoomsOfUser = async function (userId) {
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