const sequelize = require('./Backend/config/database');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Check if column exists
        const [results] = await sequelize.query("PRAGMA table_info(Reports);");
        const hasColumn = results.some(c => c.name === 'ai_analysis');

        if (!hasColumn) {
            console.log('Adding ai_analysis column...');
            await sequelize.query("ALTER TABLE Reports ADD COLUMN ai_analysis TEXT;");
            console.log('Column added successfully.');
        } else {
            console.log('Column ai_analysis already exists.');
        }

        // Also drop the backup table if it exists and is causing issues?
        // SQLite might have left a mess.
        // await sequelize.query("DROP TABLE IF EXISTS Users_backup;"); 

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
