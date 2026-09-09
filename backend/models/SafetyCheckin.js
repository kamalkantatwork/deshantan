const mongoose = require('mongoose');

const safetyCheckinSchema = new mongoose.Schema({
    travelerName: {
        type: String,
        required: true,
        trim: true
    },
    travelerPhone: {
        type: String,
        required: true,
        trim: true
    },
    isSoloTraveler: {
        type: Boolean,
        default: true
    },
    tripCity: {
        type: String,
        required: true,
        trim: true
    },
    tripState: {
        type: String,
        trim: true
    },
    emergencyContactName: {
        type: String,
        required: true
    },
    emergencyContactPhone: {
        type: String,
        required: true
    },
    checkinIntervalHours: {
        type: Number,
        default: 6,
        min: 1
    },
    lastCheckinAt: {
        type: Date,
        default: Date.now
    },
    nextCheckinDue: {
        type: Date
    },
    lastKnownLocation: {
        label: { type: String, default: '' },
        lat: Number,
        lng: Number
    },
    // status drives the traveler-safety UI: safe / overdue / sos
    status: {
        type: String,
        enum: ['active', 'safe', 'overdue', 'sos', 'closed'],
        default: 'active'
    },
    sosTriggeredAt: {
        type: Date,
        default: null
    },
    sosResolvedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    checkinLog: [{
        timestamp: { type: Date, default: Date.now },
        status: String,
        location: {
            label: String,
            lat: Number,
            lng: Number
        }
    }]
}, {
    timestamps: true
});

safetyCheckinSchema.pre('save', function(next) {
    if (this.isModified('lastCheckinAt') || this.isNew) {
        const interval = this.checkinIntervalHours || 6;
        this.nextCheckinDue = new Date(this.lastCheckinAt.getTime() + interval * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('SafetyCheckin', safetyCheckinSchema);
