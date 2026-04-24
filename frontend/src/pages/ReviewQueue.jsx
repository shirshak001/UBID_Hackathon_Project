import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ReviewQueue() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPairs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/pairs');
      const data = await res.json();
      setPairs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  const handleAction = async (pairId, action, notes) => {
    // Optimistic UI update
    setPairs(prev => prev.filter(p => p.id !== pairId));
    
    try {
      await fetch(`http://localhost:3000/api/pairs/${pairId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }) // Now sending notes for ML feedback loop
      });
    } catch (e) {
      console.error(e);
      fetchPairs();
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">Reviewer Workbench</h2>
        <p className="text-slate-500 mt-1">Human-in-the-loop resolution. Your decisions and notes directly train the entity resolution engine.</p>
      </div>

      {pairs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6">
            🎉
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Queue is Empty</h3>
          <p className="text-slate-500 text-lg max-w-md">No pending matches for review. The ML model is handling everything automatically with high confidence!</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {pairs.map(pair => (
              <motion.div
                key={pair.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
              >
                <ReviewCard pair={pair} onAction={handleAction} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ pair, onAction }) {
  const [notes, setNotes] = useState('');
  const scorePercent = Math.round(pair.score * 100);
  
  // Determine color based on score
  let scoreColor = 'text-amber-500 bg-amber-50 border-amber-200';
  if (scorePercent >= 80) scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  else if (scorePercent < 50) scoreColor = 'text-rose-600 bg-rose-50 border-rose-200';

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-sm ${scoreColor}`}>
            <span className="text-xs font-bold uppercase tracking-wide opacity-80">Score</span>
            <span className="text-xl font-black">{scorePercent}%</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Entity Resolution Match</h3>
            <p className="text-sm text-slate-500 font-mono mt-0.5">ID: {pair.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onAction(pair.id, 'flag', notes)}
            className="px-4 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-all active:scale-95 flex items-center gap-2"
            title="Send back for more info"
          >
            <AlertCircle size={18} /> Flag
          </button>
          <button 
            onClick={() => onAction(pair.id, 'reject', notes)}
            className="px-6 py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95"
          >
            ❌ Reject
          </button>
          <button 
            onClick={() => onAction(pair.id, 'merge', notes)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            ✅ Merge
          </button>
        </div>
      </div>

      {/* Explainability Section */}
      <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex gap-8 items-center">
        <span className="text-sm font-bold text-slate-600 w-32 shrink-0">AI Explainability</span>
        <div className="flex-1 flex gap-8">
          <FeatureScore label="Name Match" score={pair.features.name_match} />
          <FeatureScore label="Address Match" score={pair.features.address_match} />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase">PAN Match</span>
              <span className="text-xs font-bold text-slate-700">{pair.features.pan_match ? 'Yes' : 'No'}</span>
            </div>
            <div className={`text-sm font-semibold px-3 py-1 rounded-md inline-block ${pair.features.pan_match ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {pair.features.pan_match ? 'Exact Match' : 'Mismatch / Missing'}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="flex divide-x divide-slate-100">
        <Record source={pair.record_a} matchDetails={pair.features} isPrimary />
        <Record source={pair.record_b} matchDetails={pair.features} />
      </div>

      {/* Reviewer Feedback Loop */}
      <div className="bg-slate-50 p-6 border-t border-slate-200 flex gap-4">
        <div className="flex-1">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reviewer Notes / Feedback (Optional)</label>
           <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your decision to help train the ML model (e.g., 'Address is completely different despite similar name')..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-20"
           />
        </div>
      </div>
    </div>
  );
}

function FeatureScore({ label, score }) {
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        <span className="text-xs font-bold text-slate-700">{score}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-1.5 rounded-full ${score > 80 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
        ></motion.div>
      </div>
    </div>
  );
}

function Record({ source, matchDetails, isPrimary }) {
  return (
    <div className={`flex-1 p-8 relative ${isPrimary ? 'bg-blue-50/30' : ''}`}>
      {isPrimary && <span className="absolute top-6 right-8 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 shadow-sm">Base Record</span>}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
          {source.source.substring(0, 1).toUpperCase()}
        </div>
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{source.source}</p>
      </div>
      
      <div className="space-y-6">
        <div className="relative group">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Business Name</label>
          <div className={`p-4 rounded-xl border transition-colors ${matchDetails.name_match > 85 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'}`}>
            <p className="text-lg font-bold">{source.name}</p>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Address</label>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-md text-slate-700 leading-relaxed">{source.address}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">PIN Code</label>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/50">
              <p className="text-md font-mono font-semibold text-slate-700 text-center">{source.pin}</p>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">PAN</label>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/50">
              <p className="text-md font-mono font-semibold text-slate-700 text-center">{source.pan || <span className="text-slate-400 italic font-sans text-sm">Not Provided</span>}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
