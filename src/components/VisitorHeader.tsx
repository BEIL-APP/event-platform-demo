import { Link, useLocation } from 'react-router-dom';
import { QrCode, Heart, MessageSquare, User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function VisitorHeader() {
  const { isLoggedIn, toggleLogin } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/me', icon: <Heart className="w-5 h-5" />, label: '관심' },
    { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, label: '문의' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-sm mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">BoothConnect</span>
        </Link>

        {/* Right: nav + login */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                location.pathname === item.to
                  ? 'text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={toggleLogin}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ml-1 ${
              isLoggedIn ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title={isLoggedIn ? '로그아웃' : '로그인'}
          >
            {isLoggedIn ? (
              <>
                <User className="w-5 h-5" />
                <span className="text-[10px] leading-none">나</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span className="text-[10px] leading-none">로그인</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
