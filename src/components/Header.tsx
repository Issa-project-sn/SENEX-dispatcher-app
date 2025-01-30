import React from 'react';
import { Package } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Livraisons
          </h1>
        </div>
      </div>
    </header>
  );
}