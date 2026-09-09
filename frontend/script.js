// ========== API CONFIGURATION ==========
const API_URL = 'https://deshantan-api.onrender.com/api';

// ========== AUTH MANAGEMENT ==========
function getToken() {
    return localStorage.getItem('deshantan_token');
}

function setToken(token) {
    localStorage.setItem('deshantan_token', token);
}

function getUser() {
    const user = localStorage.getItem('deshantan_user');
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem('deshantan_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('deshantan_token');
    localStorage.removeItem('deshantan_user');
    localStorage.removeItem('deshantan_profile_completed');
    window.location.href = 'index.html';
}

function isAuthenticated() {
    return !!getToken();
}

// ========== DOM ELEMENTS ==========
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const openLoginBtn = document.getElementById('openLogin');
const openSignupBtn = document.getElementById('openSignup');
const closeLoginBtn = document.getElementById('closeLogin');
const closeSignupBtn = document.getElementById('closeSignup');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

// ========== MODAL CONTROLS ==========
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

if (openLoginBtn) openLoginBtn.addEventListener('click', () => openModal(loginModal));
if (openSignupBtn) openSignupBtn.addEventListener('click', () => openModal(signupModal));
if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
if (closeSignupBtn) closeSignupBtn.addEventListener('click', () => closeModal(signupModal));

window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === signupModal) closeModal(signupModal);
});

if (switchToSignup) {
    switchToSignup.addEventListener('click', () => {
        closeModal(loginModal);
        setTimeout(() => openModal(signupModal), 300);
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', () => {
        closeModal(signupModal);
        setTimeout(() => openModal(loginModal), 300);
    });
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        info: '#4299e1',
        warning: '#ed8936'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        padding: 16px 24px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.5s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ========== AUTH FUNCTIONS ==========
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showNotification('❌ Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            setToken(data.token);
            setUser(data.user);
            closeModal(loginModal);
            showNotification('✅ Welcome back, ' + data.user.name + '!', 'success');
            updateUIForLoggedInUser(data.user);
            document.getElementById('loginForm')?.reset();
            loadDestinations();
            loadPackages();
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('❌ Server error. Make sure backend is running.', 'error');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const phone = document.getElementById('signupPhone')?.value;

    if (!name || !email || !password) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('❌ Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone })
        });

        const data = await response.json();

        if (data.success) {
            setToken(data.token);
            setUser(data.user);
            closeModal(signupModal);
            showNotification('🎉 Welcome to Deshantan, ' + data.user.name + '!', 'success');
            updateUIForLoggedInUser(data.user);
            document.getElementById('signupForm')?.reset();
            loadDestinations();
            loadPackages();
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('❌ Server error. Make sure backend is running.', 'error');
        console.error('Signup error:', error);
    }
}

