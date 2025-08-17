import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhKnPN77_1LK9gjAyuQ-yJDEeDrPssH_4",
  authDomain: "stockmanange-c97db.firebaseapp.com",
  projectId: "stockmanange-c97db",
  storageBucket: "stockmanange-c97db.firebasestorage.app",
  messagingSenderId: "1062011618437",
  appId: "1:1062011618437:web:da52849d7099ad92ea55ec",
  measurementId: "G-FE5PJP5PEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateManagerRole() {
  try {
    const managerEmail = 'manager@yourcompany.com';
    const managerUid = '08UxUJ5nEUUnL1Xcwx1VLR5ltQG2'; // From the Firebase console image
    
    console.log('Updating manager role...');
    console.log(`Email: ${managerEmail}`);
    console.log(`UID: ${managerUid}`);
    
    // Get the current user document
    const userDocRef = doc(db, 'users', managerUid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    console.log('Current user data:', userData);
    
    if (userData.role === 'manager') {
      console.log('✅ User already has manager role');
      return;
    }
    
    // Update the role to 'manager'
    await updateDoc(userDocRef, {
      role: 'manager'
    });
    
    console.log('✅ Manager role updated successfully');
    console.log('User now has manager permissions and can:');
    console.log('- Access all features (Dashboard, Products, Sales, Restock, Reports)');
    console.log('- Create and manage both attendants and admins');
    console.log('- Full system control');
    
  } catch (error) {
    console.error('❌ Error updating manager role:', error);
    process.exit(1);
  }
}

// Run the script
updateManagerRole()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
