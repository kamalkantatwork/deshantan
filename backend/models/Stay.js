const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['hotel', 'homestay', 'guesthouse', 'hostel', 'resort'],
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'
    },
    gallery: [{
        type: String
    }],
    pricePerNight: {
        type: Number,
        required: true,
        min: 0
    },
    amenities: [{
        type: String
    }],
    maxGuests: {
        type: Number,
        default: 2
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    // Direct-listing / no-commission model: owner is contacted directly, Deshantan takes 0% cut
    ownerName: {
        type: String,
        required: true
    },
    ownerPhone: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        default: '',
        lowercase: true
    },
    commissionFree: {
        type: Boolean,
        default: true
    },
    platformFeePercent: {
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

staySchema.index({ city: 1, type: 1 });

module.exports = mongoose.model('Stay', staySchema);
