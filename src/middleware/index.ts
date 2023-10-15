import type Application from 'koa';

import koaBody from '@/middleware/koaBody';
// import { isDev, isProd } from '@/utils/constant';

export const applyMiddle = (app: Application) => {
  app.use(koaBody);
};

export default applyMiddle;
