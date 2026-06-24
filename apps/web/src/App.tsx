import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './providers/auth-provider';
import { AppearanceProvider } from './providers/appearance-provider';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppearanceProvider>
          <RouterProvider router={router} />
        </AppearanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
