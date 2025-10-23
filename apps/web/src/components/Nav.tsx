import Link from 'next/link';

export function Nav() {
  return (
    <nav className="w-64 bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">LX Studio</h1>

      <ul className="space-y-2">
        <NavItem href="/" label="Tableau de bord" />
        <NavItem href="/ideas" label="Idées" />
        <NavItem href="/calendar" label="Calendrier" />
        <NavItem href="/publishing" label="Publication" />
        <NavItem href="/analytics" label="Analytics" />
        <NavItem href="/settings" label="Paramètres" />
      </ul>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <p className="text-sm text-gray-400">v1.0.0</p>
      </div>
    </nav>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}