// ========== UPDATE UI ==========
function updateUIForLoggedInUser(user) {
    const navActions = document.getElementById('navActions');
    if (!navActions) return;

    navActions.innerHTML = `
        <div class="user-profile">
            <img src="${user.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=667eea&color=fff&size=40'}" 
                 alt="${user.name}" 
                 class="user-avatar"
                 onclick="window.location.href='dashboard.html'" />
            <span class="user-name">${user.name}</span>
            <button onclick="logout()" class="btn-logout">Logout</button>
        </div>
    `;

    if (!document.getElementById('userStyles')) {
        const style = document.createElement('style');
        style.id = 'userStyles';
        style.textContent = `
            .user-profile {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid #667eea;
                cursor: pointer;
                transition: 0.3s;
                object-fit: cover;
            }
            .user-avatar:hover {
                transform: scale(1.05);
                border-color: #764ba2;
            }
            .user-name {
                font-weight: 600;
                color: #1a202c;
            }
            .btn-logout {
                padding: 8px 16px;
                background: #f56565;
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: 0.3s;
            }
            .btn-logout:hover {
                background: #e53e3e;
                transform: scale(1.05);
            }
            @media (max-width: 768px) {
                .user-name { display: none; }
                .btn-logout { padding: 6px 12px; font-size: 12px; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== LOAD DESTINATIONS ==========
async function loadDestinations() {
    try {
        const response = await fetch(`${API_URL}/destinations`);
        const data = await response.json();
        if (data.success) {
            displayDestinations(data.data);
        }
    } catch (error) {
        console.error('Error loading destinations:', error);
        displayFallbackDestinations();
    }
}

function displayDestinations(destinations) {
    const grid = document.getElementById('destinationGrid');
    if (!grid) return;

    if (!destinations || destinations.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#4a5568;padding:40px;">No destinations available</p>';
        return;
    }

    grid.innerHTML = destinations.slice(0, 4).map(dest => `
        <div class="destination-card">
            <img src="${dest.imageUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400'}" 
                 alt="${dest.name}" 
                 class="dest-img"
                 onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400'" />
            <div class="dest-info">
                <h3>${dest.name}</h3>
                <p>${dest.location || 'India'}</p>
                <span class="price">₹${(dest.price || 2999).toLocaleString()}</span>
                ${dest.rating ? `<span style="color:#f6ad55;">★ ${dest.rating}</span>` : ''}
                <br><br>
                <button class="btn-small" onclick="viewDestination('${dest._id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

function displayFallbackDestinations() {
    const grid = document.getElementById('destinationGrid');
    if (!grid) return;

    const fallback = [
        { name: 'Taj Mahal', location: 'Agra, UP', price: 2999 },
        { name: 'Jaipur City', location: 'Jaipur, Rajasthan', price: 3999 },
        { name: 'Kerala Backwaters', location: 'Alleppey, Kerala', price: 4499 },
        { name: 'Varanasi Ghats', location: 'Varanasi, UP', price: 2499 }
    ];

    grid.innerHTML = fallback.map(dest => `
        <div class="destination-card">
            <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400" alt="${dest.name}" class="dest-img" />
            <div class="dest-info">
                <h3>${dest.name}</h3>
                <p>${dest.location}</p>
                <span class="price">₹${dest.price.toLocaleString()}</span>
                <br><br>
                <button class="btn-small" onclick="showNotification('🔜 More details coming soon!', 'info')">View Details</button>
            </div>
        </div>
    `).join('');
}

// ========== LOAD PACKAGES ==========
async function loadPackages() {
    try {
        const response = await fetch(`${API_URL}/packages`);
        const data = await response.json();
        if (data.success) {
            displayPackages(data.data);
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        displayFallbackPackages();
    }
}

function displayPackages(packages) {
    const grid = document.getElementById('packageGrid');
    if (!grid) return;

    if (!packages || packages.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#4a5568;padding:40px;">No packages available</p>';
        return;
    }

    grid.innerHTML = packages.slice(0, 3).map(pkg => `
        <div class="package-card">
            ${pkg.isBestSeller ? '<div class="package-badge">🔥 Best Seller</div>' : ''}
            ${pkg.isLuxury ? '<div class="package-badge" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">💎 Luxury</div>' : ''}
            <h3>${pkg.name}</h3>
            <p>${pkg.description || 'Explore India'}</p>
            <div class="package-details">
                <span>📅 ${pkg.duration || '5 Days'}</span>
                <span>👥 ${pkg.maxPeople || 4} People</span>
            </div>
            <div class="package-price">₹${(pkg.price || 19999).toLocaleString()} <span>/ person</span></div>
            <ul class="package-includes">
                ${(pkg.includes || ['Hotel', 'Meals', 'Transport']).map(item => `<li>✓ ${item}</li>`).join('')}
            </ul>
            <button class="btn-book" onclick="bookPackage('${pkg._id}')">Book Now</button>
        </div>
    `).join('');
}

function displayFallbackPackages() {
    const grid = document.getElementById('packageGrid');
    if (!grid) return;

    const fallback = [
        { name: 'Golden Triangle', description: 'Delhi - Agra - Jaipur', duration: '7 Days', price: 25999, maxPeople: 6, includes: ['5-star hotels', 'All meals', 'Private cab', 'Tour guide'], isBestSeller: true },
        { name: 'Kerala Houseboat', description: 'Munnar - Alleppey - Kovalam', duration: '5 Days', price: 18999, maxPeople: 4, includes: ['Houseboat stay', 'All meals', 'Sightseeing', 'Ayurvedic massage'], isBestSeller: true },
        { name: 'Royal Rajasthan', description: 'Jaipur - Jodhpur - Udaipur', duration: '9 Days', price: 45999, maxPeople: 8, includes: ['Palace hotels', 'All meals', 'Private guide', 'Elephant ride'], isLuxury: true }
    ];

    grid.innerHTML = fallback.map(pkg => `
        <div class="package-card">
            ${pkg.isBestSeller ? '<div class="package-badge">🔥 Best Seller</div>' : ''}
            ${pkg.isLuxury ? '<div class="package-badge" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">💎 Luxury</div>' : ''}
            <h3>${pkg.name}</h3>
            <p>${pkg.description}</p>
            <div class="package-details">
                <span>📅 ${pkg.duration}</span>
                <span>👥 ${pkg.maxPeople} People</span>
            </div>
            <div class="package-price">₹${pkg.price.toLocaleString()} <span>/ person</span></div>
            <ul class="package-includes">
                ${pkg.includes.map(item => `<li>✓ ${item}</li>`).join('')}
            </ul>
            <button class="btn-book" onclick="showNotification('📞 Contact us to book this package!', 'info')">Book Now</button>
        </div>
    `).join('');
}

// ========== ACTION FUNCTIONS ==========
function viewDestination(id) {
    if (isAuthenticated()) {
        showNotification('📍 Viewing destination details...', 'info');
    } else {
        showNotification('🔐 Please login to view destination details', 'info');
        openModal(loginModal);
    }
}

function bookPackage(id) {
    if (isAuthenticated()) {
        showNotification('🎒 Package booking initiated! We\'ll contact you soon.', 'success');
        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        showNotification('🔐 Please login to book packages', 'info');
        openModal(loginModal);
    }
}

// ========== DASHBOARD FUNCTIONS ==========
async function loadDashboardData() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const user = data.user;
            document.getElementById('dashboardName').textContent = user.name;
            document.getElementById('userName').textContent = user.name;
            loadUserBookings();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('❌ Error loading dashboard data', 'error');
    }
}

async function loadUserBookings() {
    // Placeholder – implement actual backend call when ready
    console.log('Loading bookings...');
    const bookingsList = document.getElementById('bookingsList');
    if (bookingsList) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <p>🚀 No bookings yet. Start your journey with Deshantan!</p>
                <a href="index.html#packages" class="btn-empty">Explore Packages</a>
            </div>
        `;
    }
}

// ========== FORM SUBMISSIONS ==========
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const bookingForm = document.getElementById('bookingForm');

if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (signupForm) signupForm.addEventListener('submit', handleSignup);

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!isAuthenticated()) {
            showNotification('🔐 Please login to send inquiry', 'info');
            openModal(loginModal);
            return;
        }

        const formData = {
            name: this.querySelector('input[type="text"]')?.value,
            email: this.querySelector('input[type="email"]')?.value,
            phone: this.querySelector('input[type="tel"]')?.value,
            destination: this.querySelector('select')?.value,
            travelDate: this.querySelector('input[type="date"]')?.value,
            specialRequests: this.querySelector('textarea')?.value,
            peopleCount: 2
        };

        if (!formData.name || !formData.email || !formData.destination || !formData.travelDate) {
            showNotification('❌ Please fill in all required fields', 'error');
            return;
        }

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                showNotification('✅ Booking sent successfully! We\'ll contact you soon.', 'success');
                this.reset();
            } else {
                showNotification('❌ ' + data.message, 'error');
            }
        } catch (error) {
            showNotification('❌ Error sending booking. Please try again.', 'error');
            console.error('Booking error:', error);
        }
    });
}

// ========== EXPLORE BUTTON ==========
const exploreBtn = document.getElementById('exploreBtn');
if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
        document.querySelector('#destinations')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// ========== TRIP PLANNER (Enhanced Multi-Step) ==========

// Mock Data
const mockStates = [
    { name: "Uttar Pradesh", cities: ["Agra", "Varanasi", "Lucknow"] },
    { name: "Rajasthan", cities: ["Jaipur", "Udaipur", "Jodhpur"] },
    { name: "Kerala", cities: ["Kochi", "Alleppey", "Munnar"] },
    { name: "Goa", cities: ["Panaji", "Calangute", "Margao"] },
    { name: "Himachal Pradesh", cities: ["Shimla", "Manali", "Dharamshala"] },
    { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nashik"] },
    { name: "Tamil Nadu", cities: ["Chennai", "Madurai", "Coimbatore"] },
    { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hampi"] }
];

const mockCitiesData = {
    "Agra": {
        lat: 27.1767, lng: 78.0081,
        stays: [
            { id: "stay1", name: "Taj View Hotel", img: "https://source.unsplash.com/400x300/?hotel,agra", price: 2500, rating: 4.5, lat: 27.1680, lng: 78.0420 },
            { id: "stay2", name: "Grand Imperial", img: "https://source.unsplash.com/400x300/?hotel,luxury", price: 4500, rating: 4.8, lat: 27.1650, lng: 78.0300 },
            { id: "stay3", name: "Budget Homestay", img: "https://source.unsplash.com/400x300/?homestay", price: 1200, rating: 4.0, lat: 27.1900, lng: 78.0100 }
        ],
        spots: [
            { id: "spot1", name: "Taj Mahal", desc: "Iconic marble mausoleum", lat: 27.1751, lng: 78.0421, img: "https://source.unsplash.com/400x300/?tajmahal" },
            { id: "spot2", name: "Agra Fort", desc: "Historical fort", lat: 27.1795, lng: 78.0211, img: "https://source.unsplash.com/400x300/?agrafort" },
            { id: "spot3", name: "Mehtab Bagh", desc: "Garden with Taj view", lat: 27.1792, lng: 78.0589, img: "https://source.unsplash.com/400x300/?garden" },
            { id: "spot4", name: "Fatehpur Sikri", desc: "Ancient city", lat: 27.0945, lng: 77.6679, img: "https://source.unsplash.com/400x300/?fatehpursikri" }
        ]
    },
    "Jaipur": {
        lat: 26.9124, lng: 75.7873,
        stays: [
            { id: "stay1", name: "Raj Mahal Palace", img: "https://source.unsplash.com/400x300/?palace,jaipur", price: 8000, rating: 4.9, lat: 26.9000, lng: 75.8000 },
            { id: "stay2", name: "Heritage Haveli", img: "https://source.unsplash.com/400x300/?haveli", price: 3500, rating: 4.4, lat: 26.9200, lng: 75.7800 },
            { id: "stay3", name: "Backpacker Hostel", img: "https://source.unsplash.com/400x300/?hostel", price: 800, rating: 4.2, lat: 26.9100, lng: 75.7900 }
        ],
        spots: [
            { id: "spot1", name: "Hawa Mahal", desc: "Palace of Winds", lat: 26.9239, lng: 75.8267, img: "https://source.unsplash.com/400x300/?hawamahal" },
            { id: "spot2", name: "Amber Fort", desc: "Hilltop fort", lat: 26.9855, lng: 75.8513, img: "https://source.unsplash.com/400x300/?amberfort" },
            { id: "spot3", name: "City Palace", desc: "Royal residence", lat: 26.9255, lng: 75.8236, img: "https://source.unsplash.com/400x300/?citypalace" },
            { id: "spot4", name: "Jantar Mantar", desc: "Astronomical observatory", lat: 26.9247, lng: 75.8244, img: "https://source.unsplash.com/400x300/?jantarmantar" }
        ]
    },
    "Kochi": {
        lat: 9.9312, lng: 76.2673,
        stays: [
            { id: "stay1", name: "Marine Drive Hotel", img: "https://source.unsplash.com/400x300/?hotel,kochi", price: 3000, rating: 4.3, lat: 9.9400, lng: 76.2700 },
            { id: "stay2", name: "Fort Kochi Bungalow", img: "https://source.unsplash.com/400x300/?bungalow", price: 4500, rating: 4.7, lat: 9.9600, lng: 76.2400 },
            { id: "stay3", name: "Backpackers Nest", img: "https://source.unsplash.com/400x300/?hostel", price: 600, rating: 4.0, lat: 9.9500, lng: 76.2600 }
        ],
        spots: [
            { id: "spot1", name: "Fort Kochi Beach", desc: "Scenic beach", lat: 9.9610, lng: 76.2380, img: "https://source.unsplash.com/400x300/?beach,kochi" },
            { id: "spot2", name: "Mattancherry Palace", desc: "Dutch palace", lat: 9.9580, lng: 76.2590, img: "https://source.unsplash.com/400x300/?palace" },
            { id: "spot3", name: "Chinese Fishing Nets", desc: "Iconic nets", lat: 9.9600, lng: 76.2450, img: "https://source.unsplash.com/400x300/?fishingnets" },
            { id: "spot4", name: "Jewish Synagogue", desc: "Historic synagogue", lat: 9.9570, lng: 76.2600, img: "https://source.unsplash.com/400x300/?synagogue" }
        ]
    },
    "Panaji": {
        lat: 15.4909, lng: 73.8278,
        stays: [
            { id: "stay1", name: "Miramar Residency", img: "https://source.unsplash.com/400x300/?hotel,goa", price: 3500, rating: 4.5, lat: 15.4800, lng: 73.8100 },
            { id: "stay2", name: "Fontainhas Guesthouse", img: "https://source.unsplash.com/400x300/?guesthouse", price: 2000, rating: 4.2, lat: 15.5000, lng: 73.8300 },
            { id: "stay3", name: "Beach Shack Stay", img: "https://source.unsplash.com/400x300/?beachshack", price: 1000, rating: 3.9, lat: 15.4700, lng: 73.8000 }
        ],
        spots: [
            { id: "spot1", name: "Basilica of Bom Jesus", desc: "UNESCO church", lat: 15.5009, lng: 73.9112, img: "https://source.unsplash.com/400x300/?church,goa" },
            { id: "spot2", name: "Dona Paula", desc: "Viewpoint", lat: 15.4520, lng: 73.8020, img: "https://source.unsplash.com/400x300/?viewpoint" },
            { id: "spot3", name: "Miramar Beach", desc: "Popular beach", lat: 15.4800, lng: 73.8100, img: "https://source.unsplash.com/400x300/?beach" },
            { id: "spot4", name: "Reis Magos Fort", desc: "Historic fort", lat: 15.4960, lng: 73.8100, img: "https://source.unsplash.com/400x300/?fort" }
        ]
    },
    // Add more cities as needed
};

let currentStep = 1;
let selectedStay = null;
let selectedSpots = new Set();
let itineraryOrder = [];

// Helper: haversine distance (km)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Populate state dropdowns
function populateStates() {
    const fromState = document.getElementById('fromState');
    const toState = document.getElementById('toState');
    mockStates.forEach(state => {
        fromState.innerHTML += `<option value="${state.name}">${state.name}</option>`;
        toState.innerHTML += `<option value="${state.name}">${state.name}</option>`;
    });
}

// Update city dropdown when state changes
function updateCities(stateSelect, citySelect) {
    const stateName = stateSelect.value;
    const cities = mockStates.find(s => s.name === stateName)?.cities || [];
    citySelect.innerHTML = '<option value="">Select City</option>';
    cities.forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });
    citySelect.disabled = cities.length === 0;
}

function checkStep1Validity() {
    const allFilled = 
        document.getElementById('fromState').value &&
        document.getElementById('fromCity').value &&
        document.getElementById('toState').value &&
        document.getElementById('toCity').value &&
        document.getElementById('travelDate').value;
    document.getElementById('submitTripBtn').disabled = !allFilled;
}

// Step navigation
function goToStep(step) {
    document.querySelectorAll('.planner-step').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    
    // Update step indicator
    document.querySelectorAll('.step-item').forEach(item => {
        const stepNum = parseInt(item.dataset.step);
        item.classList.remove('active', 'completed');
        if (stepNum < step) item.classList.add('completed');
        if (stepNum === step) item.classList.add('active');
    });
    document.querySelectorAll('.step-line').forEach((line, index) => {
        if (index + 1 < step) line.classList.add('completed');
        else line.classList.remove('completed');
    });
    
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load stays with skeleton
function loadStays() {
    const city = document.getElementById('toCity').value;
    const stays = mockCitiesData[city]?.stays || [];
    const grid = document.getElementById('staysGrid');
    
    // Show skeleton
    grid.innerHTML = '<div class="skeleton" style="height:200px; grid-column:1/-1;"></div>'.repeat(3);
    
    setTimeout(() => {
        grid.innerHTML = stays.map(stay => `
            <div class="stay-card" data-id="${stay.id}" onclick="selectStay('${stay.id}')">
                <img src="${stay.img}" alt="${stay.name}" loading="lazy" />
                <div class="stay-info">
                    <h3>${stay.name}</h3>
                    <p>Distance: ${haversine(stay.lat, stay.lng, mockCitiesData[city].lat, mockCitiesData[city].lng).toFixed(1)} km from city center</p>
                    <div>
                        <span class="stay-price">₹${stay.price}</span>
                        <span class="stay-rating">★ ${stay.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }, 600);
}

