import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'
import AdminLayout from '../layouts/AdminLayout'
import RootPage from '../pages/RootPage'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import AuthCallback from '../pages/auth/AuthCallback'
import StudentDashboard from '../pages/student/Dashboard'
import CourseList from '../pages/student/CourseList'
import CourseDetail from '../pages/student/CourseDetail'
import LessonReader from '../pages/student/LessonReader'
import InstructorDashboard from '../pages/instructor/Dashboard'
import InstructorLiveMonitor from '../pages/instructor/LiveMonitor'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminUsers from '../pages/admin/Users'
import AdminCourses from '../pages/admin/Courses'
import AdminAnalytics from '../pages/admin/Analytics'
import CourseEditor from '../pages/shared/CourseEditor'
import CourseForm from '../pages/shared/CourseForm'
import LessonEditor from '../pages/shared/LessonEditor'
import Messaging from '../pages/staff/Messaging'

export const router = createBrowserRouter([
  // Landing / redirect selon rôle
  { path: '/', element: <RootPage /> },

  // Callback de confirmation email (standalone, sans layout)
  { path: '/auth/callback', element: <AuthCallback /> },

  // Auth (avec layout split-screen)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },

  // Espace apprenante
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <StudentDashboard /> },
          { path: '/cours', element: <CourseList /> },
          { path: '/cours/:id', element: <CourseDetail /> },
          { path: '/cours/:courseId/lecons/:lessonId', element: <LessonReader /> },
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
          { path: '/formateur', element: <InstructorDashboard /> },
          { path: '/formateur/suivi', element: <InstructorLiveMonitor /> },
          { path: '/formateur/messagerie', element: <Messaging /> },
          { path: '/formateur/editeur', element: <CourseEditor /> },
          { path: '/formateur/editeur/:courseId', element: <CourseForm /> },
          { path: '/formateur/editeur/:courseId/lecons/:lessonId', element: <LessonEditor /> },
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
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/utilisateurs', element: <AdminUsers /> },
          { path: '/admin/cours', element: <AdminCourses /> },
          { path: '/admin/suivi', element: <InstructorLiveMonitor /> },
          { path: '/admin/messagerie', element: <Messaging /> },
          { path: '/admin/analytics', element: <AdminAnalytics /> },
          { path: '/admin/editeur', element: <CourseEditor /> },
          { path: '/admin/editeur/:courseId', element: <CourseForm /> },
          { path: '/admin/editeur/:courseId/lecons/:lessonId', element: <LessonEditor /> },
        ],
      },
    ],
  },
])
