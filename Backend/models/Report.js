const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Report = sequelize.define('Report', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    report_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    report_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ai_analysis: {
        type: DataTypes.TEXT, // Storing JSON as string for SQLite compatibility
        allowNull: true
    }
});

User.hasMany(Report, { foreignKey: 'user_id' });
Report.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Report;