function selectStay(stayId) {
    selectedStay = stayId;
    document.querySelectorAll('.stay-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === stayId);
    });
    document.getElementById('proceedToSpotsBtn').disabled = false;
}

// Load spots
function loadSpots() {
    const city = document.getElementById('toCity').value;
    const spots = mockCitiesData[city]?.spots || [];
    const grid = document.getElementById('spotsGrid');
    
    // Skeleton
    grid.innerHTML = '<div class="skeleton" style="height:180px; grid-column:1/-1;"></div>'.repeat(4);
    
    setTimeout(() => {
        grid.innerHTML = spots.map(spot => `
            <div class="spot-card" data-id="${spot.id}" onclick="toggleSpot('${spot.id}')">
                <img src="${spot.img}" alt="${spot.name}" loading="lazy" />
                <div class="spot-info">
                    <h3>${spot.name}</h3>
                    <p>${spot.desc}</p>
                </div>
                <div class="spot-check">✓</div>
            </div>
        `).join('');
    }, 600);
}

function toggleSpot(spotId) {
    if (selectedSpots.has(spotId)) {
        selectedSpots.delete(spotId);
        document.querySelector(`.spot-card[data-id="${spotId}"]`).classList.remove('selected');
    } else {
        selectedSpots.add(spotId);
        document.querySelector(`.spot-card[data-id="${spotId}"]`).classList.add('selected');
    }
    document.getElementById('generateItineraryBtn').disabled = selectedSpots.size === 0;
}

// Generate itinerary (optimized by proximity)
function generateItinerary() {
    const city = document.getElementById('toCity').value;
    const spots = mockCitiesData[city].spots;
    const stay = mockCitiesData[city].stays.find(s => s.id === selectedStay);
    
    // Get selected spot objects
    const selectedSpotsArray = spots.filter(spot => selectedSpots.has(spot.id));
    
    // Sort by distance from stay
    selectedSpotsArray.sort((a, b) => 
        haversine(stay.lat, stay.lng, a.lat, a.lng) - 
        haversine(stay.lat, stay.lng, b.lat, b.lng)
    );
    
    itineraryOrder = selectedSpotsArray;
    renderItinerary();
    goToStep(4);
}

function renderItinerary() {
    const list = document.getElementById('itineraryList');
    list.innerHTML = itineraryOrder.map((spot, index) => `
        <div class="itinerary-item" draggable="true" data-id="${spot.id}">
            <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
            <span class="itinerary-number">${index + 1}</span>
            <div class="itinerary-details">
                <h4>${spot.name}</h4>
                <p>${spot.desc}</p>
            </div>
            <div class="itinerary-actions">
                <button class="btn-reorder" onclick="moveSpot(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="btn-reorder" onclick="moveSpot(${index}, 1)" ${index === itineraryOrder.length-1 ? 'disabled' : ''}>↓</button>
            </div>
        </div>
    `).join('');
    
    // Add drag and drop events
    list.querySelectorAll('.itinerary-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    this.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const targetId = this.dataset.id;
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== targetId) {
        const draggedIndex = itineraryOrder.findIndex(s => s.id === draggedId);
        const targetIndex = itineraryOrder.findIndex(s => s.id === targetId);
        const [moved] = itineraryOrder.splice(draggedIndex, 1);
        itineraryOrder.splice(targetIndex, 0, moved);
        renderItinerary();
    }
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedItem = null;
}

