import fse from 'fs-extra';
import type { Dialect } from 'sequelize';
import yaml from 'yaml';

class ConfigurationManager {
  private configFileName: string;
  private globalConfFile: string;
  private configs: {
    BASE: {
      Port: string;
      Address: string;
      NODE_ENV: 'production' | 'development' | 'test' | 'debug';
      MongoURI: string;
      JwtSecret: string;
    };
    MYSQL: {
      DataBase: string;
      Host: string;
      User: string;
      Password: string;
      Port: string;
      Dialect: Dialect;
    };
  };
  constructor(configFileName = 'config.yml') {
    this.configFileName = configFileName;
    this.globalConfFile = fse.readFileSync(configFileName, 'utf8');
    this.configs = yaml.parse(this.globalConfFile);

    const env = this.configs.BASE.NODE_ENV;
    if (!['production', 'development'].includes(env)) {
      throw new Error(`invalid config, NODE_ENV: ${env}`);
    }
  }

  get baseConfig() {
    return this.configs['BASE'];
  }

  get dbConfig() {
    return this.configs['MYSQL'];
  }

  get allConfig() {
    return this.configs;
  }
}

export default new ConfigurationManager();
