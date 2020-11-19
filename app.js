'use strict';

const express = require('express')
    , path = require('path')
//   , logger = require('morgan')
    , expressSession = require("express-session")
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , ioCookie = require('socket.io-cookie')
    , sharedSession = require('express-socket.io-session')
    , login_router = require('./controllers/login-router')
    , chatroom_router = require('./controllers/chatroom-router')
    , Operator = require('./models/operator')
    , config = require('./config')
  ;

const app = express();
const server = require('http').createServer(app);

const session = expressSession({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
});

const operator = new Operator(server);
operator.use(ioCookie);
operator.use(sharedSession(session, cookieParser(config.secret)));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser(config.secret));
app.use(session);
app.use(express.static(path.join(__dirname, config.staticPath)));
app.use('/node_modules', express.static(__dirname + '/node_modules'));


if (config.staticPath == 'test') {
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/test/index.html'));
    });
}

app.use(login_router);
app.use(chatroom_router);

app.use((req, res) => {
    res.writeHead(404);
    res.write("Opps this doesn't exist - 404");
    res.end();
});

server.listen(config.serverConfig.port, () => {
    console.log(`Server is running on port ${config.serverConfig.port}!`);
});