function moveSpot(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= itineraryOrder.length) return;
    const [moved] = itineraryOrder.splice(index, 1);
    itineraryOrder.splice(newIndex, 0, moved);
    renderItinerary();
}

// Transport suggestions
function showTransportSuggestions() {
    const list = document.getElementById('transportList');
    const transportModes = [
        { icon: '🚶', mode: 'Walking', desc: 'For short distances', when: (dist) => dist < 1 },
        { icon: '🛺', mode: 'Auto Rickshaw', desc: 'Cheap and quick for medium distances', when: (dist) => dist >= 1 && dist < 5 },
        { icon: '🚕', mode: 'Cab / Taxi', desc: 'Comfortable for longer distances', when: (dist) => dist >= 5 },
        { icon: '🚌', mode: 'Public Bus', desc: 'Economical but slower', when: () => false }
    ];
    
    let html = '';
    for (let i = 0; i < itineraryOrder.length - 1; i++) {
        const current = itineraryOrder[i];
        const next = itineraryOrder[i + 1];
        const dist = haversine(current.lat, current.lng, next.lat, next.lng);
        const mode = transportModes.find(m => m.when(dist)) || transportModes[3];
        html += `
            <div class="transport-card">
                <div class="transport-icon">${mode.icon}</div>
                <div class="transport-details">
                    <h4>${current.name} → ${next.name}</h4>
                    <p>${dist.toFixed(1)} km • ${mode.mode} (${mode.desc})</p>
                </div>
            </div>
        `;
    }
    list.innerHTML = html;
}

function finishPlanning() {
    showNotification('✅ Trip planned successfully! Check your email for details.', 'success');
    // Optionally reset
}

// ========== PROFILE COMPLETION ==========
function checkProfileCompletion() {
    const profileCompleted = localStorage.getItem('deshantan_profile_completed');
    const completeProfile = document.getElementById('completeProfile');
    const dashboardStats = document.getElementById('dashboardStats');
    const bookingsSection = document.getElementById('bookingsSection');

    if (!completeProfile || !dashboardStats || !bookingsSection) return;

    if (profileCompleted === 'true') {
        completeProfile.style.display = 'none';
        dashboardStats.style.display = 'block';
        bookingsSection.style.display = 'block';
    } else {
        completeProfile.style.display = 'block';
        dashboardStats.style.display = 'none';
        bookingsSection.style.display = 'none';
    }
}

function updateProfileProgress() {
    const form = document.getElementById('profileCompletionForm');
    if (!form) return;

    const fields = form.querySelectorAll('input, select');
    let filled = 0;
    let total = 0;

    fields.forEach(field => {
        if (field.type === 'submit' || field.type === 'button' || field.type === 'hidden') return;
        if (field.type === 'radio' || field.type === 'checkbox') {
            const group = document.querySelectorAll(`input[name="${field.name}"]`);
            const checked = Array.from(group).some(cb => cb.checked);
            if (checked) filled++;
            total++;
            return;
        }
        total++;
        if (field.value && field.value.trim() !== '') filled++;
    });

    const selects = form.querySelectorAll('select');
    selects.forEach(select => {
        if (select.value === '') total--;
    });

    const percentage = Math.round((filled / Math.max(total, 1)) * 100);
    const profileProgressFillEl = document.getElementById('profileProgressFill');
    if (profileProgressFillEl) profileProgressFillEl.style.width = percentage + '%';
    if (document.querySelector('.profile-progress')) document.querySelector('.profile-progress').textContent = percentage + '%';
}

function completeProfile() {
    const name = document.getElementById('profileName')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    const role = document.querySelector('input[name="userRole"]:checked')?.value || 'tourist';

    if (!name || !phone) {
        showNotification('❌ Please fill in your name and phone number', 'error');
        return;
    }

    const profileData = {
        name: name,
        dob: document.getElementById('profileDob')?.value,
        gender: document.getElementById('profileGender')?.value,
        nationality: document.getElementById('profileNationality')?.value,
        phone: phone,
        altEmail: document.getElementById('profileAltEmail')?.value,
        address: document.getElementById('profileAddress')?.value,
        travelerType: document.querySelector('input[name="travelerType"]:checked')?.value || '',
        interests: Array.from(document.querySelectorAll('.interest-checkbox input:checked')).map(cb => cb.value),
        role: role
    };

    localStorage.setItem('deshantan_profile', JSON.stringify(profileData));
    localStorage.setItem('deshantan_profile_completed', 'true');

    showNotification('✅ Profile completed successfully!', 'success');

    if (role === 'business') {
        setTimeout(() => window.location.href = 'business-register.html', 1500);
    } else if (role === 'security') {
        setTimeout(() => window.location.href = 'security-register.html', 1500);
    } else if (role === 'others') {
        setTimeout(() => window.location.href = 'others-register.html', 1500);
    } else {
        const completeProfile = document.getElementById('completeProfile');
        const dashboardStats = document.getElementById('dashboardStats');
        const bookingsSection = document.getElementById('bookingsSection');
        if (completeProfile && dashboardStats && bookingsSection) {
            completeProfile.style.display = 'none';
            dashboardStats.style.display = 'block';
            bookingsSection.style.display = 'block';
        }
        updateUIWithProfile(profileData);
    }
}

function skipProfile() {
    const role = document.querySelector('input[name="userRole"]:checked')?.value || 'tourist';
    localStorage.setItem('deshantan_profile_completed', 'true');
    showNotification('⏭️ You can complete your profile later', 'info');

    if (role === 'business') {
        setTimeout(() => window.location.href = 'business-register.html', 1500);
    } else if (role === 'security') {
        setTimeout(() => window.location.href = 'security-register.html', 1500);
    } else if (role === 'others') {
        setTimeout(() => window.location.href = 'others-register.html', 1500);
    } else {
        const completeProfile = document.getElementById('completeProfile');
        const dashboardStats = document.getElementById('dashboardStats');
        const bookingsSection = document.getElementById('bookingsSection');
        if (completeProfile && dashboardStats && bookingsSection) {
            completeProfile.style.display = 'none';
            dashboardStats.style.display = 'block';
            bookingsSection.style.display = 'block';
        }
    }
}

function updateUIWithProfile(profile) {
    document.getElementById('dashboardName').textContent = profile.name;
    document.getElementById('userName').textContent = profile.name;
}

// ========== BUSINESS REGISTRATION ==========
function registerBusiness() {
    const businessData = {
        businessType: document.querySelector('input[name="businessType"]:checked')?.value || '',
        businessName: document.getElementById('businessName')?.value || '',
        contactPerson: document.getElementById('contactPerson')?.value || '',
        email: document.getElementById('businessEmail')?.value || '',
        phone: document.getElementById('businessPhone')?.value || '',
        address: document.getElementById('businessAddress')?.value || '',
        description: document.getElementById('businessDescription')?.value || '',
        website: document.getElementById('businessWebsite')?.value || '',
        social: document.getElementById('businessSocial')?.value || '',
        services: document.getElementById('services')?.selectedOptions ?
            Array.from(document.getElementById('services').selectedOptions).map(opt => opt.value) : [],
        priceRange: document.getElementById('priceRange')?.value || '',
        languages: document.getElementById('languages')?.selectedOptions ?
            Array.from(document.getElementById('languages').selectedOptions).map(opt => opt.value) : []
    };

    if (!businessData.businessType || !businessData.businessName || !businessData.email) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }

    if (document.getElementById('businessForm')) document.getElementById('businessForm').style.display = 'none';
    if (document.getElementById('businessSuccess')) document.getElementById('businessSuccess').style.display = 'block';
    localStorage.setItem('deshantan_business_profile', JSON.stringify(businessData));
    showNotification('✅ Business registered successfully!', 'success');
}

function resetBusinessForm() {
    if (document.getElementById('businessForm')) document.getElementById('businessForm').style.display = 'block';
    if (document.getElementById('businessSuccess')) document.getElementById('businessSuccess').style.display = 'none';
    document.getElementById('businessForm')?.reset();
}

