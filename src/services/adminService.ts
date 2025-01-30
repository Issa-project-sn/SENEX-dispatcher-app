import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Admin, CreateAdminData, AdminRole } from '../types/admin';

const SUPER_ADMIN_EMAIL = 'bayeissaniang@outlook.com';
const SUPER_ADMIN_PASSWORD = 'Terminator765/!';

export async function initializeSuperAdmin(): Promise<void> {
  try {
    // 1. Vérifier si le super admin existe déjà dans Firestore
    const adminRef = collection(db, 'administrators');
    const q = query(adminRef, where('email', '==', SUPER_ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('Super admin already exists in Firestore');
      return;
    }

    // 2. Créer le compte Firebase Authentication
    const auth = getAuth();
    let userCredential;
    
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD
      );
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        // Si le compte existe déjà dans Auth, on se connecte
        userCredential = await signInWithEmailAndPassword(
          auth,
          SUPER_ADMIN_EMAIL,
          SUPER_ADMIN_PASSWORD
        );
      } else {
        throw authError;
      }
    }

    // 3. Créer l'entrée dans Firestore
    const superAdminData = {
      email: SUPER_ADMIN_EMAIL,
      firstName: 'Baye Issa',
      lastName: 'NIANG',
      role: 'superadmin' as AdminRole,
      createdAt: Timestamp.now()
    };

    await setDoc(doc(db, 'administrators', userCredential.user.uid), superAdminData);
    console.log('Super administrateur créé avec succès dans Firestore');

  } catch (error) {
    console.error('Error initializing super admin:', error);
    throw error;
  }
}

export async function fetchAdmins(): Promise<Admin[]> {
  const adminRef = collection(db, 'administrators');
  const querySnapshot = await getDocs(adminRef);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toLocaleString('fr-FR')
  })) as Admin[];
}

export async function createAdmin(adminData: CreateAdminData): Promise<void> {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('Non authentifié');
  }

  try {
    // Vérifier si l'utilisateur actuel est un super admin
    const currentAdminDoc = await getDoc(doc(db, 'administrators', auth.currentUser.uid));
    if (!currentAdminDoc.exists() || currentAdminDoc.data().role !== 'superadmin') {
      throw new Error('Seul le super administrateur peut créer des comptes admin');
    }

    // Créer le compte Firebase Authentication pour le nouvel admin
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    );

    // Créer l'entrée dans Firestore
    await setDoc(doc(db, 'administrators', userCredential.user.uid), {
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      role: adminData.role,
      createdAt: Timestamp.now(),
      createdBy: auth.currentUser.uid
    });

  } catch (error) {
    console.error('Error creating administrator:', error);
    throw error;
  }
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const auth = getAuth();
  if (!auth.currentUser) return null;

  const docRef = doc(db, 'administrators', auth.currentUser.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt.toDate().toLocaleString('fr-FR')
  } as Admin;
}

export async function updateAdminProfile(profileData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<void> {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('Non authentifié');
  }

  try {
    // Mettre à jour l'email dans Firebase Auth si modifié
    if (profileData.email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, profileData.email);
    }

    // Mettre à jour les données dans Firestore
    const adminRef = doc(db, 'administrators', auth.currentUser.uid);
    await updateDoc(adminRef, {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function updateAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('Non authentifié');
  }

  try {
    // Réauthentifier l'utilisateur avant de changer le mot de passe
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email!,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);

    // Mettre à jour le mot de passe
    await updatePassword(auth.currentUser, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}