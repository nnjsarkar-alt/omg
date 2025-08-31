// OMG Admin Panel - Main JavaScript File

// Global variables
let currentUser = null;
let users = [];
let withdrawals = [];
let transactions = [];
let appSettings = {};

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    setupEventListeners();
});

// Initialize Admin Panel
async function initializeAdminPanel() {
    try {
        // Check authentication
        await checkAdminAuth();
        
        // Load initial data
        await loadDashboardStats();
        await loadUsers();
        await loadWithdrawals();
        await loadTransactions();
        await loadAppSettings();
        
        // Show dashboard by default
        showTab('dashboard');
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize admin panel');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabName = link.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', filterUsers);
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterWithdrawals(btn.getAttribute('data-filter'));
        });
    });
}

// Authentication Functions
async function checkAdminAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Check if user is admin
                const isAdmin = await checkIfAdmin(user.uid);
                if (isAdmin) {
                    currentUser = user;
                    const adminName = document.getElementById('adminName');
                    if (adminName) {
                        adminName.textContent = user.email || 'Admin';
                    }
                    resolve();
                } else {
                    reject(new Error('User is not an admin'));
                }
            } else {
                // Redirect to login
                window.location.href = 'login.html';
            }
        });
    });
}

async function checkIfAdmin(uid) {
    try {
        // Check if user exists in admins collection by UID
        const adminDoc = await db.collection('admins').doc(uid).get();
        if (adminDoc.exists) {
            const adminData = adminDoc.data();
            return adminData.isAdmin === true || adminData.role === 'admin' || adminData.admin === true;
        }
        
        // Also check if user email is in admins collection
        const adminByEmail = await db.collection('admins')
            .where('email', '==', auth.currentUser.email)
            .limit(1)
            .get();
        
        if (!adminByEmail.empty) {
            const adminData = adminByEmail.docs[0].data();
            return adminData.isAdmin === true || adminData.role === 'admin' || adminData.admin === true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout');
    }
}

// Tab Navigation
function showTab(tabName) {
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            withdrawals: 'Withdrawal Requests',
            transactions: 'Transaction History',
            referrals: 'Referral System',
            settings: 'App Settings'
        };
        pageTitle.textContent = titles[tabName] || 'Dashboard';
    }
    
    // Load tab-specific data
    switch(tabName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'users':
            loadUsers();
            break;
        case 'withdrawals':
            loadWithdrawals();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'referrals':
            loadReferralData();
            break;
        case 'settings':
            loadAppSettings();
            break;
    }
}

// Dashboard Functions
async function loadDashboardStats() {
    try {
        // Get total users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        
        // Calculate total coins
        let totalCoins = 0;
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            totalCoins += userData.balance || 0;
        });
        
        // Get pending withdrawals
        const withdrawalsSnapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending').get();
        const pendingWithdrawals = withdrawalsSnapshot.size;
        
        // Get today's spins
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const spinsSnapshot = await db.collection('users')
            .where('lastSpinAt', '>=', today).get();
        const todaySpins = spinsSnapshot.size;
        
        // Update UI
        const totalUsersEl = document.getElementById('totalUsers');
        const totalCoinsEl = document.getElementById('totalCoins');
        const pendingWithdrawalsEl = document.getElementById('pendingWithdrawals');
        const todaySpinsEl = document.getElementById('todaySpins');
        
        if (totalUsersEl) totalUsersEl.textContent = totalUsers.toLocaleString();
        if (totalCoinsEl) totalCoinsEl.textContent = totalCoins.toLocaleString();
        if (pendingWithdrawalsEl) pendingWithdrawalsEl.textContent = pendingWithdrawals;
        if (todaySpinsEl) todaySpinsEl.textContent = todaySpins;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        alert('Failed to load dashboard statistics');
    }
}

