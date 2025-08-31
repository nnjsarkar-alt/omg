# OMG Admin Panel

A comprehensive web-based admin panel for managing the OMG mobile app users, withdrawals, and system settings.

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics**: Total users, total coins, pending withdrawals, today's spins
- **Quick Actions**: Add bonus, block/unblock users, update settings
- **Recent Activity**: Latest transactions and user activities

### 👥 User Management
- **User List**: View all users with search functionality
- **User Details**: Name, phone, balance, referral code, status
- **User Actions**: 
  - View user details
  - Edit user information
  - Block/unblock users
  - Add bonus coins

### 💰 Withdrawal Management
- **Withdrawal Requests**: View all withdrawal requests
- **Status Management**: Approve, reject, or view withdrawal details
- **Automatic Refunds**: Rejected withdrawals automatically refund coins to users
- **Filtering**: Filter by status (All, Pending, Approved, Rejected)

### 📈 Transaction History
- **Complete History**: All user transactions (spin, reward, withdrawal, referral, bonus)
- **Search**: Search transactions by user ID, type, or description
- **Real-time Updates**: Live transaction data

### 🌐 Referral System
- **Referral Statistics**: Total and active referrals
- **Multi-level Structure**: 
  - Level 1: 1% commission
  - Level 2: 0.5% commission
  - Level 3: 0.25% commission
  - Level 4: 0.15% commission
  - Level 5: 0.1% commission
- **Referral Tree**: Visual representation of referral relationships

### ⚙️ App Settings
- **Configurable Parameters**:
  - Minimum withdrawal amount
  - Coin value (₹)
  - Daily spin limit
  - Daily reward amount
  - Referral bonus amount
- **Real-time Updates**: Changes apply immediately

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication)
- **UI Framework**: Custom CSS with modern design
- **Icons**: Font Awesome 6.0
- **Responsive**: Mobile-first design approach

## 📁 File Structure

```
admin/
├── index.html          # Main admin panel
├── login.html          # Admin login page
├── styles.css          # Main stylesheet
├── config.js           # Firebase configuration
├── admin.js            # Main functionality
└── README.md           # This file
```

## 🔧 Setup Instructions

### 1. Firebase Configuration
Ensure your Firebase project is properly configured with:
- **Authentication**: Phone number sign-in enabled
- **Firestore Database**: Created and rules deployed
- **Admin Collection**: `admins/{uid}` with `isAdmin: true`

### 2. Admin Setup
1. Create an admin user in Firestore:
```javascript
// In Firebase Console or via code
db.collection('admins').doc('YOUR_UID').set({
  email: 'admin@omg.com',
  isAdmin: true,
  role: 'admin',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

2. Update `config.js` with your Firebase credentials (already done)

### 3. Deploy
1. Upload all files to your web server
2. Access via `yourdomain.com/admin/`
3. Login with your admin email and password

## 🔐 Security Features

- **Admin-only Access**: Only users in `admins` collection can access
- **Email Authentication**: Secure email/password-based login
- **Role-based Permissions**: Admin users have full access
- **Audit Trail**: All admin actions are logged in transactions

## 📱 User Management Features

### Block/Unblock Users
- **Block User**: Prevents user from accessing app
- **Unblock User**: Restores user access
- **Reason Tracking**: Admin notes for blocking actions

### Bonus Management
- **Add Bonus**: Give coins to specific users
- **Reason Required**: Must specify reason for bonus
- **Transaction Log**: All bonuses are recorded

## 💳 Withdrawal Processing

### Approval Process
1. **Review Request**: Check user balance and withdrawal amount
2. **Approve**: Mark as approved (coins deducted)
3. **Reject**: Mark as rejected (coins refunded automatically)

### Automatic Features
- **Balance Validation**: Ensures sufficient balance
- **Refund Processing**: Automatic coin refund on rejection
- **Status Updates**: Real-time status changes

## 🌟 Referral System Management

### Multi-level Commission
The referral system automatically calculates and distributes commissions:

```
Level 1: 1% of new user's initial deposit
Level 2: 0.5% of new user's initial deposit  
Level 3: 0.25% of new user's initial deposit
Level 4: 0.15% of new user's initial deposit
Level 5: 0.1% of new user's initial deposit
```

### Referral Code Generation
- User ID becomes the referral code (e.g., `aaa111`)
- Automatic code generation on signup
- Unique codes for each user

## 📊 Dashboard Analytics

### Key Metrics
- **Total Users**: Real-time user count
- **Total Coins**: Sum of all user balances
- **Pending Withdrawals**: Number of withdrawal requests
- **Today's Spins**: Daily spin activity

### Quick Actions
- **Add Bonus**: Quick bonus distribution
- **Block User**: Immediate user management
- **Update Settings**: Quick configuration changes

## 🔄 Real-time Updates

- **Live Data**: All data updates in real-time
- **Auto-refresh**: Automatic data synchronization
- **Instant Actions**: Immediate effect of admin actions

## 📱 Responsive Design

- **Mobile Optimized**: Works on all device sizes
- **Touch Friendly**: Optimized for touch interfaces
- **Modern UI**: Clean, professional design

## 🚨 Error Handling

- **Graceful Failures**: User-friendly error messages
- **Retry Mechanisms**: Automatic retry for failed operations
- **Logging**: Comprehensive error logging

## 🔧 Customization

### Styling
- **Color Scheme**: Easily customizable via CSS variables
- **Layout**: Flexible grid system
- **Themes**: Support for light/dark themes

### Functionality
- **Modular Code**: Easy to add new features
- **API Integration**: Extensible for additional services
- **Plugin System**: Support for custom plugins

## 📈 Performance Features

- **Lazy Loading**: Load data only when needed
- **Caching**: Smart data caching strategies
- **Optimized Queries**: Efficient Firestore queries

## 🔒 Data Privacy

- **User Data**: Only necessary data is displayed
- **Secure Access**: Encrypted connections
- **Audit Logs**: Complete action history

## 🚀 Future Enhancements

- **Advanced Analytics**: Charts and graphs
- **Bulk Operations**: Mass user management
- **Export Features**: Data export capabilities
- **API Integration**: REST API for external tools
- **Mobile App**: Native admin mobile app

## 📞 Support

For technical support or feature requests:
- Check the main app documentation
- Review Firebase console logs
- Contact development team

## 📝 License

This admin panel is part of the OMG mobile app project.
All rights reserved.

---

**Note**: This admin panel is designed for authorized administrators only. Unauthorized access attempts will be logged and reported.
