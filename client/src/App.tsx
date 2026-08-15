import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { DispatcherDashboard } from './pages/DispatcherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { startSignalR } from './services/signalr';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Customer': return <CustomerDashboard />;
    case 'Driver': return <DriverDashboard />;
    case 'Dispatcher': return <DispatcherDashboard />;
    case 'Admin': return <AdminDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};

const AppContent = () => {
  const [searchTracking, setSearchTracking] = useState<string | null>(null);

  useEffect(() => {
    startSignalR();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        <Navbar onSearchTracking={setSearchTracking} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {searchTracking ? (
            <OrderTrackingPage
              trackingNumber={searchTracking}
              onBack={() => setSearchTracking(null)}
            />
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardRouter />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          )}
        </main>
      </div>

      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <span className="font-bold text-white">DeliTrack Platform</span> — Built with ASP.NET Core 8 Web API, C#, EF Core, SignalR & React + TypeScript
          </div>
          <div className="text-slate-500 text-[11px]">
            Real-time delivery management & GPS tracking for Ethiopian logistics
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
