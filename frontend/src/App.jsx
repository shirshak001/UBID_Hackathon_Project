import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReviewQueue from './pages/ReviewQueue';
import Search from './pages/Search';
import UnmatchedEvents from './pages/UnmatchedEvents';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="review" element={<ReviewQueue />} />
        <Route path="unmatched" element={<UnmatchedEvents />} />
        <Route path="search" element={<Search />} />
      </Route>
    </Routes>
  );
}

export default App;
