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

async function checkUserStatus() {
  try {
    const userEmail = 'mxomk82@gmail.com';
    const userPassword = 'your-password-here'; // You'll need to provide the actual password
    
    console.log('🔍 Checking user status...');
    console.log(`Email: ${userEmail}`);
    
    // Try to sign in to verify the account works
    console.log('\n📱 Testing login...');
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const user = userCredential.user;
    
    console.log('✅ Login successful!');
    console.log(`User UID: ${user.uid}`);
    
    // Get user document from Firestore
    console.log('\n📄 Checking Firestore user document...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document found in Firestore');
      console.log('User data:', JSON.stringify(userData, null, 2));
      
      // Check role
      if (userData.role === 'admin' || userData.role === 'manager') {
        console.log('✅ User has admin/manager role');
      } else {
        console.log(`❌ User has role: ${userData.role} (expected: admin or manager)`);
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
        console.log('❌ User is inactive');
      }
      
    } else {
      console.log('❌ User document not found in Firestore');
      console.log('This user needs to be created in the users collection');
    }
    
    console.log('\n🎉 User status check complete!');
    
  } catch (error) {
    console.error('❌ Error checking user status:', error);
    if (error.code === 'auth/user-not-found') {
      console.log('User not found in Firebase Auth');
    } else if (error.code === 'auth/wrong-password') {
      console.log('Wrong password provided');
    } else {
      console.log('Other authentication error:', error.message);
    }
  }
}

// Run the script
checkUserStatus()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
