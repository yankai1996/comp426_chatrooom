const Router = require('koa-router');

const router = new Router();

router.get('/login', async (ctx, next) => {
    await ctx.render("index");
});

router.get('/', (ctx, next) => {
    ctx.response.redirect('/login');
});

exports.router = router;