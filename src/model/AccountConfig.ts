import type { Sequelize } from 'sequelize';
import { DataTypes, Model } from 'sequelize';

export class AccountConfig extends Model {}

export const defineAccountConfig = (sequelize: Sequelize) => {
  AccountConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userAddress: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'user_address'
      },
      userName: {
        type: DataTypes.STRING,
        field: 'user_name'
      },
      account: {
        type: DataTypes.STRING
      },
      privateKey: {
        type: DataTypes.STRING,
        field: 'private_key'
      },
      strategy: {
        type: DataTypes.NUMBER,
        defaultValue: 1,
        validate: {
          isIn: [[1, 2]]
        }
      },
      isEnable: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        field: 'is_enable',
        validate: {
          is: /^[0|1]$/i
        }
      },
      maxMintTokenCnt: {
        type: DataTypes.STRING,
        field: 'max_mint_token_cnt',
        validate: {
          max: 100,
          min: 0
        }
      }
    },
    {
      sequelize,
      createdAt: true,
      updatedAt: true,
      underscored: true,
      tableName: 'account_config'
    }
  );
};
export default defineAccountConfig;
