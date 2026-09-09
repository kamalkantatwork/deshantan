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
    document.getElementById('profileProgressFill')?.style.width = percentage + '%';
    document.querySelector('.profile-progress')?.textContent = percentage + '%';
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

    document.getElementById('businessForm')?.style.display = 'none';
    document.getElementById('businessSuccess')?.style.display = 'block';
    localStorage.setItem('deshantan_business_profile', JSON.stringify(businessData));
    showNotification('✅ Business registered successfully!', 'success');
}

function resetBusinessForm() {
    document.getElementById('businessForm')?.style.display = 'block';
    document.getElementById('businessSuccess')?.style.display = 'none';
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

    document.getElementById('securityForm')?.style.display = 'none';
    document.getElementById('securitySuccess')?.style.display = 'block';
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

    document.getElementById('othersForm')?.style.display = 'none';
    document.getElementById('othersSuccess')?.style.display = 'block';
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

// ========== CONSOLE WELCOME ==========
console.log('🌏 Welcome to Deshantan!');
console.log('📚 Explore India\'s best destinations');
console.log('💡 Tip: Sign up to unlock exclusive features!');
console.log('🚀 Created with ❤️ using HTML, CSS, and JavaScript');