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

async function checkCurrentUser() {
  try {
    const managerEmail = 'manager@yourcompany.com';
    const managerPassword = 'TempPassword123!';
    
    console.log('🔍 Checking current user data...');
    console.log(`Email: ${managerEmail}`);
    
    // Sign in as manager
    const userCredential = await signInWithEmailAndPassword(auth, managerEmail, managerPassword);
    console.log('✅ Successfully signed in');
    console.log(`User UID: ${userCredential.user.uid}`);
    
    // Get user document
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    console.log('\n📋 User Data:');
    console.log(JSON.stringify(userData, null, 2));
    
    // Check specific fields
    console.log('\n🔍 Field Analysis:');
    console.log(`Role: ${userData.role} (expected: manager)`);
    console.log(`Company ID: ${userData.companyId} (should not be null/undefined)`);
    console.log(`Active: ${userData.active} (should be true)`);
    console.log(`Email: ${userData.email}`);
    
    // Check if user meets Firestore rule requirements
    console.log('\n🔒 Firestore Rule Requirements:');
    console.log(`1. User is authenticated: ✅`);
    console.log(`2. User is active: ${userData.active ? '✅' : '❌'}`);
    console.log(`3. User has manager role: ${userData.role === 'manager' ? '✅' : '❌'}`);
    console.log(`4. User has company ID: ${userData.companyId ? '✅' : '❌'}`);
    
    if (userData.role !== 'manager') {
      console.log('\n⚠️  ISSUE: User does not have manager role!');
      console.log('This is why the admin invitation creation is failing.');
      console.log('The user needs to have role: "manager" to create admin invitations.');
    }
    
    if (!userData.companyId) {
      console.log('\n⚠️  ISSUE: User does not have company ID!');
      console.log('This could also cause permission issues.');
    }
    
    console.log('\n🎯 Next Steps:');
    if (userData.role !== 'manager') {
      console.log('1. Update user role to "manager" in Firebase Console');
      console.log('2. Or run: node scripts/update-manager-role.js');
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  }
}

// Run the check
checkCurrentUser()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
