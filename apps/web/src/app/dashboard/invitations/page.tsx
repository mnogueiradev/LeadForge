'use client';

import { useState, useEffect } from 'react';
import { InvitationTable } from '@/features/invitations/components/InvitationTable';
import { InvitationForm } from '@/features/invitations/components/InvitationForm';
import { apiClient } from '@/lib/api-client';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/invitations');
      setInvitations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Convites de Equipe</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Convide novos membros para participar da sua organização.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Convidar Membro
        </button>
      </div>

      <InvitationTable 
        invitations={invitations} 
        isLoading={loading} 
        onRefresh={fetchInvitations} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enviar Convite</h3>
            </div>
            <div className="p-6">
              <InvitationForm 
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchInvitations();
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
