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
        this.io = socketio.listen(server);
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
                user.profile = `image/user/${user.profile}`;
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
        roomId = parseInt(roomId);
        console.log('join');
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
        socket.to(roomId).emit(JOIN, {
            room_id: roomId,
            username: user.username,
            nickname: user.nickname,
            profile: user.profile
        });
    });

    socket.on(LEAVE, async (roomId) => {
        roomId = parseInt(roomId);
        console.log('leave');
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
        socket.to(roomId).emit(LEAVE, {
            room_id: roomId,
            username: user.username
        });
    });

    socket.on(MESSAGE, (data) => {
        let roomId = parseInt(data.room_id);
        console.log('message');
        if (user == null) {
            socket.emit(ERROR, 'didn\'t init');
            return;
        }
        let message = {
            room_id: roomId,
            username: user.username,
            nickname: user.nickname,
            profile: user.profile,
            timestamp: Date.now(),
            text: data.message
        }
        try {
            socket.to(roomId).emit(MESSAGE, message);
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        saveMessage(user.id, message);
    });

    socket.on('disconnect', () => {
        console.log('disconnect');
        if (user == null) {
            socket.emit(ERROR, 'didn\'t init');
            return;
        }
        admin.logoutUser(user.id);
    });
}

module.exports = Operator;