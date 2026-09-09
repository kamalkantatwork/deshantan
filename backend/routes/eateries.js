const express = require('express');
const router = express.Router();
const Eatery = require('../models/Eatery');

// GET eateries, optionally filtered by city / minimum hygiene rating
router.get('/', async (req, res) => {
    try {
        const { city, minHygiene, cuisine } = req.query;
        const filter = {};
        if (city) filter.city = new RegExp(`^${city}$`, 'i');
        if (cuisine) filter.cuisine = new RegExp(cuisine, 'i');
        if (minHygiene) filter.hygieneRating = { $gte: Number(minHygiene) };

        const eateries = await Eatery.find(filter).sort({ hygieneRating: -1, rating: -1 });
        res.json({ success: true, count: eateries.length, data: eateries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET top hygiene-rated eateries in a city (4+ stars)
router.get('/top-hygiene/:city', async (req, res) => {
    try {
        const eateries = await Eatery.find({
            city: new RegExp(`^${req.params.city}$`, 'i'),
            hygieneRating: { $gte: 4 }
        }).sort({ hygieneRating: -1 });
        res.json({ success: true, count: eateries.length, data: eateries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST add/submit an eatery (with an initial hygiene rating pending Deshantan verification)
router.post('/', async (req, res) => {
    try {
        const eatery = new Eatery(req.body);
        await eatery.save();
        res.status(201).json({ success: true, data: eatery });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// GET single eatery
router.get('/:id', async (req, res) => {
    try {
        const eatery = await Eatery.findById(req.params.id);
        if (!eatery) return res.status(404).json({ success: false, message: 'Eatery not found' });
        res.json({ success: true, data: eatery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
