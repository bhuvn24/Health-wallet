const express = require('express');
const router = express.Router();
const Share = require('../models/Share');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

// Share a report
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { report_id, email } = req.body;

        // Verify report ownership
        const report = await Report.findOne({ where: { id: report_id, user_id: req.user.id } });
        if (!report) {
            return res.status(404).json({ error: 'Report not found or access denied' });
        }

        const share = await Share.create({
            report_id,
            shared_with_email: email,
            access_level: 'read'
        });

        res.status(201).json(share);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reports shared with me
router.get('/shared-with-me', authMiddleware, async (req, res) => {
    try {
        const shares = await Share.findAll({
            where: { shared_with_email: req.user.email },
            include: [{ model: Report }]
        });
        res.json(shares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my shares (who I shared with)
router.get('/my-shares', authMiddleware, async (req, res) => {
    try {
        // This is a bit complex in Sequelize without raw query or complex join on nested association
        // Ideally: Select Share where Report.user_id = req.user.id
        // For simplicity, let's fetch reports first then shares
        const myReports = await Report.findAll({ where: { user_id: req.user.id } });
        const reportIds = myReports.map(r => r.id);

        const shares = await Share.findAll({
            where: { report_id: reportIds },
            include: [{ model: Report }]
        });

        res.json(shares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
