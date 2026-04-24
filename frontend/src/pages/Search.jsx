import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, MapPin, Briefcase, FileText, ChevronDown, Activity, Clock, Zap, AlertCircle } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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
        <p className="text-slate-500 text-lg">Query the read-only federated identity graph for businesses.</p>
      </div>

      <div className="relative max-w-3xl mx-auto w-full group">
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

      <div className="flex-1 mt-8 pb-12">
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
                <SearchResultCard 
                  result={result} 
                  isExpanded={expandedId === idx}
                  onToggle={() => setExpandedId(expandedId === idx ? null : idx)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result, isExpanded, onToggle }) {
  // Mock activity classification logic for demo purposes
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
    <div className={`bg-white rounded-[2rem] shadow-sm border border-slate-200 transition-all overflow-hidden ${isExpanded ? 'shadow-md border-blue-200 ring-4 ring-blue-50' : 'hover:border-slate-300'}`}>
      <div 
        className="p-6 cursor-pointer flex items-start gap-6 relative"
        onClick={onToggle}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner border border-blue-100/50">
          <Briefcase size={28} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 pr-12">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              {result.name}
            </h3>
            <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border ${statusColor}`}>
              {status}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <MapPin size={16} className="text-slate-400" />
              {result.address}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <FileText size={16} className="text-slate-400" />
              <span className="font-mono font-semibold">{result.pan || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown size={24} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-4 bg-slate-50 border-t border-slate-100">
              <div className="flex gap-12">
                <div className="flex-1">
                   <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Activity size={18} className="text-blue-500" /> Activity Evidence Timeline
                   </h4>
                   <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      <TimelineItem 
                        icon={<Zap size={14} className="text-amber-500"/>}
                        title="Electricity Consumption > Threshold"
                        date="2 weeks ago"
                        source="BESCOM"
                        active={status === 'Active'}
                      />
                      <TimelineItem 
                        icon={<FileText size={14} className="text-blue-500"/>}
                        title={status === 'Closed' ? "Explicit Closure Filing" : "License Renewed"}
                        date="3 months ago"
                        source={status === 'Closed' ? "Registrar" : "Shop Est"}
                        active={status !== 'Dormant'}
                      />
                      <TimelineItem 
                        icon={<AlertCircle size={14} className="text-rose-500"/>}
                        title="No events detected"
                        date="> 18 months"
                        source="All Systems"
                        active={false}
                        hidden={status === 'Active'}
                      />
                   </div>
                </div>
                
                <div className="w-1/3 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">UBID Details</h4>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">Generated Identifier</p>
                      <p className="font-mono font-bold text-lg text-indigo-700">KA-PAN-{result.pan || '1029384'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Linked Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">{result.source}</span>
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">Labour Dept</span>
                      {status === 'Active' && <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">BESCOM</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineItem({ icon, title, date, source, active, hidden }) {
  if (hidden) return null;
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${active ? 'ring-2 ring-emerald-500/30' : ''}`}>
            {icon}
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-1">
                <h5 className={`font-bold text-sm ${active ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h5>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{source}</span>
            </div>
            <time className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-2">
              <Clock size={12} /> {date}
            </time>
        </div>
    </div>
  );
}
