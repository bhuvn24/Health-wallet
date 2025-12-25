const sequelize = require('./Backend/config/database');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Raw query to get table info in SQLite
        const [results, metadata] = await sequelize.query("PRAGMA table_info(Reports);");
        console.log('Columns in Reports table:', results.map(c => c.name));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
