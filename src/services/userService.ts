import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface User {
  id: string;
  email: string;
  company: {
    address: string;
    email: string;
    industry: string;
    name: string;
    phone: string;
  };
  createdAt: any; // Timestamp from Firebase
}

function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  // Convertir le timestamp Firebase en Date
  const date = new Date(timestamp.seconds * 1000);
  
  // Formatter la date en français
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? formatDate(data.createdAt) : ''
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}