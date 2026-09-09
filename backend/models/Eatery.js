const mongoose = require('mongoose');

const eaterySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        default: ''
    },
    cuisine: [{
        type: String
    }],
    priceRange: {
        type: String,
        enum: ['budget', 'mid-range', 'premium'],
        default: 'budget'
    },
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'
    },
    // Core of the "Hygiene-rated local eateries" checklist item
    hygieneRating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    hygieneSource: {
        type: String,
        enum: ['fssai', 'deshantan_inspection', 'crowdsourced'],
        default: 'crowdsourced'
    },
    fssaiLicenseNumber: {
        type: String,
        default: ''
    },
    lastInspectedAt: {
        type: Date,
        default: null
    },
    tasteRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 4
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    coordinates: {
        lat: Number,
        lng: Number
    }
}, {
    timestamps: true
});

eaterySchema.index({ city: 1, hygieneRating: -1 });

module.exports = mongoose.model('Eatery', eaterySchema);
