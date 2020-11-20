'use strict';

const express = require('express')
    , cors = require('cors')
    , path = require('path')
//   , logger = require('morgan')
    , expressSession = require("express-session")
    , MySQLStore = require('express-mysql-session')(expressSession)
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , sharedSession = require('express-socket.io-session')
    , login_router = require('./controllers/login-router')
    , chatroom_router = require('./controllers/chatroom-router')
    , Operator = require('./models/operator')
    , config = require('./config')
  ;

const app = express();
const server = require('http').createServer(app);

app.use(cors());

const sessionStore = new MySQLStore({
    host: config.dbConfig.host,
    port: config.dbConfig.port,
    user: config.dbConfig.username,
    password: config.dbConfig.password,
    database: config.dbConfig.database
});
const session = expressSession({
    secret: config.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
});

const operator = new Operator(server);
operator.use(sharedSession(session, cookieParser(config.secret)));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser(config.secret));
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use(login_router);
app.use(chatroom_router);

app.use((req, res) => {
    res.writeHead(404);
    res.write("Opps this doesn't exist - 404");
    res.end();
});

let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}!`);
});
