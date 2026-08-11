import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}
