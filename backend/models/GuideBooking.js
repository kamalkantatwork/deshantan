const mongoose = require('mongoose');

const guideBookingSchema = new mongoose.Schema({
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guide',
        required: true
    },
    travelerName: {
        type: String,
        required: true,
        trim: true
    },
    travelerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    travelerPhone: {
        type: String,
        required: true,
        trim: true
    },
    tourDate: {
        type: Date,
        required: true
    },
    days: {
        type: Number,
        default: 1,
        min: 1
    },
    groupSize: {
        type: Number,
        default: 1,
        min: 1
    },
    notes: {
        type: String,
        default: ''
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    bookingReference: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

guideBookingSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.bookingReference = `GDE${timestamp}${random}`;
    }
    next();
});

module.exports = mongoose.model('GuideBooking', guideBookingSchema);
