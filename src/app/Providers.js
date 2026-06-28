'use client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#43332c', color: '#fff', borderRadius: '12px' },
          success: { iconTheme: { primary: '#c9a15e', secondary: '#fff' } },
          error: { style: { background: '#7f1d1d', color: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
