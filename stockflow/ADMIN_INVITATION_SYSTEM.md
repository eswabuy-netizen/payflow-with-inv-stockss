# Admin Invitation System

## Overview

The admin invitation system has been redesigned to provide a more secure and user-friendly way for managers to create admin accounts. Instead of managers creating admin accounts with temporary passwords, they now send invitations that allow admins to set up their own accounts.

## How It Works

### 1. Manager Creates Admin Invitation

When a manager wants to add an admin:

1. **Manager goes to User Management** in the admin panel
2. **Clicks "Add User"** and selects "Admin" role
3. **Enters only the email address** (no password required)
4. **Clicks "Send Invitation"**

The system creates an invitation record in the `admin_invitations` collection with:
- Email address
- Company ID (from manager's company)
- Role (admin)
- Invitation status (pending)
- Expiration date (7 days from creation)

### 2. Admin Completes Signup

The invited admin:

1. **Receives notification** from the manager (email, message, etc.)
2. **Visits the signup page** (`/signup`)
3. **Enters their email address** (must match the invitation)
4. **Sets their own password**
5. **Completes the signup process**

The system:
- Validates the invitation exists and is not expired
- Creates the Firebase Auth account
- Creates the user document with proper company ID
- Marks the invitation as completed

## Key Benefits

### Security
- ✅ Admins set their own passwords (no temporary passwords)
- ✅ Invitations expire after 7 days
- ✅ Email validation ensures only invited users can signup
- ✅ Company ID is properly set from the manager's company

### User Experience
- ✅ Simpler process for managers (only need email)
- ✅ Better experience for admins (set their own password)
- ✅ Clear instructions and validation
- ✅ No password sharing required

### Data Integrity
- ✅ Company ID is correctly inherited from manager
- ✅ Proper audit trail (who invited whom)
- ✅ Invitation status tracking

## Technical Implementation

### New Collections

#### `admin_invitations`
```javascript
{
  email: string,           // Invited email address
  companyId: string,       // Manager's company ID
  role: 'admin',           // Always 'admin'
  invitedBy: string,       // Manager's UID
  invitedAt: timestamp,    // When invitation was created
  status: 'pending' | 'completed',
  expiresAt: timestamp,    // 7 days from creation
  completedAt?: timestamp, // When signup was completed
  completedBy?: string     // Admin's UID
}
```

### Updated Services

#### `userService.createAdminInvitation()`
Creates an admin invitation instead of a direct account.

#### `userService.checkAdminInvitation()`
Validates if an invitation exists and is still valid.

#### `userService.completeAdminSignup()`
Completes the admin signup process using an invitation.

### Updated Components

#### `AttendantForm`
- Shows different UI for admin invitations
- Hides password field for admin invitations
- Provides clear instructions

#### `AttendantManagement`
- Handles admin invitations differently from attendant creation
- Shows appropriate success messages

#### `SignUpForm`
- Updated to work with invitation validation
- Better error messages for missing invitations

## Firestore Security Rules

The `admin_invitations` collection has specific rules:

- **Read**: Anyone can read (for signup validation)
- **Create**: Only managers in their company
- **Update**: Managers or the invited user (to mark as completed)
- **Delete**: Only managers in their company

## Migration Notes

### For Existing Admins
- Existing admin accounts continue to work normally
- No changes required for current users

### For Managers
- The UI now clearly distinguishes between creating attendants and inviting admins
- Admin invitations require manual notification (email, message, etc.)
- Clear instructions are provided in the UI

## Testing

Use the test script to verify the system works:

```bash
node scripts/test-admin-invitation.js
```

This script:
1. Creates a test admin invitation
2. Validates the invitation exists
3. Simulates admin signup
4. Verifies the final state

## Troubleshooting

### Common Issues

1. **"No valid admin invitation found"**
   - Check if the invitation was created
   - Verify the email address matches exactly
   - Check if the invitation has expired

2. **"Email does not match invitation"**
   - Ensure the admin uses the exact email from the invitation
   - Check for typos or case sensitivity

3. **"Invitation has expired"**
   - Create a new invitation
   - Invitations expire after 7 days

4. **Permission errors**
   - Verify Firestore rules are deployed
   - Check if the manager has proper permissions

### Debug Steps

1. Check the `admin_invitations` collection in Firebase Console
2. Verify the invitation status and expiration date
3. Check the `users` collection for the created admin account
4. Review Firestore security rules

## Future Enhancements

Potential improvements:
- Email notifications for invitations
- Invitation resend functionality
- Bulk invitation creation
- Invitation management dashboard
- Custom invitation messages
