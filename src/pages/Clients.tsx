import React, { useEffect, useState } from 'react';
import { Users, Phone, Building2, Mail, ArrowLeft, Search, MapPin } from 'lucide-react';
import type { User } from '../services/userService';
import { fetchUsers } from '../services/userService';

interface ClientsProps {
  onBack: () => void;
}

export function Clients({ onBack }: ClientsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.company?.name?.toLowerCase().includes(searchLower) ||
      user.company?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Clients
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

        <div className="mb-6 flex justify-between items-center">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={loadUsers}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Rafraîchir la liste
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Chargement des clients...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <p className="text-gray-500">Aucun client à afficher</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.company?.name}
                        </h3>
                      </div>
                      <div className="ml-7 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          <a href={`mailto:${user.company?.email}`} className="hover:text-blue-600">
                            {user.company?.email}
                          </a>
                        </div>
                        {user.company?.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-2" />
                            <a href={`tel:${user.company?.phone}`} className="hover:text-blue-600">
                              {user.company?.phone}
                            </a>
                          </div>
                        )}
                        {user.company?.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{user.company.address}</span>
                          </div>
                        )}
                        {user.company?.industry && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Secteur d'activité :</span> {user.company.industry}
                          </div>
                        )}
                        {user.createdAt && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Client depuis :</span> {user.createdAt}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}