import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Inbox,
  QrCode,
  LogOut,
  Plus,
  BarChart3,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/admin/booths', icon: LayoutGrid, label: '내 부스' },
  { to: '/admin/inbox', icon: Inbox, label: '문의 인박스' },
  { to: '/admin/leads', icon: Users, label: '리드 목록' },
  { to: '/organizer/preview', icon: BarChart3, label: '주최자 프리뷰' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — dark theme */}
      <aside className="w-[220px] shrink-0 bg-gray-950 flex flex-col border-r border-white/[0.06]">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
          <Link to="/admin/booths" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white tracking-tight">BoothLiner</span>
          </Link>
        </div>

        {/* New Booth CTA */}
        <div className="px-3 pt-3 pb-1">
          <Link
            to="/admin/booths/new"
            className="flex items-center gap-2 w-full bg-brand-600 text-white text-[13px] font-medium rounded-lg px-3 h-9 hover:bg-brand-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            새 부스 만들기
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-white/[0.06] space-y-0.5">
          <Link
            to="/auth"
            className="flex items-center gap-2.5 w-full px-2.5 h-8 rounded-lg text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            관람객 모드
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2.5 h-8 rounded-lg text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
