const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration (same as your app)
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

async function setupAdmin() {
  try {
    const adminEmail = 'manager@eswabuy.com';
    const adminPassword = 'admin123456'; // Change this to a secure password
    
    console.log('Creating admin user...');
    
    // Create the admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;
    
    console.log('Admin user created with UID:', adminUid);
    
    // Create the user document in Firestore
    const userData = {
      uid: adminUid,
      email: adminEmail,
      role: 'admin',
      active: true,
      companyId: 'eswabuy',
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', adminUid), userData);
    console.log('User document created in Firestore');

    // Ensure company document exists and mark this admin as owner
    await setDoc(doc(db, 'companies', 'eswabuy'), {
      companyId: 'eswabuy',
      name: 'eswabuy',
      ownerUid: adminUid,
      createdAt: new Date(),
      createdBy: adminUid
    }, { merge: true });
    console.log('Company document ensured');
    
    // Create the authorized manager entry
    const authorizedManagerData = {
      email: adminEmail.toLowerCase(),
      active: true,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'authorized_managers', adminUid), authorizedManagerData);
    console.log('Authorized manager entry created');
    
    console.log('\n✅ Setup complete!');
    console.log('Admin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\nYou can now sign in to your StockFlow application.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nUser already exists. You can try signing in with:');
      console.log('Email: manager@eswabuy.com');
      console.log('Password: (the password you set)');
    }
  }
}

// Run the setup
setupAdmin();
