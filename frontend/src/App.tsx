import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { PlayersPage } from '@/pages/Players';
import { PlayerTypesPage } from '@/pages/PlayerTypes';
import { PaymentsPage } from '@/pages/Payments';
import { CostsPage } from '@/pages/Costs';
import { CashPage } from '@/pages/Cash';
import { SettingsPage } from '@/pages/Settings';
import { InjuriesPage } from '@/pages/Injuries';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="player-types" element={<PlayerTypesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="costs" element={<CostsPage />} />
        <Route path="injuries" element={<InjuriesPage />} />
        <Route path="cash" element={<CashPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
