const express = require('express');
const browser = require('browser-detect');
const router = express.Router();
// const auth = require('./auth');

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

router.get('/login', (req, res) => {
    const info = browser(req.headers['user-agent']);
    if (!compatibleBrowser(info)) {
        res.send("<p>This website is not supported by your browser!</p>" + 
            "<p>Please use the latest Chrome/Safari/Firefox/Opera.</p>");
    } else {
        res.send('login');
    }
});


// router.post('/login', auth.authenticate);
// router.post('/login', auth.clearCookie);
// router.post('/login', auth.authFail);

// // log out
// router.get('/logout', auth.clearCookie);
// router.get('/logout', (req, res) => {
//     res.redirect('/login');
// });


exports.router = router;