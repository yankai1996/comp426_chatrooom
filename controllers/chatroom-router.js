const express = require('express');
const ChatroomManager = require('../models/chatroom-manager');

const router = express.Router();
const manager = new ChatroomManager();


const checkSession = (req, res, next) => {
    if (!req.session.username) {
        res.status(403).end();
    } else {
        next();
    }
}


router.post('/chatroom/create', checkSession);
router.post('/chatroom/create', async (req, res) => {
    const result = await manager.create(req.session.username, req.body);
    if (result) res.send({room_id: result});
    else res.status(400).end();
});


router.post('/chatroom/leave', checkSession);
router.post('/chatroom/leave', async (req, res) => {
    const success = await manager.leave(req.session.username, req.body.room_id);
    let status = success ? 200 : 400;
    res.status(status).end();
});


router.post('/chatroom/search', checkSession);
router.post('/chatroom/search', async (req, res) => {
    let result = await manager.search(req.body.keyword);
    res.send({chatrooms: result});
});


router.post('/chatroom/join', checkSession);
router.post('/chatroom/join', async (req, res) => {
    const result = await manager.join(req.session.username, req.body.room_id);
    if (result === false) res.status(500).end();
    else res.send({users: result});
});


router.post('/chatroom/get', checkSession);
router.post('/chatroom/get', async (req, res) => {
    const result = await manager.getRoomInfo(req.body.room_id);
    res.send(result);
});


router.post('/homepage', checkSession);
router.post('/homepage', async (req, res) => {
    const rooms = await manager.getRoomsOfUser(req.session.username);
    const user = await manager.findUserBy({username: req.session.username});
    if (rooms === false || !user) res.status(500).end();
    else res.send({
        chatrooms: rooms,
        user: {
            username: user.username,
            nickname: user.nickname,
            profile: user.profile
        }
    });
});

module.exports = router;