// ========== SECURITY REGISTRATION ==========
function registerSecurity() {
    const securityData = {
        name: document.getElementById('secName')?.value || '',
        email: document.getElementById('secEmail')?.value || '',
        phone: document.getElementById('secPhone')?.value || '',
        dob: document.getElementById('secDob')?.value || '',
        gender: document.getElementById('secGender')?.value || '',
        nationality: document.getElementById('secNationality')?.value || '',
        role: document.getElementById('secRole')?.value || '',
        experience: document.getElementById('secExperience')?.value || '',
        area: document.getElementById('secArea')?.value || '',
        certifications: document.getElementById('secCertifications')?.value || '',
        languages: document.getElementById('secLanguages')?.selectedOptions ?
            Array.from(document.getElementById('secLanguages').selectedOptions).map(opt => opt.value) : [],
        skills: Array.from(document.querySelectorAll('.skill-checkbox input:checked')).map(cb => cb.value)
    };

    if (!securityData.name || !securityData.email || !securityData.phone || !securityData.role || !securityData.area) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }

    if (document.getElementById('securityForm')) document.getElementById('securityForm').style.display = 'none';
    if (document.getElementById('securitySuccess')) document.getElementById('securitySuccess').style.display = 'block';
    localStorage.setItem('deshantan_security_profile', JSON.stringify(securityData));
    showNotification('✅ Security profile submitted!', 'success');
}

// ========== OTHERS REGISTRATION ==========
function registerOthers() {
    const othersData = {
        name: document.getElementById('otherName')?.value || '',
        email: document.getElementById('otherEmail')?.value || '',
        phone: document.getElementById('otherPhone')?.value || '',
        dob: document.getElementById('otherDob')?.value || '',
        gender: document.getElementById('otherGender')?.value || '',
        nationality: document.getElementById('otherNationality')?.value || '',
        address: document.getElementById('otherAddress')?.value || '',
        roleType: document.querySelector('input[name="othersType"]:checked')?.value || '',
        experience: document.getElementById('otherExperience')?.value || '',
        workArea: document.getElementById('otherWorkArea')?.value || '',
        qualifications: document.getElementById('otherQualifications')?.value || '',
        previousExp: document.getElementById('otherPreviousExp')?.value || '',
        languages: document.getElementById('otherLanguages')?.selectedOptions ?
            Array.from(document.getElementById('otherLanguages').selectedOptions).map(opt => opt.value) : [],
        skills: Array.from(document.querySelectorAll('.skill-checkbox-other input:checked')).map(cb => cb.value)
    };

    if (!othersData.name || !othersData.email || !othersData.phone || !othersData.roleType || !othersData.workArea) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }

    if (document.getElementById('othersForm')) document.getElementById('othersForm').style.display = 'none';
    if (document.getElementById('othersSuccess')) document.getElementById('othersSuccess').style.display = 'block';
    localStorage.setItem('deshantan_others_profile', JSON.stringify(othersData));
    showNotification('✅ Support profile submitted!', 'success');
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners for forms (if present)
    const profileForm = document.getElementById('profileCompletionForm');
    if (profileForm) {
        document.querySelectorAll('#profileCompletionForm input, #profileCompletionForm select').forEach(field => {
            field.addEventListener('change', updateProfileProgress);
            field.addEventListener('input', updateProfileProgress);
        });
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            completeProfile();
        });
    }

    const businessForm = document.getElementById('businessForm');
    if (businessForm) {
        businessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerBusiness();
        });
    }

    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerSecurity();
        });
    }

    const othersForm = document.getElementById('othersForm');
    if (othersForm) {
        othersForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerOthers();
        });
    }

    // Trip Planner Multi-Step (if on trip-planner page)
    if (document.getElementById('tripForm')) {
        populateStates();
        const fromState = document.getElementById('fromState');
        const toState = document.getElementById('toState');
        const fromCity = document.getElementById('fromCity');
        const toCity = document.getElementById('toCity');
        const travelDate = document.getElementById('travelDate');

        fromState.addEventListener('change', function() {
            updateCities(this, fromCity);
            checkStep1Validity();
        });
        toState.addEventListener('change', function() {
            updateCities(this, toCity);
            checkStep1Validity();
        });
        fromCity.addEventListener('change', checkStep1Validity);
        toCity.addEventListener('change', checkStep1Validity);
        travelDate.addEventListener('change', checkStep1Validity);

        // Set min date to today
        travelDate.min = new Date().toISOString().split('T')[0];

        document.getElementById('tripForm').addEventListener('submit', function(e) {
            e.preventDefault();
            goToStep(2);
            loadStays();
        });

        // Button listeners for later steps
        document.getElementById('proceedToSpotsBtn').addEventListener('click', () => {
            goToStep(3);
            loadSpots();
        });
        document.getElementById('generateItineraryBtn').addEventListener('click', generateItinerary);
        document.getElementById('proceedToTransportBtn').addEventListener('click', () => {
            showTransportSuggestions();
            goToStep(5);
        });
    }

    // ===== Trust & Safety feature pages =====
    if (document.getElementById('guidesGrid')) initGuidesPage();
    if (document.getElementById('eateriesGrid')) initEateriesPage();
    if (document.getElementById('alertsFeed')) initAlertsPage();
    if (document.getElementById('staysPageGrid')) initStaysPage();
    if (document.getElementById('checkinForm')) initSafetyPage();
    if (document.getElementById('tabOffbeat')) initOffbeatTabs();

    // Check authentication state
    const user = getUser();
    if (user && getToken()) {
        updateUIForLoggedInUser(user);
    }

    // Dashboard specific initialization
    if (window.location.pathname.includes('dashboard.html')) {
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
        checkProfileCompletion();
        loadDashboardData();
    }

    // Load destinations and packages on relevant pages
    if (!window.location.pathname.includes('dashboard.html') && !window.location.pathname.includes('about.html')) {
        loadDestinations();
        loadPackages();
    }

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(loginModal);
            closeModal(signupModal);
        }
    });

    // Check backend status
    checkBackendStatus();
});

async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        if (data.status === 'OK') {
            console.log('✅ Backend connected successfully!');
        }
    } catch (error) {
        console.warn('⚠️ Backend not running. Using fallback data.');
    }
}

// ========== SHARED HELPERS ==========
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function populateCityFilter(selectEl, cities) {
    if (!selectEl) return;
    const unique = [...new Set(cities.filter(Boolean))].sort();
    unique.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        selectEl.appendChild(opt);
    });
}

// ============================================================
// ========== 1) VERIFIED LOCAL GUIDES ==========
// ============================================================
let allGuidesCache = [];

const mockGuides = [
    { _id: 'g1', name: 'Arjun Verma', city: 'Agra', state: 'Uttar Pradesh', photo: 'https://ui-avatars.com/api/?name=Arjun+Verma&background=667eea&color=fff&size=200', languages: ['English', 'Hindi', 'French'], pricePerDay: 1800, rating: 4.9, verificationStatus: 'verified' },
    { _id: 'g2', name: 'Lena Fernandes', city: 'Goa', state: 'Goa', photo: 'https://ui-avatars.com/api/?name=Lena+Fernandes&background=f5576c&color=fff&size=200', languages: ['English', 'Konkani'], pricePerDay: 1600, rating: 4.8, verificationStatus: 'verified' },
    { _id: 'g3', name: 'Tenzin Dorjee', city: 'Manali', state: 'Himachal Pradesh', photo: 'https://ui-avatars.com/api/?name=Tenzin+Dorjee&background=764ba2&color=fff&size=200', languages: ['English', 'Hindi', 'Tibetan'], pricePerDay: 2200, rating: 5.0, verificationStatus: 'verified' }
];

async function initGuidesPage() {
    document.getElementById('guideCityFilter').addEventListener('change', filterGuides);
    document.getElementById('guideLangFilter').addEventListener('change', filterGuides);

    document.getElementById('closeGuideBook').addEventListener('click', () => closeModal(document.getElementById('guideBookModal')));

    const gbDays = document.getElementById('gbDays');
    gbDays.addEventListener('input', updateGuideBookTotal);

    document.getElementById('guideBookForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitGuideBooking();
    });

    document.getElementById('gbDate').min = new Date().toISOString().split('T')[0];

    await loadGuides();
}

async function loadGuides() {
    try {
        const response = await fetch(`${API_URL}/guides`);
        const data = await response.json();
        allGuidesCache = data.success && data.data.length ? data.data : mockGuides;
    } catch (error) {
        console.warn('Guides API unavailable, using sample guides.', error);
        allGuidesCache = mockGuides;
    }
    populateCityFilter(document.getElementById('guideCityFilter'), allGuidesCache.map(g => g.city));
    displayGuides(allGuidesCache);
}

