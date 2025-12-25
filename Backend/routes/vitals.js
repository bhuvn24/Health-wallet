const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');
const authMiddleware = require('../middleware/authMiddleware');

// Get all vitals for logged in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const vitals = await Vital.findAll({
            where: { user_id: req.user.id },
            order: [['recorded_at', 'ASC']]
        });
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new vital record
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { vital_type, value, unit, recorded_at } = req.body;
        const vital = await Vital.create({
            user_id: req.user.id,
            vital_type,
            value,
            unit,
            recorded_at: recorded_at || new Date()
        });
        res.status(201).json(vital);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
