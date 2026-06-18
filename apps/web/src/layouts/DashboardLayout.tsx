import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="font-bold text-lg">LeadForge CRM</span>
        </div>
        <nav className="flex-1 p-4">
          Sidebar Links
        </nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar Placeholder */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 justify-between">
          <div>Menu Toggle</div>
          <div>Tenant Switcher & User Profile</div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
