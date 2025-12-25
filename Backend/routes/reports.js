const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports images and PDF!'));
    }
});

// Get all reports for logged in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reports = await Report.findAll({
            where: { user_id: req.user.id },
            order: [['report_date', 'DESC']]
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const { analyzeMedicalDocument } = require('../services/llmService');

// ... existing imports

// Upload a new report
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { name, report_type, report_date } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let report = await Report.create({
            user_id: req.user.id,
            name,
            report_type,
            report_date,
            file_path: req.file.filename
        });

        // Trigger LLM Analysis (Simulating content with metadata for now)
        // in a real app, this would extract text from the file first
        console.log(`Starting analysis for report: ${name}`);
        const analysisContext = `Report Name: ${name}, Type: ${report_type}, Date: ${report_date}. Verify typical healthy ranges and common issues associated with this type of report.`;
        const analysis = await analyzeMedicalDocument(analysisContext);
        console.log('Analysis result:', analysis);

        // Update with analysis results
        report.ai_analysis = JSON.stringify(analysis);
        await report.save();
        console.log('Report saved with analysis:', report.toJSON());

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get download URL (Mock logic since we serve static files)
router.get('/:id/download', authMiddleware, async (req, res) => {
    // In a real app with S3, this would generate a signed URL
    // Here we just return the static path
    try {
        const report = await Report.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Assuming server is running on localhost:5000
        const downloadUrl = `http://localhost:5000/uploads/${report.file_path}`;
        res.json({ downloadUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
