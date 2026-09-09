const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    travelDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    peopleCount: {
        type: Number,
        required: true,
        min: 1
    },
    specialRequests: {
        type: String,
        default: ''
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    advancePaid: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    bookingReference: {
        type: String,
        unique: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

bookingSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        const prefix = 'DESH';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.bookingReference = `${prefix}${timestamp}${random}`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);