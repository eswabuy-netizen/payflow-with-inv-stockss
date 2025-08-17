import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updatePassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  adminSignup: (email: string, password: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const adminSignup = async (email: string, password: string) => {
    const invitation = await userService.checkAdminInvitation(email);
    if (!invitation) {
      throw new Error('No valid admin invitation found for this email. Please contact your manager for an invitation.');
    }
    await userService.completeAdminSignup(email, password, invitation.id);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    await updatePassword(auth.currentUser, newPassword);
    
    if (currentUser?.isTemporaryPassword) {
      await userService.updateAttendantPassword(currentUser.uid);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user account exists and is active
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let userData: User;
      
      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        if (!userData.active) {
          await signOut(auth);
          throw new Error('Your account has been deactivated. Please contact an administrator.');
        }
        } else {
          // If user document doesn't exist, create a basic one with fallback companyId
          const emailDomainPart = (userCredential.user.email || '').split('@')[1] || '';
          const companyId = emailDomainPart ? emailDomainPart.split('.')[0] : 'default-company';
          userData = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            role: 'attendant',
            active: true,
            companyId: companyId,
            createdAt: new Date()
          };
          await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        }
      
      // Update the current user state immediately after successful login
      setCurrentUser(userData);
      
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else {
        throw new Error('Failed to sign in. Please check your credentials and try again.');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('Auth state changed:', firebaseUser ? firebaseUser.email : 'null');
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          console.log('User document found:', userData);
          if (userData.active !== false) {
            setCurrentUser(userData);
            console.log('Setting current user:', userData);
          } else {
            console.log('User account deactivated, signing out');
            await signOut(auth);
            setCurrentUser(null);
          }
        } else {
          console.log('User document not found');
          setCurrentUser(null);
        }
      } else {
        console.log('No Firebase user, setting current user to null');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    adminSignup,
    updateUserPassword,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};