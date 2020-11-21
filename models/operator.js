const socketio = require('socket.io');
const ChatroomManager = require('./chatroom-manager');
const model = require('./model-sequelize/model');

const User = model.User
    , Chatroom = model.Chatroom
    , Membership = model.Membership
    , Message = model.Message
;

const manager = new ChatroomManager();

const INIT = 'init'
    , ERROR = 'error'
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

const saveMessage = (roomId, userId, text) => {
    Message.create({
        room_id: roomId,
        userId: userId,
        text: text
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
    let userId = null;
    let rooms = null;
    let user = null;

    socket.on(INIT, async (token) => {
        if (!token || userId != null) {
            socket.emit(ERROR, 'init error');
            return;
        } 
        try {
            user = await getUser(token);
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        if (user == null) {
            socket.emit(ERROR, 'init error');
            return;
        }

        userId = user.id;
        rooms = await getRoomIds(userId);
        socket.join(rooms);
        console.log(`Socket: ${user.username} connected!`);
    });

    socket.on('join', (roomId) => {
        try {
            socket.join(roomId);
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        socket.broadcast.to(data.roomId).emit('join', {
            room_id: roomId,
            username: user.username,
            nickname: user.nickname,
            profile: user.profile
        });
    });

    socket.on('leave', async (roomId) => {
        try {
            await manager.leave(userId, roomId);
            socket.leave(roomId);
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        socket.broadcast.to(data.roomId).emit('leave', {
            room_id: roomId,
            username: user.username
        });
    });

    socket.on('message', (data) => {
        try {
            socket.broadcast.to(data.roomId).emit('message', {
                room_id: data.roomId,
                message: data.message
            });
        } catch (error) {
            socket.emit(ERROR, error);
            return;
        }
        saveMessage(data.roomId, socket.handshake.session.userId, data.message);
    });

    socket.on('disconnect', ()=> {
        // socket.handshake.session.destroy();
    });
}

module.exports = Operator;