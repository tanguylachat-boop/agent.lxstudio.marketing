export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Vues totales" value="45.2K" platform="Instagram" />
        <MetricCard title="Vues totales" value="32.8K" platform="TikTok" />
        <MetricCard title="Engagement moyen" value="4.2%" platform="Global" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Évolution des vues (7 derniers jours)</h2>
        <div className="h-64 flex items-end justify-around gap-2">
          <Bar height={120} label="Lun" />
          <Bar height={150} label="Mar" />
          <Bar height={100} label="Mer" />
          <Bar height={180} label="Jeu" />
          <Bar height={160} label="Ven" />
          <Bar height={90} label="Sam" />
          <Bar height={140} label="Dim" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Top posts</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Titre</th>
              <th className="text-left py-2">Plateforme</th>
              <th className="text-right py-2">Vues</th>
              <th className="text-right py-2">Likes</th>
              <th className="text-right py-2">Engagement</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">Site lent = clients perdus</td>
              <td>Instagram</td>
              <td className="text-right">8.2K</td>
              <td className="text-right">342</td>
              <td className="text-right">4.2%</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Agent IA restaurants</td>
              <td>TikTok</td>
              <td className="text-right">12.5K</td>
              <td className="text-right">587</td>
              <td className="text-right">4.7%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, value, platform }: { title: string; value: string; platform: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold my-2">{value}</p>
      <p className="text-sm text-gray-500">{platform}</p>
    </div>
  );
}

function Bar({ height, label }: { height: number; label: string }) {
  return (
    <div className="flex flex-col items-center flex-1">
      <div
        className="w-full bg-blue-600 rounded-t"
        style={{ height: `${height}px` }}
      />
      <p className="text-xs mt-2 text-gray-600">{label}</p>
    </div>
  );
}
