import React, { useEffect, useState } from 'react';
import { Users, ArrowLeft, Plus, Shield } from 'lucide-react';
import { fetchAdmins, createAdmin, getCurrentAdmin } from '../services/adminService';
import type { Admin, CreateAdminData, AdminRole } from '../types/admin';

interface AdminManagementProps {
  onBack: () => void;
}

export function AdminManagement({ onBack }: AdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [newAdminData, setNewAdminData] = useState<CreateAdminData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'admin'
  });

  useEffect(() => {
    loadCurrentAdmin();
  }, []);

  useEffect(() => {
    if (currentAdmin?.role === 'superadmin') {
      loadAdmins();
    }
  }, [currentAdmin]);

  const loadCurrentAdmin = async () => {
    try {
      const admin = await getCurrentAdmin();
      setCurrentAdmin(admin);
      if (admin?.role !== 'superadmin') {
        onBack();
      }
    } catch (error) {
      console.error('Error loading current admin:', error);
      setError("Erreur lors du chargement des informations de l'administrateur");
      onBack();
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error loading administrators:', error);
      setError("Erreur lors du chargement des administrateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAdmin?.role !== 'superadmin') {
      setError("Vous n'avez pas les droits pour créer un administrateur");
      return;
    }

    try {
      await createAdmin(newAdminData);
      setShowCreateModal(false);
      setNewAdminData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'admin'
      });
      await loadAdmins();
    } catch (error) {
      console.error('Error creating administrator:', error);
      setError("Erreur lors de la création de l'administrateur");
    }
  };

  if (currentAdmin && currentAdmin.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Seul le super administrateur peut accéder à cette page.
          </p>
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Administrateurs
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouvel Administrateur
              </button>
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
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

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Chargement des administrateurs...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <li key={admin.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>{admin.email}</p>
                        <p className="mt-1">
                          Rôle : <span className="font-medium">{admin.role === 'superadmin' ? 'Super Administrateur' : 'Administrateur'}</span>
                        </p>
                        <p className="mt-1">
                          Créé le : <span className="font-medium">{admin.createdAt}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        admin.role === 'superadmin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">
                Créer un nouvel administrateur
              </h3>
              <form onSubmit={handleCreateAdmin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminData.firstName}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminData.lastName}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de compte
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-blue-600 h-4 w-4"
                          name="role"
                          value="admin"
                          checked={newAdminData.role === 'admin'}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value as AdminRole }))}
                        />
                        <span className="ml-2">Administrateur</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-purple-600 h-4 w-4"
                          name="role"
                          value="superadmin"
                          checked={newAdminData.role === 'superadmin'}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value as AdminRole }))}
                        />
                        <span className="ml-2">Super Administrateur</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}