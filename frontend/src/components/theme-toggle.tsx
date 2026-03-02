import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ]

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {options.map((option) => (
        <Tooltip key={option.value}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme(option.value)}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                theme === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <option.icon className="h-4 w-4" />
              <span className="sr-only">{option.label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{option.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
