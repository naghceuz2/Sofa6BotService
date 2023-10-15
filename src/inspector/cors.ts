import type { Context } from 'koa';
import cors from 'koa2-cors';

export default cors({
  origin: (ctx: Context) => {
    // @TODO: waiting customize
    if (ctx.headers['x-access-flag'] === 'true') {
      return '*';
    }
    return '*';
  },
  maxAge: 24 * 60 * 60,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-access-flag'],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
});
