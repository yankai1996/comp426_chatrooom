import { sha1 } from "crypto-js/sha1";

class Auth {
    constructor(userTable) {
        this.userTable = userTable
    }
}

Auth.prototype.hashPassword = function(password) {
    return sha1(password).toString();
}

Auth.prototype.existUsername = function(username) {
    return this.userTable.findOne({
        where: {
            id: username,
        },
        raw: true
    }).then((result) => {
        return result !== null;
    });
}

Auth.prototype.findUser = function(username, password) {
    return this.userTable.findOne({
        where: {
            id: username,
            password: this.hashPassword(password)
        },
        raw: true
    }).then((result) => {
        return result !== null;
    });
}

Auth.prototype.createUser = function(username, password) {
    return this.userTable.create({
        id: username,
        password: this.hashPassword(password)
    }).then((result) => {
        return result !== null;
    });
}

export default Auth;