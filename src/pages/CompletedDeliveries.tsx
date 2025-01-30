import React, { useEffect, useState } from 'react';
import { DeliveryCard } from '../components/DeliveryCard';
import { fetchCompletedDeliveries } from '../services/deliveryService';
import type { DeliveryRequest } from '../types/delivery';
import { Package, ArrowLeft, CheckCircle, Filter, X } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';

interface CompletedDeliveriesProps {
  onBack: () => void;
}

interface FilterState {
  company: string;
  startDate: string;
  endDate: string;
}

export function CompletedDeliveries({ onBack }: CompletedDeliveriesProps) {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    company: '',
    startDate: '',
    endDate: ''
  });
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    loadCompletedDeliveries();
  }, []);

  useEffect(() => {
    // Extraire la liste unique des entreprises
    const uniqueCompanies = new Set<string>();
    deliveries.forEach(delivery => {
      if (delivery.sender.isCompany) {
        uniqueCompanies.add(delivery.sender.companyName);
      }
      if (delivery.receiver.isCompany) {
        uniqueCompanies.add(delivery.receiver.companyName);
      }
    });
    setCompanies(Array.from(uniqueCompanies).sort());

    // Appliquer les filtres
    applyFilters();
  }, [deliveries, filters]);

  const loadCompletedDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCompletedDeliveries();
      setDeliveries(data);
      setFilteredDeliveries(data);
    } catch (error) {
      console.error('Error loading completed deliveries:', error);
      setError('Erreur lors du chargement des livraisons terminées');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveries];

    // Filtre par entreprise
    if (filters.company) {
      filtered = filtered.filter(delivery => 
        (delivery.sender.isCompany && delivery.sender.companyName === filters.company) ||
        (delivery.receiver.isCompany && delivery.receiver.companyName === filters.company)
      );
    }

    // Filtre par date
    if (filters.startDate && filters.endDate) {
      const start = parseISO(filters.startDate);
      const end = parseISO(filters.endDate);
      
      filtered = filtered.filter(delivery => {
        const completedDate = parseISO(delivery.completedAt || '');
        return isWithinInterval(completedDate, { start, end });
      });
    }

    setFilteredDeliveries(filtered);
  };

  const resetFilters = () => {
    setFilters({
      company: '',
      startDate: '',
      endDate: ''
    });
    setFilteredDeliveries(deliveries);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Livraisons Terminées
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtrer
              </button>
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </button>
            </div>
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
            onClick={loadCompletedDeliveries}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Rafraîchir la liste
          </button>
        </div>

        {/* Affichage des filtres actifs */}
        {(filters.company || filters.startDate) && (
          <div className="mb-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Filtres actifs:</span>
            {filters.company && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {filters.company}
              </span>
            )}
            {filters.startDate && filters.endDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {format(parseISO(filters.startDate), 'dd/MM/yyyy')} - {format(parseISO(filters.endDate), 'dd/MM/yyyy')}
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2">Chargement des livraisons terminées...</p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <p className="text-gray-500">Aucune livraison terminée à afficher</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                />
              ))}
            </ul>
          </div>
        )}

        {/* Modal de filtrage */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Filtrer les livraisons</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Filtre par entreprise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <select
                    value={filters.company}
                    onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Toutes les entreprises</option>
                    {companies.map(company => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    resetFilters();
                    setShowFilterModal(false);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}