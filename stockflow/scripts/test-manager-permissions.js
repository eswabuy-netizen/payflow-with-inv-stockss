import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

async function testManagerPermissions() {
  try {
    const managerEmail = 'manager@yourcompany.com';
    const managerPassword = 'TempPassword123!';
    
    console.log('Testing manager permissions...');
    console.log(`Email: ${managerEmail}`);
    
    // Sign in as manager
    const userCredential = await signInWithEmailAndPassword(auth, managerEmail, managerPassword);
    console.log('✅ Successfully signed in as manager');
    console.log(`User UID: ${userCredential.user.uid}`);
    
    // Get user document
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    console.log('✅ User document found');
    console.log('User data:', JSON.stringify(userData, null, 2));
    
    // Check role
    if (userData.role === 'manager') {
      console.log('✅ User has manager role');
    } else {
      console.log(`❌ User has role: ${userData.role} (expected: manager)`);
    }
    
    // Check company ID
    if (userData.companyId) {
      console.log(`✅ Company ID: ${userData.companyId}`);
    } else {
      console.log('❌ No company ID found');
    }
    
    // Check if user is active
    if (userData.active) {
      console.log('✅ User is active');
    } else {
      console.log('❌ User is not active');
    }
    
    console.log('\n🎉 Manager permissions test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing manager permissions:', error);
    
    if (error.code === 'auth/wrong-password') {
      console.log('\n💡 The password might be incorrect. Try using the password you set.');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User not found. Make sure the email is correct.');
    }
    
    process.exit(1);
  }
}

// Run the test
testManagerPermissions()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
