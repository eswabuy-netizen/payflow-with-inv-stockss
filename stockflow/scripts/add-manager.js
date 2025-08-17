import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

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

async function addManager() {
  try {
    // Manager details - you can modify these values
    const managerEmail = 'manager@yourcompany.com';
    const managerPassword = 'TempPassword123!';
    const managerName = 'System Manager';
    const companyId = 'yourcompany'; // Use a concrete company id for the manager's company
    
    console.log('Creating manager account...');
    console.log(`Email: ${managerEmail}`);
    console.log(`Password: ${managerPassword}`);
    console.log(`Company ID: ${companyId}`);
    
    // Create Firebase Authentication user
    const userCredential = await createUserWithEmailAndPassword(auth, managerEmail, managerPassword);
    const user = userCredential.user;
    
    console.log('✅ Firebase Authentication user created successfully');
    console.log(`User UID: ${user.uid}`);
    
    // Create user document in 'users' collection with manager role
    const userData = {
      uid: user.uid,
      email: user.email,
      role: 'manager',
      displayName: managerName,
      active: true,
      companyId: companyId,
      isTemporaryPassword: true,
      createdAt: new Date(),
      passwordUpdatedAt: null
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ User document created in Firestore');

    // Ensure a company document exists for this manager
    await setDoc(doc(db, 'companies', companyId), {
      companyId,
      name: companyId,
      createdAt: new Date(),
      createdBy: user.uid
    }, { merge: true });
    console.log('✅ Company document ensured in Firestore');
    
    // Try to create authorized manager document (may fail due to permissions)
    let permissionError = null;
    try {
      const managerData = {
        email: managerEmail.toLowerCase(),
        displayName: managerName,
        companyId: companyId,
        active: true,
        createdBy: 'system',
        createdAt: new Date(),
        uid: user.uid
      };
      
      await addDoc(collection(db, 'authorized_managers'), managerData);
      console.log('✅ Authorized manager document created');
    } catch (error) {
      permissionError = error;
      console.log('⚠️  Could not create authorized_managers document due to permissions');
      console.log('💡 This is expected - you can create it manually after first login');
      console.log('\n📋 Manual creation instructions:');
      console.log('1. Login to your application with the created credentials');
      console.log('2. Go to Firebase Console > Firestore Database');
      console.log('3. Create a new document in the "authorized_managers" collection');
      console.log('4. Use this data:');
      console.log(JSON.stringify({
        email: managerEmail.toLowerCase(),
        displayName: managerName,
        companyId: companyId,
        active: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        uid: user.uid
      }, null, 2));
    }
    
    console.log('\n🎉 Manager account created successfully!');
    console.log('\n📱 Login Credentials:');
    console.log(`Email: ${managerEmail}`);
    console.log(`Password: ${managerPassword}`);
    
    console.log('\n🚀 You can now:');
    console.log('1. Login to your application with the credentials above');
    console.log('2. Use the admin panel to create additional admin users');
    console.log('3. Manage your company\'s data');
    
    console.log('\n⚠️  IMPORTANT: Change the temporary password after first login!');
    
    if (permissionError) {
      console.log('\n📝 Note: You may need to manually create the authorized_managers document');
      console.log('   in Firebase Console if you encounter permission issues.');
    }
    
  } catch (error) {
    console.error('❌ Error creating manager account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 This email is already registered. You can:');
      console.log('1. Use a different email address');
      console.log('2. Reset the password for the existing account');
      console.log('3. Check if the user already exists in your database');
    }
    
    process.exit(1);
  }
}

// Run the script
addManager()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