// User Management Functions
async function loadUsers() {
    try {
        const usersSnapshot = await db.collection('users').get();
        users = [];
        
        usersSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    let tableHTML = '';
    users.forEach(user => {
        const statusClass = user.isBlocked ? 'blocked' : 'active';
        const statusText = user.isBlocked ? 'Blocked' : 'Active';
        
        tableHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${(user.balance || 0).toLocaleString()}</td>
                <td>${user.referralCode || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-primary" onclick="viewUserDetails('${user.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-small btn-warning" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.isBlocked ? 
                            `<button class="btn-small btn-success" onclick="unblockUserById('${user.id}')">
                                <i class="fas fa-unlock"></i>
                            </button>` :
                            `<button class="btn-small btn-danger" onclick="blockUserById('${user.id}')">
                                <i class="fas fa-ban"></i>
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML || '<tr><td colspan="7" class="text-center">No users found</td></tr>';
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm) ||
        user.phone?.includes(searchTerm) ||
        user.id.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredUsers(filteredUsers);
}

function renderFilteredUsers(filteredUsers) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    let tableHTML = '';
    filteredUsers.forEach(user => {
        const statusClass = user.isBlocked ? 'blocked' : 'active';
        const statusText = user.isBlocked ? 'Blocked' : 'Active';
        
        tableHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${(user.balance || 0).toLocaleString()}</td>
                <td>${user.referralCode || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-primary" onclick="viewUserDetails('${user.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-small btn-warning" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.isBlocked ? 
                            `<button class="btn-small btn-success" onclick="unblockUserById('${user.id}')">
                                <i class="fas fa-unlock"></i>
                            </button>` :
                            `<button class="btn-small btn-danger" onclick="blockUserById('${user.id}')">
                                <i class="fas fa-ban"></i>
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML || '<tr><td colspan="7" class="text-center">No users found</td></tr>';
}

// Withdrawal Management Functions
async function loadWithdrawals() {
    try {
        const withdrawalsSnapshot = await db.collection('withdrawals').get();
        withdrawals = [];
        
        withdrawalsSnapshot.forEach(doc => {
            withdrawals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderWithdrawalsTable();
        
    } catch (error) {
        console.error('Error loading withdrawals:', error);
        alert('Failed to load withdrawals');
    }
}

function renderWithdrawalsTable() {
    const tbody = document.getElementById('withdrawalsTableBody');
    if (!tbody) return;
    
    let tableHTML = '';
    withdrawals.forEach(withdrawal => {
        const statusClass = withdrawal.status;
        const statusText = withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1);
        const amount = (withdrawal.coins * (appSettings.coinValue || 0.01)).toFixed(2);
        const date = withdrawal.createdAt?.toDate().toLocaleDateString() || 'N/A';
        
        tableHTML += `
            <tr>
                <td>${withdrawal.uid}</td>
                <td>${withdrawal.coins.toLocaleString()}</td>
                <td>${withdrawal.upi || 'N/A'}</td>
                <td>₹${amount}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons">
                        ${withdrawal.status === 'pending' ? `
                            <button class="btn-small btn-success" onclick="approveWithdrawal('${withdrawal.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-small btn-danger" onclick="rejectWithdrawal('${withdrawal.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        <button class="btn-small btn-primary" onclick="viewWithdrawalDetails('${withdrawal.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML || '<tr><td colspan="7" class="text-center">No withdrawals found</td></tr>';
}

function filterWithdrawals(filter) {
    const tbody = document.getElementById('withdrawalsTableBody');
    if (!tbody) return;
    
    let filteredWithdrawals = withdrawals;
    if (filter !== 'all') {
        filteredWithdrawals = withdrawals.filter(w => w.status === filter);
    }
    
    renderFilteredWithdrawals(filteredWithdrawals);
}

function renderFilteredWithdrawals(filteredWithdrawals) {
    const tbody = document.getElementById('withdrawalsTableBody');
    if (!tbody) return;
    
    let tableHTML = '';
    filteredWithdrawals.forEach(withdrawal => {
        const statusClass = withdrawal.status;
        const statusText = withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1);
        const amount = (withdrawal.coins * (appSettings.coinValue || 0.01)).toFixed(2);
        const date = withdrawal.createdAt?.toDate().toLocaleDateString() || 'N/A';
        
        tableHTML += `
            <tr>
                <td>${withdrawal.uid}</td>
                <td>${withdrawal.coins.toLocaleString()}</td>
                <td>${withdrawal.upi || 'N/A'}</td>
                <td>₹${amount}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons">
                        ${withdrawal.status === 'pending' ? `
                            <button class="btn-small btn-success" onclick="approveWithdrawal('${withdrawal.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-small btn-danger" onclick="rejectWithdrawal('${withdrawal.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        <button class="btn-small btn-primary" onclick="viewWithdrawalDetails('${withdrawal.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML || '<tr><td colspan="7" class="text-center">No withdrawals found</td></tr>';
}

// Transaction Functions
async function loadTransactions() {
    try {
        const transactionsSnapshot = await db.collection('transactions')
            .orderBy('createdAt', 'desc')
            .get();
        transactions = [];
        
        transactionsSnapshot.forEach(doc => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderTransactionsTable();
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        alert('Failed to load transactions');
    }
}

function renderTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    let tableHTML = '';
    transactions.forEach(transaction => {
        const date = transaction.createdAt?.toDate().toLocaleDateString() || 'N/A';
        
        tableHTML += `
            <tr>
                <td>${transaction.uid}</td>
                <td><span class="status-badge ${transaction.type}">${transaction.type}</span></td>
                <td>${transaction.amount.toLocaleString()}</td>
                <td>${transaction.description || 'N/A'}</td>
                <td>${date}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML || '<tr><td colspan="5" class="text-center">No transactions found</td></tr>';
}

// Referral System Functions
async function loadReferralData() {
    try {
        // Calculate referral statistics
        const usersSnapshot = await db.collection('users').get();
        let totalReferrals = 0;
        let activeReferrals = 0;
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.referredBy) {
                totalReferrals++;
                if (!userData.isBlocked) {
                    activeReferrals++;
                }
            }
        });
        
        // Update UI
        const totalReferralsEl = document.getElementById('totalReferrals');
        const activeReferralsEl = document.getElementById('activeReferrals');
        
        if (totalReferralsEl) totalReferralsEl.textContent = totalReferrals;
        if (activeReferralsEl) activeReferralsEl.textContent = activeReferrals;
        
    } catch (error) {
        console.error('Error loading referral data:', error);
        alert('Failed to load referral data');
    }
}

// App Settings Functions
async function loadAppSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('config').get();
        if (settingsDoc.exists) {
            appSettings = settingsDoc.data();
            
            // Update form fields
            const minWithdrawal = document.getElementById('minWithdrawal');
            const coinValue = document.getElementById('coinValue');
            const dailySpinLimit = document.getElementById('dailySpinLimit');
            const dailyReward = document.getElementById('dailyReward');
            const referralBonus = document.getElementById('referralBonus');
            
            if (minWithdrawal) minWithdrawal.value = appSettings.minWithdrawal || 1000;
            if (coinValue) coinValue.value = appSettings.coinValue || 0.01;
            if (dailySpinLimit) dailySpinLimit.value = appSettings.dailySpinLimit || 10;
            if (dailyReward) dailyReward.value = appSettings.dailyReward || 100;
            if (referralBonus) referralBonus.value = appSettings.referralBonus || 500;
        }
    } catch (error) {
        console.error('Error loading app settings:', error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            minWithdrawal: parseInt(document.getElementById('minWithdrawal').value),
            coinValue: parseFloat(document.getElementById('coinValue').value),
            dailySpinLimit: parseInt(document.getElementById('dailySpinLimit').value),
            dailyReward: parseInt(document.getElementById('dailyReward').value),
            referralBonus: parseInt(document.getElementById('referralBonus').value),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('settings').doc('config').set(settings, { merge: true });
        
        appSettings = settings;
        alert('Settings saved successfully');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
    }
}

// Modal Functions
function showAddBonusModal() {
    document.getElementById('addBonusModal').style.display = 'block';
}

function showBlockUserModal() {
    document.getElementById('blockUserModal').style.display = 'block';
}

function showSettingsModal() {
    // Populate modal fields with current settings
    const modalMinWithdrawal = document.getElementById('modalMinWithdrawal');
    const modalCoinValue = document.getElementById('modalCoinValue');
    const modalDailySpinLimit = document.getElementById('modalDailySpinLimit');
    const modalDailyReward = document.getElementById('modalDailyReward');
    const modalReferralBonus = document.getElementById('modalReferralBonus');
    
    if (modalMinWithdrawal) modalMinWithdrawal.value = appSettings.minWithdrawal || 1000;
    if (modalCoinValue) modalCoinValue.value = appSettings.coinValue || 0.01;
    if (modalDailySpinLimit) modalDailySpinLimit.value = appSettings.dailySpinLimit || 10;
    if (modalDailyReward) modalDailyReward.value = appSettings.dailyReward || 100;
    if (modalReferralBonus) modalReferralBonus.value = appSettings.referralBonus || 500;
    
    document.getElementById('settingsModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Action Functions
async function addBonus() {
    try {
        const userId = document.getElementById('bonusUserId').value.trim();
        const amount = parseInt(document.getElementById('bonusAmount').value);
        const reason = document.getElementById('bonusReason').value.trim();
        
        if (!userId || !amount || !reason) {
            alert('Please fill in all fields');
            return;
        }
        
        // Update user balance
        await db.collection('users').doc(userId).update({
            balance: firebase.firestore.FieldValue.increment(amount)
        });
        
        // Create transaction record
        await db.collection('transactions').add({
            uid: userId,
            type: 'bonus',
            amount: amount,
            description: `Admin bonus: ${reason}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeModal('addBonusModal');
        alert(`Bonus of ${amount} coins added to user ${userId}`);
        
        // Refresh data
        await loadUsers();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Error adding bonus:', error);
        alert('Failed to add bonus');
    }
}

async function blockUser() {
    try {
        const userId = document.getElementById('blockUserId').value.trim();
        const reason = document.getElementById('blockReason').value.trim();
        
        if (!userId || !reason) {
            alert('Please fill in all fields');
            return;
        }
        
        await db.collection('users').doc(userId).update({
            isBlocked: true,
            blockedAt: firebase.firestore.FieldValue.serverTimestamp(),
            blockReason: reason
        });
        
        closeModal('blockUserModal');
        alert(`User ${userId} has been blocked`);
        
        // Refresh data
        await loadUsers();
        
    } catch (error) {
        console.error('Error blocking user:', error);
        alert('Failed to block user');
    }
}

async function unblockUser() {
    try {
        const userId = document.getElementById('blockUserId').value.trim();
        
        if (!userId) {
            alert('Please enter user ID');
            return;
        }
        
        await db.collection('users').doc(userId).update({
            isBlocked: false,
            blockedAt: firebase.firestore.FieldValue.delete(),
            blockReason: firebase.firestore.FieldValue.delete()
        });
        
        closeModal('blockUserModal');
        alert(`User ${userId} has been unblocked`);
        
        // Refresh data
        await loadUsers();
        
    } catch (error) {
        console.error('Error unblocking user:', error);
        alert('Failed to unblock user');
    }
}

async function blockUserById(userId) {
    try {
        await db.collection('users').doc(userId).update({
            isBlocked: true,
            blockedAt: firebase.firestore.FieldValue.serverTimestamp(),
            blockReason: 'Blocked by admin'
        });
        
        alert(`User ${userId} has been blocked`);
        await loadUsers();
        
    } catch (error) {
        console.error('Error blocking user:', error);
        alert('Failed to block user');
    }
}

async function unblockUserById(userId) {
    try {
        await db.collection('users').doc(userId).update({
            isBlocked: false,
            blockedAt: firebase.firestore.FieldValue.delete(),
            blockReason: firebase.firestore.FieldValue.delete()
        });
        
        alert(`User ${userId} has been unblocked`);
        await loadUsers();
        
    } catch (error) {
        console.error('Error unblocking user:', error);
        alert('Failed to unblock user');
    }
}

async function approveWithdrawal(withdrawalId) {
    try {
        const withdrawal = withdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal) {
            alert('Withdrawal not found');
            return;
        }
        
        // Update withdrawal status
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'approved',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            adminNote: 'Approved by admin'
        });
        
        alert('Withdrawal approved successfully');
        await loadWithdrawals();
        
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        alert('Failed to approve withdrawal');
    }
}

async function rejectWithdrawal(withdrawalId) {
    try {
        const withdrawal = withdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal) {
            alert('Withdrawal not found');
            return;
        }
        
        // Refund coins to user
        await db.collection('users').doc(withdrawal.uid).update({
            balance: firebase.firestore.FieldValue.increment(withdrawal.coins)
        });
        
        // Update withdrawal status
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'rejected',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            adminNote: 'Rejected by admin - coins refunded'
        });
        
        // Create refund transaction
        await db.collection('transactions').add({
            uid: withdrawal.uid,
            type: 'refund',
            amount: withdrawal.coins,
            description: 'Withdrawal rejection refund',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Withdrawal rejected and coins refunded');
        await loadWithdrawals();
        await loadUsers();
        
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        alert('Failed to reject withdrawal');
    }
}

async function updateSettings() {
    try {
        const settings = {
            minWithdrawal: parseInt(document.getElementById('modalMinWithdrawal').value),
            coinValue: parseFloat(document.getElementById('modalCoinValue').value),
            dailySpinLimit: parseInt(document.getElementById('modalDailySpinLimit').value),
            dailyReward: parseInt(document.getElementById('modalDailyReward').value),
            referralBonus: parseInt(document.getElementById('modalReferralBonus').value),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('settings').doc('config').set(settings, { merge: true });
        
        appSettings = settings;
        closeModal('settingsModal');
        alert('Settings updated successfully');
        
        // Refresh settings tab
        await loadAppSettings();
        
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Failed to update settings');
    }
}

// Placeholder functions for future implementation
function viewUserDetails(userId) {
    alert(`View details for user: ${userId}`);
}

function editUser(userId) {
    alert(`Edit user: ${userId}`);
}

function viewWithdrawalDetails(withdrawalId) {
    alert(`View withdrawal details: ${withdrawalId}`);
}
