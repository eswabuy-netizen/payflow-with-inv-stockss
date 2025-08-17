import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const userService = {
  // Check if user is authorized manager
  async isAuthorizedManager(email: string): Promise<boolean> {
    const q = query(
      collection(db, 'authorized_managers'),
      where('email', '==', email.toLowerCase()),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  // Get all attendants for a company
  async getAttendants(companyId: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['attendant', 'admin']),
      where('companyId', '==', companyId),
      orderBy('email')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  },

  // Create admin invitation (manager only provides email)
  async createAdminInvitation(email: string, managerUid: string, companyId: string) {
    // Check if a user already exists in the same company (query must match security rules)
    const existingUserQuery = query(
      collection(db, 'users'),
      where('companyId', '==', companyId),
      where('email', '==', email.toLowerCase())
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);
    
    if (!existingUserSnapshot.empty) {
      throw new Error('A user with this email already exists');
    }

    // Create invitation document
    const invitationData = {
      email: email.toLowerCase(),
      companyId: companyId,
      role: 'admin',
      invitedBy: managerUid,
      invitedAt: Timestamp.now(),
      status: 'pending',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
    };

    const invitationRef = await addDoc(collection(db, 'admin_invitations'), invitationData);
    return invitationRef.id;
  },

  // Check if admin invitation exists and is valid
  async checkAdminInvitation(email: string): Promise<any> {
    const q = query(
      collection(db, 'admin_invitations'),
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data();
    // Basic client-side expiry validation (rules no longer enforce it to avoid query failures)
    if (data.expiresAt && data.expiresAt.toDate && data.expiresAt.toDate() < new Date()) {
      return null;
    }
    return { id: querySnapshot.docs[0].id, ...data };
  },

  // Complete admin signup with invitation
  async completeAdminSignup(email: string, password: string, invitationId: string) {
    // Get invitation details
    const invitationRef = doc(db, 'admin_invitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      throw new Error('Invalid invitation');
    }
    
    const invitationData = invitationDoc.data();
    
    if (invitationData.email !== email.toLowerCase()) {
      throw new Error('Email does not match invitation');
    }
    
    if (invitationData.status !== 'pending') {
      throw new Error('Invitation has already been used or expired');
    }
    
    if (invitationData.expiresAt.toDate() < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Determine the company this admin belongs to. Treat each admin signup as a new company owner.
    // Prefer an explicit companyId provided on the signup form; otherwise derive from the email domain.
    let finalCompanyId: string;
    let finalCompanyName: string | undefined;
    try {
      const extra = (window as any)?.__signupCompanyInfo;
      const derivedFromEmail = (email.split('@')[1] || '').split('.')[0] || '';
      finalCompanyId = (extra?.companyId || derivedFromEmail || `company-${userCredential.user.uid.slice(0, 6)}`).toLowerCase();
      finalCompanyName = extra?.companyName || finalCompanyId;
    } catch (_) {
      const derivedFromEmail = (email.split('@')[1] || '').split('.')[0] || '';
      finalCompanyId = (derivedFromEmail || `company-${userCredential.user.uid.slice(0, 6)}`).toLowerCase();
      finalCompanyName = finalCompanyId;
    }

    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      role: 'admin',
      companyId: finalCompanyId,
      isTemporaryPassword: false,
      createdBy: invitationData.invitedBy,
      createdAt: Timestamp.now(),
      active: true
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    // Always create or upsert the company document for this admin
    await setDoc(doc(db, 'companies', finalCompanyId), {
      companyId: finalCompanyId,
      name: finalCompanyName,
      ownerUid: userCredential.user.uid,
      createdAt: Timestamp.now(),
      createdBy: userCredential.user.uid
    }, { merge: true });
    
    // Mark invitation as completed
    await updateDoc(invitationRef, {
      status: 'completed',
      completedAt: Timestamp.now(),
      completedBy: userCredential.user.uid
    });
    
    return userCredential.user.uid;
  },

  // Create attendant account
  async createAttendant(email: string, tempPassword: string, adminUid: string, companyId: string, role: 'attendant' | 'admin' = 'attendant') {
    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    
    // Create user document
    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      role: role,
      companyId,
      isTemporaryPassword: true,
      createdBy: adminUid,
      createdAt: Timestamp.now(),
      active: true
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    return userCredential.user.uid;
  },

  // Update attendant password (when they change from temp)
  async updateAttendantPassword(uid: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isTemporaryPassword: false,
      passwordUpdatedAt: Timestamp.now()
    });
  },

  // Deactivate attendant
  async deactivateAttendant(uid: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      active: false,
      deactivatedAt: Timestamp.now()
    });
  },

  // Reactivate attendant
  async reactivateAttendant(uid: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      active: true,
      reactivatedAt: Timestamp.now()
    });
  }
};