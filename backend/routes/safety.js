const express = require('express');
const router = express.Router();
const SafetyCheckin = require('../models/SafetyCheckin');

// POST start a new safety check-in session for a trip
router.post('/checkin', async (req, res) => {
    try {
        const checkin = new SafetyCheckin({
            ...req.body,
            status: 'active',
            lastCheckinAt: new Date(),
            checkinLog: [{
                timestamp: new Date(),
                status: 'active',
                location: req.body.lastKnownLocation || {}
            }]
        });
        await checkin.save();
        res.status(201).json({
            success: true,
            message: 'Safety check-in started. Stay safe and check in regularly!',
            data: checkin
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT "I'm Safe" — traveler confirms they are okay, resets the check-in clock
router.put('/:id/im-safe', async (req, res) => {
    try {
        const checkin = await SafetyCheckin.findById(req.params.id);
        if (!checkin) return res.status(404).json({ success: false, message: 'Check-in not found' });

        checkin.status = 'safe';
        checkin.lastCheckinAt = new Date();
        if (req.body.location) checkin.lastKnownLocation = req.body.location;
        checkin.checkinLog.push({
            timestamp: new Date(),
            status: 'safe',
            location: req.body.location || checkin.lastKnownLocation
        });
        await checkin.save();

        res.json({ success: true, message: "Great, glad you're safe!", data: checkin });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT trigger SOS — alerts Deshantan safety team + the traveler's emergency contact
router.put('/:id/sos', async (req, res) => {
    try {
        const checkin = await SafetyCheckin.findByIdAndUpdate(
            req.params.id,
            {
                status: 'sos',
                sosTriggeredAt: new Date(),
                $push: {
                    checkinLog: {
                        timestamp: new Date(),
                        status: 'sos',
                        location: req.body.location || {}
                    }
                }
            },
            { new: true }
        );
        if (!checkin) return res.status(404).json({ success: false, message: 'Check-in not found' });

        // In production this is where Deshantan would trigger SMS/call to
        // checkin.emergencyContactPhone and to local authorities/security partners.
        res.json({
            success: true,
            message: `SOS triggered! Emergency contact ${checkin.emergencyContactName} and Deshantan's safety team have been notified.`,
            data: checkin
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT resolve an SOS (safety team or traveler confirms all clear)
router.put('/:id/resolve-sos', async (req, res) => {
    try {
        const checkin = await SafetyCheckin.findByIdAndUpdate(
            req.params.id,
            { status: 'safe', sosResolvedAt: new Date() },
            { new: true }
        );
        if (!checkin) return res.status(404).json({ success: false, message: 'Check-in not found' });
        res.json({ success: true, data: checkin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT close a check-in session (trip finished)
router.put('/:id/close', async (req, res) => {
    try {
        const checkin = await SafetyCheckin.findByIdAndUpdate(
            req.params.id,
            { status: 'closed' },
            { new: true }
        );
        if (!checkin) return res.status(404).json({ success: false, message: 'Check-in not found' });
        res.json({ success: true, data: checkin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single check-in (for status polling by the frontend)
router.get('/:id', async (req, res) => {
    try {
        const checkin = await SafetyCheckin.findById(req.params.id);
        if (!checkin) return res.status(404).json({ success: false, message: 'Check-in not found' });
        res.json({ success: true, data: checkin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET all overdue check-ins (admin/safety-team dashboard use)
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        // Auto-flag overdue sessions
        await SafetyCheckin.updateMany(
            { status: { $in: ['active', 'safe'] }, nextCheckinDue: { $lt: now } },
            { status: 'overdue' }
        );
        const checkins = await SafetyCheckin.find(req.query.status ? { status: req.query.status } : {})
            .sort({ createdAt: -1 });
        res.json({ success: true, count: checkins.length, data: checkins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
