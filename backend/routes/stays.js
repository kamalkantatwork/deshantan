const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');

// GET stays, optionally filtered by city / type / max price
router.get('/', async (req, res) => {
    try {
        const { city, type, maxPrice } = req.query;
        const filter = {};
        if (city) filter.city = new RegExp(`^${city}$`, 'i');
        if (type) filter.type = type;
        if (maxPrice) filter.pricePerNight = { $lte: Number(maxPrice) };

        const stays = await Stay.find(filter).sort({ rating: -1 });
        res.json({ success: true, count: stays.length, data: stays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST list a hotel/homestay directly — always commissionFree by default,
// this is what backs "Direct listings for small hotels/homestays (no big commission)"
router.post('/', async (req, res) => {
    try {
        const stay = new Stay({
            ...req.body,
            commissionFree: true,
            platformFeePercent: 0
        });
        await stay.save();
        res.status(201).json({
            success: true,
            message: 'Your property is listed with 0% commission!',
            data: stay
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// GET single stay
router.get('/:id', async (req, res) => {
    try {
        const stay = await Stay.findById(req.params.id);
        if (!stay) return res.status(404).json({ success: false, message: 'Stay not found' });
        res.json({ success: true, data: stay });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
