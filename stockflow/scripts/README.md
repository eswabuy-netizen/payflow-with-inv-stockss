# Database Management Scripts

This directory contains scripts for managing your sales application database.

## add-manager.js

This script creates a manager user account in your Firebase database, allowing you to login and manage the system.

### What it does:

1. **Creates a Firebase Authentication user** with admin privileges
2. **Creates a user document** in the `users` collection with `role: 'admin'`
3. **Creates an authorized manager document** in the `authorized_managers` collection
4. **Sets up company data isolation** with a default company ID

### Prerequisites:

- Node.js installed on your system
- Firebase project configured and accessible
- Firebase Admin SDK or service account (if running from server)

### Usage:

#### Option 1: Run directly with Node.js
```bash
cd scripts
node add-manager.js
```

#### Option 2: Run with npm script (if added to package.json)
```bash
npm run add-manager
```

### Configuration:

Before running the script, you may want to modify these values in `add-manager.js`:

```javascript
const managerEmail = 'manager@yourcompany.com';     // Change to your email
const managerPassword = 'TempPassword123!';         // Change to your preferred password
const managerName = 'System Manager';               // Change to your name
const companyId = 'default-company';                // Change to your company ID
```

### Default Credentials:

- **Email**: `manager@yourcompany.com`
- **Password**: `TempPassword123!`
- **Role**: `admin`
- **Company ID**: `default-company`

### After Running:

1. **Login** to your application using the created credentials
2. **Change the temporary password** immediately after first login
3. **Use the admin panel** to create additional admin users
4. **Manage your company's data** through the admin interface

### Security Notes:

- The script creates a temporary password that should be changed immediately
- The manager account has full admin privileges
- Only admins can access the `authorized_managers` collection
- Company data is isolated by `companyId`

### Troubleshooting:

- **Email already exists**: The script will show helpful error messages
- **Firebase connection issues**: Check your Firebase configuration
- **Permission errors**: Ensure your Firebase project allows user creation

### Next Steps:

After creating your manager account, you can:
1. Login to the application
2. Create additional admin users through the admin panel
3. Set up your company's product catalog
4. Configure sales and inventory settings
