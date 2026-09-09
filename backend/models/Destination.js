const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: 20
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true,
        default: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600'
    },
    gallery: [{
        type: String,
        default: []
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 4.5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['historical', 'nature', 'spiritual', 'adventure', 'beach', 'heritage', 'urban'],
        required: true
    },
    bestTimeToVisit: {
        type: String,
        default: 'Year-round'
    },
    duration: {
        type: String,
        default: '2-3 days'
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Off-beat destination discovery: hidden gems that are NOT on the mainstream circuit
    isOffbeat: {
        type: Boolean,
        default: false
    },
    crowdLevel: {
        type: String,
        enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
        default: 'moderate'
    },
    offbeatTag: {
        type: String,
        default: ''
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    nearbyAttractions: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema);
