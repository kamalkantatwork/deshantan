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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

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
            document.getElementById('loginForm').reset();
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
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('signupPhone').value;

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
            document.getElementById('signupForm').reset();
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

    // Add styles if not present
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

            // Load bookings
            loadUserBookings();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('❌ Error loading dashboard data', 'error');
    }
}

async function loadUserBookings() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        if (data.success && data.data.length > 0) {
            document.getElementById('totalBookings').textContent = data.data.length;
            bookingsList.innerHTML = data.data.map(booking => `
                <div class="booking-card">
                    <div class="booking-header">
                        <span class="booking-id">#${booking.bookingReference || 'N/A'}</span>
                        <span class="booking-status ${booking.bookingStatus}">${booking.bookingStatus}</span>
                    </div>
                    <div class="booking-details">
                        <p><strong>Package:</strong> ${booking.package?.name || booking.destination?.name || 'N/A'}</p>
                        <p><strong>Date:</strong> ${new Date(booking.travelDate).toLocaleDateString()}</p>
                        <p><strong>People:</strong> ${booking.peopleCount}</p>
                        <p><strong>Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            `).join('');
        } else {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <p>🚀 No bookings yet. Start your journey with Deshantan!</p>
                    <a href="index.html#packages" class="btn-empty">Explore Packages</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
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
            name: this.querySelector('input[type="text"]').value,
            email: this.querySelector('input[type="email"]').value,
            phone: this.querySelector('input[type="tel"]').value,
            destination: this.querySelector('select').value,
            travelDate: this.querySelector('input[type="date"]').value,
            specialRequests: this.querySelector('textarea').value,
            peopleCount: 2
        };

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
        document.querySelector('#destinations').scrollIntoView({ behavior: 'smooth' });
    });
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (user && getToken()) {
        updateUIForLoggedInUser(user);
        if (window.location.pathname.includes('dashboard.html')) {
            loadDashboardData();
        }
    } else if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }

    if (!window.location.pathname.includes('dashboard.html') && !window.location.pathname.includes('about.html')) {
        loadDestinations();
        loadPackages();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(loginModal);
            closeModal(signupModal);
        }
    });

    // Check backend
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