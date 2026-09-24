import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AdminGate              from './components/admin/AdminGate'
import Navbar              from './components/Navbar'
import Hero                from './components/Hero'
import Clients             from './components/Clients'
import Services            from './components/Services'
import FounderTools        from './components/FounderTools'
import Process             from './components/Process'
import TechStack           from './components/TechStack'
import About               from './components/About'
import Testimonials        from './components/Testimonials'
import FAQ                 from './components/FAQ'
import Footer              from './components/Footer'
import ScrollToTop         from './components/ScrollToTop'
import CursorGlow          from './components/CursorGlow'
import RouteTracker        from './components/RouteTracker'
import ErrorBoundary       from './components/ErrorBoundary'
import CookieConsent       from './components/CookieConsent'
import SplashScreen        from './components/SplashScreen'
import Reveal              from './components/Reveal'
import usePageMeta         from './hooks/usePageMeta'

const Login                 = lazy(() => import('./pages/Login'))
const Signup                = lazy(() => import('./pages/Signup'))
const ForgotPassword        = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword         = lazy(() => import('./pages/ResetPassword'))
const Account               = lazy(() => import('./pages/Account'))
const Dashboard             = lazy(() => import('./pages/Dashboard'))
const CostEstimator         = lazy(() => import('./pages/CostEstimator'))
const ProjectEstimator      = lazy(() => import('./pages/ProjectEstimator'))
const ROICalculator         = lazy(() => import('./pages/ROICalculator'))
const BusinessImpact        = lazy(() => import('./pages/BusinessImpact'))
const TimelineCalculator    = lazy(() => import('./pages/TimelineCalculator'))
const TimelineTool          = lazy(() => import('./pages/TimelineTool'))
const MaintenanceTool       = lazy(() => import('./pages/MaintenanceTool'))
const TechRecommender       = lazy(() => import('./pages/TechRecommender'))
const StackRecommender      = lazy(() => import('./pages/StackRecommender'))
const MaintenanceCalculator = lazy(() => import('./pages/MaintenanceCalculator'))
const AIVisibilityScore     = lazy(() => import('./pages/AIVisibilityScore'))
const ShareableResult       = lazy(() => import('./pages/ShareableResult'))
const SavedResults          = lazy(() => import('./pages/SavedResults'))
const PMDashboard           = lazy(() => import('./pages/pm/PMDashboard'))
const NewProject            = lazy(() => import('./pages/pm/NewProject'))
const ProjectDetail         = lazy(() => import('./pages/pm/ProjectDetail'))
const ClientView            = lazy(() => import('./pages/pm/ClientView'))
const JoinProject           = lazy(() => import('./pages/pm/JoinProject'))
const ReferralPage          = lazy(() => import('./pages/pm/ReferralPage'))
const InvoiceGenerator      = lazy(() => import('./pages/pm/InvoiceGenerator'))
const PublicShowcase        = lazy(() => import('./pages/pm/PublicShowcase'))
const PaymentDemo            = lazy(() => import('./pages/PaymentDemo'))
const VibeLevel              = lazy(() => import('./pages/VibeLevel'))
const PrivacyPolicy          = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService         = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy           = lazy(() => import('./pages/CookiePolicy'))
const RefundPolicy           = lazy(() => import('./pages/RefundPolicy'))
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'))
const NotFound               = lazy(() => import('./pages/NotFound'))
const AdminDashboard         = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers             = lazy(() => import('./pages/admin/AdminUsers'))
const AdminBilling           = lazy(() => import('./pages/admin/AdminBilling'))
const AdminProfile           = lazy(() => import('./pages/admin/AdminProfile'))
const AdminAnalytics         = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminAnnouncements     = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminEmail             = lazy(() => import('./pages/admin/AdminEmail'))
const AdminActivity          = lazy(() => import('./pages/admin/AdminActivity'))

function PMRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-black" />
  return <Navigate to={user ? '/pm/dashboard' : '/signup'} replace />
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-black" />
  return user ? children : <Navigate to="/login" replace />
}

