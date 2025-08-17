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

async function showManagerStatus() {
  try {
    const managerEmail = 'manager@yourcompany.com';
    const managerPassword = 'TempPassword123!';
    
    console.log('🔍 Checking manager account status...');
    console.log(`Email: ${managerEmail}`);
    console.log(`Password: ${managerPassword}`);
    
    // Try to sign in to verify the account works
    console.log('\n📱 Testing login...');
    const userCredential = await signInWithEmailAndPassword(auth, managerEmail, managerPassword);
    const user = userCredential.user;
    
    console.log('✅ Login successful!');
    console.log(`User UID: ${user.uid}`);
    
    // Get user document from Firestore
    console.log('\n📄 Checking Firestore user document...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document found in Firestore');
      console.log(`Role: ${userData.role}`);
      console.log(`Company ID: ${userData.companyId}`);
      console.log(`Active: ${userData.active}`);
      console.log(`Temporary Password: ${userData.isTemporaryPassword}`);
    } else {
      console.log('❌ User document not found in Firestore');
    }
    
    console.log('\n🎉 Manager account is ready to use!');
    console.log('\n📱 Login Credentials:');
    console.log(`Email: ${managerEmail}`);
    console.log(`Password: ${managerPassword}`);
    
    console.log('\n🚀 You can now:');
    console.log('1. Login to your application with the credentials above');
    console.log('2. Use the admin panel to create additional admin users');
    console.log('3. Manage your company\'s data');
    
    console.log('\n⚠️  IMPORTANT: Change the temporary password after first login!');
    
    console.log('\n💡 Note: If you need to create the authorized_managers document,');
    console.log('   you can do so manually in Firebase Console after first login.');
    
  } catch (error) {
    console.error('❌ Error checking manager account:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 The manager account does not exist. Run add-manager.js first.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n💡 The password is incorrect. Check the credentials.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 The email format is invalid.');
    }
    
    process.exit(1);
  }
}

// Run the script
showManagerStatus()
  .then(() => {
    console.log('\n✅ Status check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Status check failed:', error);
    process.exit(1);
  });
