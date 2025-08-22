import { DataTypes } from 'sequelize';
let Market;
function initModel(sequelize) {
 Market = sequelize.define('Market', {
  id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,   // ← clé auto-incrémentée
      primaryKey: true
    },
  name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
      description: {
          type: DataTypes.STRING(255), 
          allowNull: true 
        },
          adress: {
          type: DataTypes.STRING(255), 
          allowNull: false 
        }
  
});
return Market;
}
export { initModel, Market };