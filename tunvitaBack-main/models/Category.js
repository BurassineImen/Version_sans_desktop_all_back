import { DataTypes } from 'sequelize';

let Category;

function initModel(sequelize) {
  Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#000000',
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  });
  return Category;
}

export { initModel, Category };