const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: 20
    },
    duration: {
        type: String,
        required: true,
        default: '5 Days'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    destinations: [{
        type: String,
        required: true
    }],
    includes: [{
        type: String,
        required: true
    }],
    excludes: [{
        type: String,
        default: []
    }],
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600'
    },
    maxPeople: {
        type: Number,
        default: 6,
        min: 1
    },
    minPeople: {
        type: Number,
        default: 2,
        min: 1
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isLuxury: {
        type: Boolean,
        default: false
    },
    isCustomizable: {
        type: Boolean,
        default: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'challenging'],
        default: 'easy'
    },
    languages: [{
        type: String,
        default: ['English', 'Hindi']
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);