import React from 'react';
import { Package, CheckCircle, XCircle, Clock, CheckSquare, Users, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentAdmin } from '../services/adminService';
import type { Admin } from '../types/admin';

interface SidebarProps {
  currentView: 'pending' | 'accepted' | 'completed' | 'rejected' | 'rescheduled' | 'clients' | 'admin';
  onViewChange: (view: 'pending' | 'accepted' | 'completed' | 'rejected' | 'rescheduled' | 'clients' | 'admin') => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      const admin = await getCurrentAdmin();
      setCurrentAdmin(admin);
    };
    loadAdminData();
  }, []);

  const menuItems = [
    {
      id: 'pending',
      label: 'Livraisons en attente',
      icon: Package,
      color: 'blue'
    },
    {
      id: 'accepted',
      label: 'Livraisons acceptées',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 'completed',
      label: 'Livraisons terminées',
      icon: CheckSquare,
      color: 'gray'
    },
    {
      id: 'rejected',
      label: 'Livraisons annulées',
      icon: XCircle,
      color: 'red'
    },
    {
      id: 'rescheduled',
      label: 'Livraisons reprogrammées',
      icon: Clock,
      color: 'yellow'
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      color: 'blue'
    },
    // N'afficher l'option administrateur que pour le superadmin
    ...(currentAdmin?.role === 'superadmin' ? [{
      id: 'admin',
      label: 'Administrateurs',
      icon: Shield,
      color: 'purple'
    }] : [])
  ] as const;

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">
            Gestion Livraisons
          </h1>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon, color }) => (
            <li key={id}>
              <button
                onClick={() => onViewChange(id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === id
                    ? `bg-${color}-100 text-${color}-700`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${currentView === id ? `text-${color}-600` : 'text-gray-400'}`} />
                <span className="font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}