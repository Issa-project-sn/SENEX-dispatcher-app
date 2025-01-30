import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onAccept: () => void;
  onComplete?: () => void;
  showComplete?: boolean;
}

export function BulkActions({ selectedCount, onAccept, onComplete, showComplete }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedCount} livraison{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
        </div>
        <div className="space-x-2">
          {showComplete ? (
            <button
              onClick={onComplete}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Terminer les livraisons
            </button>
          ) : (
            <button
              onClick={onAccept}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Clock className="w-4 h-4 mr-2" />
              Accepter les livraisons
            </button>
          )}
        </div>
      </div>
    </div>
  );
}