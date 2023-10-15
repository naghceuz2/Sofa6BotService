import { Sequelize } from 'sequelize';

import defineModel from '@/model';
import config from '@/utils/confManager';
import {
  DB_POOL_ACQUIRE,
  DB_POOL_IDLE,
  MAX_DB_POOL,
  MIN_DB_POOL
} from '@/utils/constant';

const dbConfig = config.dbConfig;
const validateConfig = () => {
  if (/[^0-9]/.test(dbConfig.Port)) {
    throw new Error('db config error, port must be a number');
  }
};
validateConfig();

const port = Number(dbConfig.Port);
const database = dbConfig.DataBase;
const username = dbConfig.User;
const password = dbConfig.Password;
const host = dbConfig.Host;
const dialect = dbConfig.Dialect;

export const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  pool: {
    max: MAX_DB_POOL,
    min: MIN_DB_POOL,
    idle: DB_POOL_IDLE,
    acquire: DB_POOL_ACQUIRE
  },
  logging: process.env.NODE_ENV === 'debug'
});
process.on('exit', () => {
  sequelize.close();
});

export const initDB = async () => {
  // try {
  //   defineModel(sequelize);
  //   sequelize.authenticate();
  //   console.log(`Connection of ${dialect} has been established successfully.`);
  // } catch (error) {
  //   console.error('Unable to connect to the database:', error);
  //   throw new Error();
  // }
};

export default { initDB, sequelize };
