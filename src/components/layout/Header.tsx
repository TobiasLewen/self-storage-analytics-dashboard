import { Menu, Moon, Sun, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ExportButton } from '@/components/reports/ExportButton'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { toggleTheme } = useTheme()
  const { logout, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Signed out', 'You have been signed out successfully.')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.name}
          </span>
        )}
        <ExportButton />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
