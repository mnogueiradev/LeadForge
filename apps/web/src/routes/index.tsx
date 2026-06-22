import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthGuard } from '../components/auth-guard';
import { GuestGuard } from '../components/guest-guard';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';

import { DashboardOverviewPage } from '../features/dashboard/pages/DashboardOverviewPage';
import { OrganizationsListPage } from '../features/organizations/pages/OrganizationsListPage';
import { ContactsListPage } from '../features/contacts/pages/ContactsListPage';
import { LeadsListPage } from '../features/leads/pages/LeadsListPage';
import { PipelinesPage } from '../features/pipelines/pages/PipelinesPage';
import { PipelineDetailsPage } from '../features/pipelines/pages/PipelineDetailsPage';
import { DealsBoardPage } from '../features/deals/pages/DealsBoardPage';
import { ActivitiesPage } from '../features/activities/pages/ActivitiesPage';
import { CalendarPage } from '../features/calendar/pages/CalendarPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <GuestGuard />,
    children: [
      {
        path: '/',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <DashboardOverviewPage /> },
          { path: 'organizations', element: <OrganizationsListPage /> },
          { path: 'contacts', element: <ContactsListPage /> },
          { path: 'leads', element: <LeadsListPage /> },
          { path: 'pipelines', element: <PipelinesPage /> },
          { path: 'pipelines/:id', element: <PipelineDetailsPage /> },
          { path: 'deals', element: <DealsBoardPage /> },
          { path: 'activities', element: <ActivitiesPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
