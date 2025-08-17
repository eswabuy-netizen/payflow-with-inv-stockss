import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

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

async function testAdminInvitationReal() {
  try {
    const managerEmail = 'manager@yourcompany.com';
    const managerPassword = 'TempPassword123!';
    const testAdminEmail = 'testadmin@example.com';
    
    console.log('🧪 Testing Admin Invitation with Real Authentication...\n');
    
    // Step 1: Sign in as manager
    console.log('1️⃣ Signing in as manager...');
    const userCredential = await signInWithEmailAndPassword(auth, managerEmail, managerPassword);
    console.log('✅ Successfully signed in as manager');
    console.log(`Manager UID: ${userCredential.user.uid}`);
    
    // Step 2: Create admin invitation
    console.log('\n2️⃣ Creating admin invitation...');
    const invitationData = {
      email: testAdminEmail.toLowerCase(),
      companyId: 'default-company',
      role: 'admin',
      invitedBy: userCredential.user.uid,
      invitedAt: Timestamp.now(),
      status: 'pending',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    };
    
    console.log('Invitation data:', invitationData);
    
    const invitationRef = await addDoc(collection(db, 'admin_invitations'), invitationData);
    console.log('✅ Admin invitation created successfully!');
    console.log(`Invitation ID: ${invitationRef.id}`);
    
    console.log('\n🎉 Test completed successfully!');
    console.log('The admin invitation system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Permission denied - possible issues:');
      console.log('1. User role is not "manager"');
      console.log('2. User company ID mismatch');
      console.log('3. Firestore rules not deployed');
      console.log('4. Invitation data structure invalid');
    }
  }
}

// Run the test
testAdminInvitationReal()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
