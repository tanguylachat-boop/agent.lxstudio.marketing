'use client';

import { useState } from 'react';

export default function PublishingPage() {
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Publication</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Publier maintenant</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Plateforme</label>
          <div className="flex gap-4">
            <button
              onClick={() => setPlatform('instagram')}
              className={`px-4 py-2 rounded ${
                platform === 'instagram' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setPlatform('tiktok')}
              className={`px-4 py-2 rounded ${
                platform === 'tiktok' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              TikTok
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Asset ID</label>
          <input
            type="text"
            placeholder="uuid-here"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Caption ID</label>
          <input
            type="text"
            placeholder="uuid-here"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Légende</label>
          <textarea
            rows={4}
            placeholder="Votre légende ici..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Publier maintenant
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Mode test (sandbox)
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Dernières publications</h2>
        <div className="space-y-3">
          <PublishItem
            title="Site lent = clients perdus"
            platform="Instagram"
            status="Publié"
            date="Il y a 2h"
          />
          <PublishItem
            title="Agent IA restaurants"
            platform="TikTok"
            status="En cours"
            date="Il y a 5min"
          />
        </div>
      </div>
    </div>
  );
}

function PublishItem({
  title,
  platform,
  status,
  date,
}: {
  title: string;
  platform: string;
  status: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{platform} • {date}</p>
      </div>
      <span
        className={`px-3 py-1 text-xs rounded-full ${
          status === 'Publié' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {status}
      </span>
    </div>
  );
}
