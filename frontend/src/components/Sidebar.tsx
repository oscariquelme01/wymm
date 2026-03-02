import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  WalletCards,
  BarChart3,
  ArrowLeftRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/auth", icon: WalletCards, label: "Connect Bank" },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card px-3 py-4">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Where is my <span className="text-emerald-500">Money</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Separator className="my-3" />

      <div className="flex items-center justify-center px-3 py-2">
        <ThemeToggle />
      </div>
    </div>
  )
}
