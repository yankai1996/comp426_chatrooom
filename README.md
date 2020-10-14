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

export {dbConfig, serverConfig};
```

