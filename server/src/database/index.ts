/* eslint-disable @typescript-eslint/no-var-requires */
// const { Sequelize } = require('sequelize');
import { DataTypes, Sequelize } from 'sequelize';
import userModel from './model/user';
import roomModel from './model/room';
const sequelize = new Sequelize('demo', 'root', '00000000', {
  host: 'localhost',
  dialect: 'mysql'
});

const initModel = () => {
  const User = userModel(sequelize, DataTypes);
  const Room = roomModel(sequelize, DataTypes);
  return {
    User,
    Room
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
