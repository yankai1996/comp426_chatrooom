const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const e = require('express');

class ProfileManager {
    constructor() {

    }
}

ProfileManager.prototype.saveUserProfile = function (file) {
    return this.saveProfile(file, 'user');
}

ProfileManager.prototype.saveRoomProfile = function (file) {
    return this.saveProfile(file, 'room');
}

ProfileManager.prototype.saveProfile = (file, catalog) => {
    let suffix = '';
    if (file.mimetype != 'image/jpeg') {
        suffix = '.jpeg'; 
    } else if (file.mimetype != 'image/png') {
        suffix = '.png';
    } else {
        throw new Error('invalid image type!');
    }

    if (file.size > 1024 * 1024) {
        throw new Error('image over 1MB!');
    }

    try {
        let dir = path.join(__dirname, `../public/image/${catalog}`);
        let filename = generateSafeFilename(dir, file.buffer, suffix);
        fs.writeFile(`${dir}/${filename}${suffix}`, file.buffer, (error) => {
            if (error) console.log(error);
            else return true;
        });

        return `${filename}${suffix}`;
    } catch (error) {
        throw error;
    }
}

const generateSafeFilename = (dir, seed, suffix) => {
    let filename = crypto.createHash('md5').update(seed).digest('hex');
    if (fs.existsSync(`${dir}/${filename}${suffix}`)) {
        return generateSafeFilename(dir, filename, suffix);
    }
    return filename;
}

module.exports = ProfileManager;