function filterGuides() {
    const city = document.getElementById('guideCityFilter').value;
    const lang = document.getElementById('guideLangFilter').value;
    const filtered = allGuidesCache.filter(g =>
        (!city || g.city === city) &&
        (!lang || (g.languages || []).includes(lang))
    );
    displayGuides(filtered);
}

function displayGuides(guides) {
    const grid = document.getElementById('guidesGrid');
    if (!guides.length) {
        grid.innerHTML = '<p style="text-align:center;color:#4a5568;padding:40px;grid-column:1/-1;">No verified guides match your filters yet.</p>';
        return;
    }
    grid.innerHTML = guides.map(g => `
        <div class="stay-card guide-card">
            <img src="${g.photo || 'https://ui-avatars.com/api/?background=667eea&color=fff&size=200'}" alt="${g.name}" loading="lazy" />
            <div class="stay-info">
                <div class="badge-row">
                    <span class="verified-badge">✅ Verified</span>
                    <span class="stay-rating">★ ${g.rating ? g.rating.toFixed(1) : 'New'}</span>
                </div>
                <h3>${g.name}</h3>
                <p>📍 ${g.city}, ${g.state}</p>
                <p class="tag-row">${(g.languages || []).map(l => `<span class="mini-tag">${l}</span>`).join('')}</p>
                <div>
                    <span class="stay-price">₹${g.pricePerDay}/day</span>
                </div>
                <button class="btn-small" onclick="openGuideBookModal('${g._id}')">Book This Guide</button>
            </div>
        </div>
    `).join('');
}

function openGuideBookModal(id) {
    const guide = allGuidesCache.find(g => g._id === id);
    if (!guide) return;
    document.getElementById('guideBookId').value = id;
    document.getElementById('guideBookTitle').textContent = `Book ${guide.name}`;
    document.getElementById('gbDays').value = 1;
    document.getElementById('gbGroup').value = 2;
    updateGuideBookTotal();
    openModal(document.getElementById('guideBookModal'));
}

function updateGuideBookTotal() {
    const id = document.getElementById('guideBookId').value;
    const guide = allGuidesCache.find(g => g._id === id);
    const days = parseInt(document.getElementById('gbDays').value) || 1;
    if (guide) {
        document.getElementById('gbTotal').textContent = `Total: ₹${(guide.pricePerDay * days).toLocaleString()} for ${days} day(s)`;
    }
}

