import { 
  collection, 
  getDocs,
  updateDoc,
  doc, 
  query,
  addDoc,
  deleteDoc,
  getDoc,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { DeliveryRequest, DeliveryStatus } from '../types/delivery';

const COLLECTIONS = {
  PENDING: 'delivery_requests',
  ACCEPTED: 'accepted_deliveries',
  COMPLETED: 'completed_deliveries',
  REJECTED: 'rejected_deliveries',
  RESCHEDULED: 'rescheduled_deliveries'
};

export async function fetchDeliveries(): Promise<DeliveryRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PENDING));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryRequest));
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    throw error;
  }
}

export async function fetchAcceptedDeliveries(): Promise<DeliveryRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ACCEPTED));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryRequest));
  } catch (error) {
    console.error('Error fetching accepted deliveries:', error);
    throw error;
  }
}

export async function fetchCompletedDeliveries(): Promise<DeliveryRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COMPLETED));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryRequest));
  } catch (error) {
    console.error('Error fetching completed deliveries:', error);
    throw error;
  }
}

export async function fetchRejectedDeliveries(): Promise<DeliveryRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.REJECTED));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryRequest));
  } catch (error) {
    console.error('Error fetching rejected deliveries:', error);
    throw error;
  }
}

export async function fetchRescheduledDeliveries(): Promise<DeliveryRequest[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.RESCHEDULED));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryRequest));
  } catch (error) {
    console.error('Error fetching rescheduled deliveries:', error);
    throw error;
  }
}

export async function updateDeliveryStatus(
  id: string, 
  status: DeliveryStatus, 
  pickupTime?: string,
  reason?: string
): Promise<void> {
  try {
    // Déterminer la collection source en fonction du statut actuel
    let sourceCollection = COLLECTIONS.PENDING;
    let targetCollection = COLLECTIONS.ACCEPTED;

    // Vérifier d'abord dans la collection des livraisons reprogrammées
    let deliveryRef = doc(db, COLLECTIONS.RESCHEDULED, id);
    let deliverySnap = await getDoc(deliveryRef);

    // Si la livraison n'est pas dans la collection reprogrammée, vérifier dans la collection acceptée
    if (!deliverySnap.exists()) {
      deliveryRef = doc(db, COLLECTIONS.ACCEPTED, id);
      deliverySnap = await getDoc(deliveryRef);
      sourceCollection = COLLECTIONS.ACCEPTED;
    } else {
      sourceCollection = COLLECTIONS.RESCHEDULED;
    }

    // Si toujours pas trouvé, vérifier dans la collection en attente
    if (!deliverySnap.exists()) {
      deliveryRef = doc(db, COLLECTIONS.PENDING, id);
      deliverySnap = await getDoc(deliveryRef);
      sourceCollection = COLLECTIONS.PENDING;
    }

    if (!deliverySnap.exists()) {
      throw new Error('Document not found');
    }

    // Déterminer la collection cible en fonction du nouveau statut
    switch (status) {
      case 'completed':
        targetCollection = COLLECTIONS.COMPLETED;
        break;
      case 'rejected':
        targetCollection = COLLECTIONS.REJECTED;
        break;
      case 'rescheduled':
        targetCollection = COLLECTIONS.RESCHEDULED;
        break;
      case 'accepted':
        targetCollection = COLLECTIONS.ACCEPTED;
        break;
    }

    const deliveryData = {
      ...deliverySnap.data(),
      status,
      ...(pickupTime && { scheduledTime: pickupTime }),
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      ...(status === 'rejected' && { 
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      }),
      ...(status === 'rescheduled' && { 
        rescheduledAt: new Date().toISOString(),
        rescheduledTime: pickupTime
      })
    };

    // Ajouter à la nouvelle collection
    await addDoc(collection(db, targetCollection), deliveryData);
    // Supprimer de l'ancienne collection
    await deleteDoc(deliveryRef);
  } catch (error) {
    console.error('Error updating delivery:', error);
    throw error;
  }
}

export async function bulkUpdateDeliveryStatus(
  ids: string[], 
  status: DeliveryStatus, 
  pickupTime?: string,
  reason?: string
): Promise<void> {
  try {
    await Promise.all(ids.map(id => updateDeliveryStatus(id, status, pickupTime, reason)));
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw error;
  }
}