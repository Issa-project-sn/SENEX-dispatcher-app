import React, { useState } from 'react';
import { DeliveryCard } from './DeliveryCard';
import { BulkActions } from './BulkActions';
import { bulkUpdateDeliveryStatus } from '../services/deliveryService';
import type { DeliveryRequest } from '../types/delivery';

interface DeliveryListProps {
  deliveries: DeliveryRequest[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  showComplete?: boolean;
}

export function DeliveryList({ deliveries, loading, onRefresh, showComplete }: DeliveryListProps) {
  const [selectedDeliveries, setSelectedDeliveries] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedDeliveries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkAction = async () => {
    try {
      await bulkUpdateDeliveryStatus(
        Array.from(selectedDeliveries),
        showComplete ? 'completed' : 'accepted',
        selectedDate || undefined
      );
      setSelectedDeliveries(new Set());
      await onRefresh();
    } catch (error) {
      console.error('Error in bulk action:', error);
      setError('Erreur lors de la mise à jour des livraisons');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Chargement des livraisons...</p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8 bg-white shadow rounded-lg">
        <p className="text-gray-500">Aucune livraison à afficher</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              selected={selectedDeliveries.has(delivery.id)}
              onSelect={handleSelect}
              onDateChange={setSelectedDate}
            />
          ))}
        </ul>
      </div>

      <BulkActions
        selectedCount={selectedDeliveries.size}
        onAccept={handleBulkAction}
        onComplete={showComplete ? handleBulkAction : undefined}
        showComplete={showComplete}
      />
    </>
  );
}