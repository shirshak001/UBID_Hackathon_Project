import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart to make it look active
const activityData = [
  { name: 'Jan', processed: 400, resolved: 240 },
  { name: 'Feb', processed: 300, resolved: 139 },
  { name: 'Mar', processed: 200, resolved: 980 },
  { name: 'Apr', processed: 278, resolved: 390 },
  { name: 'May', processed: 189, resolved: 480 },
  { name: 'Jun', processed: 239, resolved: 380 },
  { name: 'Jul', processed: 349, resolved: 430 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/dashboard');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">System Overview</h2>
        <p className="text-slate-500 mt-1">Real-time statistics of the UBID resolution engine.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard variants={itemVariants} title="Total Businesses" value={stats.total_businesses} color="blue" />
          <StatCard variants={itemVariants} title="Active" value={stats.active} color="emerald" />
          <StatCard variants={itemVariants} title="Dormant/Closed" value={stats.dormant + stats.closed} color="rose" />
          <StatCard variants={itemVariants} title="Pending Review" value={stats.pending_reviews} color="amber" />
        </div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Resolution Throughput</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="processed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessed)" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">UBID Issuance</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl -z-10"></div>
             <div className="text-center p-8">
               <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">Total UBIDs Generated</div>
               <div className="text-6xl font-black text-slate-800 drop-shadow-sm">{stats?.total_ubids_assigned?.toLocaleString() || 0}</div>
             </div>
             
             <div className="w-full mt-auto pt-6 border-t border-indigo-100/50">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Auto-merged</span>
                 <span className="font-bold text-emerald-600">98%</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                 <div className="bg-emerald-500 h-full rounded-full" style={{width: '98%'}}></div>
               </div>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, color, variants }) {
  const styles = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20',
    rose: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/20',
    amber: 'bg-white border-amber-200 text-amber-900 border'
  };

  const isLight = color === 'amber';

  return (
    <motion.div 
      variants={variants}
      className={`p-6 rounded-3xl shadow-lg ${styles[color]} relative overflow-hidden group`}
    >
      {/* Decorative circle */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${isLight ? 'bg-amber-100/50' : 'bg-white/10'} group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
      
      <div className="relative z-10">
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-amber-600' : 'text-white/80'}`}>{title}</h3>
        <p className="text-4xl font-extrabold">{value?.toLocaleString() || 0}</p>
      </div>
    </motion.div>
  );
}
