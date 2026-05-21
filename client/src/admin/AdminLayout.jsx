import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      setAuthed(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  if (!authed) return null;

  const tabs = [
    { path: '/admin', label: '概览', exact: true },
    { path: '/admin/orders', label: '订单' },
    { path: '/admin/products', label: '商品' },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === '/admin' : location.pathname.startsWith(tab.path);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-pink-600">管理后台</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500">退出</button>
      </header>

      {/* Content */}
      <div className="p-3">
        <Outlet />
      </div>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex-1 text-center py-3 text-sm ${isActive(tab) ? 'text-pink-600 font-medium' : 'text-gray-500'}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
