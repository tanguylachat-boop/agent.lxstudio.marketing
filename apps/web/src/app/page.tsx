export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Posts cette semaine" value="12" trend="+20%" />
        <StatCard title="RDV générés" value="8" trend="+33%" />
        <StatCard title="Reach total" value="24.5K" trend="+15%" />
        <StatCard title="Taux engagement" value="4.2%" trend="+0.5%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Prochaines publications</h2>
          <div className="space-y-3">
            <ScheduledPost platform="Instagram" time="Aujourd'hui 14:00" title="Site lent = clients perdus" />
            <ScheduledPost platform="TikTok" time="Demain 18:00" title="Agent IA pour restaurants" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Derniers leads</h2>
          <div className="space-y-3">
            <Lead name="Jean Dupont" source="Instagram" email="jean@example.ch" />
            <Lead name="Marie Martin" source="TikTok" email="marie@example.ch" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-sm text-green-600">{trend}</p>
    </div>
  );
}

function ScheduledPost({ platform, time, title }: { platform: string; time: string; title: string }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{platform} • {time}</p>
      </div>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Planifié</span>
    </div>
  );
}

function Lead({ name, source, email }: { name: string; source: string; email: string }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-600">{email} • via {source}</p>
      </div>
      <button className="text-blue-600 text-sm hover:underline">Contacter</button>
    </div>
  );
}
