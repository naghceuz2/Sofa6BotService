import _jwt from 'jsonwebtoken';
import KoaJwt from 'koa-jwt';

import { jwtSecret } from '@/utils/constant';

export const koaJwt = KoaJwt({
  secret: jwtSecret
}).unless({
  path: ['/user/login']
});

export default koaJwt;
