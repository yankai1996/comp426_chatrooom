const socketio = require('socket.io');
const ChatroomManager = require('./chatroom-manager');
const model = require('./model-sequelize/model');

const User = model.User
    , Chatroom = model.Chatroom
    , Membership = model.Membership
    , Message = model.Message
;

const manager = new ChatroomManager();


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
        attributes: ['username', 'nickname', 'profile']
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
    const userId = socket.handshake.session.userId;
    let rooms = await getRoomIds(userId);
    let user = await getUser(userId);
    socket.join(rooms);

    console.log(`Socket: ${user.username} connected!`);
    socket.on('join', (roomId) => {
        socket.join(roomId);
        socket.broadcast.to(data.roomId).emit('join', {
            room_id: roomId,
            username: user.username,
            nickname: user.nickname,
            profile: user.profile
        });
    });

    socket.on('leave', async (roomId) => {
        await manager.leave(userId, roomId);
        socket.leave(roomId);
        socket.broadcast.to(data.roomId).emit('leave', {
            room_id: roomId,
            username: user.username
        });
    });

    socket.on('message', (data) => {
        socket.broadcast.to(data.roomId).emit('message', {
            room_id: data.roomId,
            message: data.message
        });
        saveMessage(data.roomId, socket.handshake.session.userId, data.message);
    });

    socket.on('disconnect', ()=> {

    });
}

module.exports = Operator;