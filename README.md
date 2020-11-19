# COMP426 Chatroom

### Config

For local testing, create a file `config-test.js` with the following content:

```js
exports.dbConfig = {
    database: '<your database name>',
    username: '<your MySQL username>',
    password: '<your MySQL password>',
    host: '<your database host>',
    port: 3306,
};

exports.serverConfig = {
    port: 3000
}

exports.staticPath = 'test';
exports.secret = "<your secret to parse cookies>";
```

then run
```
npm run test
```
