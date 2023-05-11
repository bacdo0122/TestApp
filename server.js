require("isomorphic-fetch")
const dotenv = require("dotenv")
const koa = require("koa")
const next = require("next")
const {default: createShopifyAuth} = require("@shopify/koa-shopify-auth")
const {verifyRequest} = require("@shopify/koa-shopify-auth")
const {default: Shopify, ApiVersion} = require("@shopify/shopify-api")
const Router = require("koa-router")

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
    API_KEY:process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY:process.env.SHOPIFY_API_SECRET,
    SCOPES:process.env.SHOPIFY_API_SCOPES.split(","),
    HOST_NAME:process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
    API_VERSION: ApiVersion.April23,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
})

app.prepare().then(()=>{
    const server = new Koa();
    const router = new Router();
    server.keys = [Shopify.Context.API_SECRET_KEY];

    const handleRequest = async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.response = false;
        ctx.res.statusCode = 200;
    }
    router.get('(.*)', handleRequest);
    server.use(router.allowedMethods());
    server.use(router.routes())
})
