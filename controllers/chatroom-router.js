const express = require('express');
const ChatroomManager = require('../models/chatroom-manager');

const router = express.Router();
const manager = new ChatroomManager();


const checkSession = (req, res, next) => {
    if (!req.session.userId) {
        res.status(403).end();
    } else {
        next();
    }
}

const redirectedProfilePath = (subdir, profile) => {
    return `image/${subdir}/${profile}`;
}


router.post('/chatroom/create', checkSession);
router.post('/chatroom/create', async (req, res) => {
    let room = await manager.create(req.session.userId, req.body);
    room.profile = redirectedProfilePath('room', room.profile);
    if (room) res.send(room);
    else res.status(400).end();
});


router.post('/chatroom/leave', checkSession);
router.post('/chatroom/leave', async (req, res) => {
    const success = await manager.leave(req.session.userId, req.body.room_id);
    res.status(success ? 200 : 400).end();
});


router.post('/chatroom/search', checkSession);
router.post('/chatroom/search', async (req, res) => {
    let result = await manager.search(req.body.keyword);
    result = result.map(r => {
        r.profile = redirectedProfilePath('room', r.profile);
        return r;
    });
    res.send({chatrooms: result});
});


router.post('/chatroom/join', checkSession);
router.post('/chatroom/join', async (req, res) => {
    let result = await manager.join(req.session.userId, req.body.room_id);
    if (result === false) res.status(500).end();
    else {
        result.room.profile = redirectedProfilePath('room', result.room.profile);
        res.send(result);
    }
});


router.post('/chatroom/get', checkSession);
router.post('/chatroom/get', async (req, res) => {
    let result = await manager.getRoomInfo(req.body.room_id);
    result.users = result.users.map(u => {
        u.profile = redirectedProfilePath('user', u.profile);
        return u;
    });
    res.send(result);
});


router.post('/homepage', checkSession);
router.post('/homepage', async (req, res) => {
    let rooms = await manager.getRoomsOfUser(req.session.userId);
    let user = await manager.getUser(req.session.userId);
    if (rooms === false || !user) res.status(500).end();
    else res.send({
        chatrooms: rooms.map(r => {
            r.profile = redirectedProfilePath('room', r.profile);
            return r;
        }),
        user: {
            username: user.username,
            nickname: user.nickname,
            profile: redirectedProfilePath('user', user.profile)
        }
    });
});

module.exports = router;