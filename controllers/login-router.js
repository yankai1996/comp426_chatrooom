const express = require('express');
const browser = require('browser-detect');
const Administrator = require('../models/administrator');

const router = express.Router();
const admin = new Administrator();

const compatibleBrowser = (info) => {
    switch (info && info.name) {
        case 'chrome':
            if (info.versionNumber > 16) {
                return true;
            }
        case 'safari':
            if (info.versionNumber > 7 && info.os.startsWith("OS X")) {
                return true;
            }
        case 'firefox':
            if (info.versionNumber > 11) {
                return true;
            }
        case 'opera':
            if (info.versionNumber > 12.1) {
                return true;
            }
    }
    return false;
}

const sendStatus = (condition, res) => {
    if (condition) res.status(200);
    else res.status(400);
    res.end();
}


router.get('/', (req, res) => {
    const info = browser(req.headers['user-agent']);
    if (!compatibleBrowser(info)) {
        res.send("<p>This website is not supported by your browser!</p>" + 
            "<p>Please use the latest Chrome/Safari/Firefox/Opera.</p>");
    } else {
        res.render('index');
    }
});


router.post('/signup', async (req, res) => {
    sendStatus(await admin.createUser(req.body), res);
});


router.post('/login', async (req, res) => {
    const token = await admin.loginUser(req.body);
    if (token != null) res.send({token: token});
    else res.status(400).end(); 
});

router.post('/logout', async (req, res, next) => {
    let userId = await admin.getUserId(req.body.token);
    if (userId == null) res.status(403).end();
    else {
        req.body.userId = userId;
        next();
    }
});
router.post('/logout', async (req, res) => {
    let success = await admin.logoutUser(req.body.userId);
    sendStatus(success, res);
});

module.exports = router;