# Company Data Isolation Implementation

This document explains the implementation of company-based data isolation in the StockFlow application to ensure users can only access data from their own company.

## Overview

The application now implements company-based data isolation where:
- Each user belongs to a company (identified by their email domain)
- All data (products, sales, restocks) is tagged with a company ID
- Users can only view and modify data from their own company
- Firestore security rules enforce this isolation at the database level

## What Was Implemented

### 1. Data Model Updates
- Added `companyId` field to all data models:
  - `User` interface
  - `Product` interface  
  - `Sale` interface
  - `RestockEntry` interface

### 2. Firestore Security Rules
Updated `firestore.rules` to enforce company-based access:
- Users can only read/write data from their own company
- Helper functions `getUserCompany()` and `isAdmin()` for permission checks
- All collections now require company ID matching

### 3. Service Layer Updates
All services now filter data by company ID:
- `productService` - filters products by company
- `salesService` - filters sales by company  
- `restockService` - filters restocks by company
- `userService` - filters users by company

### 4. Component Updates
All components now use the current user's company ID:
- `Dashboard` - loads company-specific data
- `ProductList` - shows only company products
- `SalesPage` - processes company-specific sales
- `RestockPage` - manages company-specific restocks
- `ReportsPage` - shows company-specific analytics
- `RecentActivity` - displays company-specific activities

### 5. Authentication Context
- `AuthContext` now extracts company ID from user email domain
- Company ID is automatically assigned during user creation
- All new users get company ID based on their email

## How It Works

### Company ID Assignment
Company IDs are automatically generated from user email domains:
- `user@company.com` → company ID: `company`
- `admin@business.org` → company ID: `business`
- `attendant@store.net` → company ID: `store`

### Data Filtering
All database queries now include company ID filters:
```typescript
// Before
const products = await productService.getProducts();

// After  
const products = await productService.getProducts(currentUser.companyId);
```

### Security Enforcement
Firestore rules ensure data isolation:
```javascript
// Products - users can only read products from their company
match /products/{productId} {
  allow read: if request.auth != null && 
    resource.data.companyId == getUserCompany();
}
```

## Migration

### For Existing Data
If you have existing data without company IDs, use the migration script:

1. Update `scripts/migrate-company-data.js` with your Firebase config
2. Run the script: `node scripts/migrate-company-data.js`

The script will:
- Add company IDs to existing users based on email domains
- Add company IDs to existing products (you'll need to customize this)
- Add company IDs to existing sales based on attendant emails
- Add company IDs to existing restocks based on user emails

### For New Data
All new data automatically includes company IDs:
- New users get company ID from email domain
- New products include company ID from creating user
- New sales include company ID from attendant
- New restocks include company ID from user

## Benefits

1. **Data Security**: Users can only access their company's data
2. **Multi-tenancy**: Support for multiple companies using the same application
3. **Compliance**: Better data privacy and regulatory compliance
4. **Scalability**: Easy to scale for enterprise customers

## Important Notes

1. **Email Domain Consistency**: Ensure all users from the same company use the same email domain
2. **Migration Required**: Existing data must be migrated to include company IDs
3. **Admin Access**: Admins can only manage users and data within their company
4. **Offline Support**: Offline actions are queued with company ID for proper syncing

## Testing

After implementation:
1. Create users with different email domains
2. Verify data isolation between companies
3. Test offline functionality with company ID
4. Verify Firestore rules are working correctly

## Troubleshooting

### Common Issues

1. **"Missing or insufficient permissions" error**
   - Check if user has companyId in their profile
   - Verify Firestore rules are deployed
   - Ensure data has companyId field

2. **No data showing**
   - Check if currentUser.companyId exists
   - Verify data has correct companyId values
   - Check browser console for errors

3. **Migration issues**
   - Verify Firebase config in migration script
   - Check if you have admin access to Firestore
   - Review migration logs for specific errors

## Future Enhancements

1. **Company Management**: Admin interface for managing company settings
2. **Custom Company IDs**: Allow custom company identifiers
3. **Cross-company Sharing**: Controlled data sharing between companies
4. **Company Analytics**: Company-level reporting and insights
