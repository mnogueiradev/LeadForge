import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

import { DashboardOverviewPage } from '../features/dashboard/pages/DashboardOverviewPage';
import { OrganizationsListPage } from '../features/organizations/pages/OrganizationsListPage';
import { ContactsListPage } from '../features/contacts/pages/ContactsListPage';
import { LeadsListPage } from '../features/leads/pages/LeadsListPage';
import { PipelinesPage } from '../features/pipelines/pages/PipelinesPage';
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
    path: '/login',
    element: <AuthLayout />,
    children: [
      { path: '', element: <div>Login Page (to be implemented)</div> },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardOverviewPage /> },
      { path: 'organizations', element: <OrganizationsListPage /> },
      { path: 'contacts', element: <ContactsListPage /> },
      { path: 'leads', element: <LeadsListPage /> },
      { path: 'pipelines', element: <PipelinesPage /> },
      { path: 'deals', element: <DealsBoardPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
