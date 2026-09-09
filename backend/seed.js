require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Destination = require('./models/Destination');
const Package = require('./models/Package');

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Destination.deleteMany({});
        await Package.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            name: 'Admin Deshantan',
            email: 'admin@deshantan.com',
            password: hashedPassword,
            phone: '+91 98765 43210',
            role: 'admin',
            isVerified: true
        });
        await admin.save();
        console.log('👤 Admin user created');

        // Create sample users
        const users = [
            {
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                password: await bcrypt.hash('password123', 10),
                phone: '+91 98765 12345',
                preferences: ['historical', 'nature']
            },
            {
                name: 'Priya Patel',
                email: 'priya@example.com',
                password: await bcrypt.hash('password123', 10),
                phone: '+91 98765 54321',
                preferences: ['beach', 'adventure']
            }
        ];
        await User.insertMany(users);
        console.log('👥 Sample users created');

        // Sample destinations
        const destinations = [
            {
                name: 'Taj Mahal',
                location: 'Agra, Uttar Pradesh',
                description: 'One of the Seven Wonders of the World, a symbol of eternal love.',
                price: 2999,
                imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600',
                rating: 4.9,
                category: 'historical',
                isPopular: true
            },
            {
                name: 'Jaipur City Palace',
                location: 'Jaipur, Rajasthan',
                description: 'A magnificent palace complex in the heart of the Pink City.',
                price: 3999,
                imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
                rating: 4.7,
                category: 'historical',
                isPopular: true
            },
            {
                name: 'Kerala Backwaters',
                location: 'Alleppey, Kerala',
                description: 'Cruise through the serene backwaters of God\'s Own Country.',
                price: 4499,
                imageUrl: 'https://images.unsplash.com/photo-1598620665575-66b8d6ec8a9d?w=600',
                rating: 4.8,
                category: 'nature',
                isPopular: true
            },
            {
                name: 'Varanasi Ghats',
                location: 'Varanasi, Uttar Pradesh',
                description: 'Experience the spiritual heart of India on the banks of Ganges.',
                price: 2499,
                imageUrl: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600',
                rating: 4.6,
                category: 'spiritual',
                isPopular: true
            },
            {
                name: 'Goa Beaches',
                location: 'Goa',
                description: 'Sun, sand, and sea - India\'s most vibrant beach destination.',
                price: 3499,
                imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
                rating: 4.5,
                category: 'beach',
                isPopular: true
            },
            {
                name: 'Himalayan Trekking',
                location: 'Manali, Himachal Pradesh',
                description: 'Trek through the majestic Himalayas with breathtaking views.',
                price: 5499,
                imageUrl: 'https://images.unsplash.com/photo-1532009324734-20f7f581ca4b?w=600',
                rating: 4.8,
                category: 'adventure',
                isPopular: true
            }
        ];
        await Destination.insertMany(destinations);
        console.log('🏔️ Sample destinations created');

        // Sample packages
        const packages = [
            {
                name: 'Golden Triangle Express',
                description: 'Delhi - Agra - Jaipur in 7 days',
                duration: '7 Days',
                price: 25999,
                destinations: ['Delhi', 'Agra', 'Jaipur'],
                includes: ['5-star hotels', 'All meals', 'Private cab', 'Professional tour guide', 'Entry fees'],
                imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600',
                maxPeople: 6,
                isBestSeller: true
            },
            {
                name: 'Kerala Houseboat Special',
                description: 'Munnar - Alleppey - Kovalam',
                duration: '5 Days',
                price: 18999,
                destinations: ['Munnar', 'Alleppey', 'Kovalam'],
                includes: ['Premium houseboat stay', 'All meals (local cuisine)', 'Sightseeing', 'Ayurvedic massage', 'Coconut water welcome'],
                imageUrl: 'https://images.unsplash.com/photo-1598620665575-66b8d6ec8a9d?w=600',
                maxPeople: 4,
                isBestSeller: true
            },
            {
                name: 'Royal Rajasthan Tour',
                description: 'Jaipur - Jodhpur - Udaipur - Jaisalmer',
                duration: '9 Days',
                price: 45999,
                destinations: ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer'],
                includes: ['Luxury palace hotels', 'All meals', 'Private guide', 'Elephant ride', 'Desert safari', 'Cultural shows'],
                imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
                maxPeople: 8,
                isLuxury: true
            },
            {
                name: 'Himalayan Adventure',
                description: 'Manali - Leh - Ladakh',
                duration: '10 Days',
                price: 34999,
                destinations: ['Manali', 'Leh', 'Ladakh'],
                includes: ['Camping gear', 'Meals', 'Professional guide', 'First aid kit', 'Transport', 'Permits'],
                imageUrl: 'https://images.unsplash.com/photo-1532009324734-20f7f581ca4b?w=600',
                maxPeople: 10,
                isBestSeller: true
            }
        ];
        await Package.insertMany(packages);
        console.log('🎒 Sample packages created');

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();