import React, { useEffect, useState } from 'react';
import { DeliveryCard } from '../components/DeliveryCard';
import { BulkActions } from '../components/BulkActions';
import { fetchAcceptedDeliveries, bulkUpdateDeliveryStatus } from '../services/deliveryService';
import type { DeliveryRequest } from '../types/delivery';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface AcceptedDeliveriesProps {
  onBack: () => void;
}

export function AcceptedDeliveries({ onBack }: AcceptedDeliveriesProps) {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeliveries, setSelectedDeliveries] = useState<Set<string>>(new Set());
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'complete' | 'reject' | 'reschedule' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');

  useEffect(() => {
    loadAcceptedDeliveries();
  }, []);

  const loadAcceptedDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAcceptedDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading accepted deliveries:', error);
      setError('Erreur lors du chargement des livraisons acceptées');
    } finally {
      setLoading(false);
    }
  };

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
    if (selectedDeliveries.size === 0) return;

    try {
      switch (selectedAction) {
        case 'complete':
          await bulkUpdateDeliveryStatus(Array.from(selectedDeliveries), 'completed');
          break;
        case 'reject':
          if (!actionReason) {
            alert('Veuillez fournir une raison d\'annulation');
            return;
          }
          await bulkUpdateDeliveryStatus(Array.from(selectedDeliveries), 'rejected', undefined, actionReason);
          break;
        case 'reschedule':
          if (!newScheduleTime) {
            alert('Veuillez sélectionner une nouvelle date');
            return;
          }
          await bulkUpdateDeliveryStatus(Array.from(selectedDeliveries), 'rescheduled', newScheduleTime);
          break;
      }
      
      setSelectedDeliveries(new Set());
      setShowActionModal(false);
      setSelectedAction(null);
      setActionReason('');
      setNewScheduleTime('');
      await loadAcceptedDeliveries();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Erreur lors de la mise à jour des livraisons');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Livraisons Acceptées
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

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4 flex space-x-4">
          <button
            onClick={loadAcceptedDeliveries}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Rafraîchir la liste
          </button>
          {selectedDeliveries.size > 0 && (
            <>
              <button
                onClick={() => {
                  setSelectedAction('complete');
                  setShowActionModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Terminer les livraisons
              </button>
              <button
                onClick={() => {
                  setSelectedAction('reject');
                  setShowActionModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Annuler les livraisons
              </button>
              <button
                onClick={() => {
                  setSelectedAction('reschedule');
                  setShowActionModal(true);
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Reprogrammer les livraisons
              </button>
            </>
          )}
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2">Chargement des livraisons acceptées...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <p className="text-gray-500">Aucune livraison acceptée à afficher</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  selected={selectedDeliveries.has(delivery.id)}
                  onSelect={handleSelect}
                />
              ))}
            </ul>
          </div>
        )}

        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">
                {selectedAction === 'complete' && 'Terminer les livraisons'}
                {selectedAction === 'reject' && 'Annuler les livraisons'}
                {selectedAction === 'reschedule' && 'Reprogrammer les livraisons'}
              </h3>

              {selectedAction === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison de l'annulation
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}

              {selectedAction === 'reschedule' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouvelle date de livraison
                  </label>
                  <input
                    type="datetime-local"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedAction(null);
                    setActionReason('');
                    setNewScheduleTime('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}