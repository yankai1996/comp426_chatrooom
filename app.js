const Koa = require("koa");
const config = require("./config").serverConfig;
const login = require("./controllers/login_router").router;
const path = require('path');
const serve = require('koa-static');
const views = require('koa-views');

const app = new Koa();

app.use(serve(path.join(__dirname, "/public")));
app.use(views(__dirname + '/views'));

app.use(login.routes(), login.allowedMethods());

app.listen(config.port, () => {
    console.log("Server starts running on port " + config.port + "...");
});