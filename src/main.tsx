import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/authContext'; // ✅ import the provider
// import "./debug/authTests"; // ❌ temporarily remove debug tests if they call useAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>        {/* ✅ Wrap everything */}
      <App />
    </AuthProvider>
  </StrictMode>
);
