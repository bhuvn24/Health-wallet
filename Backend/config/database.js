const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'health_wallet.sqlite'),
    logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize;
