import { Outlet, useLocation } from 'react-router'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'
import ChatWidget, { ChatWidgetProvider } from '../components/chat/ChatWidget'
import { SkipLink } from '../components/ui/SkipLink'
import { useStudentHeartbeat } from '../hooks/useChat'

export default function AppLayout() {
  const location = useLocation()
  // Pastilles « en ligne » côté staff : simple heartbeat en base (migration 030).
  useStudentHeartbeat()

  return (
    <ChatWidgetProvider>
      <div className="min-h-screen bg-background">
        <SkipLink />
        <Navbar />
        {/* pb-24 : laisse la place à la bottom nav mobile */}
        <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-6 py-8 pb-24 lg:pb-8 focus:outline-none">
          <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
        <BottomNav />
        <ChatWidget />
      </div>
    </ChatWidgetProvider>
  )
}
