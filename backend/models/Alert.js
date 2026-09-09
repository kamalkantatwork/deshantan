const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    description: {
        type: String,
        required: true,
        minlength: 10
    },
    category: {
        type: String,
        enum: ['scam', 'overpricing', 'fake_guide', 'unsafe_area', 'touting', 'other'],
        required: true
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
    exactLocation: {
        type: String,
        default: ''
    },
    fairPriceNote: {
        type: String,
        default: ''
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    reportedByName: {
        type: String,
        default: 'Anonymous Traveler'
    },
    reportedByEmail: {
        type: String,
        default: '',
        lowercase: true,
        trim: true
    },
    upvotes: {
        type: Number,
        default: 0
    },
    // crowdsourced verification: alerts gain trust as more travelers confirm them
    confirmations: {
        type: Number,
        default: 1
    },
    isVerifiedByTeam: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'flagged'],
        default: 'active'
    }
}, {
    timestamps: true
});

alertSchema.index({ city: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
