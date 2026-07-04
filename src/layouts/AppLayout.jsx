import { Outlet, useLocation } from 'react-router'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'
import { SkipLink } from '../components/ui/SkipLink'

export default function AppLayout() {
  const location = useLocation()

  return (
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
    </div>
  )
}
