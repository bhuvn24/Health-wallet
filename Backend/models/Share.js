const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Report = require('./Report');

const Share = sequelize.define('Share', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    report_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Report,
            key: 'id'
        }
    },
    shared_with_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    access_level: {
        type: DataTypes.STRING,
        defaultValue: 'read'
    }
});

Report.hasMany(Share, { foreignKey: 'report_id' });
Share.belongsTo(Report, { foreignKey: 'report_id' });

module.exports = Share;
