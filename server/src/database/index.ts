/* eslint-disable @typescript-eslint/no-var-requires */
// const { Sequelize } = require('sequelize');
import { DataTypes, Sequelize } from 'sequelize';
import userModel from './model/user';
const sequelize = new Sequelize('demo', 'root', '00000000', {
  host: 'localhost',
  dialect: 'mysql'
});

const initModel = () => {
  const User = userModel(sequelize, DataTypes);

  return {
    User
  };
};

export const initDatabase = () => {
  let Models = {};
  return new Promise((resolve, reject) => {
    sequelize.authenticate().then(() => {
      // 初始化model
      Models = initModel();

      return sequelize.sync({ force: false });
    }).then(() => {
      resolve(Models);
    }).catch((error) => {
      reject(error);
    });
  });
};

export default sequelize;
