import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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

async function fixUserRole() {
  try {
    const userEmail = 'mxomk82@gmail.com';
    const userPassword = 'your-password-here'; // You'll need to provide the actual password
    
    console.log('🔧 Fixing user role...');
    console.log(`Email: ${userEmail}`);
    
    // Sign in as the user
    console.log('\n📱 Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const user = userCredential.user;
    
    console.log('✅ Login successful!');
    console.log(`User UID: ${user.uid}`);
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document found');
      console.log('Current user data:', JSON.stringify(userData, null, 2));
      
      // Check if role needs to be updated
      if (userData.role === 'admin' || userData.role === 'manager') {
        console.log('✅ User already has admin/manager role');
        return;
      }
      
      // Update the role to admin
      console.log('🔄 Updating role to admin...');
      await updateDoc(userDocRef, {
        role: 'admin',
        active: true
      });
      
      console.log('✅ Role updated successfully to admin');
      
    } else {
      // Create user document if it doesn't exist
      console.log('📝 Creating user document...');
      const companyId = userEmail.split('@')[1].split('.')[0]; // Extract from email domain
      
      const userData = {
        uid: user.uid,
        email: userEmail,
        role: 'admin',
        active: true,
        companyId: companyId,
        createdAt: new Date()
      };
      
      await setDoc(userDocRef, userData);
      console.log('✅ User document created with admin role');
      console.log(`Company ID: ${companyId}`);
    }
    
    console.log('\n🎉 User role fix complete!');
    console.log('The user should now be able to process sales.');
    
  } catch (error) {
    console.error('❌ Error fixing user role:', error);
    if (error.code === 'auth/user-not-found') {
      console.log('User not found in Firebase Auth');
    } else if (error.code === 'auth/wrong-password') {
      console.log('Wrong password provided');
    } else {
      console.log('Other error:', error.message);
    }
  }
}

// Run the script
fixUserRole()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
