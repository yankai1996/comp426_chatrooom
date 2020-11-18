# COMP426 Chatroom

### Config

Before running the node, create a file `config.js` with the following content:

```js
exports.dbConfig = {
    database: '<your database name>',
    username: '<your MySQL username>',
    password: '<your MySQL password>',
    host: '<your database host>',
    port: 3306,
    init: true // set false if table already exitsts in the database
};

exports.serverConfig = {
    port: 8888
}

exports.staticPath = 'test'; // or 'public'
exports.secret = "secret to parse cookies";
```