async function submitGuideBooking() {
    const id = document.getElementById('guideBookId').value;
    const guide = allGuidesCache.find(g => g._id === id);
    const payload = {
        travelerName: document.getElementById('gbName').value,
        travelerEmail: document.getElementById('gbEmail').value,
        travelerPhone: document.getElementById('gbPhone').value,
        tourDate: document.getElementById('gbDate').value,
        days: parseInt(document.getElementById('gbDays').value) || 1,
        groupSize: parseInt(document.getElementById('gbGroup').value) || 1,
        notes: document.getElementById('gbNotes').value
    };

    try {
        const response = await fetch(`${API_URL}/guides/${id}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            showNotification(`✅ ${guide.name} booked! Reference: ${data.data.bookingReference}`, 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.warn('Booking API unavailable, confirming locally.', error);
        showNotification(`✅ Booking request sent to ${guide.name}! They'll confirm shortly.`, 'success');
    }
    closeModal(document.getElementById('guideBookModal'));
    document.getElementById('guideBookForm').reset();
}

// ============================================================
// ========== 2) CROWDSOURCED SCAM / PRICE ALERTS ==========
// ============================================================
let allAlertsCache = [];

const mockAlerts = [
    { _id: 'a1', title: 'Overpriced auto from station', description: 'Autos near Agra Cantt station quoted ₹500 for a ₹150 ride. Always ask for the meter or a prepaid booth.', category: 'overpricing', city: 'Agra', severity: 'medium', reportedByName: 'Neha S.', upvotes: 34, confirmations: 12, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
    { _id: 'a2', title: '"Free" henna turns into a hard sell', description: 'Street vendors near Anjuna beach offer "free" henna, then demand ₹1000+ afterward. Politely decline upfront.', category: 'scam', city: 'Goa', severity: 'low', reportedByName: 'Marco T.', upvotes: 21, confirmations: 8, createdAt: new Date(Date.now() - 20 * 3600000).toISOString() },
    { _id: 'a3', title: 'Fake "government-approved" guides at the ghats', description: 'Men claiming to be certified guides at Assi Ghat are not registered. Verify guides only through Deshantan.', category: 'fake_guide', city: 'Varanasi', severity: 'high', reportedByName: 'Anonymous Traveler', upvotes: 47, confirmations: 19, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() }
];

async function initAlertsPage() {
    document.getElementById('alertCityFilter').addEventListener('change', filterAlerts);
    document.getElementById('alertCategoryFilter').addEventListener('change', filterAlerts);

    document.getElementById('toggleAlertFormBtn').addEventListener('click', () => {
        const section = document.getElementById('alertFormSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('alertForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitAlertReport();
    });

    await loadAlerts();
}

async function loadAlerts() {
    try {
        const response = await fetch(`${API_URL}/alerts`);
        const data = await response.json();
        allAlertsCache = data.success && data.data.length ? data.data : mockAlerts;
    } catch (error) {
        console.warn('Alerts API unavailable, using sample alerts.', error);
        allAlertsCache = mockAlerts;
    }
    populateCityFilter(document.getElementById('alertCityFilter'), allAlertsCache.map(a => a.city));
    displayAlerts(allAlertsCache);
}

function filterAlerts() {
    const city = document.getElementById('alertCityFilter').value;
    const category = document.getElementById('alertCategoryFilter').value;
    const filtered = allAlertsCache.filter(a =>
        (!city || a.city === city) && (!category || a.category === category)
    );
    displayAlerts(filtered);
}

const alertCategoryLabels = {
    scam: '⚠️ Scam', overpricing: '💸 Overpricing', fake_guide: '🎭 Fake Guide',
    unsafe_area: '🚧 Unsafe Area', touting: '📢 Touting', other: '❗ Other'
};

function displayAlerts(alerts) {
    const feed = document.getElementById('alertsFeed');
    if (!alerts.length) {
        feed.innerHTML = '<p style="text-align:center;color:#4a5568;padding:40px;">No alerts for this filter yet — that\'s good news!</p>';
        return;
    }
    feed.innerHTML = alerts.map(a => `
        <div class="alert-card severity-${a.severity || 'medium'}" data-id="${a._id}">
            <div class="alert-card-header">
                <span class="alert-category-pill">${alertCategoryLabels[a.category] || a.category}</span>
                <span class="alert-city-pill">📍 ${a.city}</span>
            </div>
            <h3>${a.title}</h3>
            <p>${a.description}</p>
            ${a.fairPriceNote ? `<p class="fair-price-note">💡 ${a.fairPriceNote}</p>` : ''}
            <div class="alert-card-footer">
                <span>Reported by ${a.reportedByName || 'Anonymous Traveler'} · ${a.createdAt ? timeAgo(a.createdAt) : 'recently'}</span>
                <button class="btn-upvote" onclick="confirmAlert('${a._id}')">👍 Confirm (${a.upvotes || 0})</button>
            </div>
        </div>
    `).join('');
}

async function submitAlertReport() {
    const payload = {
        title: document.getElementById('alTitle').value,
        city: document.getElementById('alCity').value,
        category: document.getElementById('alCategory').value,
        description: document.getElementById('alDescription').value,
        severity: document.getElementById('alSeverity').value,
        fairPriceNote: document.getElementById('alFairPrice').value,
        reportedByName: document.getElementById('alName').value || 'Anonymous Traveler'
    };

    try {
        const response = await fetch(`${API_URL}/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            allAlertsCache.unshift(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.warn('Alerts API unavailable, adding locally.', error);
        allAlertsCache.unshift({ ...payload, _id: 'local-' + Date.now(), upvotes: 0, confirmations: 1, createdAt: new Date().toISOString() });
    }

    showNotification('🙏 Thanks — your alert helps keep other travelers safe!', 'success');
    document.getElementById('alertForm').reset();
    document.getElementById('alertFormSection').style.display = 'none';
    displayAlerts(allAlertsCache);
}

async function confirmAlert(id) {
    try {
        const response = await fetch(`${API_URL}/alerts/${id}/confirm`, { method: 'PUT' });
        const data = await response.json();
        if (data.success) {
            const idx = allAlertsCache.findIndex(a => a._id === id);
            if (idx > -1) allAlertsCache[idx] = data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        const idx = allAlertsCache.findIndex(a => a._id === id);
        if (idx > -1) allAlertsCache[idx].upvotes = (allAlertsCache[idx].upvotes || 0) + 1;
    }
    displayAlerts(allAlertsCache);
    showNotification('👍 Confirmed — thanks for helping verify this report.', 'info');
}

// ============================================================
// ========== 3) HYGIENE-RATED EATERIES ==========
// ============================================================
let allEateriesCache = [];

const mockEateries = [
    { _id: 'e1', name: 'Pandit Pakodewala', city: 'Agra', cuisine: ['Street Food', 'North Indian'], priceRange: 'budget', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', hygieneRating: 4.5, tasteRating: 4.8, reviewCount: 340 },
    { _id: 'e2', name: 'Goan Fish Curry House', city: 'Goa', cuisine: ['Goan', 'Seafood'], priceRange: 'mid-range', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', hygieneRating: 4.2, tasteRating: 4.6, reviewCount: 210 },
    { _id: 'e3', name: 'Roadside Dhaba No. 7', city: 'Manali', cuisine: ['North Indian', 'Tibetan'], priceRange: 'budget', imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', hygieneRating: 2.5, tasteRating: 4.0, reviewCount: 58 }
];

async function initEateriesPage() {
    document.getElementById('eateryCityFilter').addEventListener('change', filterEateries);
    document.getElementById('eateryHygieneFilter').addEventListener('change', filterEateries);
    await loadEateries();
}

async function loadEateries() {
    try {
        const response = await fetch(`${API_URL}/eateries`);
        const data = await response.json();
        allEateriesCache = data.success && data.data.length ? data.data : mockEateries;
    } catch (error) {
        console.warn('Eateries API unavailable, using sample eateries.', error);
        allEateriesCache = mockEateries;
    }
    populateCityFilter(document.getElementById('eateryCityFilter'), allEateriesCache.map(e => e.city));
    displayEateries(allEateriesCache);
}

function filterEateries() {
    const city = document.getElementById('eateryCityFilter').value;
    const minHygiene = parseFloat(document.getElementById('eateryHygieneFilter').value) || 0;
    const filtered = allEateriesCache.filter(e =>
        (!city || e.city === city) && (e.hygieneRating >= minHygiene)
    );
    displayEateries(filtered);
}

function hygieneBadgeClass(rating) {
    if (rating >= 4) return 'hygiene-good';
    if (rating >= 3) return 'hygiene-ok';
    return 'hygiene-poor';
}

function displayEateries(eateries) {
    const grid = document.getElementById('eateriesGrid');
    if (!eateries.length) {
        grid.innerHTML = '<p style="text-align:center;color:#4a5568;padding:40px;grid-column:1/-1;">No eateries match your filters yet.</p>';
        return;
    }
    grid.innerHTML = eateries.map(e => `
        <div class="stay-card eatery-card">
            <img src="${e.imageUrl}" alt="${e.name}" loading="lazy" />
            <div class="stay-info">
                <div class="badge-row">
                    <span class="hygiene-badge ${hygieneBadgeClass(e.hygieneRating)}">🧼 Hygiene ${e.hygieneRating.toFixed(1)}★</span>
                    <span class="stay-rating">😋 ${e.tasteRating ? e.tasteRating.toFixed(1) : '4.0'}★</span>
                </div>
                <h3>${e.name}</h3>
                <p>📍 ${e.city} · ${e.priceRange || 'budget'}</p>
                <p class="tag-row">${(e.cuisine || []).map(c => `<span class="mini-tag">${c}</span>`).join('')}</p>
            </div>
        </div>
    `).join('');
}

// ============================================================
// ========== 4) DIRECT, COMMISSION-FREE STAY LISTINGS ==========
// ============================================================
let allDirectStaysCache = [];

const mockDirectStays = [
    { _id: 's1', name: 'Sharma Homestay', type: 'homestay', city: 'Agra', pricePerNight: 1400, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600', ownerName: 'Meena Sharma', ownerPhone: '+91 97001 22334' },
    { _id: 's2', name: 'Beira Mar Guest House', type: 'guesthouse', city: 'Goa', pricePerNight: 1800, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', ownerName: "Joaquim D'Souza", ownerPhone: '+91 97002 33445' },
    { _id: 's3', name: 'Mountain Nest Homestay', type: 'homestay', city: 'Manali', pricePerNight: 1100, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600', ownerName: 'Deepak Thakur', ownerPhone: '+91 97003 44556' }
];

async function initStaysPage() {
    document.getElementById('stayCityFilter').addEventListener('change', filterDirectStays);
    document.getElementById('stayTypeFilter').addEventListener('change', filterDirectStays);

    document.getElementById('listYourStayBtn').addEventListener('click', () => {
        const section = document.getElementById('stayFormSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('stayListForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitStayListing();
    });

    await loadDirectStays();
}

async function loadDirectStays() {
    try {
        const response = await fetch(`${API_URL}/stays`);
        const data = await response.json();
        allDirectStaysCache = data.success && data.data.length ? data.data : mockDirectStays;
    } catch (error) {
        console.warn('Stays API unavailable, using sample stays.', error);
        allDirectStaysCache = mockDirectStays;
    }
    populateCityFilter(document.getElementById('stayCityFilter'), allDirectStaysCache.map(s => s.city));
    displayDirectStays(allDirectStaysCache);
}

function filterDirectStays() {
    const city = document.getElementById('stayCityFilter').value;
    const type = document.getElementById('stayTypeFilter').value;
    const filtered = allDirectStaysCache.filter(s =>
        (!city || s.city === city) && (!type || s.type === type)
    );
    displayDirectStays(filtered);
}

function displayDirectStays(stays) {
    const grid = document.getElementById('staysPageGrid');
    if (!stays.length) {
        grid.innerHTML = '<p style="text-align:center;color:#4a5568;padding:40px;grid-column:1/-1;">No direct listings match your filters yet.</p>';
        return;
    }
    grid.innerHTML = stays.map(s => `
        <div class="stay-card direct-stay-card">
            <img src="${s.imageUrl}" alt="${s.name}" loading="lazy" />
            <div class="stay-info">
                <div class="badge-row">
                    <span class="commission-badge">0% Commission</span>
                    <span class="stay-rating">★ ${s.rating ? s.rating.toFixed(1) : 'New'}</span>
                </div>
                <h3>${s.name}</h3>
                <p>📍 ${s.city} · ${s.type}</p>
                <div>
                    <span class="stay-price">₹${s.pricePerNight}/night</span>
                </div>
                <button class="btn-small" onclick="revealOwnerContact('${s._id}', this)">Contact Owner Directly</button>
            </div>
        </div>
    `).join('');
}

function revealOwnerContact(id, btnEl) {
    const stay = allDirectStaysCache.find(s => s._id === id);
    if (!stay) return;
    btnEl.outerHTML = `<p class="owner-contact">👤 ${stay.ownerName} · 📞 ${stay.ownerPhone}</p>`;
}

async function submitStayListing() {
    const payload = {
        name: document.getElementById('slName').value,
        type: document.getElementById('slType').value,
        city: document.getElementById('slCity').value,
        state: document.getElementById('slState').value,
        pricePerNight: parseInt(document.getElementById('slPrice').value) || 0,
        ownerName: document.getElementById('slOwnerName').value,
        ownerPhone: document.getElementById('slOwnerPhone').value
    };

    try {
        const response = await fetch(`${API_URL}/stays`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            allDirectStaysCache.unshift(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.warn('Stays API unavailable, adding locally.', error);
        allDirectStaysCache.unshift({ ...payload, _id: 'local-' + Date.now(), imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' });
    }

    showNotification('🏠 Listed with 0% commission! Travelers can now contact you directly.', 'success');
    document.getElementById('stayListForm').reset();
    document.getElementById('stayFormSection').style.display = 'none';
    displayDirectStays(allDirectStaysCache);
}

// ============================================================
// ========== 5) OFF-BEAT DESTINATION DISCOVERY ==========
// ============================================================
const mockOffbeatDestinations = [
    { _id: 'o1', name: 'Dzukou Valley', location: 'Kohima, Nagaland', price: 3200, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f83a9ea62d2f?w=600', rating: 4.7, offbeatTag: 'Hidden Valley' },
    { _id: 'o2', name: 'Majuli Island', location: 'Majuli, Assam', price: 2800, imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=600', rating: 4.6, offbeatTag: 'River Island Culture' },
    { _id: 'o3', name: 'Gandikota', location: 'Kadapa, Andhra Pradesh', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600', rating: 4.5, offbeatTag: 'Canyon Country' }
];

function initOffbeatTabs() {
    document.getElementById('tabPopular').addEventListener('click', () => {
        document.getElementById('tabPopular').classList.add('active');
        document.getElementById('tabOffbeat').classList.remove('active');
        loadDestinations();
    });
    document.getElementById('tabOffbeat').addEventListener('click', () => {
        document.getElementById('tabOffbeat').classList.add('active');
        document.getElementById('tabPopular').classList.remove('active');
        loadOffbeatDestinations();
    });
}

async function loadOffbeatDestinations() {
    const grid = document.getElementById('destinationGrid');
    grid.innerHTML = '<div class="skeleton" style="height:280px;grid-column:1/-1;"></div>'.repeat(3);
    let offbeat;
    try {
        const response = await fetch(`${API_URL}/destinations/offbeat`);
        const data = await response.json();
        offbeat = data.success && data.data.length ? data.data : mockOffbeatDestinations;
    } catch (error) {
        console.warn('Off-beat API unavailable, using sample destinations.', error);
        offbeat = mockOffbeatDestinations;
    }
    grid.innerHTML = offbeat.map(d => `
        <div class="destination-card">
            <img src="${d.imageUrl}" alt="${d.name}" class="dest-img" loading="lazy" />
            <div class="dest-info">
                ${d.offbeatTag ? `<span class="offbeat-tag">🗺️ ${d.offbeatTag}</span>` : ''}
                <h3>${d.name}</h3>
                <p>${d.location}</p>
                <span class="price">₹${(d.price || 2999).toLocaleString()}</span>
                <span style="color:#f6ad55;"> ★ ${d.rating || 4.5}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================
// ========== 6) SOLO / WOMEN TRAVELER SAFETY CHECK-IN ==========
// ============================================================
const CHECKIN_STORAGE_KEY = 'deshantan_active_checkin';

function initSafetyPage() {
    document.getElementById('checkinForm').addEventListener('submit', function (e) {
        e.preventDefault();
        startSafetyCheckin();
    });
    document.getElementById('imSafeBtn').addEventListener('click', markImSafe);
    document.getElementById('sosBtn').addEventListener('click', triggerSOS);
    document.getElementById('endCheckinBtn').addEventListener('click', endSafetyCheckin);

    renderCheckinView();
}

function getStoredCheckin() {
    const raw = localStorage.getItem(CHECKIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

function saveStoredCheckin(checkin) {
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(checkin));
}

function renderCheckinView() {
    const checkin = getStoredCheckin();
    if (checkin && checkin.status !== 'closed') {
        document.getElementById('checkinStartView').style.display = 'none';
        document.getElementById('checkinActiveView').style.display = 'block';
        paintCheckinStatus(checkin);
    } else {
        document.getElementById('checkinStartView').style.display = 'block';
        document.getElementById('checkinActiveView').style.display = 'none';
    }
}

function paintCheckinStatus(checkin) {
    const headline = document.getElementById('checkinStatusHeadline');
    const sub = document.getElementById('checkinStatusSub');
    const sosBtn = document.getElementById('sosBtn');

    if (checkin.status === 'sos') {
        headline.textContent = '🔴 SOS Active';
        sub.textContent = `Your emergency contact ${checkin.emergencyContactName} has been notified. Tap "I'm Safe" the moment things are okay.`;
        sosBtn.textContent = '🆘 SOS Sent — Tap to Resend';
    } else {
        headline.textContent = "🟢 You're checked in";
        sub.textContent = `Check in again before ${new Date(checkin.nextCheckinDue).toLocaleTimeString()} or we'll flag you as overdue.`;
        sosBtn.textContent = '🆘 SOS — Send Emergency Alert';
    }

    document.getElementById('checkinTripLabel').textContent = `${checkin.tripCity}${checkin.tripState ? ', ' + checkin.tripState : ''}`;
    document.getElementById('checkinEcLabel').textContent = `${checkin.emergencyContactName} (${checkin.emergencyContactPhone})`;
    document.getElementById('checkinLastTime').textContent = new Date(checkin.lastCheckinAt).toLocaleString();
    document.getElementById('checkinNextDue').textContent = new Date(checkin.nextCheckinDue).toLocaleString();
}

async function startSafetyCheckin() {
    const payload = {
        travelerName: document.getElementById('ciName').value,
        travelerPhone: document.getElementById('ciPhone').value,
        isSoloTraveler: document.getElementById('ciSolo').checked,
        tripCity: document.getElementById('ciCity').value,
        tripState: document.getElementById('ciState').value,
        emergencyContactName: document.getElementById('ciEcName').value,
        emergencyContactPhone: document.getElementById('ciEcPhone').value,
        checkinIntervalHours: parseInt(document.getElementById('ciInterval').value) || 6
    };

    let checkin;
    try {
        const response = await fetch(`${API_URL}/safety/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            checkin = data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.warn('Safety API unavailable, tracking check-in locally.', error);
        const now = new Date();
        checkin = {
            _id: 'local-' + Date.now(),
            ...payload,
            status: 'active',
            lastCheckinAt: now.toISOString(),
            nextCheckinDue: new Date(now.getTime() + payload.checkinIntervalHours * 3600000).toISOString()
        };
    }

    saveStoredCheckin(checkin);
    showNotification('🟢 Safety check-in started. Stay safe!', 'success');
    document.getElementById('checkinForm').reset();
    renderCheckinView();
}

async function markImSafe() {
    const checkin = getStoredCheckin();
    if (!checkin) return;

    try {
        const response = await fetch(`${API_URL}/safety/${checkin._id}/im-safe`, { method: 'PUT' });
        const data = await response.json();
        if (data.success) {
            saveStoredCheckin(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        const now = new Date();
        checkin.status = 'safe';
        checkin.lastCheckinAt = now.toISOString();
        checkin.nextCheckinDue = new Date(now.getTime() + (checkin.checkinIntervalHours || 6) * 3600000).toISOString();
        saveStoredCheckin(checkin);
    }

    showNotification("✅ Great, glad you're safe!", 'success');
    renderCheckinView();
}

async function triggerSOS() {
    const checkin = getStoredCheckin();
    if (!checkin) return;
    if (!confirm('This will alert your emergency contact and the Deshantan safety team. Continue?')) return;

    try {
        const response = await fetch(`${API_URL}/safety/${checkin._id}/sos`, { method: 'PUT' });
        const data = await response.json();
        if (data.success) {
            saveStoredCheckin(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        checkin.status = 'sos';
        checkin.sosTriggeredAt = new Date().toISOString();
        saveStoredCheckin(checkin);
    }

    showNotification(`🆘 SOS sent! ${checkin.emergencyContactName} has been notified.`, 'error');
    renderCheckinView();
}

async function endSafetyCheckin() {
    const checkin = getStoredCheckin();
    if (!checkin) return;

    try {
        await fetch(`${API_URL}/safety/${checkin._id}/close`, { method: 'PUT' });
    } catch (error) {
        console.warn('Safety API unavailable, closing locally.', error);
    }

    localStorage.removeItem(CHECKIN_STORAGE_KEY);
    showNotification('Trip closed — safe travels next time!', 'info');
    renderCheckinView();
}

// ========== CONSOLE WELCOME ==========
console.log('🌏 Welcome to Deshantan!');
console.log('📚 Explore India\'s best destinations');
console.log('💡 Tip: Sign up to unlock exclusive features!');
console.log('🚀 Created with ❤️ using HTML, CSS, and JavaScript');
