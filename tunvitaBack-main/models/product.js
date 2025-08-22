import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';
import { Category } from './Category.js';
import { Market } from './Market.js';

let Product;

function initModel(sequelize) {
  Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    pricePerUnit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    marketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Market,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  });

  // Déclaration des relations
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'Category' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'Products' });

  Product.belongsTo(Market, { foreignKey: 'marketId', as: 'Market' });
  Market.hasMany(Product, { foreignKey: 'marketId', as: 'Markets' });

  return Product;
}

export { initModel, Product };