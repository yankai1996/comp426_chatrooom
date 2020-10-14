# COMP426 Chatroom

### Config

Before running the node, create a file `config.js` with the following content:

```js
const dbConfig = {
    database: '<your database name>',
    username: '<your MySQL username>',
    password: '<your MySQL password>',
    host: '<your database host>',
    port: 3306,
    init: true // set false if table already exitsts in the database
};

const serverConfig = {
    port: 8888
}

exports.dbConfig = dbConfig;
exports.serverConfig = serverConfig;
```



### UI/UX Mockups

https://www.figma.com/file/A2BP7i3pf7v2XP4wzDpvXE/ChatRoom?node-id=0%3A1