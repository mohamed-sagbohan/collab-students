import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const options = [
  { value: 'light', icon: Sun, label: 'Clair' },
  { value: 'dark', icon: Moon, label: 'Sombre' },
  { value: 'system', icon: Monitor, label: 'Système' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
            theme === value
              ? 'bg-card shadow-sm text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
