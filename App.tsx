import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { TierGuard } from './components/TierGuard';
import { MoodoorFinder, MoodoorStudio } from './pages/Moodoor';
import MoodoorLanding from './pages/MoodoorLanding';
import MemoryWeaver from './pages/MemoryWeaver';
import InventoryWeaver from './pages/InventoryWeaver';
import ImageAnalyzer from './pages/ImageAnalyzer';
import Assistant from './pages/Assistant';
import Sourcing from './pages/Sourcing';

function Login() {
  const { user, signInWithGoogle, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app/apps/memory" replace />;
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <button onClick={signInWithGoogle} className="px-6 py-3 bg-primary text-primary-foreground">
        Sign in with Google
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/moodoor" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Consumer-facing Moodoor routes — public, per docs/Moodoor Studio Integration.md */}
          <Route path="/moodoor" element={<MoodoorLanding />} />
          <Route path="/moodoor/find" element={<MoodoorFinder />} />

          {/* Authenticated maker Studio */}
          <Route path="/app" element={<TierGuard><Layout /></TierGuard>}>
            <Route path="apps/memory" element={<MemoryWeaver />} />
            <Route
              path="apps/inventory"
              element={
                <TierGuard feature="hasInventoryWeaver">
                  <InventoryWeaver />
                </TierGuard>
              }
            />
            <Route path="apps/image" element={<ImageAnalyzer />} />
            <Route path="apps/assistant" element={<Assistant />} />
            <Route path="apps/sourcing" element={<Sourcing />} />
            <Route
              path="moodoor-studio"
              element={
                <TierGuard feature="hasDesignStudio">
                  <MoodoorStudio />
                </TierGuard>
              }
            />
            <Route index element={<Navigate to="apps/memory" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/moodoor" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
