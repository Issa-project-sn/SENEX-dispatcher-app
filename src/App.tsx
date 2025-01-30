import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { DeliveryList } from './components/DeliveryList';
import { AcceptedDeliveries } from './pages/AcceptedDeliveries';
import { CompletedDeliveries } from './pages/CompletedDeliveries';
import { RejectedDeliveries } from './pages/RejectedDeliveries';
import { RescheduledDeliveries } from './pages/RescheduledDeliveries';
import { Clients } from './pages/Clients';
import { AdminManagement } from './pages/AdminManagement';
import { ProfileSettings } from './pages/ProfileSettings';
import { Login } from './pages/Login';
import { fetchDeliveries } from './services/deliveryService';
import type { DeliveryRequest } from './types/delivery';
import { LogOut, User } from 'lucide-react';
import { getCurrentAdmin } from './services/adminService';
import type { Admin } from './types/admin';

function AppContent() {
  const [currentView, setCurrentView] = useState<'pending' | 'accepted' | 'completed' | 'rejected' | 'rescheduled' | 'clients' | 'admin' | 'profile'>('pending');
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const adminData = await getCurrentAdmin();
          setCurrentAdmin(adminData);
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      } else {
        setCurrentAdmin(null);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadDeliveries();
    }
  }, [user]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setError('Erreur lors du chargement des livraisons');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Erreur lors de la déconnexion');
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'accepted':
        return <AcceptedDeliveries onBack={() => setCurrentView('pending')} />;
      case 'completed':
        return <CompletedDeliveries onBack={() => setCurrentView('pending')} />;
      case 'rejected':
        return <RejectedDeliveries onBack={() => setCurrentView('pending')} />;
      case 'rescheduled':
        return <RescheduledDeliveries onBack={() => setCurrentView('pending')} />;
      case 'clients':
        return <Clients onBack={() => setCurrentView('pending')} />;
      case 'admin':
        return <AdminManagement onBack={() => setCurrentView('pending')} />;
      case 'profile':
        return <ProfileSettings onBack={() => setCurrentView('pending')} />;
      default:
        return (
          <div className="p-6">
            <div className="mb-4">
              <button
                onClick={loadDeliveries}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Rafraîchir les livraisons
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <DeliveryList
              deliveries={deliveries}
              loading={loading}
              onRefresh={loadDeliveries}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 ml-64">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <User className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {currentAdmin?.firstName} {currentAdmin?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentAdmin?.role === 'superadmin' ? 'Super Administrateur' : 'Administrateur'}
                  </p>
                </div>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}