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

module.exports = router;