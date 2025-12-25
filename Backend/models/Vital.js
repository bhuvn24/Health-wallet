const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Vital = sequelize.define('Vital', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    vital_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recorded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

User.hasMany(Vital, { foreignKey: 'user_id' });
Vital.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Vital;
