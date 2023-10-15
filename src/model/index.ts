import type { Sequelize } from 'sequelize';

import { defineAccountConfig } from './AccountConfig';

export const defineModel = (seq: Sequelize) => {
  defineAccountConfig(seq);
};
export default defineModel;
