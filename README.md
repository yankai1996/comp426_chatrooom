# COMP426 Chatroom

This is the backend for COMP423 Project.

### Config

Create a file `config-test.js` and `config-prod.js` with the following content:

```js
exports.dbConfig = {
    database: '<your database name>',
    username: '<your MySQL username>',
    password: '<your MySQL password>',
    host: '<your database host>',
    port: 3306,
};

exports.secret = "<your secret to parse cookies>";
```

For local testing, run
```
npm run test
```

### UI/UX Mockups

https://www.figma.com/file/A2BP7i3pf7v2XP4wzDpvXE/ChatRoom?node-id=0%3A1
