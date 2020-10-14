const dbConfig = {
    database: 'ra_website_v1',
    username: 'root',
    password: 'admin@0225',
    host: 'localhost',
    port: 3306,
    init: false // set true for creating tables in the database
};

const serverConfig = {
    port: 8888
}

export {dbConfig, serverConfig};