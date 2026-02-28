import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { initSeedData } from './utils/localStorage';

// Visitor pages
import BoothPage from './pages/visitor/BoothPage';
import MyPage from './pages/visitor/MyPage';
import MessagesPage from './pages/visitor/MessagesPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminBoothsPage from './pages/admin/AdminBoothsPage';
import AdminBoothNewPage from './pages/admin/AdminBoothNewPage';
import AdminBoothDetailPage from './pages/admin/AdminBoothDetailPage';
import AdminInboxPage from './pages/admin/AdminInboxPage';

// Organizer
import OrganizerPreviewPage from './pages/organizer/OrganizerPreviewPage';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/scan/booth-001" replace />} />

      {/* Visitor */}
      <Route path="/scan/:boothId" element={<BoothPage />} />
      <Route path="/me" element={<MyPage />} />
      <Route path="/messages" element={<MessagesPage />} />

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin protected */}
      <Route path="/admin/booths" element={<AdminGuard><AdminBoothsPage /></AdminGuard>} />
      <Route path="/admin/booths/new" element={<AdminGuard><AdminBoothNewPage /></AdminGuard>} />
      <Route path="/admin/booths/:boothId" element={<AdminGuard><AdminBoothDetailPage /></AdminGuard>} />
      <Route path="/admin/inbox" element={<AdminGuard><AdminInboxPage /></AdminGuard>} />

      {/* Organizer */}
      <Route path="/organizer/preview" element={<AdminGuard><OrganizerPreviewPage /></AdminGuard>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DataInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSeedData();
  }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DataInitializer>
            <AppRoutes />
          </DataInitializer>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
