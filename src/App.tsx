import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EstablishmentUrlResolver } from './components/EstablishmentUrlResolver';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LoadingFallback } from './components/LoadingFallback';
import { CookieConsent } from './components/CookieConsent';
import { FeedbackWidget } from './components/FeedbackWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { ConsentReprompt } from './components/ConsentReprompt';
import { env } from './config/env';
import { usePreventNumberInputScroll } from './hooks/usePreventNumberInputScroll';
import { useTextInputLimits } from './hooks/useTextInputLimits';
import { usePageTracking } from './hooks/usePageTracking';

// ============================================================================
// Eager Imports (Critical path - always needed)
// ============================================================================
// These are loaded immediately as they're needed for the auth flow
import { ErrorPage } from './components/ErrorPage';
import { ProtectedRoute, OwnerRoute } from './components/ProtectedRoute';
import { ChatWidgetEnhancer } from './components/ChatWidgetEnhancer';
import { ScrollToTop } from './components/ScrollToTop';

// ============================================================================
// Lazy Imports - Public Pages
// ============================================================================
// Landing page is the entry point - consider preloading for better UX
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PosDemoPage = lazy(() => import('./pages/PosDemoPage').then(m => ({ default: m.PosDemoPage })));

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const IndustriesPage = lazy(() => import('./pages/IndustriesPage').then(m => ({ default: m.IndustriesPage })));
const SecurityPage = lazy(() => import('./pages/SecurityPage').then(m => ({ default: m.SecurityPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const MarketingLoyaltyPage = lazy(() => import('./pages/LoyaltyPage').then(m => ({ default: m.LoyaltyPage })));
const MultiLocationPage = lazy(() => import('./pages/MultiLocationPage').then(m => ({ default: m.MultiLocationPage })));
const WhyMintcomPage = lazy(() => import('./pages/WhyMintcomPage').then(m => ({ default: m.WhyMintcomPage })));
const QAPage = lazy(() => import('./pages/QAPage').then(m => ({ default: m.QAPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage').then(m => ({ default: m.ComingSoonPage })));

// ============================================================================
// Lazy Imports - Support Pages
// ============================================================================
const SupportPage = lazy(() => import('./pages/support/SupportPage').then(m => ({ default: m.SupportPage })));
const TicketsPage = lazy(() => import('./pages/support/TicketsPage').then(m => ({ default: m.TicketsPage })));
const TicketDetailPage = lazy(() => import('./pages/support/TicketDetailPage').then(m => ({ default: m.TicketDetailPage })));
const NewTicketPage = lazy(() => import('./pages/support/NewTicketPage').then(m => ({ default: m.NewTicketPage })));
const SupportCategoryPage = lazy(() => import('./pages/support/SupportCategoryPage').then(m => ({ default: m.SupportCategoryPage })));
const ArticlePage = lazy(() => import('./pages/support/ArticlePage').then(m => ({ default: m.ArticlePage })));
const AllArticlesPage = lazy(() => import('./pages/support/AllArticlesPage').then(m => ({ default: m.AllArticlesPage })));
const SupportAdminPage = lazy(() => import('./pages/support/SupportAdminPage').then(m => ({ default: m.SupportAdminPage })));
const SupportAdminDetailPage = lazy(() => import('./pages/support/SupportAdminDetailPage').then(m => ({ default: m.SupportAdminDetailPage })));
const SupportFeedbackPage = lazy(() => import('./pages/support/SupportFeedbackPage').then(m => ({ default: m.SupportFeedbackPage })));

// ============================================================================
// Lazy Imports - Onboarding
// ============================================================================
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const SelectEstablishmentPage = lazy(() => import('./pages/SelectEstablishmentPage').then(m => ({ default: m.SelectEstablishmentPage })));

// ============================================================================
// Lazy Imports - Layouts (Loaded when entering each section)
// ============================================================================
const DashboardLayout = lazy(() => import('./components/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const OwnerLayout = lazy(() => import('./components/OwnerLayout').then(m => ({ default: m.OwnerLayout })));
const BrandLayout = lazy(() => import('./components/BrandLayout').then(m => ({ default: m.BrandLayout })));

// ============================================================================
// Lazy Imports - Owner Portal Pages
// ============================================================================
const OwnerOverviewPage = lazy(() => import('./pages/owner/OwnerOverviewPage').then(m => ({ default: m.OwnerOverviewPage })));
const OwnerEstablishmentsPage = lazy(() => import('./pages/owner/OwnerEstablishmentsPage').then(m => ({ default: m.OwnerEstablishmentsPage })));
const OwnerEmployeesPage = lazy(() => import('./pages/owner/OwnerEmployeesPage').then(m => ({ default: m.OwnerEmployeesPage })));
const OwnerBillingPage = lazy(() => import('./pages/owner/OwnerBillingPage').then(m => ({ default: m.OwnerBillingPage })));
const OwnerMergePage = lazy(() => import('./pages/owner/OwnerMergePage').then(m => ({ default: m.OwnerMergePage })));
const OwnerBrandsPage = lazy(() => import('./pages/owner/OwnerBrandsPage').then(m => ({ default: m.OwnerBrandsPage })));
const OwnerRolesPage = lazy(() => import('./pages/owner/OwnerRolesPage').then(m => ({ default: m.OwnerRolesPage })));
const OwnerAccountManagementPage = lazy(() => import('./pages/owner/OwnerAccountManagementPage').then(m => ({ default: m.OwnerAccountManagementPage })));

// ============================================================================
// Lazy Imports - Brand Portal Pages
// ============================================================================
const BrandDashboardPage = lazy(() => import('./pages/brand/BrandDashboardPage').then(m => ({ default: m.BrandDashboardPage })));
const BrandLocationsPage = lazy(() => import('./pages/brand/BrandLocationsPage').then(m => ({ default: m.BrandLocationsPage })));
const BrandTeamPage = lazy(() => import('./pages/brand/BrandTeamPage'));

// ============================================================================
// Lazy Imports - Dashboard Pages (Largest chunk - most features)
// ============================================================================
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage').then(m => ({ default: m.OrdersPage })));
const ProductsPage = lazy(() => import('./pages/dashboard/ProductsPage').then(m => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import('./pages/dashboard/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const StaffPage = lazy(() => import('./pages/dashboard/StaffPage').then(m => ({ default: m.StaffPage })));
const CustomersPage = lazy(() => import('./pages/dashboard/CustomersPage').then(m => ({ default: m.CustomersPage })));
const ReportsPage = lazy(() => import('./pages/dashboard/ReportsPage').then(m => ({ default: m.ReportsPage })));
const DiscountsPage = lazy(() => import('./pages/dashboard/DiscountsPage').then(m => ({ default: m.DiscountsPage })));
const PaymentMethodsPage = lazy(() => import('./pages/dashboard/PaymentMethodsPage').then(m => ({ default: m.PaymentMethodsPage })));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LoyaltyPage = lazy(() => import('./pages/dashboard/LoyaltyPage').then(m => ({ default: m.LoyaltyPage })));
const ActivityLogsPage = lazy(() => import('./pages/dashboard/ActivityLogsPage').then(m => ({ default: m.ActivityLogsPage })));
const AddonsPage = lazy(() => import('./pages/dashboard/AddonsPage').then(m => ({ default: m.AddonsPage })));
const InventoryPage = lazy(() => import('./pages/dashboard/RecipesPage').then(m => ({ default: m.RecipesPage })));
const EstablishmentsPage = lazy(() => import('./pages/dashboard/EstablishmentsPage').then(m => ({ default: m.EstablishmentsPage })));
const AdminUsersPage = lazy(() => import('./pages/dashboard/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const CustomRolesPage = lazy(() => import('./pages/dashboard/CustomRolesPage').then(m => ({ default: m.CustomRolesPage })));

// ============================================================================
// Suspense Wrapper Components
// ============================================================================
// These wrap lazy components with appropriate loading states

/** Wrapper for full-page lazy components */
function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}

/** Wrapper for layout components (shows loading while layout chunk loads) */
function LayoutSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}

const routeSeo = [
  { path: '/', title: 'Mintcom POS | Cloud POS & Business Management', description: 'Run sales, inventory, staff, reports, loyalty, and multi-location operations from Mintcom.' },
  { path: '/try-pos', title: 'Try Mintcom POS | Free interactive demo', description: 'Try a full Mintcom POS experience free — clock in, sell items, customize add-ons, and take payment. No account required.' },
  { path: '/login', title: 'Login | Mintcom POS', description: 'Sign in securely to your Mintcom account.' },
  { path: '/signup', title: 'Create Account | Mintcom POS', description: 'Create a Mintcom account for your business.' },
  { path: '/support', title: 'Support | Mintcom POS', description: 'Find Mintcom help articles and support tickets.' },
  { path: '/privacy', title: 'Privacy Policy | Mintcom POS', description: 'Read how Mintcom POS protects your data and how to request account or data deletion.' },
  { path: '/legal/privacy', title: 'Privacy Policy | Mintcom POS', description: 'Read how Mintcom POS protects your data and how to request account or data deletion.' },
  { path: '/about', title: 'About Mintcom', description: 'Learn about Mintcom POS and business management.' },
  { path: '/industries', title: 'Industries | Mintcom POS', description: 'Mintcom POS for restaurants, cafés, retail, bakeries, and multi-branch brands.' },
  { path: '/security', title: 'Security | Mintcom POS', description: 'How Mintcom protects business data with encryption, roles, and privacy controls.' },
  { path: '/pricing', title: 'Pricing | Mintcom POS', description: 'Simple Mintcom POS pricing per location. No hardware sales.' },
  { path: '/how-it-works', title: 'How it works | Mintcom POS', description: 'Go from signup to first sale with Mintcom POS.' },
  { path: '/loyalty', title: 'Loyalty | Mintcom POS', description: 'Built-in loyalty and rewards for Mintcom POS.' },
  { path: '/multi-location', title: 'Multi-location | Mintcom POS', description: 'Run multiple branches and brands with Mintcom.' },
  { path: '/why-mintcom', title: 'Why Mintcom | Mintcom POS', description: 'Why owners choose Mintcom POS.' },
  { path: '/dashboard', title: 'Dashboard | Mintcom POS', description: 'Manage your Mintcom business dashboard.' },
  { path: '/owner', title: 'Owner Portal | Mintcom POS', description: 'Manage Mintcom account ownership, billing, brands, and establishments.' },
  { path: '/brand', title: 'Brand Portal | Mintcom POS', description: 'Manage Mintcom brand locations and teams.' },
];

const siteUrl = env.VITE_SITE_URL.replace(/\/$/, '');

function RouteSeo() {
  const { pathname } = useLocation();
  const exact = routeSeo.find((entry) => entry.path === pathname);
  const prefix = [...routeSeo]
    .sort((a, b) => b.path.length - a.path.length)
    .find((entry) => entry.path !== '/' && pathname.startsWith(entry.path));
  const seo = exact || prefix || routeSeo[0];
  const canonicalPath = pathname === '/' ? '' : pathname;
  const shouldNoIndex = [
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/select-establishment',
    '/dashboard',
    '/owner',
    '/brand',
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={shouldNoIndex ? 'noindex, nofollow, noarchive' : 'index, follow'} />
      <link rel="canonical" href={`${siteUrl}${canonicalPath}`} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={`${siteUrl}${canonicalPath}`} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
    </Helmet>
  );
}

// ============================================================================
// Maintenance Mode Configuration
// ============================================================================
// Client flag for local/dev only. Production maintenance is enforced at the
// Cloudflare Worker edge (MAINTENANCE_MODE + QA_ACCESS_KEY secrets), so the
// bypass key is never baked into the public JS bundle.
const MAINTENANCE_MODE = env.VITE_MAINTENANCE_MODE;

/**
 * /qa-access is handled by the Cloudflare Worker in production (sets an
 * HttpOnly signed cookie). This client handler is a local-dev fallback only
 * when VITE_QA_ACCESS_KEY is present in .env.local — never commit that key.
 */
function SecretAccessHandler() {
  useEffect(() => {
    // Production: Worker already validated & redirected; if we still render
    // this route, just go home (cookie may already be set).
    const expectedKey = env.VITE_QA_ACCESS_KEY?.trim();
    const providedKey = new URLSearchParams(window.location.search).get('key')?.trim();

    if (expectedKey && providedKey === expectedKey) {
      // Dev-only soft flag (Worker uses HttpOnly cookie in production).
      localStorage.setItem('mintcom_preview_access', 'true');
      toast.success('Preview access granted. Redirecting...', {
        icon: '🔐',
        duration: 2000,
      });
    } else if (expectedKey) {
      localStorage.removeItem('mintcom_preview_access');
      toast.error('Invalid or missing access key.', {
        icon: '🔒',
        duration: 2500,
      });
    } else {
      // No client key configured — edge Worker handles real access.
      toast.success('Redirecting…', { duration: 1200 });
    }

    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return <LoadingFallback />;
}

/**
 * Wraps the application to show Coming Soon page if maintenance is active
 * and the user doesn't have a bypass key (local/dev soft check).
 * Production also gates HTML at the Worker edge.
 */
function MaintenanceWrapper() {
  const hasAccess = localStorage.getItem('mintcom_preview_access') === 'true';
  const { pathname } = useLocation();

  // Report client-side route changes to GA4 (the initial load is tracked by
  // gtag('config') in index.html). Without this, SPA navigations are invisible.
  usePageTracking();

  // Always allow access to the secret bypass route
  if (pathname === '/qa-access') {
    return <Outlet />;
  }

  if (MAINTENANCE_MODE && !hasAccess) {
    return (
      <PageSuspense>
        <ComingSoonPage />
      </PageSuspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <RouteSeo />
      <Outlet />
      <CookieConsent />
      <FeedbackWidget />
      <ChatWidgetEnhancer />
    </>
  );
}

// ============================================================================
// Router Configuration
// ============================================================================
const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    element: <MaintenanceWrapper />,
    children: [
      // ========== Secret Access Route ==========
      {
        path: "/qa-access",
        element: <SecretAccessHandler />,
      },

      // ========== Public Routes ==========
      {
        path: "/",
        element: (
          <PageSuspense>
            <LandingPage />
          </PageSuspense>
        ),
      },
      {
        path: "/try-pos",
        element: (
          <PageSuspense>
            <PosDemoPage />
          </PageSuspense>
        ),
      },

      {
        path: "/login",
        element: (
          <PageSuspense>
            <LoginPage />
          </PageSuspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <PageSuspense>
            <SignUpPage />
          </PageSuspense>
        ),
      },
      {
        path: "/verify-email",
        element: (
          <PageSuspense>
            <VerifyEmailPage />
          </PageSuspense>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <PageSuspense>
            <ForgotPasswordPage />
          </PageSuspense>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <PageSuspense>
            <ResetPasswordPage />
          </PageSuspense>
        ),
      },
      {
        path: "/legal/cookie-policy",
        element: (
          <PageSuspense>
            <CookiePolicyPage />
          </PageSuspense>
        ),
      },
      {
        path: "/about",
        element: (
          <PageSuspense>
            <AboutUsPage />
          </PageSuspense>
        ),
      },
      {
        path: "/features",
        element: <Navigate to="/#features" replace />,
      },
      {
        path: "/industries",
        element: (
          <PageSuspense>
            <IndustriesPage />
          </PageSuspense>
        ),
      },
      {
        path: "/security",
        element: (
          <PageSuspense>
            <SecurityPage />
          </PageSuspense>
        ),
      },
      {
        path: "/pricing",
        element: (
          <PageSuspense>
            <PricingPage />
          </PageSuspense>
        ),
      },
      {
        path: "/how-it-works",
        element: (
          <PageSuspense>
            <HowItWorksPage />
          </PageSuspense>
        ),
      },
      {
        path: "/loyalty",
        element: (
          <PageSuspense>
            <MarketingLoyaltyPage />
          </PageSuspense>
        ),
      },
      {
        path: "/multi-location",
        element: (
          <PageSuspense>
            <MultiLocationPage />
          </PageSuspense>
        ),
      },
      {
        path: "/faq",
        element: <Navigate to="/support" replace />,
      },
      {
        path: "/why-mintcom",
        element: (
          <PageSuspense>
            <WhyMintcomPage />
          </PageSuspense>
        ),
      },
      {
        path: "/qa",
        element: (
          <PageSuspense>
            <QAPage />
          </PageSuspense>
        ),
      },
      {
        path: "/legal/privacy",
        element: (
          <PageSuspense>
            <PrivacyPolicyPage />
          </PageSuspense>
        ),
      },
      {
        path: "/legal/privacy/",
        element: (
          <PageSuspense>
            <PrivacyPolicyPage />
          </PageSuspense>
        ),
      },
      {
        path: "/privacy",
        element: (
          <PageSuspense>
            <PrivacyPolicyPage />
          </PageSuspense>
        ),
      },
      {
        path: "/legal/terms",
        element: (
          <PageSuspense>
            <TermsPage />
          </PageSuspense>
        ),
      },

      // ========== Support Routes (Public Articles) ==========
      {
        path: "/support",
        element: (
          <PageSuspense>
            <SupportPage />
          </PageSuspense>
        ),
      },
      {
        path: "/support/category/:categoryId",
        element: (
          <PageSuspense>
            <SupportCategoryPage />
          </PageSuspense>
        ),
      },
      {
        path: "/support/article/:articleId",
        element: (
          <PageSuspense>
            <ArticlePage />
          </PageSuspense>
        ),
      },
      {
        path: "/support/articles",
        element: (
          <PageSuspense>
            <AllArticlesPage />
          </PageSuspense>
        ),
      },

      // ========== Support Admin Portal (handles its own auth) ==========
      {
        path: "/support/admin",
        element: (
          <PageSuspense>
            <SupportAdminPage />
          </PageSuspense>
        ),
      },
      {
        path: "/support/admin/feedback",
        element: (
          <PageSuspense>
            <SupportFeedbackPage />
          </PageSuspense>
        ),
      },
      {
        path: "/support/admin/:ticketId",
        element: (
          <PageSuspense>
            <SupportAdminDetailPage />
          </PageSuspense>
        ),
      },

      // ========== Community Routes (Temporarily Disabled) ==========
      {
        path: "/community-hub",
        element: <Navigate to="/" replace />,
      },
      {
        path: "/community/*",
        element: <Navigate to="/" replace />,
      },

      // ========== Portal Routes (Protected) ==========
      {
        element: <ProtectedRoute />,
        children: [
          // ========== Support Ticket Routes (Protected) ==========
          {
            path: "/support/tickets",
            element: (
              <PageSuspense>
                <TicketsPage />
              </PageSuspense>
            ),
          },
          {
            path: "/support/tickets/new",
            element: (
              <PageSuspense>
                <NewTicketPage />
              </PageSuspense>
            ),
          },
          {
            path: "/support/tickets/:ticketId",
            element: (
              <PageSuspense>
                <TicketDetailPage />
              </PageSuspense>
            ),
          },
          {
            path: "/portal",
            element: <Navigate to="/" replace />,
          },
          {
            path: "/onboarding",
            element: <Navigate to="/onboarding/step/1" replace />,
          },
          {
            path: "/onboarding/step/:step",
            element: (
              <PageSuspense>
                <OnboardingPage />
              </PageSuspense>
            ),
          },
          {
            path: "/select-establishment",
            element: (
              <PageSuspense>
                <SelectEstablishmentPage />
              </PageSuspense>
            ),
          },

          // ===== Owner & Brand Portals (account owner only) =====
          {
            element: <OwnerRoute />,
            children: [
          // ========== Owner Portal ==========
          {
            path: "/owner",
            element: (
              <LayoutSuspense>
                <OwnerLayout />
              </LayoutSuspense>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageSuspense>
                    <OwnerOverviewPage />
                  </PageSuspense>
                ),
              },
              {
                path: "establishments",
                element: (
                  <PageSuspense>
                    <OwnerEstablishmentsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "brands",
                element: (
                  <PageSuspense>
                    <OwnerBrandsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "roles",
                element: (
                  <PageSuspense>
                    <OwnerRolesPage />
                  </PageSuspense>
                ),
              },
              {
                path: "employees",
                element: (
                  <PageSuspense>
                    <OwnerEmployeesPage />
                  </PageSuspense>
                ),
              },
              {
                path: "billing",
                element: (
                  <PageSuspense>
                    <OwnerBillingPage />
                  </PageSuspense>
                ),
              },
              {
                path: "merge",
                element: (
                  <PageSuspense>
                    <OwnerMergePage />
                  </PageSuspense>
                ),
              },
              {
                path: "account",
                element: (
                  <PageSuspense>
                    <OwnerAccountManagementPage />
                  </PageSuspense>
                ),
              },
            ],
          },

          // ========== Brand Portal ==========
          {
            path: "/brand/:brandId",
            element: (
              <LayoutSuspense>
                <BrandLayout />
              </LayoutSuspense>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageSuspense>
                    <BrandDashboardPage />
                  </PageSuspense>
                ),
              },
              {
                path: "locations",
                element: (
                  <PageSuspense>
                    <BrandLocationsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "team",
                element: (
                  <PageSuspense>
                    <BrandTeamPage />
                  </PageSuspense>
                ),
              },
            ],
          },
            ], // end OwnerRoute children
          },
        ],
      },
      // ========== Establishment-Required Routes ==========
      // Use simpler wrapper or direct routes since Resolver handles logic
      {
        children: [
          // Redirect root /dashboard to selection
          {
            path: "/dashboard",
            element: <Navigate to="/select-establishment" replace />
          },
          {
            path: "/dashboard/:locationSlug",
            element: (
              <EstablishmentUrlResolver>
                <LayoutSuspense>
                  <DashboardLayout />
                </LayoutSuspense>
              </EstablishmentUrlResolver>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageSuspense>
                    <DashboardPage />
                  </PageSuspense>
                ),
              },
              {
                path: "orders",
                element: (
                  <PageSuspense>
                    <OrdersPage />
                  </PageSuspense>
                ),
              },
              {
                path: "products",
                element: (
                  <PageSuspense>
                    <ProductsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "categories",
                element: (
                  <PageSuspense>
                    <CategoriesPage />
                  </PageSuspense>
                ),
              },
              {
                path: "staff",
                element: (
                  <PageSuspense>
                    <StaffPage />
                  </PageSuspense>
                ),
              },
              {
                path: "customers",
                element: (
                  <PageSuspense>
                    <CustomersPage />
                  </PageSuspense>
                ),
              },
              {
                path: "reports/:type?",
                element: (
                  <PageSuspense>
                    <ReportsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "discounts",
                element: (
                  <PageSuspense>
                    <DiscountsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "payment-methods",
                element: (
                  <PageSuspense>
                    <PaymentMethodsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "settings",
                element: (
                  <PageSuspense>
                    <SettingsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "loyalty",
                element: (
                  <PageSuspense>
                    <LoyaltyPage />
                  </PageSuspense>
                ),
              },
              {
                path: "activity-logs",
                element: (
                  <PageSuspense>
                    <ActivityLogsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "addons",
                element: (
                  <PageSuspense>
                    <AddonsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "inventory",
                element: (
                  <PageSuspense>
                    <InventoryPage />
                  </PageSuspense>
                ),
              },
              {
                path: "establishments",
                element: (
                  <PageSuspense>
                    <EstablishmentsPage />
                  </PageSuspense>
                ),
              },
              {
                path: "admin-users",
                element: (
                  <PageSuspense>
                    <AdminUsersPage />
                  </PageSuspense>
                ),
              },
              {
                path: "roles",
                element: (
                  <PageSuspense>
                    <CustomRolesPage />
                  </PageSuspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

// ============================================================================
// App Component
// ============================================================================
function App() {
  usePreventNumberInputScroll();
  useTextInputLimits();

  // Listen for permission-denied events from API interceptor
  useEffect(() => {
    const handlePermissionDenied = (event: CustomEvent<{ message: string }>) => {
      toast.error(event.detail.message || 'You do not have permission to perform this action', {
        duration: 5000,
        id: 'permission-denied', // Prevent duplicate toasts
      });
    };

    window.addEventListener('permission-denied', handlePermissionDenied as EventListener);
    return () => {
      window.removeEventListener('permission-denied', handlePermissionDenied as EventListener);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="mintcom-ui-theme">
        <AuthProvider>
          <CurrencyProvider>
            <div id="global-blocking-overlay" />
            <RouterProvider router={router} />
            <ConsentReprompt />
            <PwaUpdatePrompt />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#7dc6a2',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#D55263',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
