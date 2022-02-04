export default (sequelize, DataTypes) => {
  const Room = sequelize.define('Rooms', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: sequelize.UUIDV4
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  });
  return Room;
};
