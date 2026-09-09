const express = require('express');
const router = express.Router();
const Guide = require('../models/Guide');
const GuideBooking = require('../models/GuideBooking');

// GET all VERIFIED guides (default), optionally filtered by city/language
// Only verificationStatus === 'verified' is shown to travelers by default —
// this is what backs the "Verified local guide booking" checklist item.
router.get('/', async (req, res) => {
    try {
        const { city, language, includeUnverified } = req.query;
        const filter = { isActive: true };
        if (!includeUnverified) filter.verificationStatus = 'verified';
        if (city) filter.city = new RegExp(`^${city}$`, 'i');
        if (language) filter.languages = new RegExp(language, 'i');

        const guides = await Guide.find(filter).sort({ rating: -1 });
        res.json({ success: true, count: guides.length, data: guides });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST register as a guide (starts as 'pending' until Deshantan verifies ID/license)
router.post('/', async (req, res) => {
    try {
        const guide = new Guide({ ...req.body, verificationStatus: 'pending' });
        await guide.save();
        res.status(201).json({
            success: true,
            message: 'Guide profile submitted for verification!',
            data: guide
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT admin: approve/reject a guide's verification
router.put('/:id/verify', async (req, res) => {
    try {
        const { status, verifiedBy } = req.body; // status: 'verified' | 'rejected'
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const guide = await Guide.findByIdAndUpdate(
            req.params.id,
            {
                verificationStatus: status,
                verifiedAt: status === 'verified' ? new Date() : null,
                verifiedBy: verifiedBy || 'Deshantan Team'
            },
            { new: true }
        );
        if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
        res.json({ success: true, data: guide });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single guide
router.get('/:id', async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
        res.json({ success: true, data: guide });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST book a verified guide
router.post('/:id/book', async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
        if (guide.verificationStatus !== 'verified') {
            return res.status(400).json({ success: false, message: 'This guide is not yet verified' });
        }

        const days = req.body.days || 1;
        const booking = new GuideBooking({
            guide: guide._id,
            travelerName: req.body.travelerName,
            travelerEmail: req.body.travelerEmail,
            travelerPhone: req.body.travelerPhone,
            tourDate: req.body.tourDate,
            days,
            groupSize: req.body.groupSize || 1,
            notes: req.body.notes || '',
            totalAmount: guide.pricePerDay * days
        });
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Guide booked successfully!',
            data: booking
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// GET all bookings for a guide (admin/guide dashboard)
router.get('/:id/bookings', async (req, res) => {
    try {
        const bookings = await GuideBooking.find({ guide: req.params.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
