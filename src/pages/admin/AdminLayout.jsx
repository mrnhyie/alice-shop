import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Settings, ChevronLeft, ChevronRight, Search,
  LogOut, Menu, X, Store, TrendingUp, Shield
} from '../../components/MaterialIcon';
import AdminNotifications from '../../components/admin/AdminNotifications';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navSections = [
    {
      label: 'GENERAL',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
        { icon: ShoppingCart, label: 'Orders', to: '/admin/orders' },
        { icon: Users, label: 'Customers', to: '/admin/customers', badge: null },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { icon: Package, label: 'Products', to: '/admin/products' },
        { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
        { icon: TrendingUp, label: 'Marketing', to: '/admin/marketing' },
      ]
    },
    {
      label: 'SUPPORT',
      items: [
        { icon: Settings, label: 'Settings', to: '/admin/settings' },
        { icon: Shield, label: 'Security', to: '/admin/security' },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-zinc-100 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-serif font-bold text-lg">A</span>
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-zinc-900 text-sm leading-tight">Alice Admin</p>
            <p className="text-xs text-zinc-400">Management Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map(section => (
          <div key={section.label} className="mb-4">
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-2">{section.label}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <item.icon size={18} className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                      {!sidebarCollapsed && item.badge && (
                        <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + Store link */}
      <div className="border-t border-zinc-100 p-3 space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-500 hover:bg-zinc-100 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <Store size={16} />
          {!sidebarCollapsed && <span>View Store</span>}
        </Link>
        <div className={`flex items-center gap-3 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 font-semibold text-sm">A</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">Alice Mensah</p>
              <p className="text-xs text-zinc-400 truncate">Admin</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 flex-shrink-0 relative ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-sm hover:bg-zinc-50 transition-colors z-10"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-white border-r border-zinc-200 z-50 lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 px-4 lg:px-6 h-16 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={20} className="text-zinc-600" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm placeholder-zinc-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hidden sm:block">⌘F</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <AdminNotifications />
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-sm">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
