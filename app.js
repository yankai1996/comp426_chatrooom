'use strict';

const express = require('express')
    , path = require('path')
//   , logger = require('morgan')
    , session = require("express-session")
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , ioCookie = require('socket.io-cookie')
    , login_router = require('./controllers/login-router')
    , chatroom_router = require('./controllers/chatroom-router')
//   , login  = require('./controllers/router_login')
//   , admin  = require('./controllers/router_admin')
//   , play   = require('./controllers/router_play')
    , config = require('./config')
  ;

const app = express()
  , server = require('http').createServer(app)
//   , io = require('./controllers/socket').listen(server)
  ;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser(config.secret));
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
}))
app.use(express.static(path.join(__dirname, config.staticPath)));
app.use('/node_modules', express.static(__dirname + '/node_modules'));


if (config.staticPath == 'test') {
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/test/index.html'));
    });
}


// app.use(login.get);
// app.use(login.post);
// app.use(admin.get);
// app.use(admin.post);
// app.use(play.get);
app.use(login_router);
app.use(chatroom_router);

app.use((req, res) => {
    res.writeHead(404);
    res.write("Opps this doesn't exist - 404");
    res.end();
});

// io.use(ioCookie);

server.listen(config.serverConfig.port, () => {
    console.log(`Server is running on port ${config.serverConfig.port}!`);
});

const model = require('./models/model-sequelize/model');
model.User.sync();
// model.User.sync()
// model.User.sync()