'use strict';

const express = require('express')
    , cors = require('cors')
    , path = require('path')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , multer = require('multer')
    , login_router = require('./controllers/login-router')
    , chatroom_router = require('./controllers/chatroom-router')
    , Operator = require('./models/operator')
    , config = require('./config')
  ;

const app = express();
const server = require('http').createServer(app);

app.use(cors());

const operator = new Operator(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser(config.secret));
app.use(multer().single('file'));

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
