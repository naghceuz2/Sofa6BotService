import type Application from 'koa';

import cors from '@/inspector/cors';
import jwt from '@/inspector/jwt';
// import { isDev, isProd } from '@/utils/constant';

export const applyInspector = (app: Application) => {
 // app.use(jwt);
  app.use(cors);
};

export default applyInspector;
