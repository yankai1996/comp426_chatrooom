const socketio = require('socket.io');
const model = require('./model-sequelize/model');

const User = model.User
    , Chatroom = model.Chatroom
    , Membership = model.Membership
    , Message = model.Message
;

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
    let rooms = await this.getRoomIds(userId);
    let user = await this.getUser(userId)
    socket.join(rooms);

    socket.on('join', (roomId) => {
        socket.join(roomId);
        socket.broadcast.to(data.roomId).emit('join', {
            room_id: roomId,
            username: user.username,
            nickname: user.nickname,
            profile: user.profile
        });
    });

    socket.on('leave', (roomId) => {
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
        this.saveMessage(data.roomId, socket.handshake.session.userId, data.message);
    });

    socket.on('disconnect', ()=> {

    });
}


Operator.prototype.getRoomIds = async function (userId) {
    return await Membership.findAll({
        where: {user_id: userId}
    }).then(result => {
        return result.map(r => r.room_id);
    });
}

Operator.prototype.getUser = async function (userId) {
    return await User.findOne({
        where: {user_id: userId},
        attributes: ['username', 'nickname', 'profile']
    });
}

Operator.prototype.saveMessage = function (roomId, userId, text) {
    Message.create({
        room_id: roomId,
        userId: userId,
        text: text
    });
}

module.exports = Operator;