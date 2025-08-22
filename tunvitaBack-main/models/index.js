// index.js
import { Sequelize } from 'sequelize';

import path from 'path';
import { fileURLToPath } from 'url';

import * as CategoryModel from './Category.js';
import * as MarketModel from './Market.js';
import * as ProductModel from './product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../../database.sqlite'),
  logging: false
});

// Initialisation des modèles
const Category = CategoryModel.initModel(sequelize);
const Market = MarketModel.initModel(sequelize);
const Product = ProductModel.initModel(sequelize);

// Définir les relations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Market.hasMany(Product, { foreignKey: 'marketId', as: 'products' });
Product.belongsTo(Market, { foreignKey: 'marketId', as: 'market' });

// Exports
export { sequelize, Category, Market, Product };
export default { sequelize, Category, Market, Product };