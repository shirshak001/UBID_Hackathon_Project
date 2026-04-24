import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Briefcase, FileText } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="text-center mt-10 mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Directory Search</h2>
        <p className="text-slate-500 text-lg">Quickly locate businesses across integrated departmental data.</p>
      </div>

      <div className="relative max-w-3xl mx-auto w-full group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
        
        <div className="relative bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center p-2">
          <div className="pl-4 pr-2 text-slate-400">
            <SearchIcon size={24} />
          </div>
          <input
            type="text"
            className="flex-1 w-full bg-transparent border-none focus:outline-none text-xl p-3 text-slate-800 placeholder-slate-400"
            placeholder="Search by Name, Address, or PAN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
             <div className="pr-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 mt-8">
        {searched && !loading && results.length === 0 ? (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm"
          >
            <p className="text-slate-500 text-lg">No businesses found matching "{query}"</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {results.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SearchResultCard result={result} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result }) {
  // Mock activity classification based on source for visual demonstration
  let status = 'Active';
  let statusColor = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  
  if (result.source === 'KSPCB') {
      status = 'Dormant';
      statusColor = 'bg-amber-100 text-amber-700 border-amber-200';
  } else if (Math.random() > 0.8) {
      status = 'Closed';
      statusColor = 'bg-rose-100 text-rose-700 border-rose-200';
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex items-start gap-6 cursor-pointer">
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Briefcase size={24} />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
            {result.name}
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}>
            {status}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={16} className="text-slate-400" />
            {result.address}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <FileText size={16} className="text-slate-400" />
            <span className="font-mono">{result.pan || 'N/A'}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-xs font-semibold">
           <span className="text-slate-400">Source: <span className="text-slate-600">{result.source}</span></span>
           <span className="text-slate-400">PIN: <span className="text-slate-600 font-mono">{result.pin}</span></span>
        </div>
      </div>
    </div>
  );
}
