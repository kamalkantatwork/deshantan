require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Destination = require('./models/Destination');
const Package = require('./models/Package');
const Guide = require('./models/Guide');
const Alert = require('./models/Alert');
const Eatery = require('./models/Eatery');
const Stay = require('./models/Stay');

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Destination.deleteMany({});
        await Package.deleteMany({});
        await Guide.deleteMany({});
        await Alert.deleteMany({});
        await Eatery.deleteMany({});
        await Stay.deleteMany({});
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

        // Sample destinations (mainstream + off-beat)
        const destinations = [
            {
                name: 'Taj Mahal',
                location: 'Agra, Uttar Pradesh',
                state: 'Uttar Pradesh',
                description: 'One of the Seven Wonders of the World, a symbol of eternal love.',
                price: 2999,
                imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600',
                rating: 4.9,
                category: 'historical',
                isPopular: true,
                crowdLevel: 'very_high'
            },
            {
                name: 'Jaipur City Palace',
                location: 'Jaipur, Rajasthan',
                state: 'Rajasthan',
                description: 'A magnificent palace complex in the heart of the Pink City.',
                price: 3999,
                imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
                rating: 4.7,
                category: 'historical',
                isPopular: true,
                crowdLevel: 'high'
            },
            {
                name: 'Kerala Backwaters',
                location: 'Alleppey, Kerala',
                state: 'Kerala',
                description: 'Cruise through the serene backwaters of God\'s Own Country.',
                price: 4499,
                imageUrl: 'https://images.unsplash.com/photo-1598620665575-66b8d6ec8a9d?w=600',
                rating: 4.8,
                category: 'nature',
                isPopular: true,
                crowdLevel: 'high'
            },
            {
                name: 'Varanasi Ghats',
                location: 'Varanasi, Uttar Pradesh',
                state: 'Uttar Pradesh',
                description: 'Experience the spiritual heart of India on the banks of Ganges.',
                price: 2499,
                imageUrl: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600',
                rating: 4.6,
                category: 'spiritual',
                isPopular: true,
                crowdLevel: 'high'
            },
            {
                name: 'Goa Beaches',
                location: 'Goa',
                state: 'Goa',
                description: 'Sun, sand, and sea - India\'s most vibrant beach destination.',
                price: 3499,
                imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
                rating: 4.5,
                category: 'beach',
                isPopular: true,
                crowdLevel: 'very_high'
            },
            {
                name: 'Himalayan Trekking',
                location: 'Manali, Himachal Pradesh',
                state: 'Himachal Pradesh',
                description: 'Trek through the majestic Himalayas with breathtaking views.',
                price: 5499,
                imageUrl: 'https://images.unsplash.com/photo-1532009324734-20f7f581ca4b?w=600',
                rating: 4.8,
                category: 'adventure',
                isPopular: true,
                crowdLevel: 'moderate'
            },
            // --- Off-beat / hidden-gem destinations ---
            {
                name: 'Dzukou Valley',
                location: 'Kohima, Nagaland',
                state: 'Nagaland',
                description: 'A remote, flower-carpeted valley on the Nagaland-Manipur border, virtually untouched by mass tourism.',
                price: 3200,
                imageUrl: 'https://images.unsplash.com/photo-1600100397608-f83a9ea62d2f?w=600',
                rating: 4.7,
                category: 'nature',
                isOffbeat: true,
                crowdLevel: 'very_low',
                offbeatTag: 'Hidden Valley'
            },
            {
                name: 'Majuli Island',
                location: 'Majuli, Assam',
                state: 'Assam',
                description: 'The world\'s largest river island, home to centuries-old Vaishnavite monasteries and mask-making villages.',
                price: 2800,
                imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=600',
                rating: 4.6,
                category: 'heritage',
                isOffbeat: true,
                crowdLevel: 'very_low',
                offbeatTag: 'River Island Culture'
            },
            {
                name: 'Gandikota',
                location: 'Kadapa, Andhra Pradesh',
                state: 'Andhra Pradesh',
                description: 'Known as the "Grand Canyon of India" — a dramatic gorge carved by the Pennar river, rarely crowded.',
                price: 2200,
                imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600',
                rating: 4.5,
                category: 'nature',
                isOffbeat: true,
                crowdLevel: 'low',
                offbeatTag: 'Canyon Country'
            }
        ];
        await Destination.insertMany(destinations);
        console.log('🏔️ Sample destinations created (incl. off-beat)');

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

        // Sample verified guides
        const guides = [
            {
                name: 'Arjun Verma',
                email: 'arjun.guide@example.com',
                phone: '+91 98111 22334',
                city: 'Agra',
                state: 'Uttar Pradesh',
                bio: 'Government-licensed heritage guide with 8 years showing travelers the real Agra beyond the Taj.',
                photo: 'https://ui-avatars.com/api/?name=Arjun+Verma&background=667eea&color=fff&size=200',
                languages: ['English', 'Hindi', 'French'],
                specialties: ['historical', 'photography tours'],
                pricePerDay: 1800,
                yearsExperience: 8,
                rating: 4.9,
                reviewCount: 214,
                verificationStatus: 'verified',
                idProofType: 'aadhaar',
                govtLicenseNumber: 'UP-GUIDE-2291',
                verifiedAt: new Date(),
                verifiedBy: 'Deshantan Team'
            },
            {
                name: 'Lena Fernandes',
                email: 'lena.guide@example.com',
                phone: '+91 98222 33445',
                city: 'Goa',
                state: 'Goa',
                bio: 'Local Goan guide specializing in off-beat beaches, Portuguese heritage walks and food trails.',
                photo: 'https://ui-avatars.com/api/?name=Lena+Fernandes&background=f5576c&color=fff&size=200',
                languages: ['English', 'Konkani', 'Portuguese'],
                specialties: ['beach', 'food tours'],
                pricePerDay: 1600,
                yearsExperience: 5,
                rating: 4.8,
                reviewCount: 132,
                verificationStatus: 'verified',
                idProofType: 'passport',
                govtLicenseNumber: 'GA-GUIDE-0871',
                verifiedAt: new Date(),
                verifiedBy: 'Deshantan Team'
            },
            {
                name: 'Tenzin Dorjee',
                email: 'tenzin.guide@example.com',
                phone: '+91 98333 44556',
                city: 'Manali',
                state: 'Himachal Pradesh',
                bio: 'Certified trekking guide and wilderness first-responder for high-altitude Himalayan routes.',
                photo: 'https://ui-avatars.com/api/?name=Tenzin+Dorjee&background=764ba2&color=fff&size=200',
                languages: ['English', 'Hindi', 'Tibetan'],
                specialties: ['adventure', 'trekking'],
                pricePerDay: 2200,
                yearsExperience: 10,
                rating: 5.0,
                reviewCount: 98,
                verificationStatus: 'verified',
                idProofType: 'aadhaar',
                govtLicenseNumber: 'HP-GUIDE-4432',
                verifiedAt: new Date(),
                verifiedBy: 'Deshantan Team'
            },
            {
                name: 'Ravi Kumar',
                phone: '+91 98444 55667',
                city: 'Varanasi',
                state: 'Uttar Pradesh',
                bio: 'New to the platform — profile under review.',
                languages: ['Hindi'],
                specialties: ['spiritual'],
                pricePerDay: 1200,
                yearsExperience: 1,
                verificationStatus: 'pending'
            }
        ];
        await Guide.insertMany(guides);
        console.log('🧭 Sample verified guides created');

        // Sample hygiene-rated eateries
        const eateries = [
            {
                name: 'Pandit Pakodewala',
                city: 'Agra',
                state: 'Uttar Pradesh',
                address: 'Sadar Bazaar, Agra',
                cuisine: ['Street Food', 'North Indian'],
                priceRange: 'budget',
                imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
                hygieneRating: 4.5,
                hygieneSource: 'fssai',
                fssaiLicenseNumber: '11221334000123',
                lastInspectedAt: new Date(),
                tasteRating: 4.8,
                reviewCount: 340,
                isVerified: true
            },
            {
                name: 'Goan Fish Curry House',
                city: 'Goa',
                state: 'Goa',
                address: 'Calangute Beach Road',
                cuisine: ['Goan', 'Seafood'],
                priceRange: 'mid-range',
                imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
                hygieneRating: 4.2,
                hygieneSource: 'deshantan_inspection',
                lastInspectedAt: new Date(),
                tasteRating: 4.6,
                reviewCount: 210,
                isVerified: true
            },
            {
                name: 'Roadside Dhaba No. 7',
                city: 'Manali',
                state: 'Himachal Pradesh',
                address: 'Old Manali Road',
                cuisine: ['North Indian', 'Tibetan'],
                priceRange: 'budget',
                imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
                hygieneRating: 2.5,
                hygieneSource: 'crowdsourced',
                tasteRating: 4.0,
                reviewCount: 58,
                isVerified: false
            },
            {
                name: 'Ganga View Kitchen',
                city: 'Varanasi',
                state: 'Uttar Pradesh',
                address: 'Assi Ghat',
                cuisine: ['North Indian', 'Vegetarian'],
                priceRange: 'budget',
                imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
                hygieneRating: 4.0,
                hygieneSource: 'fssai',
                fssaiLicenseNumber: '11221334000456',
                lastInspectedAt: new Date(),
                tasteRating: 4.3,
                reviewCount: 176,
                isVerified: true
            }
        ];
        await Eatery.insertMany(eateries);
        console.log('🍽️ Sample hygiene-rated eateries created');

        // Sample commission-free stays (direct listings)
        const stays = [
            {
                name: 'Sharma Homestay',
                type: 'homestay',
                city: 'Agra',
                state: 'Uttar Pradesh',
                address: 'Near Taj East Gate, Agra',
                description: 'Family-run homestay 5 minutes from the Taj Mahal, home-cooked meals included.',
                imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
                pricePerNight: 1400,
                amenities: ['Free Wi-Fi', 'Home-cooked meals', 'Rooftop Taj view'],
                maxGuests: 3,
                rating: 4.8,
                reviewCount: 76,
                ownerName: 'Meena Sharma',
                ownerPhone: '+91 97001 22334',
                isVerified: true
            },
            {
                name: 'Beira Mar Guest House',
                type: 'guesthouse',
                city: 'Goa',
                state: 'Goa',
                address: 'Anjuna, North Goa',
                description: 'Small independently-run guesthouse two minutes' + "'" + ' walk from Anjuna beach.',
                imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600',
                pricePerNight: 1800,
                amenities: ['Free Wi-Fi', 'Bike rental', 'Garden cafe'],
                maxGuests: 2,
                rating: 4.6,
                reviewCount: 54,
                ownerName: 'Joaquim D\'Souza',
                ownerPhone: '+91 97002 33445',
                isVerified: true
            },
            {
                name: 'Mountain Nest Homestay',
                type: 'homestay',
                city: 'Manali',
                state: 'Himachal Pradesh',
                address: 'Old Manali',
                description: 'Cozy wooden homestay run by a local family, apple orchard views, bonfire evenings.',
                imageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600',
                pricePerNight: 1100,
                amenities: ['Bonfire', 'Home-cooked meals', 'Mountain views'],
                maxGuests: 4,
                rating: 4.9,
                reviewCount: 91,
                ownerName: 'Deepak Thakur',
                ownerPhone: '+91 97003 44556',
                isVerified: true
            }
        ];
        await Stay.insertMany(stays);
        console.log('🏠 Sample commission-free stays created');

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
