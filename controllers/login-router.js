const express = require('express');
const browser = require('browser-detect');
const Administrator = require('../models/administrator');

const router = express.Router();
const admin = new Administrator();

// root url
router.get('/', (req, res) => {
    res.redirect('/login');
});

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
    // res.set("Access-Control-Allow-Origin", "localhost:3000");
    // res.set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
    // res.set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.end();
}

router.get('/login', (req, res) => {
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
    const userId = await admin.loginUser(req.body);
    let success = userId !== false;
    if (success) {
        req.session.userId = userId;
    }
    sendStatus(success, res);
});

router.get('/logout', async (req, res) => {
    let success = false;
    const userId = req.session.userId;
    if (userId) {
        req.session.destroy();
        success = await admin.logoutUser(userId)
    }
    sendStatus(success, res);
});

module.exports = router;