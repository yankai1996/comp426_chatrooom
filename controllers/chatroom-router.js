const express = require('express');
const ChatroomManager = require('../models/chatroom-manager');
const Administrator = require('../models/administrator');

const router = express.Router();
const manager = new ChatroomManager();
const admin = new Administrator();


const checkToken = async (req, res, next) => {
    let userId = await admin.getUserId(req.body.token);
    if (userId == null) res.status(403).end();
    else {
        req.body.userId = userId;
        next();
    }
}

const redirectedProfilePath = (subdir, profile) => {
    return `image/${subdir}/${profile}`;
}


router.post('/chatroom/create', checkToken);
router.post('/chatroom/create', async (req, res) => {
    let room = await manager.create(req.body.userId, req.body);
    room.profile = redirectedProfilePath('room', room.profile);
    if (room) res.send(room);
    else res.status(400).end();
});


router.post('/chatroom/leave', checkToken);
router.post('/chatroom/leave', async (req, res) => {
    const success = await manager.leave(req.body.userId, req.body.room_id);
    res.status(success ? 200 : 400).end();
});


router.post('/chatroom/search', checkToken);
router.post('/chatroom/search', async (req, res) => {
    let result = await manager.search(req.body.keyword);
    result = result.map(r => {
        r.profile = redirectedProfilePath('room', r.profile);
        return r;
    });
    res.send({chatrooms: result});
});


router.post('/chatroom/join', checkToken);
router.post('/chatroom/join', async (req, res) => {
    console.log(req.body)
    let result = await manager.join(req.body.userId, req.body.room_id);
    if (result === false) res.status(500).end();
    else {
        result.room.profile = redirectedProfilePath('room', result.room.profile);
        res.send(result);
    }
});


router.post('/chatroom/get', checkToken);
router.post('/chatroom/get', async (req, res) => {
    let result = await manager.getRoomInfo(req.body.userId, req.body.room_id);
    if (result == false) {
        res.status(400).end();
    } else {
        result.users = result.users.map(u => {
            u.profile = redirectedProfilePath('user', u.profile);
            return u;
        });
        res.send(result);
    }
});


router.post('/homepage', checkToken);
router.post('/homepage', async (req, res) => {
    let rooms = await manager.getRoomsOfUser(req.body.userId);
    let user = await manager.getUser(req.body.userId);
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