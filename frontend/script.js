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

// ========== TRIP PLANNER ==========
function generateItinerary() {
    const destination = document.getElementById('destination')?.value;
    const travelType = document.getElementById('travelType')?.value;
    const days = document.getElementById('days')?.value;
    const budget = document.getElementById('budget')?.value;
    const people = document.getElementById('people')?.value;

    if (!destination || !travelType || !days || !budget || !people) {
        showNotification('❌ Please fill in all fields', 'error');
        return;
    }

    const interests = [];
    document.querySelectorAll('.interest-checkbox input:checked').forEach(cb => {
        interests.push(cb.value);
    });

    let itinerary = [];
    const destinationNames = {
        'taj-mahal': 'Taj Mahal, Agra',
        'jaipur': 'Jaipur, Rajasthan',
        'kerala': 'Kerala Backwaters',
        'varanasi': 'Varanasi Ghats',
        'goa': 'Goa Beaches',
        'manali': 'Manali, Himachal Pradesh',
        'multiple': 'Multiple Destinations'
    };

    const destName = destinationNames[destination] || 'India';

    for (let i = 1; i <= Math.min(days, 7); i++) {
        let dayPlan = { day: i, title: `Day ${i}`, activities: [] };
        if (i === 1) {
            dayPlan.activities.push('Arrival and check-in at hotel');
            dayPlan.activities.push(`Explore local area of ${destName}`);
        } else if (i === Math.min(days, 7)) {
            dayPlan.activities.push('Check-out from hotel');
            dayPlan.activities.push('Departure - Last minute shopping');
        } else {
            if (interests.includes('historical')) dayPlan.activities.push(`Visit historical sites in ${destName}`);
            if (interests.includes('nature')) dayPlan.activities.push('Nature walk and photography');
            if (interests.includes('adventure')) dayPlan.activities.push('Adventure activities');
            if (interests.includes('food')) dayPlan.activities.push('Local food tasting tour');
            if (interests.includes('culture')) dayPlan.activities.push('Cultural experience and local arts');
            if (interests.includes('shopping')) dayPlan.activities.push('Shopping at local markets');
            dayPlan.activities.push('Evening leisure and dinner');
        }
        itinerary.push(dayPlan);
    }

    displayItinerary(itinerary, destName, days, budget, people, travelType);
}

function displayItinerary(itinerary, destination, days, budget, people, travelType) {
    const resultsDiv = document.getElementById('plannerResults');
    const contentDiv = document.getElementById('itineraryContent');

    if (!resultsDiv || !contentDiv) return;

    const travelTypeNames = { 'solo': 'Solo Traveler', 'couple': 'Couple', 'family': 'Family', 'friends': 'Friends Group', 'group': 'Large Group' };
    const budgetNames = { 'budget': 'Budget (₹5,000-10,000)', 'standard': 'Standard (₹10,000-25,000)', 'premium': 'Premium (₹25,000-50,000)', 'luxury': 'Luxury (₹50,000+)' };

    let html = `
        <div style="margin-bottom:24px; padding:16px; background:#f0f4ff; border-radius:12px;">
            <p><strong>📍 Destination:</strong> ${destination}</p>
            <p><strong>👥 Travel Type:</strong> ${travelTypeNames[travelType] || travelType}</p>
            <p><strong>📅 Duration:</strong> ${days} days</p>
            <p><strong>💰 Budget:</strong> ${budgetNames[budget] || budget}</p>
            <p><strong>👤 People:</strong> ${people}</p>
        </div>
        <h3 style="margin-bottom:16px;">📋 Your ${days}-Day Itinerary</h3>
    `;

    itinerary.forEach(day => {
        html += `<div class="itinerary-card"><h3>${day.title}</h3><ul style="list-style:none; padding:0; margin:0;">`;
        day.activities.forEach(activity => {
            html += `<li style="padding:4px 0; color:#4a5568;">✓ ${activity}</li>`;
        });
        html += `</ul></div>`;
    });

    html += `
        <div style="margin-top:24px; padding:16px; background:#f0fff4; border-radius:12px; border:2px solid #48bb78;">
            <h4 style="color:#22543d; margin-bottom:8px;">💡 Travel Tips</h4>
            <ul style="list-style:none; padding:0; margin:0; color:#276749;">
                <li>✓ Book hotels in advance</li>
                <li>✓ Travel insurance recommended</li>
                <li>✓ Check weather before packing</li>
                <li>✓ Carry necessary medications</li>
            </ul>
        </div>
        <div style="margin-top:16px; text-align:center; padding:16px; background:#ebf8ff; border-radius:12px;">
            <p>📞 <strong>Need help customizing this itinerary?</strong> Call us at +91 98765 43210</p>
        </div>
    `;

    contentDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    document.querySelector('.planner-form')?.style.display = 'none';
}

function resetPlanner() {
    document.getElementById('plannerResults')?.style.display = 'none';
    document.querySelector('.planner-form')?.style.display = 'block';
    document.getElementById('plannerForm')?.reset();
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
    const plannerForm = document.getElementById('plannerForm');
    if (plannerForm) {
        plannerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateItinerary();
        });
    }

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