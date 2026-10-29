import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { PublicLayout, ScrollManager } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useApp } from '@/context/AppContext';
import { roleHome } from '@/lib/utils';
import type { Role } from '@/types';

import { Home } from '@/pages/Home';
import { Explore } from '@/pages/Explore';
import { GroundDetails } from '@/pages/GroundDetails';
import { MyBookings } from '@/pages/MyBookings';
import { About } from '@/pages/About';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { NotFound } from '@/pages/NotFound';

import { AdminHome, AdminUsers, AdminGrounds, AdminBookings, AdminActivity } from '@/pages/dashboards/Admin';
import {
  OwnerHome,
  OwnerBookings,
  OwnerEarnings,
  OwnerGroundProfile,
  OwnerPricing,
  OwnerAvailability,
} from '@/pages/dashboards/Owner';
import {
  ScorerHome,
  ScorerMatches,
  ScorerLive,
  ScorerScorecards,
  ScorerHistory,
} from '@/pages/dashboards/Scorer';
import { UmpireHome, UmpireMatches, UmpireSchedule, UmpireHistory } from '@/pages/dashboards/Umpire';
import { PlayerHome, PlayerMatches, PlayerStats, PlayerHistory } from '@/pages/dashboards/Player';
import {
  CaptainHome,
  CaptainTeam,
  CaptainMatches,
  CaptainResults,
  CaptainPerformance,
} from '@/pages/dashboards/Captain';

import { Profile } from '@/pages/account/Profile';
import { Settings } from '@/pages/account/Settings';
import { Notifications } from '@/pages/account/Notifications';

function RequireRole({ role }: { role: Role }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}

function DashboardRoutes() {
  return (
    <>
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route path="notifications" element={<Notifications />} />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="grounds" element={<Explore />} />
          <Route path="grounds/:groundId" element={<GroundDetails />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route element={<RequireRole role="Admin" />}>
          <Route path="admin" element={<DashboardLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="grounds" element={<AdminGrounds />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="activity" element={<AdminActivity />} />
            {DashboardRoutes()}
          </Route>
        </Route>

        <Route element={<RequireRole role="Ground Owner" />}>
          <Route path="owner" element={<DashboardLayout />}>
            <Route index element={<OwnerHome />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="earnings" element={<OwnerEarnings />} />
            <Route path="ground" element={<OwnerGroundProfile />} />
            <Route path="pricing" element={<OwnerPricing />} />
            <Route path="availability" element={<OwnerAvailability />} />
            {DashboardRoutes()}
          </Route>
        </Route>

        <Route element={<RequireRole role="Scorer" />}>
          <Route path="scorer" element={<DashboardLayout />}>
            <Route index element={<ScorerHome />} />
            <Route path="matches" element={<ScorerMatches />} />
            <Route path="live" element={<ScorerLive />} />
            <Route path="scorecards" element={<ScorerScorecards />} />
            <Route path="history" element={<ScorerHistory />} />
            {DashboardRoutes()}
          </Route>
        </Route>

        <Route element={<RequireRole role="Umpire" />}>
          <Route path="umpire" element={<DashboardLayout />}>
            <Route index element={<UmpireHome />} />
            <Route path="matches" element={<UmpireMatches />} />
            <Route path="schedule" element={<UmpireSchedule />} />
            <Route path="history" element={<UmpireHistory />} />
            {DashboardRoutes()}
          </Route>
        </Route>

        <Route element={<RequireRole role="Player" />}>
          <Route path="player" element={<DashboardLayout />}>
            <Route index element={<PlayerHome />} />
            <Route path="matches" element={<PlayerMatches />} />
            <Route path="stats" element={<PlayerStats />} />
            <Route path="history" element={<PlayerHistory />} />
            {DashboardRoutes()}
          </Route>
        </Route>

        <Route element={<RequireRole role="Captain" />}>
          <Route path="captain" element={<DashboardLayout />}>
            <Route index element={<CaptainHome />} />
            <Route path="team" element={<CaptainTeam />} />
            <Route path="matches" element={<CaptainMatches />} />
            <Route path="results" element={<CaptainResults />} />
            <Route path="performance" element={<CaptainPerformance />} />
            {DashboardRoutes()}
          </Route>
        </Route>
      </Routes>
    </>
  );
}
