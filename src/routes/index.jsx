import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'
import AdminLayout from '../layouts/AdminLayout'
import RootPage from '../pages/RootPage'
import LoadingScreen from '../components/LoadingScreen'
// Import direct (pas de lazy) : la page d'erreur doit s'afficher même
// quand le chargement d'un chunk est précisément ce qui a échoué.
import RouteErrorPage from '../components/RouteErrorPage'

/**
 * Code splitting : chaque page est un chunk séparé — une apprenante ne
 * télécharge jamais le code de l'admin (ni jsPDF, importé dynamiquement
 * par lib/certificate.js et lib/fichePdf.js au clic de téléchargement).
 */
const Guide          = lazy(() => import('../pages/Guide'))
const Login          = lazy(() => import('../pages/auth/Login'))
const Register       = lazy(() => import('../pages/auth/Register'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('../pages/auth/ResetPassword'))
const AuthCallback   = lazy(() => import('../pages/auth/AuthCallback'))

const StudentDashboard = lazy(() => import('../pages/student/Dashboard'))
const CourseList       = lazy(() => import('../pages/student/CourseList'))
const CourseDetail     = lazy(() => import('../pages/student/CourseDetail'))
const LessonReader     = lazy(() => import('../pages/student/LessonReader'))
const MyResults        = lazy(() => import('../pages/student/MyResults'))

const InstructorDashboard   = lazy(() => import('../pages/instructor/Dashboard'))
const InstructorLiveMonitor = lazy(() => import('../pages/instructor/LiveMonitor'))
const AdminDashboard        = lazy(() => import('../pages/admin/Dashboard'))
const AdminUsers            = lazy(() => import('../pages/admin/Users'))
const AdminCourses          = lazy(() => import('../pages/admin/Courses'))
const AdminAnalytics        = lazy(() => import('../pages/admin/Analytics'))
const CourseEditor          = lazy(() => import('../pages/shared/CourseEditor'))
const CourseForm            = lazy(() => import('../pages/shared/CourseForm'))
const LessonEditor          = lazy(() => import('../pages/shared/LessonEditor'))
const Messaging             = lazy(() => import('../pages/staff/Messaging'))
const CallHistory           = lazy(() => import('../pages/staff/CallHistory'))

// eslint-disable-next-line react/no-multi-comp
function page(Component) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  )
}

const routes = [
  // Landing / redirect selon rôle
  { path: '/', element: <RootPage /> },

  // Guide d'utilisation (public, standalone comme la landing)
  { path: '/guide', element: page(Guide) },

  // Callback de confirmation email (standalone, sans layout)
  { path: '/auth/callback', element: page(AuthCallback) },

  // Auth (avec layout split-screen)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: page(Login) },
      { path: '/register', element: page(Register) },
      { path: '/forgot-password', element: page(ForgotPassword) },
      { path: '/reset-password', element: page(ResetPassword) },
    ],
  },

  // Espace apprenante
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: page(StudentDashboard) },
          { path: '/cours', element: page(CourseList) },
          { path: '/cours/:id', element: page(CourseDetail) },
          { path: '/cours/:courseId/lecons/:lessonId', element: page(LessonReader) },
          { path: '/resultats', element: page(MyResults) },
        ],
      },
    ],
  },

  // Espace formateur
  {
    element: <ProtectedRoute role="formateur" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/formateur', element: page(InstructorDashboard) },
          { path: '/formateur/suivi', element: page(InstructorLiveMonitor) },
          { path: '/formateur/messagerie', element: page(Messaging) },
          { path: '/formateur/appels', element: page(CallHistory) },
          { path: '/formateur/editeur', element: page(CourseEditor) },
          { path: '/formateur/editeur/:courseId', element: page(CourseForm) },
          { path: '/formateur/editeur/:courseId/lecons/:lessonId', element: page(LessonEditor) },
        ],
      },
    ],
  },

  // Espace admin
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: page(AdminDashboard) },
          { path: '/admin/utilisateurs', element: page(AdminUsers) },
          { path: '/admin/cours', element: page(AdminCourses) },
          { path: '/admin/suivi', element: page(InstructorLiveMonitor) },
          { path: '/admin/messagerie', element: page(Messaging) },
          { path: '/admin/appels', element: page(CallHistory) },
          { path: '/admin/analytics', element: page(AdminAnalytics) },
          { path: '/admin/editeur', element: page(CourseEditor) },
          { path: '/admin/editeur/:courseId', element: page(CourseForm) },
          { path: '/admin/editeur/:courseId/lecons/:lessonId', element: page(LessonEditor) },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter([
  {
    // Route englobante sans chemin : toute erreur non gérée (crash d'un
    // effet, chunk introuvable après déploiement, URL inconnue) remonte
    // ici au lieu de l'écran par défaut de react-router (stack trace
    // brute « Unexpected Application Error! »).
    errorElement: <RouteErrorPage />,
    children: routes,
  },
])
