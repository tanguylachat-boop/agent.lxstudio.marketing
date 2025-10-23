export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Calendrier éditorial</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-4">
          <select className="border rounded px-3 py-2">
            <option>Semaine en cours</option>
            <option>Semaine prochaine</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Générer calendrier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}

        <CalendarSlot day="15" posts={[{ platform: 'Instagram', time: '14:00' }]} />
        <CalendarSlot day="16" posts={[]} />
        <CalendarSlot day="17" posts={[{ platform: 'TikTok', time: '18:00' }]} />
        <CalendarSlot day="18" posts={[]} />
        <CalendarSlot day="19" posts={[{ platform: 'Instagram', time: '14:00' }]} />
        <CalendarSlot day="20" posts={[]} />
        <CalendarSlot day="21" posts={[]} />
      </div>
    </div>
  );
}

function CalendarSlot({ day, posts }: { day: string; posts: Array<{ platform: string; time: string }> }) {
  return (
    <div className="bg-white border rounded p-3 min-h-[100px]">
      <p className="text-sm font-semibold mb-2">{day}</p>
      {posts.map((post, i) => (
        <div key={i} className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 mb-1">
          {post.platform} {post.time}
        </div>
      ))}
    </div>
  );
}
