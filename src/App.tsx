import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Workspace from '@/pages/Workspace';
import Recipes from '@/pages/Recipes';
import HistoryPage from '@/pages/HistoryPage';
import Encyclopedia from '@/pages/Encyclopedia';
import EncyclopediaDetail from '@/pages/EncyclopediaDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Workspace />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/encyclopedia" element={<Encyclopedia />} />
          <Route path="/encyclopedia/:id" element={<EncyclopediaDetail />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
