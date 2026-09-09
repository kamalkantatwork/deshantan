const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
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
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    photo: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=667eea&color=fff&size=200'
    },
    languages: [{
        type: String
    }],
    specialties: [{
        type: String
    }],
    pricePerDay: {
        type: Number,
        required: true,
        min: 0
    },
    yearsExperience: {
        type: Number,
        default: 0,
        min: 0
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
    // Verification: this is what powers the "Verified local guide booking" checklist item
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    idProofType: {
        type: String,
        enum: ['aadhaar', 'passport', 'driving_license', 'voter_id', 'other'],
        default: 'aadhaar'
    },
    idProofNumberMasked: {
        type: String,
        default: ''
    },
    govtLicenseNumber: {
        type: String,
        default: ''
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verifiedBy: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

guideSchema.index({ city: 1, verificationStatus: 1 });

module.exports = mongoose.model('Guide', guideSchema);
