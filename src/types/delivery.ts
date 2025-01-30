export type DeliveryStatus = 'pending' | 'accepted' | 'completed' | 'rejected' | 'rescheduled';

interface Person {
  companyName: string;
  firstName: string;
  isCompany: boolean;
  lastName: string;
  phone: string;
}

export interface DeliveryRequest {
  id: string;
  cashAmount: number;
  cashCollection: boolean;
  createdAt: string;
  deliveryAddress: string;
  isImmediate: boolean;
  packageDescription: string;
  pickupAddress: string;
  receiver: Person;
  scheduledTime: string;
  selectedVehicles: string[];
  sender: Person & {
    specialInstructions: string;
  };
  status: DeliveryStatus;
  completedAt?: string;
  rejectedAt?: string;
  rescheduledAt?: string;
  rescheduledTime?: string;
  rejectionReason?: string;
}