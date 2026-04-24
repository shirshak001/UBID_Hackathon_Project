import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Link as LinkIcon, RefreshCw } from 'lucide-react';

const MOCK_UNMATCHED = [
  { id: 'evt_1', type: 'License Renewal', source: 'Shop Est', name: 'Raju Tea Stall', address: 'Unknown', date: '2023-10-12', confidence: 'Low' },
  { id: 'evt_2', type: 'Inspection', source: 'KSPCB', name: 'Global Tech', address: 'Block 4, Tech Park', date: '2023-11-05', confidence: 'Medium' },
  { id: 'evt_3', type: 'Electricity Bill', source: 'BESCOM', name: 'Sri Balaji Store', address: 'MG Road, BNG', date: '2023-11-10', confidence: 'Low' },
];

export default function UnmatchedEvents() {
  const [events, setEvents] = useState(MOCK_UNMATCHED);

  const handleManualMatch = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">Unmatched Events Queue</h2>
        <p className="text-slate-500 mt-1">Raw events that could not be joined to any existing UBID due to low confidence blocking keys.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <FileWarning size={20} className="text-amber-500"/> Action Required ({events.length})
           </h3>
           <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
             <RefreshCw size={16} /> Re-run Entity Resolution
           </button>
        </div>

        {events.length === 0 ? (
           <div className="p-12 text-center text-slate-500">
              Queue is empty. All events have been assigned.
           </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((evt) => (
               <motion.div 
                 key={evt.id} 
                 layout 
                 initial={{opacity:0}} 
                 animate={{opacity:1}} 
                 exit={{opacity:0}}
                 className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
               >
                 <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="text-xs font-bold uppercase px-2 py-1 bg-slate-200 text-slate-600 rounded">{evt.source}</span>
                     <span className="font-bold text-slate-800">{evt.type}</span>
                   </div>
                   <div className="text-sm text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-400">Raw Name:</span> {evt.name}</p>
                      <p><span className="font-semibold text-slate-400">Raw Address:</span> {evt.address}</p>
                   </div>
                   <div className="mt-3 text-xs text-slate-400">Date: {evt.date}</div>
                 </div>
                 
                 <div className="flex flex-col items-end gap-3">
                   <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">Match Confidence: {evt.confidence}</span>
                   <button 
                     onClick={() => handleManualMatch(evt.id)}
                     className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                   >
                     <LinkIcon size={16} /> Manual Match
                   </button>
                 </div>
               </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
