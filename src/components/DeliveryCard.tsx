import React, { useState } from 'react';
import { MapPin, Phone, ChevronDown, ChevronUp, Package, Truck, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import type { DeliveryRequest } from '../types/delivery';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DeliveryCardProps {
  delivery: DeliveryRequest;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDateChange?: (date: string) => void;
}

export function DeliveryCard({ 
  delivery,
  selected,
  onSelect,
  onDateChange
}: DeliveryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const statusText = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    completed: 'Terminée'
  };

  const vehicleTypes = {
    car: 'Voiture',
    van: 'Camionnette',
    truck: 'Camion',
    bike: 'Moto/Scooter'
  };

  const companyName = delivery.sender.isCompany ? delivery.sender.companyName : `${delivery.sender.firstName} ${delivery.sender.lastName}`;

  return (
    <li className="relative">
      {onSelect && (
        <div className="absolute left-4 top-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(delivery.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      )}
      
      <div className={`p-4 ${onSelect ? 'pl-12' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium text-gray-900">
              {companyName}
            </p>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[delivery.status]}`}>
              {statusText[delivery.status]}
            </span>
            {delivery.status === 'completed' && delivery.completedAt && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                {format(parseISO(delivery.completedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="font-medium">Adresse de collecte</span>
            </div>
            <p className="pl-6">{delivery.pickupAddress}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="font-medium">Adresse de livraison</span>
            </div>
            <p className="pl-6">{delivery.deliveryAddress}</p>
          </div>
        </div>

        {delivery.sender.specialInstructions && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-700">Instructions spéciales</span>
            </div>
            <p className="text-sm text-blue-800 pl-6">{delivery.sender.specialInstructions}</p>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Informations sur le colis */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Détails du colis
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Description :</p>
                  <p className="text-sm font-medium">{delivery.packageDescription}</p>
                </div>
                {delivery.cashCollection && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Montant à collecter :
                    </div>
                    <p className="text-sm font-medium">{delivery.cashAmount} €</p>
                  </div>
                )}
              </div>
            </div>

            {/* Véhicules sélectionnés */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Véhicules requis
              </h4>
              <div className="flex flex-wrap gap-2">
                {delivery.selectedVehicles.map((vehicle) => (
                  <span
                    key={vehicle}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {vehicleTypes[vehicle as keyof typeof vehicleTypes] || vehicle}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expéditeur</h4>
                <p className="text-sm">
                  {delivery.sender.firstName} {delivery.sender.lastName}
                  {delivery.sender.isCompany && (
                    <span className="text-gray-600 text-xs block mt-1">
                      {delivery.sender.companyName}
                    </span>
                  )}
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${delivery.sender.phone}`} className="hover:text-blue-600">
                    {delivery.sender.phone}
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Destinataire</h4>
                <p className="text-sm">
                  {delivery.receiver.firstName} {delivery.receiver.lastName}
                  {delivery.receiver.isCompany && (
                    <span className="text-gray-600 text-xs block mt-1">
                      {delivery.receiver.companyName}
                    </span>
                  )}
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${delivery.receiver.phone}`} className="hover:text-blue-600">
                    {delivery.receiver.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}