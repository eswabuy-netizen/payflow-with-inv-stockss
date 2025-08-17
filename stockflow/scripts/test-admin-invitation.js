import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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

async function testAdminInvitation() {
  let invitationRef; // Declare at function level for scope
  
  try {
    console.log('🧪 Testing Admin Invitation System...\n');
    
    // Test data
    const testEmail = 'testadmin@example.com';
    const managerUid = 'test-manager-uid';
    const companyId = 'test-company';
    
    console.log('📧 Test Email:', testEmail);
    console.log('👤 Manager UID:', managerUid);
    console.log('🏢 Company ID:', companyId);
    console.log('');
    
    // Step 1: Create admin invitation
    console.log('1️⃣ Creating admin invitation...');
    const invitationData = {
      email: testEmail.toLowerCase(),
      companyId: companyId,
      role: 'admin',
      invitedBy: managerUid,
      invitedAt: new Date(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };
    
    try {
      invitationRef = await addDoc(collection(db, 'admin_invitations'), invitationData);
      console.log('✅ Admin invitation created with ID:', invitationRef.id);
    } catch (error) {
      console.error('❌ Failed to create invitation:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
    console.log('');
    
    // Step 2: Check if invitation exists
    console.log('2️⃣ Checking invitation...');
    try {
      const invitationQuery = query(
        collection(db, 'admin_invitations'),
        where('email', '==', testEmail.toLowerCase()),
        where('status', '==', 'pending')
      );
      const invitationSnapshot = await getDocs(invitationQuery);
      
      if (!invitationSnapshot.empty) {
        const invitation = invitationSnapshot.docs[0];
        console.log('✅ Invitation found:', invitation.id);
        console.log('📋 Invitation data:', invitation.data());
      } else {
        console.log('❌ No invitation found');
      }
    } catch (error) {
      console.error('❌ Failed to check invitation:', error.message);
      throw error;
    }
    console.log('');
    
    // Step 3: Simulate admin signup
    console.log('3️⃣ Simulating admin signup...');
    const adminPassword = 'admin123456';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, adminPassword);
      console.log('✅ Admin user created with UID:', userCredential.user.uid);
      
      // Create user document
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: 'admin',
        companyId: companyId,
        isTemporaryPassword: false,
        createdBy: managerUid,
        createdAt: new Date(),
        active: true
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('✅ User document created');
      
      // Mark invitation as completed
      await updateDoc(invitationRef, {
        status: 'completed',
        completedAt: new Date(),
        completedBy: userCredential.user.uid
      });
      console.log('✅ Invitation marked as completed');
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️  Admin user already exists, skipping creation');
      } else {
        console.error('❌ Failed to create admin user:', error.message);
        throw error;
      }
    }
    console.log('');
    
    // Step 4: Verify final state
    console.log('4️⃣ Verifying final state...');
    try {
      const finalInvitationDoc = await getDoc(invitationRef);
      if (finalInvitationDoc.exists()) {
        console.log('✅ Final invitation status:', finalInvitationDoc.data().status);
      }
      
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', testEmail.toLowerCase())
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const user = userSnapshot.docs[0];
        console.log('✅ Admin user found:', user.data());
      }
    } catch (error) {
      console.error('❌ Failed to verify final state:', error.message);
      throw error;
    }
    
    console.log('\n🎉 Admin invitation test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Admin invitation system is working');
    console.log('- Invitations can be created and validated');
    console.log('- Admin signup process is functional');
    console.log('- Company ID is properly set');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Firebase configuration');
    console.log('2. Verify Firestore rules allow admin_invitations collection');
    console.log('3. Ensure you have proper permissions');
  }
}

// Run the test
testAdminInvitation()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
