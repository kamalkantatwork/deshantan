const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');

// GET all destinations
router.get('/', async (req, res) => {
    try {
        const destinations = await Destination.find();
        res.json({
            success: true,
            data: destinations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST new destination (for admin)
router.post('/', async (req, res) => {
    try {
        const destination = new Destination(req.body);
        await destination.save();
        res.status(201).json({
            success: true,
            data: destination
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// GET popular destinations
// NOTE: this and every other literal route below must be declared BEFORE
// GET /:id, otherwise Express matches "popular"/"offbeat" as an :id value.
router.get('/popular', async (req, res) => {
    try {
        const destinations = await Destination.find({ isPopular: true });
        res.json({
            success: true,
            data: destinations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET off-beat / hidden-gem destinations (Off-beat destination discovery)
router.get('/offbeat', async (req, res) => {
    try {
        const { state, category } = req.query;
        const filter = { isOffbeat: true };
        if (state) filter.state = state;
        if (category) filter.category = category;

        const destinations = await Destination.find(filter).sort({ crowdLevel: 1 });
        res.json({
            success: true,
            count: destinations.length,
            data: destinations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET single destination — must come AFTER the literal routes above
router.get('/:id', async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }
        res.json({
            success: true,
            data: destination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
