const socketio = require('socket.io');
const ChatroomManager = require('./chatroom-manager');
const Administrator = require('../models/administrator');
const model = require('./model-sequelize/model');

const User = model.User
    , Chatroom = model.Chatroom
    , Membership = model.Membership
    , Message = model.Message
;

const admin = new Administrator();
const manager = new ChatroomManager();

const INIT = 'init'
    , ERROR = 'err'
    , JOIN = 'join'
    , LEAVE = 'leave'
    , MESSAGE = 'message'
;


const getRoomIds = async (userId) => {
    return await Membership.findAll({
        where: {user_id: userId}
    }).then(result => {
        return result.map(r => r.room_id);
    });
}

const getUser = async (userId) => {
    return await User.findOne({
        where: {id: userId},
        attributes: ['id', 'username', 'nickname', 'profile']
    });
}

const saveMessage = (userId, message) => {
    Message.create({
        room_id: message.room_id,
        user_id: userId,
        created_at: message.timestamp,
        text: message.text
    });
}


class Operator {
    constructor(server) {
        this.io = socketio(server);
        this.io.sockets.on('connection', this.newSocket);
    }
}

Operator.prototype.use = function (middleware) {
    this.io.use(middleware);
}

Operator.prototype.newSocket = async function (socket) {
    let rooms = null;
    let user = null;

    console.log('New Socket!');

    socket.on(INIT, async (token) => {
        if (!token || user != null) {
            socket.emit(ERROR, 'init error');
            return;
        } 
        try {
            let userId = await admin.getUserId(token);
            if (userId == null) {
                socket.emit(ERROR, 'init 403');
            } else {
                user = await getUser(userId);
            }
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        if (user == null) {
            socket.emit(ERROR, 'init error');
            return;
        }

        rooms = await getRoomIds(user.id);
        socket.join(rooms);
        console.log(`Socket: ${user.username} connected!`);
        socket.emit(INIT, {
            username: user.username,
            token: token
        });
    });

    socket.on(JOIN, (roomId) => {
        if (user == null) {
            socket.emit(ERROR, 'didn\'t init');
            return;
        }
        try {
            socket.join(roomId);
        } catch (error) {
            socket.emit(ERROR, 'invalid room_id');
            return;
        }
        socket.broadcast.to(roomId).emit(JOIN, {
            room_id: roomId,
            username: user.username,
            nickname: user.nickname,
            profile: user.profile
        });
    });

    socket.on(LEAVE, async (roomId) => {
        if (user == null) {
            socket.emit(ERROR, 'didn\'t init');
            return;
        }
        try {
            await manager.leave(user.id, roomId);
            socket.leave(roomId);
        } catch (error) {
            socket.emit(ERROR, 'invalid room_id');
            return;
        }
        socket.broadcast.to(roomId).emit(LEAVE, {
            room_id: roomId,
            username: user.username
        });
    });

    socket.on(MESSAGE, (data) => {
        if (user == null) {
            socket.emit(ERROR, 'didn\'t init');
            return;
        }
        let message = {
            room_id: data.room_id,
            username: user.username,
            nickname: user.nickname,
            timestamp: Date.now(),
            text: data.message
        }
        try {
            socket.broadcast.to(data.room_id).emit(MESSAGE, message);
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        saveMessage(user.id, message);
    });

    socket.on('disconnect', () => {
        if (user == null) {
            socket.emit(ERROR, 'didn\'t init');
            return;
        }
        admin.logoutUser(user.id);
    });
}

module.exports = Operator;