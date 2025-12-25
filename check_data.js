const sequelize = require('./Backend/config/database');
const Report = require('./Backend/models/Report');

async function checkData() {
    try {
        await sequelize.authenticate();
        const reports = await Report.findAll();

        console.log(`Found ${reports.length} reports.`);
        reports.forEach(r => {
            console.log(`ID: ${r.id}, Name: ${r.name}`);
            console.log(`AI Analysis Length: ${r.ai_analysis ? r.ai_analysis.length : 'NULL'}`);
            if (r.ai_analysis) {
                console.log('Snippet:', r.ai_analysis.substring(0, 50) + '...');
            }
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
