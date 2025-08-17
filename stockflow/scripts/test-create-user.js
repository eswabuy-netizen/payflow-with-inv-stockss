import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

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

async function testCreateUser() {
  try {
    const managerEmail = 'manager@yourcompany.com';
    const managerPassword = 'TempPassword123!';
    const testUserEmail = 'testuser@yourcompany.com';
    const testUserPassword = 'TestPass123!';
    
    console.log('Testing user creation as manager...');
    
    // Sign in as manager
    const managerCredential = await signInWithEmailAndPassword(auth, managerEmail, managerPassword);
    console.log('✅ Successfully signed in as manager');
    
    // Get manager's company ID
    const managerDoc = await getDoc(doc(db, 'users', managerCredential.user.uid));
    const managerData = managerDoc.data();
    const companyId = managerData.companyId;
    
    console.log(`Manager company ID: ${companyId}`);
    
    // Create a test user
    console.log('Creating test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testUserEmail, testUserPassword);
    console.log('✅ Firebase auth user created');
    
    // Create user document
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: 'attendant',
      companyId: companyId,
      isTemporaryPassword: true,
      createdBy: managerCredential.user.uid,
      createdAt: new Date(),
      active: true
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    console.log('✅ User document created successfully');
    
    // Clean up - delete the test user
    console.log('Cleaning up test user...');
    await deleteDoc(doc(db, 'users', userCredential.user.uid));
    console.log('✅ Test user document deleted');
    
    console.log('\n🎉 User creation test completed successfully!');
    console.log('The manager can now create users in the application.');
    
  } catch (error) {
    console.error('❌ Error testing user creation:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Permission denied. This might be due to:');
      console.log('1. Firestore rules not deployed yet');
      console.log('2. Browser cache needs to be cleared');
      console.log('3. Application needs to be refreshed');
    }
    
    process.exit(1);
  }
}

// Run the test
testCreateUser()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
