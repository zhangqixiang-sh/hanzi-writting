import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from '@/pages/HomePage';
import PracticePage from '@/pages/PracticePage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <HashRouter>
      <div className="h-screen w-screen overflow-hidden bg-bg-page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <Toaster position="top-center" richColors />
    </HashRouter>
  );
}

export default App;
