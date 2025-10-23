'use client';

import { useState } from 'react';

export default function IdeasPage() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Appel API ici
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Idées de contenu</h1>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Génération...' : 'Générer 20 idées'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IdeaCard
          title="Site lent = clients perdus"
          hook="Votre site perd-il 60% de vos visiteurs ?"
          angle="Montrer l'impact d'un site optimisé sur les réservations d'un hôtel local"
        />
        <IdeaCard
          title="Agent IA pour restaurants"
          hook="Vous perdez des réservations à 21h le vendredi ?"
          angle="Démontrer comment un agent IA peut gérer les réservations 24/7"
        />
      </div>
    </div>
  );
}

function IdeaCard({ title, hook, angle }: { title: string; hook: string; angle: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700 mb-2"><strong>Hook:</strong> {hook}</p>
      <p className="text-sm text-gray-600 mb-4">{angle}</p>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
          Créer script
        </button>
        <button className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300">
          Ajouter au calendrier
        </button>
      </div>
    </div>
  );
}
