import './utils/moduleAlias';

import Koa from 'koa';

import { initDB } from '@/dao';
import applyInspector from '@/inspector';
import applyMiddle from '@/middleware';
import applyRouter from '@/router';
import { PORT } from '@/utils/constant';

const app = new Koa();

applyInspector(app);
applyMiddle(app);
applyRouter(app);

initDB()
  .then(() => {
    return new Promise((resolve, _reject) => {
      app.listen(PORT, () => resolve(PORT));
    });
  })
  .then((port) => {
    console.log(`🚀 koa app is running at port ${port}`);
  });
