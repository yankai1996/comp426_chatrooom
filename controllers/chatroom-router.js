const express = require('express');
const ChatroomManager = require('../models/chatroom-manager');

const router = express.Router();
const manager = new ChatroomManager();


const checkUserId = (req, res, next) => {
    if (!req.body.user_id) {
        res.status(403).end();
    } else {
        next();
    }
}

const redirectedProfilePath = (subdir, profile) => {
    return `image/${subdir}/${profile}`;
}


router.post('/chatroom/create', checkUserId);
router.post('/chatroom/create', async (req, res) => {
    let room = await manager.create(req.body.user_id, req.body);
    room.profile = redirectedProfilePath('room', room.profile);
    if (room) res.send(room);
    else res.status(400).end();
});


router.post('/chatroom/leave', checkUserId);
router.post('/chatroom/leave', async (req, res) => {
    const success = await manager.leave(req.body.user_id, req.body.room_id);
    res.status(success ? 200 : 400).end();
});


router.post('/chatroom/search', async (req, res) => {
    let result = await manager.search(req.body.keyword);
    result = result.map(r => {
        r.profile = redirectedProfilePath('room', r.profile);
        return r;
    });
    res.send({chatrooms: result});
});


router.post('/chatroom/join', checkUserId);
router.post('/chatroom/join', async (req, res) => {
    let result = await manager.join(req.body.user_id, req.body.room_id);
    if (result === false) res.status(500).end();
    else {
        result.room.profile = redirectedProfilePath('room', result.room.profile);
        res.send(result);
    }
});


router.post('/chatroom/get', async (req, res) => {
    let result = await manager.getRoomInfo(req.body.room_id);
    result.users = result.users.map(u => {
        u.profile = redirectedProfilePath('user', u.profile);
        return u;
    });
    res.send(result);
});


router.post('/homepage', checkUserId);
router.post('/homepage', async (req, res) => {
    let rooms = await manager.getRoomsOfUser(req.body.user_id);
    let user = await manager.getUser(req.body.user_id);
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