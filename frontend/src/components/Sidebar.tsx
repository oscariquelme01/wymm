import { NavLink } from "react-router-dom";
import { LayoutDashboard, WalletCards, BarChart3 } from "lucide-react";
import { cn } from "../lib/utils";

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-3 py-4">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Where is my <span className="text-emerald-500">Money</span>
        </h1>
      </div>
      <nav className="space-y-1">

        {/* Dashboard entry */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )
          }
        >
          {/* This is somewhat misleading, it is an icon! */}
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        {/* Analytics entry */}
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )
          }
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </NavLink>

        {/* Connect bank entry */}
        <NavLink
          to="/auth"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )
          }
        >
          <WalletCards className="h-4 w-4" />
          Connect Bank
        </NavLink>
      </nav>
    </div>
  );
}
