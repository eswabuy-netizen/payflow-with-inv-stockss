const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Migration function to add companyId to existing data
async function migrateCompanyData() {
  try {
    console.log('Starting company data migration...');

    // 1. Update users collection
    console.log('Updating users collection...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userUpdates = [];
    
    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      if (!userData.companyId && userData.email) {
        const companyId = userData.email.split('@')[1].split('.')[0];
        userUpdates.push(
          updateDoc(doc(db, 'users', userDoc.id), { companyId })
        );
      }
    });
    
    if (userUpdates.length > 0) {
      await Promise.all(userUpdates);
      console.log(`Updated ${userUpdates.length} users with companyId`);
    }

    // 2. Update products collection
    console.log('Updating products collection...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const productUpdates = [];
    
    productsSnapshot.forEach((productDoc) => {
      const productData = productDoc.data();
      if (!productData.companyId) {
        // For products, we'll use a default company ID
        // In a real scenario, you'd need to determine the company based on business logic
        const companyId = 'default'; // Change this based on your needs
        productUpdates.push(
          updateDoc(doc(db, 'products', productDoc.id), { companyId })
        );
      }
    });
    
    if (productUpdates.length > 0) {
      await Promise.all(productUpdates);
      console.log(`Updated ${productUpdates.length} products with companyId`);
    }

    // 3. Update sales collection
    console.log('Updating sales collection...');
    const salesSnapshot = await getDocs(collection(db, 'sales'));
    const saleUpdates = [];
    
    salesSnapshot.forEach((saleDoc) => {
      const saleData = saleDoc.data();
      if (!saleData.companyId && saleData.attendantEmail) {
        const companyId = saleData.attendantEmail.split('@')[1].split('.')[0];
        saleUpdates.push(
          updateDoc(doc(db, 'sales', saleDoc.id), { companyId })
        );
      }
    });
    
    if (saleUpdates.length > 0) {
      await Promise.all(saleUpdates);
      console.log(`Updated ${saleUpdates.length} sales with companyId`);
    }

    // 4. Update restocks collection
    console.log('Updating restocks collection...');
    const restocksSnapshot = await getDocs(collection(db, 'restocks'));
    const restockUpdates = [];
    
    restocksSnapshot.forEach((restockDoc) => {
      const restockData = restockDoc.data();
      if (!restockData.companyId && restockData.userEmail) {
        const companyId = restockData.userEmail.split('@')[1].split('.')[0];
        restockUpdates.push(
          updateDoc(doc(db, 'restocks', restockDoc.id), { companyId })
        );
      }
    });
    
    if (restockUpdates.length > 0) {
      await Promise.all(restockUpdates);
      console.log(`Updated ${restockUpdates.length} restocks with companyId`);
    }

    console.log('Company data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateCompanyData();
