import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Search, Building2, FileWarning } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-inner shadow-blue-800">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-blue-900 tracking-tight leading-tight">UBID Engine</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Govt. of Karnataka</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/review" icon={<ListChecks size={20} />} label="Review Queue" />
          <NavItem to="/unmatched" icon={<FileWarning size={20} />} label="Unmatched Events" />
          <NavItem to="/search" icon={<Search size={20} />} label="Search Directory" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              JS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700">Jane Smith</span>
              <span className="text-xs text-slate-500">Chief Reviewer</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {/* Ambient background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        
        <div className="p-8 relative z-10 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
          isActive 
            ? 'bg-blue-50 text-blue-700 shadow-sm' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default Layout;
