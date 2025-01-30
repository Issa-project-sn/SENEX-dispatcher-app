import React, { useEffect, useState } from 'react';
import { DeliveryCard } from '../components/DeliveryCard';
import { fetchRejectedDeliveries } from '../services/deliveryService';
import type { DeliveryRequest } from '../types/delivery';
import { XCircle, ArrowLeft } from 'lucide-react';

interface RejectedDeliveriesProps {
  onBack: () => void;
}

export function RejectedDeliveries({ onBack }: RejectedDeliveriesProps) {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRejectedDeliveries();
  }, []);

  const loadRejectedDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRejectedDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading rejected deliveries:', error);
      setError('Erreur lors du chargement des livraisons annulées');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Livraisons Annulées
              </h1>
            </div>
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <button
            onClick={loadRejectedDeliveries}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Rafraîchir la liste
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2">Chargement des livraisons annulées...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <p className="text-gray-500">Aucune livraison annulée à afficher</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                />
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}