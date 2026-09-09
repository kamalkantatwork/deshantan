const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// GET all active alerts, optionally filtered by city/category, newest & most-upvoted first
router.get('/', async (req, res) => {
    try {
        const { city, category, status } = req.query;
        const filter = {};
        if (city) filter.city = new RegExp(`^${city}$`, 'i');
        if (category) filter.category = category;
        filter.status = status || 'active';

        const alerts = await Alert.find(filter).sort({ upvotes: -1, createdAt: -1 });
        res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST a new crowdsourced alert (any traveler can report a scam / overpriced service)
router.post('/', async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).json({
            success: true,
            message: 'Thanks for helping keep fellow travelers safe! Alert posted.',
            data: alert
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT upvote / confirm an alert (crowdsourcing signal — more confirmations = more trustworthy)
router.put('/:id/confirm', async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { $inc: { upvotes: 1, confirmations: 1 } },
            { new: true }
        );
        if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
        res.json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT mark an alert resolved (e.g. price issue was fixed, area is safe again)
router.put('/:id/resolve', async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: 'resolved' },
            { new: true }
        );
        if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
        res.json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single alert
router.get('/:id', async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
        res.json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
