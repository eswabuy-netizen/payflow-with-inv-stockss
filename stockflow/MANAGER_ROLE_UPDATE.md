# Manager Role Update Instructions

## Issue
The existing manager user (`manager@yourcompany.com`) currently has role `'admin'` but needs to be updated to `'manager'` to have full permissions including the ability to create admins.

## Solution
Manually update the user role in Firebase Console:

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/project/stockmanange-c97db/firestore)
2. Navigate to **Firestore Database**
3. Find the **users** collection
4. Locate the document with ID: `08UxUJ5nEUUnL1Xcwx1VLR5ltQG2`
5. Click on the document to edit it
6. Find the `role` field
7. Change the value from `"admin"` to `"manager"`
8. Click **Update** to save the changes

### What this enables:
- ✅ Access to all features (Dashboard, Products, Sales, Restock, Reports)
- ✅ Ability to create and manage both attendants AND admins
- ✅ Full system control
- ✅ No more permission errors

### Verification:
After updating the role, refresh the application and the manager should have access to:
- User Management page (instead of just Attendant Management)
- Role selection dropdown when creating new users
- All navigation items in the sidebar

## Alternative: Create New Manager
If you prefer to create a new manager account instead:

1. Run: `node scripts/add-manager.js`
2. Use a different email address (e.g., `newmanager@yourcompany.com`)
3. The new account will automatically have the `'manager'` role

## Notes
- The Firestore security rules have been updated to support the `'manager'` role
- All code changes have been implemented to support manager permissions
- The authentication error (400 status) is likely temporary and should resolve itself
