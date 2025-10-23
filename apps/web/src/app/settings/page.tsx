export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Mode de publication</h2>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="radio" name="mode" defaultChecked className="mr-3" />
            <div>
              <p className="font-medium">Direct (Instagram + TikTok API)</p>
              <p className="text-sm text-gray-600">Publication directe via Graph API & TikTok API</p>
            </div>
          </label>
          <label className="flex items-center">
            <input type="radio" name="mode" className="mr-3" />
            <div>
              <p className="font-medium">Webhook (Buffer/Hootsuite)</p>
              <p className="text-sm text-gray-600">Délégation via webhook externe</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Feature flags</h2>
        <div className="space-y-3">
          <Toggle label="Rendu automatique des assets" defaultChecked={false} />
          <Toggle label="Publication directe activée" defaultChecked={true} />
          <Toggle label="Pull analytics quotidien" defaultChecked={false} />
          <Toggle label="Mode dry-run (test)" defaultChecked={false} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Webhooks</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Buffer Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.buffer.com/..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alert Webhook URL (Slack/Discord)</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="toggle" />
    </label>
  );
}