function Home() {
  usePageMeta({
    title:       'Vikku - Software & Tech Agency | Web Apps, Platforms & Digital Products',
    description: 'Vikku is a software & tech agency that builds web apps, staffing platforms, e-commerce stores, and custom digital products. Based in India, serving clients globally.',
    url:         'https://vikku.in/',
  })

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <Clients />
        <Reveal><Services /></Reveal>
        <Reveal><FounderTools /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><TechStack /></Reveal>
        <About />
        <Reveal><Testimonials /></Reveal>
        <Reveal><FAQ /></Reveal>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <RouteTracker />
        <CookieConsent />
        <SplashScreen />
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <Routes>
              <Route path="/"                        element={<Home />} />
              <Route path="/login"                   element={<Login />} />
              <Route path="/signup"                  element={<Signup />} />
              <Route path="/forgot-password"         element={<ForgotPassword />} />
              <Route path="/reset-password"          element={<ResetPassword />} />
              <Route path="/account"                 element={<Account />} />
              <Route path="/dashboard"               element={<Dashboard />} />
              <Route path="/dashboard/cost-estimator"     element={<CostEstimator />} />
              <Route path="/dashboard/project-estimator"  element={<ProjectEstimator />} />
              <Route path="/tools/project-estimator"      element={<ProjectEstimator />} />
              <Route path="/dashboard/roi-calculator"      element={<ROICalculator />} />
              <Route path="/dashboard/business-impact"     element={<BusinessImpact />} />
              <Route path="/tools/business-impact"         element={<BusinessImpact />} />
              <Route path="/dashboard/timeline-calculator" element={<TimelineCalculator />} />
              <Route path="/dashboard/timeline"             element={<TimelineTool />} />
              <Route path="/tools/timeline"                 element={<TimelineTool />} />
              <Route path="/dashboard/maintenance"          element={<MaintenanceTool />} />
              <Route path="/tools/maintenance"              element={<MaintenanceTool />} />
              <Route path="/dashboard/tech-recommender"         element={<TechRecommender />} />
              <Route path="/dashboard/stack-recommender"      element={<StackRecommender />} />
              <Route path="/tools/stack-recommender"          element={<StackRecommender />} />
              <Route path="/dashboard/maintenance-calculator" element={<MaintenanceCalculator />} />
              <Route path="/dashboard/ai-visibility-score"    element={<AIVisibilityScore />} />
              <Route path="/tools/cost-estimator"             element={<CostEstimator />} />
              <Route path="/tools/roi-calculator"             element={<ROICalculator />} />
              <Route path="/tools/timeline-calculator"        element={<TimelineCalculator />} />
              <Route path="/tools/tech-recommender"           element={<TechRecommender />} />
              <Route path="/tools/maintenance-calculator"     element={<MaintenanceCalculator />} />
              <Route path="/tools/ai-visibility-score"        element={<AIVisibilityScore />} />
              <Route path="/r/:shareId"                    element={<ShareableResult />} />
              <Route path="/r-view/:shareId"               element={<ShareableResult />} />
              <Route path="/dashboard/saved"               element={<SavedResults />} />
              <Route path="/dashboard/notifications"       element={<NotificationPreferences />} />
              <Route path="/pm"                          element={<PMRedirect />} />
              <Route path="/pm/dashboard"               element={<PMDashboard />} />
              <Route path="/pm/projects/new"            element={<NewProject />} />
              <Route path="/pm/projects/:id"            element={<ProjectDetail />} />
              <Route path="/pm/share/:token"            element={<ClientView />} />
              <Route path="/pm/join/:projectId"         element={<JoinProject />} />
              <Route path="/pm/refer"                       element={<ReferralPage />} />
              <Route path="/pm/projects/:id/invoice"    element={<InvoiceGenerator />} />
              <Route path="/showcase/:token"            element={<PublicShowcase />} />
              <Route path="/payment-demo"            element={<PaymentDemo />} />
              <Route path="/vibelevel"               element={<VibeLevel />} />
              <Route path="/privacy"                 element={<PrivacyPolicy />} />
              <Route path="/terms"                   element={<TermsOfService />} />
              <Route path="/cookies"                 element={<CookiePolicy />} />
              <Route path="/refunds"                 element={<RefundPolicy />} />
              <Route path="/admin"                 element={<AdminGate><AdminDashboard /></AdminGate>} />
              <Route path="/admin/users"         element={<AdminGate><AdminUsers /></AdminGate>} />
              <Route path="/admin/billing"       element={<AdminGate><AdminBilling /></AdminGate>} />
              <Route path="/admin/profile"       element={<AdminGate><AdminProfile /></AdminGate>} />
              <Route path="/admin/analytics"     element={<AdminGate><AdminAnalytics /></AdminGate>} />
              <Route path="/admin/announcements" element={<AdminGate><AdminAnnouncements /></AdminGate>} />
              <Route path="/admin/email"         element={<AdminGate><AdminEmail /></AdminGate>} />
              <Route path="/admin/activity"      element={<AdminGate><AdminActivity /></AdminGate>} />
              <Route path="*"                        element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
