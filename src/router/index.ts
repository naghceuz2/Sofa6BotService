import type Application from 'koa';
import KoaRouter from 'koa-router';

import { userController,tokenController, swapController } from '@/controller';

const router = new KoaRouter();

export const applyRouter = (app: Application) => {
  router.get('/tgsolbot/user', userController.getUserInfo);
  router.post('/tgsolbot/user', userController.createUserInfo);
  router.get('/tgsolbot/balance', tokenController.getUserBalance);
  router.post('/tgsolbot/transfer', tokenController.transferToken);
  router.post('/tgsolbot/swap', swapController.swap);
  router.post('/tgsolbot/wrapsol', swapController.wrapsol);
  router.post('/tgsolbot/unwrapsol', swapController.unwrapsol);
  router.get('/tgsolbot/token', tokenController.getTokenInfo);
  app.use(router.routes()).use(router.allowedMethods());
};
export default applyRouter;
