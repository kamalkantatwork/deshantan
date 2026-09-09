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

// GET single destination
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

module.exports = router;