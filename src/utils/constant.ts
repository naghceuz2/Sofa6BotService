import config from './confManager';

export const jwtSecret = config.baseConfig.JwtSecret;

export const isDev = config.baseConfig.NODE_ENV === 'development';
export const isProd = config.baseConfig.NODE_ENV === 'production';

export const PORT = config.baseConfig.Port;
export const MAX_DB_POOL = 80;
export const MIN_DB_POOL = 80;
export const DB_POOL_IDLE = 20000;
export const DB_POOL_ACQUIRE = 20000;
